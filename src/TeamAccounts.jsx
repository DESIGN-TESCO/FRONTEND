import React, { useEffect, useMemo, useState } from 'react';
import { UserPlus, X, KeyRound, Power, Pencil, Eye, Trash2 } from 'lucide-react';
import { authApi, requestsApi } from './api/client';

// Design Head — create & manage Design Team login accounts (secure, hashed on the
// backend). Create / edit / reset password / activate-deactivate / view assigned work.

const field = { width: '100%', boxSizing: 'border-box', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem', marginTop: '4px', fontFamily: 'inherit' };
const label = { fontSize: '0.78rem', fontWeight: 600, color: '#64748B' };
const DEFAULT_DESIGS = ['Design Engineer', 'Structural Design Engineer', 'Structural Engineer'];

export default function TeamAccounts() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [editing, setEditing] = useState(null); // { isNew, id, data }
  const [busy, setBusy] = useState(false);
  const [addingDesig, setAddingDesig] = useState(false);
  const [workFor, setWorkFor] = useState(null); // { user, rows }
  const desigOptions = useMemo(() => { const set = new Set(DEFAULT_DESIGS); users.forEach((u) => { if (u.designation) set.add(u.designation); }); return Array.from(set); }, [users]);

  const load = async () => {
    setLoading(true); setErr('');
    try { const d = await authApi.listUsers(); setUsers(d.users || []); }
    catch (e) { setErr(e.message || 'Could not load accounts.'); setUsers([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const blank = () => ({ name: '', employeeId: '', designation: '', username: '', email: '', password: '', confirm: '', role: 'design_team', isActive: true });
  const openNew = () => { setAddingDesig(false); setEditing({ isNew: true, id: null, data: blank() }); };
  const openEdit = (u) => { setAddingDesig(false); setEditing({ isNew: false, id: u._id, data: { name: u.name || '', employeeId: u.employeeId || '', designation: u.designation || '', username: u.username || '', email: u.email || '', role: u.role || 'design_team', isActive: u.isActive !== false, password: '', confirm: '' } }); };
  const setD = (k, v) => setEditing((e) => ({ ...e, data: { ...e.data, [k]: v } }));

  const save = async (e) => {
    e.preventDefault();
    const d = editing.data;
    if (!d.name.trim()) { alert('Employee name is required.'); return; }
    if (!d.email && !d.username) { alert('Enter a username or email.'); return; }
    if (editing.isNew) {
      if (!d.password || d.password.length < 6) { alert('Password must be at least 6 characters.'); return; }
      if (d.password !== d.confirm) { alert('Passwords do not match.'); return; }
    }
    setBusy(true);
    try {
      if (editing.isNew) {
        await authApi.createUser({ name: d.name, employeeId: d.employeeId, designation: d.designation, username: d.username, email: d.email, password: d.password, role: d.role, isActive: d.isActive });
      } else {
        await authApi.updateUser(editing.id, { name: d.name, employeeId: d.employeeId, designation: d.designation, username: d.username, email: d.email, role: d.role, isActive: d.isActive });
      }
      setEditing(null); await load();
    } catch (e2) { alert(e2.message || 'Could not save account.'); }
    finally { setBusy(false); }
  };

  const resetPw = async (u) => {
    const np = window.prompt(`New password for ${u.name}:`);
    if (np === null) return;
    if (np.length < 6) { alert('Password must be at least 6 characters.'); return; }
    try { await authApi.resetUserPassword(u._id, np); alert('Password reset.'); }
    catch (e) { alert(e.message || 'Could not reset password.'); }
  };
  const toggleActive = async (u) => {
    try { await authApi.setUserActive(u._id, !(u.isActive !== false)); await load(); }
    catch (e) { alert(e.message || 'Could not update status.'); }
  };
  const del = async (u) => {
    if (!window.confirm(`Delete the account for ${u.name}? This cannot be undone.`)) return;
    try { await authApi.deleteUser(u._id); await load(); }
    catch (e) { alert(e.message || 'Could not delete account.'); }
  };
  const viewWork = async (u) => {
    try { const all = await requestsApi.list(); setWorkFor({ user: u, rows: all.filter((r) => r.assignedDesigner === u.name) }); }
    catch (e) { alert(e.message || 'Could not load assigned work.'); }
  };

  const roleLabel = (r) => (r === 'design_head' ? 'Design Head' : 'Design Team');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Team Accounts</h3>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0' }}>Create and manage Design Team login credentials.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600 }} onClick={openNew}><UserPlus size={16} /> Create Account</button>
      </div>

      {err && <div style={{ color: '#991B1B', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: '0.85rem' }}>{err}</div>}

      <div className="table-card" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
        <table className="crm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Employee</th><th style={{ padding: '10px' }}>Employee ID</th>
              <th style={{ padding: '10px' }}>Login</th><th style={{ padding: '10px' }}>Role</th>
              <th style={{ padding: '10px' }}>Status</th><th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center', color: '#64748B' }}>Loading…</td></tr>
              : users.length === 0 ? <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center', color: '#64748B' }}>No accounts yet. Click "Create Account" to add a Design Team member.</td></tr>
                : users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 600 }}>{u.name}{u.designation ? <div style={{ fontWeight: 400, fontSize: '0.72rem', color: '#64748B' }}>{u.designation}</div> : null}</td>
                    <td style={{ padding: '12px 10px' }}>{u.employeeId || '—'}</td>
                    <td style={{ padding: '12px 10px' }}>{u.username || u.email || '—'}</td>
                    <td style={{ padding: '12px 10px' }}>{roleLabel(u.role)}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700, color: '#fff', background: u.isActive !== false ? '#16a34a' : '#94a3b8' }}>{u.isActive !== false ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => openEdit(u)}><Pencil size={12} /> Edit</button>
                        <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => resetPw(u)}><KeyRound size={12} /> Reset</button>
                        <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => toggleActive(u)}><Power size={12} /> {u.isActive !== false ? 'Deactivate' : 'Activate'}</button>
                        <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => viewWork(u)}><Eye size={12} /> Work</button>
                        <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 4, color: '#991B1B' }} onClick={() => del(u)}><Trash2 size={12} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px' }}>
          {/* Absorbs Chrome's login autofill so it doesn't fill the new-account fields. */}
          <input type="text" name="ta_fake_user" autoComplete="username" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />
          <input type="password" name="ta_fake_pass" autoComplete="current-password" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />
          <form autoComplete="off" onSubmit={save} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', width: '560px', maxWidth: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{editing.isNew ? 'Create Team Account' : 'Edit Account'}</h3>
              <button type="button" onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label style={label}>Employee Name *<input style={field} value={editing.data.name} onChange={(e) => setD('name', e.target.value)} /></label>
              <label style={label}>Employee ID<input style={field} value={editing.data.employeeId} onChange={(e) => setD('employeeId', e.target.value)} /></label>
              <label style={label}>Username<input style={field} value={editing.data.username} onChange={(e) => setD('username', e.target.value)} placeholder="login username" /></label>
              <label style={label}>Email<input style={field} value={editing.data.email} onChange={(e) => setD('email', e.target.value)} placeholder="name@tesco.com" /></label>
              {editing.isNew && <label style={label}>Password *<input type="password" style={field} value={editing.data.password} onChange={(e) => setD('password', e.target.value)} /></label>}
              {editing.isNew && <label style={label}>Confirm Password *<input type="password" style={field} value={editing.data.confirm} onChange={(e) => setD('confirm', e.target.value)} /></label>}
              <label style={label}>Designation
                {addingDesig ? (
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <input style={{ ...field, marginTop: 0 }} value={editing.data.designation} onChange={(e) => setD('designation', e.target.value)} placeholder="New designation" autoFocus />
                    <button type="button" className="btn-secondary" style={{ padding: '0 10px', fontSize: '0.72rem', whiteSpace: 'nowrap' }} onClick={() => setAddingDesig(false)}>List</button>
                  </div>
                ) : (
                  <select style={field} value={desigOptions.includes(editing.data.designation) ? editing.data.designation : ''} onChange={(e) => { if (e.target.value === '__add__') { setAddingDesig(true); setD('designation', ''); } else setD('designation', e.target.value); }}>
                    <option value="">— Select —</option>
                    {desigOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                    <option value="__add__">➕ Add new designation…</option>
                  </select>
                )}
              </label>
              <label style={label}>Access Role<select style={field} value={editing.data.role} onChange={(e) => setD('role', e.target.value)}><option value="design_team">Design Team</option><option value="design_head">Design Head</option></select></label>
              <label style={label}>Account Status<select style={field} value={editing.data.isActive ? '1' : '0'} onChange={(e) => setD('isActive', e.target.value === '1')}><option value="1">Active</option><option value="0">Inactive</option></select></label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Saving…' : editing.isNew ? 'Create Account' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      )}

      {workFor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px' }} onClick={() => setWorkFor(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', width: '640px', maxWidth: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Assigned Work — {workFor.user.name}</h3>
              <button type="button" onClick={() => setWorkFor(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            {workFor.rows.length === 0 ? <p style={{ color: '#64748B', fontSize: '0.9rem' }}>No requests assigned to this member.</p>
              : (
                <table className="crm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ backgroundColor: '#F8FAFC', textAlign: 'left' }}><th style={{ padding: 8 }}>Request</th><th style={{ padding: 8 }}>Project</th><th style={{ padding: 8 }}>Due</th><th style={{ padding: 8 }}>Status</th></tr></thead>
                  <tbody>
                    {workFor.rows.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 8px', fontWeight: 600 }}>{r.id}</td>
                        <td style={{ padding: '10px 8px' }}>{r.projectName}</td>
                        <td style={{ padding: '10px 8px' }}>{r.dueDate || '—'}</td>
                        <td style={{ padding: '10px 8px' }}>{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
