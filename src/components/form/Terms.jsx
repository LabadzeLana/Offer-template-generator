import { FileSignature } from 'lucide-react'
import Section, { Field } from './Section'

export default function Terms({ state, patch }) {
  const { terms } = state
  return (
    <Section icon={FileSignature} title="Terms & Sign-off" hint="Program statement and signatory" defaultOpen={false}>
      <Field label="Terms / Program Statement">
        <textarea id="terms-text" rows={5} className="input resize-y leading-relaxed" value={terms.text}
          onChange={e => patch('terms', { text: e.target.value })} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Signatory Name">
          <input id="signatory" className="input" value={terms.signatory} onChange={e => patch('terms', { signatory: e.target.value })} />
        </Field>
        <Field label="Signatory Title">
          <input id="signatory-title" className="input" value={terms.signatoryTitle} onChange={e => patch('terms', { signatoryTitle: e.target.value })} />
        </Field>
      </div>
    </Section>
  )
}
