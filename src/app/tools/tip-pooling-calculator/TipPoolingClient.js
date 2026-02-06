'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function TipPoolingClient() {
  const [totalTips, setTotalTips] = useState('');
  const [method, setMethod] = useState('hours');
  const [staff, setStaff] = useState([
    { name: 'Server 1', role: 'server', hours: 8 },
    { name: 'Server 2', role: 'server', hours: 6 },
    { name: 'Busser', role: 'busser', hours: 8 },
  ]);

  const roleWeights = {
    server: { name: 'Server/Waiter', weight: 1.0 },
    captain: { name: 'Captain', weight: 1.2 },
    busser: { name: 'Busser/Runner', weight: 0.6 },
    bartender: { name: 'Bartender', weight: 1.0 },
    host: { name: 'Host/Hostess', weight: 0.5 },
    kitchen: { name: 'Kitchen Staff', weight: 0.4 },
  };

  const addStaff = () => {
    setStaff([...staff, { name: `Staff ${staff.length + 1}`, role: 'server', hours: 8 }]);
  };

  const removeStaff = (index) => {
    if (staff.length > 1) {
      setStaff(staff.filter((_, i) => i !== index));
    }
  };

  const updateStaff = (index, field, value) => {
    const newStaff = [...staff];
    newStaff[index][field] = value;
    setStaff(newStaff);
  };

  const calculateTips = () => {
    const tips = parseFloat(totalTips) || 0;
    if (tips <= 0) return null;

    if (method === 'equal') {
      const perPerson = tips / staff.length;
      return staff.map(s => ({ ...s, share: perPerson }));
    }

    if (method === 'hours') {
      const totalHours = staff.reduce((sum, s) => sum + (parseFloat(s.hours) || 0), 0);
      return staff.map(s => ({
        ...s,
        share: totalHours > 0 ? (tips * (parseFloat(s.hours) || 0)) / totalHours : 0
      }));
    }

    if (method === 'weighted') {
      const totalPoints = staff.reduce((sum, s) => {
        const hours = parseFloat(s.hours) || 0;
        const weight = roleWeights[s.role]?.weight || 1;
        return sum + (hours * weight);
      }, 0);

      return staff.map(s => {
        const hours = parseFloat(s.hours) || 0;
        const weight = roleWeights[s.role]?.weight || 1;
        const points = hours * weight;
        return { ...s, share: totalPoints > 0 ? (tips * points) / totalPoints : 0, points };
      });
    }

    return null;
  };

  const result = calculateTips();
  const tips = parseFloat(totalTips) || 0;

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Tip Pooling Calculator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Distribute tips fairly among your restaurant staff
            </p>
          </div>
        </section>

        {/* Calculator */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
              {/* Input */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Tip Details</h3>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Total Tips to Distribute (₹)
                  </label>
                  <input
                    type="number"
                    value={totalTips}
                    onChange={(e) => setTotalTips(e.target.value)}
                    placeholder="e.g., 5000"
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Distribution Method
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { key: 'equal', label: 'Equal Split' },
                      { key: 'hours', label: 'By Hours' },
                      { key: 'weighted', label: 'Role Weighted' },
                    ].map(m => (
                      <button
                        key={m.key}
                        onClick={() => setMethod(m.key)}
                        style={{
                          flex: 1, minWidth: '100px', padding: '12px',
                          backgroundColor: method === m.key ? '#059669' : '#f3f4f6',
                          color: method === m.key ? 'white' : '#374151',
                          border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px'
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Staff List */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                    Staff Members
                  </label>
                  {staff.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={s.name}
                        onChange={(e) => updateStaff(i, 'name', e.target.value)}
                        placeholder="Name"
                        style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                      />
                      <select
                        value={s.role}
                        onChange={(e) => updateStaff(i, 'role', e.target.value)}
                        style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                      >
                        {Object.entries(roleWeights).map(([key, val]) => (
                          <option key={key} value={key}>{val.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={s.hours}
                        onChange={(e) => updateStaff(i, 'hours', e.target.value)}
                        placeholder="Hrs"
                        style={{ width: '60px', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', textAlign: 'center' }}
                      />
                      <button
                        onClick={() => removeStaff(i)}
                        style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addStaff}
                    style={{ width: '100%', padding: '12px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px dashed #d1d5db', borderRadius: '8px', cursor: 'pointer', marginTop: '8px', fontWeight: '600' }}
                  >
                    + Add Staff Member
                  </button>
                </div>
              </div>

              {/* Results */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Tip Distribution</h3>

                {result ? (
                  <>
                    <div style={{ padding: '20px', backgroundColor: '#05966915', borderRadius: '12px', marginBottom: '24px', textAlign: 'center' }}>
                      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Total Tips</p>
                      <p style={{ fontSize: '32px', fontWeight: '800', color: '#059669' }}>₹{tips.toLocaleString()}</p>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      {result.map((s, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderBottom: '1px solid #e5e7eb' }}>
                          <div>
                            <p style={{ fontWeight: '600', color: '#111827' }}>{s.name}</p>
                            <p style={{ fontSize: '12px', color: '#6b7280' }}>
                              {roleWeights[s.role]?.name} • {s.hours} hrs
                              {method === 'weighted' && ` • ${s.points?.toFixed(1)} pts`}
                            </p>
                          </div>
                          <p style={{ fontSize: '18px', fontWeight: '700', color: '#059669' }}>₹{s.share.toFixed(0)}</p>
                        </div>
                      ))}
                    </div>

                    {method === 'weighted' && (
                      <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '13px', color: '#6b7280' }}>
                        <p style={{ fontWeight: '600', marginBottom: '8px' }}>Role Weights:</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {Object.entries(roleWeights).map(([key, val]) => (
                            <span key={key} style={{ padding: '4px 8px', backgroundColor: 'white', borderRadius: '4px' }}>
                              {val.name}: {val.weight}x
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <p>Enter total tips to calculate distribution</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 20px', backgroundColor: '#059669', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Automate Tip Management with DineOpen</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>Track tips automatically and generate staff payout reports.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#059669', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Start Free Trial
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
