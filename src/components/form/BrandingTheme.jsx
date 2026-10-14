import { useRef, useState } from 'react'
import { Palette, UploadCloud, Trash2, Check, Pipette } from 'lucide-react'
import Section from './Section'
import { THEMES } from '../../lib/themes'

const ACCEPT = ['image/png', 'image/jpeg', 'image/svg+xml']
const MAX = 2 * 1024 * 1024

export default function BrandingTheme({ state, patch, toast }) {
  const inputRef = useRef(null)
  const [drag, setDrag] = useState(false)
  const { logo } = state.client

  const readFile = file => {
    if (!file) return
    if (!ACCEPT.includes(file.type)) return toast('Please upload a PNG, JPG or SVG file')
    if (file.size > MAX) return toast('Logo must be under 2 MB')
    const reader = new FileReader()
    reader.onload = () => patch('client', { logo: reader.result })
    reader.readAsDataURL(file)
  }

  const swatches = [...Object.entries(THEMES)]

  return (
    <Section icon={Palette} title="Branding & Theme" hint="Client logo and document palette">
      <div>
        <span className="label">Client Logo</span>
        {logo ? (
          <div className="flex items-center gap-4 rounded-xl border border-line bg-slate-50 p-3">
            <div className="grid h-16 w-28 place-items-center rounded-lg border border-line bg-white p-2">
              <img src={logo} alt="Client logo preview" className="max-h-full max-w-full object-contain" />
            </div>
            <div className="flex flex-1 flex-wrap gap-2">
              <button type="button" className="btn" onClick={() => inputRef.current?.click()}><UploadCloud size={15} />Replace</button>
              <button type="button" id="btn-remove-logo" className="btn hover:border-red-300 hover:bg-red-50 hover:text-red-600" onClick={() => patch('client', { logo: null })}>
                <Trash2 size={15} />Remove Logo
              </button>
            </div>
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); readFile(e.dataTransfer.files[0]) }}
            className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition
              ${drag ? 'border-accent bg-slate-100' : 'border-line hover:border-slate-400 hover:bg-slate-50'}`}
          >
            <span className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-600"><UploadCloud size={20} /></span>
            <span className="font-semibold">Drop logo here or <span className="underline underline-offset-2">browse</span></span>
            <span className="text-xs text-slate-500">PNG, JPG or SVG · max 2 MB</span>
          </div>
        )}
        <input
          ref={inputRef} id="client-logo" type="file" accept=".png,.jpg,.jpeg,.svg" className="hidden"
          onChange={e => { readFile(e.target.files[0]); e.target.value = '' }}
        />
      </div>

      <div>
        <span className="label">Document Palette</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {swatches.map(([key, t]) => {
            const active = state.theme.preset === key
            return (
              <button
                key={key} type="button" id={`theme-${key}`}
                onClick={() => patch('theme', { preset: key })}
                className={`group relative flex cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 text-left transition hover:-translate-y-px
                  ${active ? 'border-accent ring-2 ring-slate-900/10' : 'border-line hover:border-slate-300'}`}
              >
                <span className="relative size-8 shrink-0 overflow-hidden rounded-lg border" style={{ background: t.bg, borderColor: t.border }}>
                  <span className="absolute inset-x-0 bottom-0 h-1.5" style={{ background: t.accent }} />
                </span>
                <span className="text-xs leading-tight font-semibold">{t.name}</span>
                {active && <Check size={14} className="absolute top-1.5 right-1.5 text-accent" />}
              </button>
            )
          })}
          <label
            className={`relative flex cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 transition hover:-translate-y-px
              ${state.theme.preset === 'custom' ? 'border-accent ring-2 ring-slate-900/10' : 'border-line hover:border-slate-300'}`}
          >
            <span className="relative size-8 shrink-0 overflow-hidden rounded-lg border border-line" style={{ background: state.theme.custom }}>
              <Pipette size={14} className="absolute inset-0 m-auto mix-blend-difference text-white" />
              <input
                id="theme-custom" type="color" value={state.theme.custom}
                onChange={e => patch('theme', { preset: 'custom', custom: e.target.value })}
                onClick={() => patch('theme', { preset: 'custom' })}
                className="absolute inset-0 size-full cursor-pointer opacity-0"
                aria-label="Custom document background color"
              />
            </span>
            <span className="text-xs leading-tight font-semibold">Custom<br /><span className="font-mono font-normal text-slate-500 uppercase">{state.theme.custom}</span></span>
            {state.theme.preset === 'custom' && <Check size={14} className="absolute top-1.5 right-1.5 text-accent" />}
          </label>
        </div>
      </div>
    </Section>
  )
}
