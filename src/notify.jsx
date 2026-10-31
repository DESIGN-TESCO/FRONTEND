import React from 'react';
import { createRoot } from 'react-dom/client';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

// Professional in-app notifications: toasts + confirm/prompt dialogs that replace
// the native window.alert / confirm / prompt. Self-mounting (attaches its own root
// to <body> on first use), so it works from any screen without wiring a provider.
//
//   notify('Saved')                                  → auto-styled toast
//   notify('Could not save', 'error')                → explicit style
//   await confirmDialog({ title, message, danger })  → Promise<boolean>
//   await promptDialog({ title, message, inputType })→ Promise<string|null>

const store = {
  toasts: [],
  dialog: null,
  subs: new Set(),
  emit() { this.subs.forEach((fn) => fn()); },
  add(t) { this.toasts = [...this.toasts, t]; this.emit(); setTimeout(() => this.remove(t.id), t.ttl || 4200); },
  remove(id) { this.toasts = this.toasts.filter((x) => x.id !== id); this.emit(); },
  setDialog(d) { this.dialog = d; this.emit(); },
};

let mounted = false;
function ensureMounted() {
  if (mounted || typeof document === 'undefined') return;
  mounted = true;
  const el = document.createElement('div');
  el.id = '__notify_root__';
  document.body.appendChild(el);
  createRoot(el).render(<NotifyHost />);
}

function detectType(m) {
  const s = String(m).toLowerCase();
  if (/could not|couldn't|fail|invalid|error|not match|do not match|must be|is required|no file|choose a file|cannot|unable|deactivated|larger than|incorrect|not found|already exists/.test(s)) return 'error';
  if (/success|approved|saved|created|sent|added|updated|deleted|reset|uploaded|rejected|commenced|request raised|request sent|completed|done/.test(s)) return 'success';
  return 'info';
}

export function notify(message, type) {
  if (message == null || message === '') return;
  ensureMounted();
  store.add({ id: Date.now() + Math.random(), message: String(message), type: type || detectType(message) });
}
export function confirmDialog(opts) {
  ensureMounted();
  const o = typeof opts === 'string' ? { message: opts } : (opts || {});
  return new Promise((resolve) => store.setDialog({ kind: 'confirm', ...o, resolve }));
}
export function promptDialog(opts) {
  ensureMounted();
  const o = typeof opts === 'string' ? { message: opts } : (opts || {});
  return new Promise((resolve) => store.setDialog({ kind: 'prompt', ...o, resolve }));
}

const TONE = {
  success: { bar: '#16a34a', bg: '#F0FDF4', icon: <CheckCircle2 size={18} color="#16a34a" /> },
  error: { bar: '#dc2626', bg: '#FEF2F2', icon: <AlertCircle size={18} color="#dc2626" /> },
  info: { bar: '#2563eb', bg: '#EFF6FF', icon: <Info size={18} color="#2563eb" /> },
};

function ToastItem({ t }) {
  const tone = TONE[t.type] || TONE.info;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 280, maxWidth: 400, background: '#FFFFFF', borderRadius: 10, boxShadow: '0 10px 25px rgba(15,23,42,0.18)', borderLeft: `4px solid ${tone.bar}`, padding: '12px 14px', animation: 'notifyIn .22s ease-out' }}>
      <div style={{ flexShrink: 0, marginTop: 1 }}>{tone.icon}</div>
      <div style={{ flex: 1, fontSize: 13.5, color: '#1E293B', lineHeight: 1.4, fontWeight: 500 }}>{t.message}</div>
      <button onClick={() => store.remove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0, lineHeight: 0, flexShrink: 0 }}><X size={15} /></button>
    </div>
  );
}

function NotifyHost() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  const [input, setInput] = React.useState('');
  React.useEffect(() => { store.subs.add(force); return () => store.subs.delete(force); }, []);
  const d = store.dialog;
  React.useEffect(() => { if (d && d.kind === 'prompt') setInput(d.defaultValue || ''); }, [d]);

  const close = (val) => { const r = d && d.resolve; store.setDialog(null); if (r) r(val); };
  const danger = d && d.danger;
  const btn = { padding: '9px 16px', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', border: 'none' };

  return (
    <>
      <style>{`@keyframes notifyIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}@keyframes notifyPop{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}`}</style>
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 100000, display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>
        {store.toasts.map((t) => <ToastItem key={t.id} t={t} />)}
      </div>

      {d && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100001, padding: 16, fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) close(d.kind === 'confirm' ? false : null); }}>
          <div style={{ background: '#FFFFFF', borderRadius: 14, padding: '22px 24px', width: 420, maxWidth: '100%', boxShadow: '0 20px 50px rgba(15,23,42,0.3)', animation: 'notifyPop .18s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              {danger ? <AlertTriangle size={20} color="#dc2626" /> : <Info size={20} color="#2563eb" />}
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>{d.title || (d.kind === 'confirm' ? 'Please confirm' : 'Enter a value')}</h3>
            </div>
            {d.message && <p style={{ margin: '0 0 14px', fontSize: 13.8, color: '#475569', lineHeight: 1.5 }}>{d.message}</p>}
            {d.kind === 'prompt' && (
              <input autoFocus type={d.inputType || 'text'} value={input} placeholder={d.placeholder || ''}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') close(input); if (e.key === 'Escape') close(null); }}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 14, outline: 'none', marginBottom: 4 }} />
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
              <button style={{ ...btn, background: '#F1F5F9', color: '#334155' }} onClick={() => close(d.kind === 'confirm' ? false : null)}>{d.cancelText || 'Cancel'}</button>
              <button autoFocus={d.kind === 'confirm'} style={{ ...btn, background: danger ? '#dc2626' : '#223C8A', color: '#FFFFFF' }} onClick={() => close(d.kind === 'confirm' ? true : input)}>{d.confirmText || (d.kind === 'confirm' ? 'Confirm' : 'OK')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
