'use client';

import { useState } from 'react';
import { FaUsers, FaPlus, FaTimes, FaTrash, FaEdit, FaSearch, FaPhone, FaEnvelope, FaUserTag } from 'react-icons/fa';
import apiClient from '../../lib/api';
import { getRoleColor, ALL_ROLES } from './constants';

export default function TeamTab({ restaurantId, staff, setStaff, isMobile }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', role: 'employee', startDate: new Date().toISOString().split('T')[0] });

  const activeStaff = (staff || []).filter(s => s.status !== 'deleted');
  const filtered = activeStaff.filter(s => {
    const matchSearch = !searchTerm || s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.phone?.includes(searchTerm);
    const matchRole = filterRole === 'all' || s.role === filterRole;
    return matchSearch && matchRole;
  });

  const roles = [...new Set(activeStaff.map(s => s.role).filter(Boolean))];

  const openAdd = () => {
    setEditingStaff(null);
    setForm({ name: '', phone: '', email: '', role: 'employee', startDate: new Date().toISOString().split('T')[0] });
    setShowAddModal(true);
  };

  const openEdit = (member) => {
    setEditingStaff(member);
    setForm({ name: member.name || '', phone: member.phone || '', email: member.email || '', role: member.role || 'employee', startDate: member.startDate || '' });
    setShowAddModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editingStaff) {
        await apiClient.updateStaff(editingStaff.id, form);
        setStaff(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...form } : s));
      } else {
        const res = await apiClient.addStaff(restaurantId, form);
        const newMember = res.staff || res;
        setStaff(prev => [...prev, newMember]);
      }
      setShowAddModal(false);
    } catch (err) {
      console.error('Error saving staff:', err);
      alert('Failed to save: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member) => {
    if (!confirm(`Remove ${member.name} from the team?`)) return;
    try {
      await apiClient.deleteStaff(member.id);
      setStaff(prev => prev.filter(s => s.id !== member.id));
    } catch (err) {
      console.error('Error deleting staff:', err);
    }
  };

  const handleStatusToggle = async (member) => {
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    try {
      await apiClient.updateStaff(member.id, { status: newStatus });
      setStaff(prev => prev.map(s => s.id === member.id ? { ...s, status: newStatus } : s));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '20px', flexWrap: 'wrap', gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '200px' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
            <FaSearch size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text" placeholder="Search team..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '9px 12px 9px 34px', borderRadius: '20px',
                border: 'none', backgroundColor: '#f3f4f6', fontSize: '13px', outline: 'none'
              }}
            />
          </div>
          {/* Role filter */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button onClick={() => setFilterRole('all')} style={{
              padding: '6px 14px', borderRadius: '20px', border: 'none',
              backgroundColor: filterRole === 'all' ? '#111827' : '#f3f4f6',
              color: filterRole === 'all' ? 'white' : '#6b7280',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer'
            }}>All</button>
            {roles.map(r => (
              <button key={r} onClick={() => setFilterRole(r)} style={{
                padding: '6px 14px', borderRadius: '20px', border: 'none',
                backgroundColor: filterRole === r ? getRoleColor(r).block : '#f3f4f6',
                color: filterRole === r ? 'white' : '#6b7280',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize'
              }}>{r}</button>
            ))}
          </div>
        </div>
        <button onClick={openAdd} style={{
          padding: '10px 18px', borderRadius: '12px', border: 'none',
          background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white',
          fontWeight: 600, fontSize: '14px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px',
          boxShadow: '0 4px 12px rgba(239,68,68,0.3)'
        }}><FaPlus size={12} /> Add Staff</button>
      </div>

      {/* Staff Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '12px'
      }}>
        {filtered.map(member => {
          const rc = getRoleColor(member.role);
          const isInactive = member.status === 'inactive';
          return (
            <div key={member.id} style={{
              backgroundColor: 'white', borderRadius: '14px', padding: '16px',
              border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              opacity: isInactive ? 0.6 : 1, transition: 'all 0.2s',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    backgroundColor: rc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', fontWeight: 700, color: rc.text
                  }}>
                    {(member.name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{member.name}</div>
                    <span style={{
                      fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px',
                      backgroundColor: rc.bg, color: rc.text, textTransform: 'capitalize'
                    }}>{member.role}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => openEdit(member)} style={{
                    padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: '#f3f4f6',
                    cursor: 'pointer', color: '#6b7280'
                  }}><FaEdit size={12} /></button>
                  <button onClick={() => handleDelete(member)} style={{
                    padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: '#fee2e2',
                    cursor: 'pointer', color: '#dc2626'
                  }}><FaTrash size={12} /></button>
                </div>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {member.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
                    <FaPhone size={10} /> {member.phone}
                  </div>
                )}
                {member.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
                    <FaEnvelope size={10} /> {member.email}
                  </div>
                )}
              </div>

              {/* Status toggle */}
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: isInactive ? '#dc2626' : '#22c55e', fontWeight: 600 }}>
                  {isInactive ? 'Inactive' : 'Active'}
                </span>
                <button onClick={() => handleStatusToggle(member)} style={{
                  width: '36px', height: '20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  backgroundColor: isInactive ? '#d1d5db' : '#22c55e', position: 'relative', transition: 'all 0.2s'
                }}>
                  <div style={{
                    width: '16px', height: '16px', borderRadius: '8px', backgroundColor: 'white',
                    position: 'absolute', top: '2px', transition: 'all 0.2s',
                    left: isInactive ? '2px' : '18px', boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
          <FaUsers size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
          <p style={{ fontSize: '15px', fontWeight: 600 }}>No team members found</p>
          <p style={{ fontSize: '13px' }}>Add staff to start scheduling shifts</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
          backdropFilter: 'blur(4px)'
        }} onClick={() => setShowAddModal(false)}>
          <div style={{
            backgroundColor: 'white', borderRadius: '20px', width: '100%', maxWidth: '440px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
                {editingStaff ? 'Edit Staff' : 'Add Staff'}
              </h2>
              <button onClick={() => setShowAddModal(false)} style={{
                border: 'none', background: '#f3f4f6', borderRadius: '10px',
                width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer'
              }}><FaTimes size={14} color="#6b7280" /></button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '20px 24px 24px' }}>
              {[
                { key: 'name', label: 'Name', icon: <FaUsers size={12} />, type: 'text', placeholder: 'Full name', required: true },
                { key: 'phone', label: 'Phone', icon: <FaPhone size={12} />, type: 'tel', placeholder: 'Phone number' },
                { key: 'email', label: 'Email', icon: <FaEnvelope size={12} />, type: 'email', placeholder: 'Email address' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    {field.icon} {field.label}
                  </label>
                  <input
                    type={field.type} value={form[field.key]} required={field.required}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e5e7eb',
                      fontSize: '14px', color: '#111827', backgroundColor: '#fafafa', outline: 'none'
                    }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  <FaUserTag size={12} /> Role
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {ALL_ROLES.filter(r => r !== 'owner').map(r => (
                    <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))} style={{
                      padding: '6px 14px', borderRadius: '20px', border: 'none',
                      backgroundColor: form.role === r ? getRoleColor(r).block : '#f3f4f6',
                      color: form.role === r ? 'white' : '#6b7280',
                      fontSize: '12px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                      transition: 'all 0.2s'
                    }}>{r}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px', display: 'block' }}>
                  Start Date
                </label>
                <input type="date" value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e5e7eb',
                    fontSize: '14px', color: '#111827', backgroundColor: '#fafafa', outline: 'none'
                  }}
                />
              </div>

              <button type="submit" disabled={saving || !form.name.trim()} style={{
                width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                background: saving ? '#e5e7eb' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white', fontWeight: 700, fontSize: '15px',
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: saving ? 'none' : '0 4px 12px rgba(239,68,68,0.3)'
              }}>
                {saving ? 'Saving...' : editingStaff ? 'Update' : 'Add to Team'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
