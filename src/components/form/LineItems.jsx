import { useState } from 'react'
import { ListOrdered, GripVertical, ArrowUp, ArrowDown, X, Plus } from 'lucide-react'
import Section, { Toggle } from './Section'
import { emptyItem } from '../../hooks/useOffer'

export default function LineItems({ state, patch, totals, money }) {
  const [dragId, setDragId] = useState(null)
  const [overId, setOverId] = useState(null)
  const setItems = fn => patch('items', fn)

  const update = (id, key, value) => setItems(items => items.map(i => (i.id === id ? { ...i, [key]: value } : i)))
  const remove = id => setItems(items => (items.length > 1 ? items.filter(i => i.id !== id) : [emptyItem()]))
  const move = (from, to) => setItems(items => {
    if (to < 0 || to >= items.length) return items
    const next = [...items]; const [m] = next.splice(from, 1); next.splice(to, 0, m); return next
  })

  const onDrop = targetId => {
    const items = state.items
    move(items.findIndex(i => i.id === dragId), items.findIndex(i => i.id === targetId))
    setDragId(null); setOverId(null)
  }

  const cols = 'grid grid-cols-[18px_minmax(0,2.4fr)_minmax(0,1fr)_56px_minmax(0,1.1fr)] gap-1.5 items-center'

  return (
    <Section icon={ListOrdered} title="Products & Services" hint="Line items, discount and VAT">
      <div className={`${cols} px-0.5 text-[10.5px] font-semibold tracking-wider text-slate-500 uppercase max-sm:hidden`}>
        <span /><span>Name</span><span>Code</span><span>Qty</span><span>Unit Price</span>
      </div>

      <ul className="space-y-2">
        {totals.rows.map((item, idx) => (
          <li
            key={item.id}
            draggable={dragId === item.id}
            onDragOver={e => { e.preventDefault(); setOverId(item.id) }}
            onDragLeave={() => setOverId(null)}
            onDrop={() => onDrop(item.id)}
            onDragEnd={() => { setDragId(null); setOverId(null) }}
            className={`animate-rise rounded-xl border p-2 transition
              ${dragId === item.id ? 'opacity-40' : ''} ${overId === item.id && dragId !== item.id ? 'border-accent bg-slate-50' : 'border-line'}`}
          >
            <div className={`${cols} max-sm:grid-cols-[18px_1fr_1fr]`}>
              <span
                className="cursor-grab text-slate-400 hover:text-accent active:cursor-grabbing"
                onMouseDown={() => setDragId(item.id)} onMouseUp={() => setDragId(null)}
                title="Drag to reorder" aria-hidden
              ><GripVertical size={16} /></span>
              <input className="input px-2.5 max-sm:col-span-2" placeholder="Service name" aria-label="Product name"
                value={item.name} onChange={e => update(item.id, 'name', e.target.value)} />
              <input className="input px-2.5 max-sm:col-start-2" placeholder="Code" aria-label="Product code"
                value={item.sku} onChange={e => update(item.id, 'sku', e.target.value)} />
              <input className="input px-2 text-center" type="number" min="0" step="1" aria-label="Quantity"
                value={item.qty} onChange={e => update(item.id, 'qty', e.target.value)} />
              <input className="input px-2.5 max-sm:col-span-2 max-sm:col-start-2" type="number" min="0" step="0.01" placeholder="0.00" aria-label="Unit price"
                value={item.price} onChange={e => update(item.id, 'price', e.target.value)} />
            </div>
            <div className="mt-1.5 flex items-center justify-between pl-6">
              <div className="flex gap-1">
                <button type="button" className="icon-btn size-7" disabled={idx === 0} onClick={() => move(idx, idx - 1)} aria-label="Move up"><ArrowUp size={13} /></button>
                <button type="button" className="icon-btn size-7" disabled={idx === state.items.length - 1} onClick={() => move(idx, idx + 1)} aria-label="Move down"><ArrowDown size={13} /></button>
                <button type="button" className="icon-btn size-7 hover:border-red-300 hover:bg-red-50 hover:text-red-600" onClick={() => remove(item.id)} aria-label="Remove item"><X size={13} /></button>
              </div>
              <span className="text-[13px] font-bold tabular-nums">{money(item.total)}</span>
            </div>
          </li>
        ))}
      </ul>

      <button type="button" id="btn-add-item"
        className="btn w-full border-dashed text-slate-500 hover:border-accent hover:bg-slate-50 hover:text-accent"
        onClick={() => setItems(items => [...items, emptyItem()])}>
        <Plus size={15} />Add line item
      </button>

      <div className="space-y-3 border-t border-line pt-4">
        {[['discount', 'Apply Discount'], ['tax', 'Apply Tax / VAT']].map(([k, label]) => {
          const on = state.adjust[`${k}On`]
          return (
            <div key={k} className="flex items-center justify-between gap-3">
              <Toggle checked={on} label={label} onChange={v => patch('adjust', { [`${k}On`]: v })} />
              <div className={`flex items-center gap-1.5 transition ${on ? '' : 'pointer-events-none opacity-35'}`}>
                <input id={`${k}-rate`} type="number" min="0" max="100" step="0.1" className="input w-20 text-right"
                  value={state.adjust[k]} onChange={e => patch('adjust', { [k]: e.target.value })} aria-label={`${label} percent`} />
                <span className="text-slate-500">%</span>
              </div>
            </div>
          )
        })}
      </div>

      <dl className="space-y-1.5 rounded-xl bg-slate-50 p-4 tabular-nums">
        <Row label="Subtotal" value={money(totals.subtotal)} />
        {state.adjust.discountOn && <Row label={`Discount (${state.adjust.discount}%)`} value={`− ${money(totals.discount)}`} />}
        {state.adjust.taxOn && <Row label={`VAT (${state.adjust.tax}%)`} value={money(totals.tax)} />}
        <div className="mt-2 flex justify-between border-t border-line pt-2.5">
          <dt className="font-bold text-accent">Grand Total</dt>
          <dd className="text-lg font-extrabold">{money(totals.grand)}</dd>
        </div>
      </dl>
    </Section>
  )
}

const Row = ({ label, value }) => (
  <div className="flex justify-between"><dt className="text-slate-500">{label}</dt><dd className="font-semibold">{value}</dd></div>
)
