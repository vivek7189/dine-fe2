'use client';

// "Also works as": other roles a staff member is trained for (MFC: a waiter who can help at takeaway).
// Used by the rota only — they can be rostered in, and pick open shifts for, these roles too.
// It never changes what they can open in the app (that stays with their main role).
const norm = (r) => String(r || '').trim().replace(/\s+/g, ' ').toLowerCase();

export default function AlsoWorksAs({ value = [], onChange, mainRole, roleOptions = [], labelFor = (r) => r }) {
  const chosen = new Set((value || []).map(norm));
  const options = [...new Set([...roleOptions, ...(value || [])])]
    .filter(r => r && !['owner', 'admin', 'co-owner', 'custom'].includes(norm(r)) && norm(r) !== norm(mainRole));
  if (!options.length) return null;
  const toggle = (r) => {
    const next = chosen.has(norm(r)) ? (value || []).filter(x => norm(x) !== norm(r)) : [...(value || []), r];
    onChange(next);
  };
  return (
    <div style={{ marginTop: '12px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Also works as <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></label>
      <div style={{ fontSize: '11.5px', color: '#6b7280', marginBottom: '6px' }}>Trained for other jobs — they can be put on the rota and pick open shifts for these too.</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {options.map(r => {
          const on = chosen.has(norm(r));
          return (
            <button key={r} type="button" onClick={() => toggle(r)} aria-pressed={on}
              style={{ padding: '5px 11px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                border: on ? '2px solid #2563eb' : '1px solid #e5e7eb', background: on ? '#eff6ff' : 'white', color: on ? '#1d4ed8' : '#4b5563' }}>
              {on ? '✓ ' : ''}{labelFor(r)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
