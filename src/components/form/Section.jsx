import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function Section({ icon: Icon, title, hint, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="animate-rise rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(15,23,42,.04),0_8px_24px_rgba(15,23,42,.05)]">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left"
      >
        <span className="grid size-8 place-items-center rounded-lg bg-accent text-white"><Icon size={16} /></span>
        <span className="flex-1">
          <span className="block text-[15px] font-bold tracking-tight">{title}</span>
          {hint && <span className="block text-xs text-slate-500">{hint}</span>}
        </span>
        <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="space-y-4 border-t border-line px-5 pt-4 pb-5">{children}</div>
        </div>
      </div>
    </section>
  )
}

export function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
    </label>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 select-none">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="relative h-5.5 w-9.5 rounded-full bg-slate-300 transition peer-checked:bg-accent peer-focus-visible:ring-3 peer-focus-visible:ring-slate-900/15
        after:absolute after:top-[3px] after:left-[3px] after:size-4 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-4" />
      <span className="font-semibold">{label}</span>
    </label>
  )
}
