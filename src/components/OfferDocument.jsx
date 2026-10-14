import { useLayoutEffect, useRef, useState } from 'react'
import { resolveTheme } from '../lib/themes'
import { fmtDate } from '../hooks/useOffer'
import logoUrl from '../assets/TheAI.png?inline'

const TAGLINE = 'A curated educational program at the intersection of human creativity and artificial intelligence, designed for curious minds ready to shape the future.'

export default function OfferDocument({ state, totals, money }) {
  const wrapRef = useRef(null)
  const docRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [docH, setDocH] = useState(null)

  useLayoutEffect(() => {
    const el = wrapRef.current
    const doc = docRef.current
    const update = () => {
      const w = doc?.offsetWidth || 794
      setScale(Math.min(1, el.clientWidth / w))
      setDocH(doc?.offsetHeight || null)
    }
    const ro = new ResizeObserver(update)
    ro.observe(el)
    if (doc) ro.observe(doc)
    return () => ro.disconnect()
  }, [])

  const t = resolveTheme(state.theme)
  const { client, meta, adjust, terms } = state
  const rows = totals.rows.filter(r => r.name || r.sku || Number(r.price))
  // Tighten row spacing as the list grows so everything fits on one A4 sheet
  const cell = rows.length > 10 ? 'px-[2mm] py-[1.2mm] text-[8.5pt]' : rows.length > 6 ? 'px-[2mm] py-[1.8mm]' : 'px-[2mm] py-[2.8mm]'
  const vars = {
    '--doc-bg': t.bg, '--doc-text': t.text, '--doc-accent': t.accent, '--doc-soft': t.soft,
    '--doc-border': t.border, '--doc-muted': t.muted, '--doc-on-accent': t.onAccent,
  }
  const ph = s => <span className="font-normal italic opacity-40">{s}</span>

  return (
    <div ref={wrapRef} className="print-root w-full">
      <div className="print-scale" style={{ height: docH ? docH * scale : undefined, width: '100%' }}>
        <article
          ref={docRef} id="offer-document"
          className="a4 relative mx-auto flex flex-col overflow-hidden rounded-[3px] shadow-[0_2px_4px_rgba(15,23,42,.04),0_24px_60px_rgba(15,23,42,.12)] transition-colors duration-500"
          style={{ ...vars, transform: scale < 1 ? `scale(${scale})` : undefined, marginLeft: scale < 1 ? 0 : 'auto' }}
        >
          {/* accent bar */}
          <div className="h-[3mm] w-full transition-colors duration-500" style={{ background: 'var(--doc-accent)' }} />

          <div className="flex flex-1 flex-col px-[15mm] pt-[11mm] pb-[10mm]">
            {/* Header */}
            <header className="flex items-start justify-between gap-[8mm] pb-[6mm]" style={{ borderBottom: '1px solid var(--doc-border)' }}>
              <div className="max-w-[95mm]">
                <img src={logoUrl} alt="The art of using AI" className="h-[17mm] w-auto" onError={e => (e.currentTarget.style.display = 'none')} />
                <div className="mt-[3mm] flex items-center gap-[2mm]">
                  <span className="rounded-full px-[2.5mm] py-[0.8mm] text-[7pt] font-bold tracking-[.14em] uppercase"
                    style={{ background: 'var(--doc-accent)', color: 'var(--doc-on-accent)' }}>GeoLab</span>
                  <span className="text-[8.5pt] font-bold" style={{ color: 'var(--doc-accent)' }}>The art of using AI</span>
                </div>
                <p className="mt-[2mm] text-[8pt] leading-[1.55]" style={{ color: 'var(--doc-muted)' }}>{TAGLINE}</p>
              </div>
              <div className="flex min-w-[55mm] flex-col items-end text-right">
                {client.logo
                  ? <img src={client.logo} alt="Client logo" className="mb-[3mm] max-h-[17mm] max-w-[50mm] object-contain" />
                  : <div className="mb-[3mm] grid h-[17mm] w-[34mm] place-items-center rounded-[2mm] text-[7pt] uppercase tracking-wider"
                      style={{ border: '1px dashed var(--doc-border)', color: 'var(--doc-muted)' }}>Client logo</div>}
                <p className="text-[7pt] font-bold tracking-[.14em] uppercase" style={{ color: 'var(--doc-muted)' }}>Prepared for</p>
                <p className="text-[12pt] leading-tight font-bold">{client.name || ph('Client organization')}</p>
              </div>
            </header>

            {/* Title + meta */}
            <div className="flex items-end justify-between py-[6mm]">
              <h2 className="text-[22pt] leading-none font-extrabold tracking-tight" style={{ color: 'var(--doc-accent)' }}>Commercial Offer</h2>
              <dl className="grid grid-cols-3 gap-[6mm] text-right text-[8.5pt]">
                {[['Reference', meta.ref || '—'], ['Issued', fmtDate(meta.issueDate)], ['Valid until', fmtDate(meta.validUntil)]].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[6.5pt] font-bold tracking-[.14em] uppercase" style={{ color: 'var(--doc-muted)' }}>{k}</dt>
                    <dd className="mt-[0.8mm] font-semibold whitespace-nowrap">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Client block */}
            {client.description && (
              <section className="mb-[6mm] rounded-[2.5mm] px-[6mm] py-[4.5mm] transition-colors duration-500"
                style={{ background: 'var(--doc-soft)', borderLeft: '1mm solid var(--doc-accent)' }}>
                <p className="text-[6.5pt] font-bold tracking-[.14em] uppercase" style={{ color: 'var(--doc-muted)' }}>Scope of work</p>
                <p className="mt-[1.5mm] leading-[1.6] whitespace-pre-wrap">{client.description}</p>
              </section>
            )}

            {/* Items table */}
            <table className="w-full border-collapse tabular-nums">
              <thead>
                <tr className="text-[6.5pt] font-bold tracking-[.12em] uppercase" style={{ color: 'var(--doc-muted)' }}>
                  {['#', 'Product / Service', 'Item #', 'Qty', 'Unit Price', 'Total'].map((h, i) => (
                    <th key={h} className={`px-[2mm] pb-[2.5mm] ${i >= 3 ? 'text-right' : 'text-left'}`} style={{ borderBottom: '1.5px solid var(--doc-accent)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length ? rows.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--doc-border)' }}>
                    <td className={`w-[8mm] ${cell}`} style={{ color: 'var(--doc-muted)' }}>{String(i + 1).padStart(2, '0')}</td>
                    <td className={`${cell} font-semibold`}>{r.name || ph('Untitled item')}</td>
                    <td className={`${cell} text-[8.5pt]`} style={{ color: 'var(--doc-muted)' }}>{r.sku || '—'}</td>
                    <td className={`${cell} text-right`}>{r.qty}</td>
                    <td className={`${cell} text-right`}>{money(Number(r.price) || 0)}</td>
                    <td className={`${cell} text-right font-bold`}>{money(r.total)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="py-[8mm] text-center italic" style={{ color: 'var(--doc-muted)' }}>No line items yet — add products or services.</td></tr>
                )}
              </tbody>
            </table>

            {/* Summary */}
            <div className="mt-[5mm] flex justify-end">
              <dl className="w-[78mm] tabular-nums">
                <SumRow label="Subtotal" value={money(totals.subtotal)} />
                {adjust.discountOn && <SumRow label={`Discount (${adjust.discount}%)`} value={`− ${money(totals.discount)}`} />}
                {adjust.taxOn && <SumRow label={`VAT (${adjust.tax}%)`} value={money(totals.tax)} />}
                <div className="mt-[2mm] flex items-center justify-between rounded-[2.5mm] px-[5mm] py-[4mm] transition-colors duration-500"
                  style={{ background: 'var(--doc-accent)', color: 'var(--doc-on-accent)' }}>
                  <dt className="text-[7.5pt] font-bold tracking-[.14em] uppercase opacity-75">Grand Total</dt>
                  <dd className="text-[16pt] font-extrabold">{money(totals.grand)}</dd>
                </div>
              </dl>
            </div>

            {/* Footer */}
            <footer className="mt-auto pt-[8mm]">
              {terms.text && (
                <p className="mb-[8mm] text-[7.5pt] leading-[1.6] whitespace-pre-wrap" style={{ color: 'var(--doc-muted)' }}>
                  <strong style={{ color: 'var(--doc-text)' }}>Terms. </strong>{terms.text}
                </p>
              )}
              <div className="grid grid-cols-2 gap-[14mm]">
                <Sig title={terms.signatory || 'Authorized signatory'} sub={terms.signatoryTitle || 'GeoLab'} />
                <Sig title={`Accepted by ${client.name || 'Client'}`} sub="Name, signature & date" />
              </div>
              <div className="mt-[7mm] flex flex-wrap justify-between gap-[4mm] pt-[3.5mm] text-[7.5pt]"
                style={{ borderTop: '1px solid var(--doc-border)', color: 'var(--doc-muted)' }}>
                <span className="font-bold" style={{ color: 'var(--doc-accent)' }}>GeoLab · The art of using AI</span>
                <span>info@geolab.edu.ge</span><span>geolab.edu.ge</span><span>Tbilisi, Georgia</span>
              </div>
            </footer>
          </div>
        </article>
      </div>
    </div>
  )
}

const SumRow = ({ label, value }) => (
  <div className="flex justify-between px-[5mm] py-[1.6mm]">
    <dt style={{ color: 'var(--doc-muted)' }}>{label}</dt><dd className="font-semibold">{value}</dd>
  </div>
)

const Sig = ({ title, sub }) => (
  <div>
    <div className="h-[12mm]" style={{ borderBottom: '1px solid var(--doc-text)' }} />
    <p className="mt-[2mm] text-[8.5pt] font-semibold">{title}</p>
    <p className="text-[7.5pt]" style={{ color: 'var(--doc-muted)' }}>{sub}</p>
  </div>
)
