import { useEffect, useMemo, useState, useCallback } from 'react'

const STORE = 'geolab-offer-v2'
const SEQ = 'geolab-offer-seq'

export const isoDate = (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return isoDate(d) }
export const uid = () => Math.random().toString(36).slice(2, 10)

export function nextRef() {
  const n = parseInt(localStorage.getItem(SEQ) || '0', 10) + 1
  localStorage.setItem(SEQ, String(n))
  return `OFFER-${new Date().getFullYear()}-${String(n).padStart(3, '0')}`
}

const DEFAULT_TERMS =
  'This offer is issued by GeoLab within the framework of "The art of using AI" program. Prices include program materials, facilitation and post-session resources. Payment terms: 50% upon acceptance, 50% upon completion. This offer is valid until the date indicated above.'

export const emptyItem = () => ({ id: uid(), name: '', sku: '', qty: 1, price: '' })

export function defaults() {
  return {
    client: { name: '', description: '', logo: null },
    meta: { ref: nextRef(), issueDate: isoDate(), validUntil: addDays(30), currency: 'GEL' },
    theme: { preset: 'minimal', custom: '#FFF7ED' },
    items: [emptyItem()],
    adjust: { discountOn: false, discount: 10, taxOn: false, tax: 18 },
    terms: { text: DEFAULT_TERMS, signatory: 'Program Director', signatoryTitle: 'GeoLab · The art of using AI' },
  }
}

export function demo(prev) {
  return {
    ...prev,
    client: { ...prev.client, name: 'Nimbus Financial Group', description: 'A tailored AI enablement track for the leadership and product teams of Nimbus Financial Group — covering responsible AI strategy, hands-on generative tooling and a capstone innovation sprint.' },
    theme: { ...prev.theme, preset: 'cool' },
    items: [
      { id: uid(), name: 'AI Strategy Workshop (full day)', sku: 'TAI-WS-01', qty: 1, price: 3200 },
      { id: uid(), name: 'Executive Training Module', sku: 'TAI-EX-04', qty: 3, price: 1450 },
      { id: uid(), name: 'Generative AI Hands-on Lab (per seat)', sku: 'TAI-LAB-12', qty: 20, price: 180 },
      { id: uid(), name: 'Capstone Innovation Sprint', sku: 'TAI-CS-02', qty: 1, price: 2600 },
    ],
    adjust: { discountOn: true, discount: 5, taxOn: true, tax: 18 },
  }
}

const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0 }

export function useOffer() {
  const [state, setState] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem(STORE)); if (s?.items) return s } catch { /* ignore */ }
    return defaults()
  })

  useEffect(() => {
    try { localStorage.setItem(STORE, JSON.stringify(state)) }
    catch { /* quota (large logo) — skip persistence */ }
  }, [state])

  const patch = useCallback((key, value) =>
    setState(s => ({ ...s, [key]: typeof value === 'function' ? value(s[key]) : { ...s[key], ...value } })), [])

  const totals = useMemo(() => {
    const rows = state.items.map(i => ({ ...i, total: num(i.qty) * num(i.price) }))
    const subtotal = rows.reduce((s, r) => s + r.total, 0)
    const discount = state.adjust.discountOn ? subtotal * num(state.adjust.discount) / 100 : 0
    const taxable = subtotal - discount
    const tax = state.adjust.taxOn ? taxable * num(state.adjust.tax) / 100 : 0
    return { rows, subtotal, discount, tax, grand: taxable + tax }
  }, [state.items, state.adjust])

  const money = useCallback(v => new Intl.NumberFormat('en-US', { style: 'currency', currency: state.meta.currency, minimumFractionDigits: 2 }).format(v), [state.meta.currency])

  return { state, setState, patch, totals, money }
}

export const fmtDate = v => v ? new Date(v + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'
