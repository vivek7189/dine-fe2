'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaPlus, FaTimes, FaSave, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaUsers, FaClock } from 'react-icons/fa';

export default function VenueManager({ venues, loading, onSave, onDelete, isMobile }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', capacity: '', description: '', hourlyRate: '', fixedRate: '',
    operatingHours: { start: '08:00', end: '22:00' },
    allowMultipleBookings: false, maxConcurrentBookings: 1, amenities: '',
  });
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setEditing(null);
    setForm({ name: '', capacity: '', description: '', hourlyRate: '', fixedRate: '', operatingHours: { start: '08:00', end: '22:00' }, allowMultipleBookings: false, maxConcurrentBookings: 1, amenities: '' });
    setShowModal(true);
  }

  function openEdit(venue) {
    setEditing(venue);
    setForm({
      name: venue.name || '',
      capacity: venue.capacity || '',
      description: venue.description || '',
      hourlyRate: venue.hourlyRate || '',
      fixedRate: venue.fixedRate || '',
      operatingHours: venue.operatingHours || { start: '08:00', end: '22:00' },
      allowMultipleBookings: venue.allowMultipleBookings || false,
      maxConcurrentBookings: venue.maxConcurrentBookings || 1,
      amenities: (venue.amenities || []).join(', '),
    });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const data = {
        name: form.name.trim(),
        capacity: Number(form.capacity) || 0,
        description: form.description.trim(),
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
        fixedRate: form.fixedRate ? Number(form.fixedRate) : null,
        operatingHours: form.operatingHours,
        allowMultipleBookings: form.allowMultipleBookings,
        maxConcurrentBookings: Number(form.maxConcurrentBookings) || 1,
        amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean),
      };
      await onSave(data, editing?.id);
      setShowModal(false);
    } catch (err) {
      console.error('Save venue error:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>Venues & Halls</h3>
        <button onClick={openAdd} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(239,68,68,0.3)' }}>
          <FaPlus size={11} /> Add Venue
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading venues...</p>
      ) : venues.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280', border: '1px dashed #d1d5db', borderRadius: '10px' }}>
          <FaUsers size={28} style={{ color: '#d1d5db', marginBottom: '10px' }} />
          <p style={{ margin: 0, fontSize: '14px' }}>No venues created yet. Add your first party hall or event space.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {venues.map(function(venue) {
            return (
              <div key={venue.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s, transform 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>{venue.name}</h4>
                    {venue.description && <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{venue.description}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={function() { openEdit(venue); }} style={{ padding: '5px 8px', borderRadius: '5px', border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', color: '#6b7280', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}><FaEdit size={11} /></button>
                    <button onClick={function() { onDelete(venue.id); }} style={{ padding: '5px 8px', borderRadius: '5px', border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', color: '#ef4444', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}><FaTrash size={11} /></button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '12px', color: '#4b5563' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaUsers size={10} /> {venue.capacity} guests</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaClock size={10} /> {venue.operatingHours?.start} - {venue.operatingHours?.end}</span>
                  {venue.hourlyRate && <span>₹{venue.hourlyRate}/hr</span>}
                  {venue.fixedRate && <span>₹{venue.fixedRate} fixed</span>}
                </div>
                {venue.amenities && venue.amenities.length > 0 && (
                  <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {venue.amenities.map(function(a, i) {
                      return <span key={i} style={{ padding: '2px 8px', borderRadius: '10px', background: '#f3f4f6', fontSize: '11px', color: '#4b5563' }}>{a}</span>;
                    })}
                  </div>
                )}
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                  {venue.allowMultipleBookings ? (
                    <span style={{ color: '#059669' }}>Multiple bookings allowed (max {venue.maxConcurrentBookings})</span>
                  ) : (
                    <span style={{ color: '#6b7280' }}>Single booking per slot</span>
                  )}
                </div>
                {!venue.isActive && <span style={{ position: 'absolute', top: '8px', right: '8px', padding: '2px 6px', borderRadius: '4px', background: '#fef2f2', color: '#dc2626', fontSize: '10px', fontWeight: '600' }}>Inactive</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* Venue Modal */}
      {showModal && typeof document !== 'undefined' && createPortal(
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '3px solid #ef4444', borderRadius: '12px 12px 0 0' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700' }}>{editing ? 'Edit Venue' : 'Add Venue'}</h3>
              <button onClick={function() { setShowModal(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><FaTimes size={16} /></button>
            </div>
            <form onSubmit={handleSave} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Venue Name *</label>
                <input value={form.name} onChange={function(e) { setForm({ ...form, name: e.target.value }); }} style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #d1d5db', fontSize: '14px' }} placeholder="Main Hall" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Capacity (guests)</label>
                  <input type="number" value={form.capacity} onChange={function(e) { setForm({ ...form, capacity: e.target.value }); }} style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #d1d5db', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Fixed Rate (₹)</label>
                  <input type="number" value={form.fixedRate} onChange={function(e) { setForm({ ...form, fixedRate: e.target.value }); }} style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #d1d5db', fontSize: '14px' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Hourly Rate (₹)</label>
                  <input type="number" value={form.hourlyRate} onChange={function(e) { setForm({ ...form, hourlyRate: e.target.value }); }} style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #d1d5db', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Max Concurrent</label>
                  <input type="number" value={form.maxConcurrentBookings} onChange={function(e) { setForm({ ...form, maxConcurrentBookings: e.target.value }); }} style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #d1d5db', fontSize: '14px' }} min="1" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Opens At</label>
                  <input type="time" value={form.operatingHours.start} onChange={function(e) { setForm({ ...form, operatingHours: { ...form.operatingHours, start: e.target.value } }); }} style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #d1d5db', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Closes At</label>
                  <input type="time" value={form.operatingHours.end} onChange={function(e) { setForm({ ...form, operatingHours: { ...form.operatingHours, end: e.target.value } }); }} style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #d1d5db', fontSize: '14px' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Description</label>
                <textarea value={form.description} onChange={function(e) { setForm({ ...form, description: e.target.value }); }} style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #d1d5db', fontSize: '14px', minHeight: '60px', resize: 'vertical' }} placeholder="Indoor banquet hall with AC..." />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Amenities (comma-separated)</label>
                <input value={form.amenities} onChange={function(e) { setForm({ ...form, amenities: e.target.value }); }} style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #d1d5db', fontSize: '14px' }} placeholder="AC, Projector, Stage, Sound System" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button type="button" onClick={function() { setForm({ ...form, allowMultipleBookings: !form.allowMultipleBookings }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: form.allowMultipleBookings ? '#ef4444' : '#9ca3af' }}>
                  {form.allowMultipleBookings ? <FaToggleOn size={22} /> : <FaToggleOff size={22} />}
                </button>
                <span style={{ fontSize: '13px', color: '#374151' }}>Allow multiple bookings for same time slot</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #f3f4f6' }}>
                <button type="button" onClick={function() { setShowModal(false); }} style={{ padding: '9px 18px', borderRadius: '7px', border: '1px solid #d1d5db', background: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '9px 18px', borderRadius: '7px', border: 'none', background: '#ef4444', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                  <FaSave size={11} style={{ marginRight: '5px' }} />{saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
