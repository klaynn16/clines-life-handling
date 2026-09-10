export function Field({ label, children, required = false }) { return <label className="field"><span>{label}{required && <i> *</i>}</span>{children}</label>; }
export const input = (value, onChange, placeholder = '') => <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />;
