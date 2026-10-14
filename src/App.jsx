import { useState, useRef, useCallback } from 'react'
import { Printer, RotateCcw, Copy, Sparkles, PencilLine, Eye, Download, Loader2 } from 'lucide-react'
import { useOffer, defaults, demo, fmtDate } from './hooks/useOffer'
import BrandingTheme from './components/form/BrandingTheme'
import ClientDetails from './components/form/ClientDetails'
import LineItems from './components/form/LineItems'
import Terms from './components/form/Terms'
import OfferDocument from './components/OfferDocument'
import logoUrl from './assets/TheAI.png?inline'

export default function App() {
  const { state, setState, patch, totals, money } = useOffer()
  const [view, setView] = useState('form')
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const timer = useRef()

  const toast = useCallback(m => {
    setMsg(m); clearTimeout(timer.current); timer.current = setTimeout(() => setMsg(null), 2200)
  }, [])

  const downloadPdf = async () => {
    const element = document.getElementById('offer-document')
    if (!element || busy) return
    setBusy(true)
    try {
      const { default: html2pdf } = await import('html2pdf.js')
      const clientName = state.client.name.trim().replace(/[^\w\-]+/g, '_')
      const PX_PER_MM = 3.7795275591 // 96 dpi → mm
      const A4_W_MM = 210
      const A4_W_PX = Math.round(A4_W_MM * PX_PER_MM) // 794 px

      // Measure the natural content height with the fixed A4 height temporarily removed
      const prevHeight = element.style.height
      const prevMaxHeight = element.style.maxHeight
      const prevOverflow = element.style.overflow
      element.style.height = 'auto'
      element.style.maxHeight = 'none'
      element.style.overflow = 'visible'
      const contentH_px = element.scrollHeight
      element.style.height = prevHeight
      element.style.maxHeight = prevMaxHeight
      element.style.overflow = prevOverflow

      const contentH_mm = contentH_px / PX_PER_MM

      const opt = {
        margin: 0,
        filename: `Offer_${clientName || 'GeoLab'}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollY: 0,
          scrollX: 0,
          width: A4_W_PX,
          windowWidth: A4_W_PX,
          onclone: doc => {
            const el = doc.getElementById('offer-document')
            // Remove fixed height so the capture area = actual content height
            Object.assign(el.style, {
              transform: 'none',
              margin: '0',
              width: `${A4_W_PX}px`,
              height: 'auto',
              maxHeight: 'none',
              overflow: 'visible',
              boxShadow: 'none',
              borderRadius: '0',
            })
          },
        },
        // Use a custom page size that exactly matches the content height → no blank space
        jsPDF: { unit: 'mm', format: [A4_W_MM, contentH_mm], orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' },
      }
      await html2pdf().set(opt).from(element).toPdf().get('pdf').then(pdf => {
        // Safety net: drop any extra pages from sub-pixel rounding
        while (pdf.getNumberOfPages() > 1) pdf.deletePage(pdf.getNumberOfPages())
      }).save()
      toast('PDF downloaded')
    } catch (err) {
      console.error(err)
      toast('PDF export failed — try Print instead')
    } finally {
      setBusy(false)
    }
  }

  const copySummary = async () => {
    const { meta, client, adjust } = state
    const lines = [
      `${meta.ref} — issued ${fmtDate(meta.issueDate)}, valid until ${fmtDate(meta.validUntil)}`,
      `Client: ${client.name || '—'}`, '',
      ...totals.rows.filter(r => r.name || Number(r.price)).map((r, i) =>
        `${i + 1}. ${r.name || 'Untitled'}${r.sku ? ` [${r.sku}]` : ''} — ${r.qty} × ${money(Number(r.price) || 0)} = ${money(r.total)}`),
      '', `Subtotal: ${money(totals.subtotal)}`,
      ...(adjust.discountOn ? [`Discount (${adjust.discount}%): −${money(totals.discount)}`] : []),
      ...(adjust.taxOn ? [`VAT (${adjust.tax}%): ${money(totals.tax)}`] : []),
      `Grand Total: ${money(totals.grand)}`, '', 'GeoLab · The art of using AI',
    ]
    try { await navigator.clipboard.writeText(lines.join('\n')); toast('Summary copied to clipboard') }
    catch { toast('Clipboard unavailable') }
  }

  const props = { state, patch, totals, money, toast }

  return (
    <>
      <header className="no-print sticky top-0 z-30 border-b border-line bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1680px] flex-wrap items-center justify-between gap-3 px-5 py-3 lg:px-7">
          <div className="flex items-center gap-3.5">
            <img src={logoUrl} alt="The art of using AI logo" className="h-10 w-auto" onError={e => (e.currentTarget.style.display = 'none')} />
            <div className="border-l border-line pl-3.5">
              <h1 className="text-[16px] font-bold tracking-tight">Offer Template Generator</h1>
              <p className="text-xs text-slate-500"><strong className="text-accent">GeoLab</strong> · The art of using AI</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button id="btn-demo" type="button" className="btn" onClick={() => { setState(demo); toast('Demo data loaded') }}><Sparkles size={15} />Demo Data</button>
            <button id="btn-copy" type="button" className="btn" onClick={copySummary}><Copy size={15} />Copy</button>
            <button id="btn-reset" type="button" className="btn"
              onClick={() => { if (confirm('Reset all fields to their defaults?')) { setState(defaults()); toast('Form reset') } }}>
              <RotateCcw size={15} />Reset
            </button>
            <button id="btn-print" type="button" className="btn" onClick={() => window.print()}><Printer size={15} />Print</button>
            <button id="btn-download" type="button" className="btn btn-primary" onClick={downloadPdf} disabled={busy}>
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}Download PDF
            </button>
          </div>
        </div>
      </header>

      <div className="no-print flex gap-1.5 px-4 pt-3 lg:hidden">
        {[['form', 'Edit', PencilLine], ['preview', 'Preview', Eye]].map(([k, l, I]) => (
          <button key={k} type="button" onClick={() => setView(k)}
            className={`btn flex-1 ${view === k ? 'border-accent bg-accent text-white hover:bg-slate-800' : 'text-slate-500'}`}><I size={15} />{l}</button>
        ))}
      </div>

      <main className="mx-auto grid max-w-[1680px] gap-7 p-4 lg:grid-cols-[minmax(400px,0.9fr)_minmax(0,1.1fr)] lg:p-7">
        <aside className={`no-print space-y-4 ${view === 'form' ? '' : 'max-lg:hidden'}`}>
          <div className="rounded-2xl bg-accent p-5 text-white">
            <p className="text-[10px] font-bold tracking-[.18em] text-slate-400 uppercase">GeoLab Program</p>
            <p className="mt-1 text-lg font-bold tracking-tight">The art of using AI</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-300">
              A curated educational program at the intersection of human creativity and artificial intelligence, designed for curious minds ready to shape the future.
            </p>
          </div>
          <BrandingTheme {...props} />
          <ClientDetails {...props} />
          <LineItems {...props} />
          <Terms {...props} />
        </aside>

        <section aria-label="Live offer preview"
          className={`print-root lg:sticky lg:top-[88px] lg:max-h-[calc(100vh-108px)] lg:self-start lg:overflow-y-auto lg:overflow-x-hidden lg:p-1 ${view === 'preview' ? '' : 'max-lg:hidden'}`}>
          <OfferDocument state={state} totals={totals} money={money} />
        </section>
      </main>

      <div role="status" aria-live="polite"
        className={`no-print fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-accent px-4 py-2.5 font-semibold text-white shadow-xl transition-all duration-300
          ${msg ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}>{msg}</div>
    </>
  )
}
