import { Building2, RefreshCw } from 'lucide-react'
import Section, { Field } from './Section'
import { nextRef } from '../../hooks/useOffer'

export default function ClientDetails({ state, patch }) {
  const { client, meta } = state
  return (
    <Section icon={Building2} title="Client Details" hint="Organization, reference and dates">
      <Field label="Organization Name">
        <input id="client-name" className="input" placeholder="e.g. Acme Corporation" value={client.name}
          onChange={e => patch('client', { name: e.target.value })} />
      </Field>
      <Field label="Short Description / Scope of Work">
        <textarea id="client-description" rows={3} className="input resize-y" placeholder="Brief background or project scope…"
          value={client.description} onChange={e => patch('client', { description: e.target.value })} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Reference Number">
          <div className="flex gap-1.5">
            <input id="offer-ref" className="input" value={meta.ref} onChange={e => patch('meta', { ref: e.target.value })} />
            <button type="button" className="icon-btn size-[38px]" title="Generate new reference" aria-label="Generate new reference"
              onClick={() => patch('meta', { ref: nextRef() })}><RefreshCw size={15} /></button>
          </div>
        </Field>
        <Field label="Currency">
          <select id="currency" className="input" value={meta.currency} onChange={e => patch('meta', { currency: e.target.value })}>
            <option value="GEL">GEL (₾)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </Field>
        <Field label="Issue Date">
          <input id="issue-date" type="date" className="input" value={meta.issueDate} onChange={e => patch('meta', { issueDate: e.target.value })} />
        </Field>
        <Field label="Valid Until">
          <input id="valid-until" type="date" className="input" min={meta.issueDate} value={meta.validUntil} onChange={e => patch('meta', { validUntil: e.target.value })} />
        </Field>
      </div>
    </Section>
  )
}
