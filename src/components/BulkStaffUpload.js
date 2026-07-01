'use client';

import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  FaUpload, FaTimes, FaSpinner, FaCheckCircle, FaExclamationTriangle,
  FaEdit, FaTrash, FaPlus, FaDownload, FaCopy, FaCloudUploadAlt,
  FaFileAlt, FaUserPlus
} from 'react-icons/fa';
import apiClient from '../lib/api';

const VALID_ROLES = ['admin', 'manager', 'captain', 'waiter', 'cashier', 'employee', 'sales', 'kitchen', 'delivery'];

const BulkStaffUpload = ({ isOpen, onClose, restaurantId, onStaffAdded }) => {
  const [step, setStep] = useState(1); // 1=upload, 2=preview, 3=credentials
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [staffData, setStaffData] = useState([]);
  const [createdStaff, setCreatedStaff] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [source, setSource] = useState('');
  const fileInputRef = useRef(null);

  const resetState = () => {
    setStep(1);
    setFile(null);
    setTextInput('');
    setStaffData([]);
    setCreatedStaff([]);
    setProcessing(false);
    setSaving(false);
    setError('');
    setSource('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum 10MB.');
      return;
    }
    setFile(selected);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      if (dropped.size > 10 * 1024 * 1024) {
        setError('File too large. Maximum 10MB.');
        return;
      }
      setFile(dropped);
      setError('');
    }
  };

  const handleExtract = async () => {
    if (!file && !textInput.trim()) {
      setError('Please upload a file or paste staff details');
      return;
    }
    try {
      setProcessing(true);
      setError('');
      let result;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        result = await apiClient.bulkUploadStaff(restaurantId, formData);
      } else {
        result = await apiClient.bulkExtractStaffFromText(restaurantId, textInput.trim());
      }

      if (!result.staff || result.staff.length === 0) {
        setError('No staff data could be extracted. Please check the format.');
        return;
      }

      setStaffData(result.staff.map((s, i) => ({ ...s, _id: i })));
      setSource(result.source || 'unknown');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to extract staff data');
    } finally {
      setProcessing(false);
    }
  };

  const handleFieldChange = (index, field, value) => {
    setStaffData(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleRemoveRow = (index) => {
    setStaffData(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddRow = () => {
    setStaffData(prev => [...prev, { _id: Date.now(), name: '', phone: '', role: 'waiter', salary: 0, email: '', address: '', aadhar: '' }]);
  };

  const getValidationErrors = () => {
    const errors = [];
    const phones = new Set();
    staffData.forEach((s, i) => {
      if (!s.name?.trim()) errors.push(`Row ${i + 1}: Name is required`);
      if (s.phone && phones.has(s.phone)) errors.push(`Row ${i + 1}: Duplicate phone number ${s.phone}`);
      if (s.phone) phones.add(s.phone);
    });
    return errors;
  };

  const handleSave = async () => {
    const validationErrors = getValidationErrors();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }

    const cleanedStaff = staffData
      .filter(s => s.name?.trim())
      .map(({ _id, ...rest }) => rest);

    if (cleanedStaff.length === 0) {
      setError('No valid staff data to save');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const result = await apiClient.bulkSaveStaff(restaurantId, cleanedStaff);
      setCreatedStaff(result.created || []);
      setStep(3);
      if (onStaffAdded) onStaffAdded();
    } catch (err) {
      setError(err.message || 'Failed to create staff members');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadCSV = () => {
    const headers = 'Name,Phone,Role,Login ID,Temporary Password\n';
    const rows = createdStaff.map(s =>
      `"${s.name}","${s.phone}","${s.role}","${s.loginId}","${s.tempPassword}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff-credentials-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyAll = () => {
    const text = createdStaff.map(s =>
      `${s.name} | Login: ${s.loginId} | Password: ${s.tempPassword} | Role: ${s.role}`
    ).join('\n');
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10010, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleClose}>
      <div style={{ background: '#fff', borderRadius: '20px', width: '95%', maxWidth: step === 2 ? '900px' : '600px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaUserPlus color="white" size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>Bulk Staff Upload</h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                {step === 1 ? 'Upload CSV, image, or paste text' : step === 2 ? `Preview & edit (${staffData.length} staff)` : `${createdStaff.length} staff created`}
              </p>
            </div>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', color: '#6b7280' }}>
            <FaTimes size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div style={{ padding: '16px 24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 600,
                background: step >= s ? 'linear-gradient(135deg, #ef4444, #dc2626)' : '#f3f4f6',
                color: step >= s ? 'white' : '#9ca3af'
              }}>
                {step > s ? <FaCheckCircle size={14} /> : s}
              </div>
              <span style={{ fontSize: '12px', color: step >= s ? '#1f2937' : '#9ca3af', fontWeight: step === s ? 600 : 400 }}>
                {s === 1 ? 'Upload' : s === 2 ? 'Preview' : 'Credentials'}
              </span>
              {s < 3 && <div style={{ flex: 1, height: '2px', background: step > s ? '#ef4444' : '#e5e7eb', borderRadius: '1px' }} />}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ margin: '0 24px 12px', padding: '12px 16px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <FaExclamationTriangle size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 1 && (
          <div style={{ padding: '0 24px 24px' }}>
            {/* File drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #d1d5db', borderRadius: '14px', padding: '32px', textAlign: 'center', cursor: 'pointer',
                background: file ? '#f0fdf4' : '#fafafa', transition: 'all 0.2s',
              }}
            >
              <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls,.tsv,.txt,image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
              {file ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <FaCheckCircle color="#22c55e" size={24} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: '#1f2937' }}>{file.name}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}>
                    <FaTimes size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <FaCloudUploadAlt size={40} color="#9ca3af" />
                  <p style={{ margin: '12px 0 4px', fontWeight: 600, color: '#374151' }}>Drop file here or click to browse</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>CSV, Excel, or image of staff list</p>
                </>
              )}
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
              <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>OR paste text</span>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            </div>

            {/* Text input */}
            <textarea
              placeholder={"Paste staff details here...\n\nExamples:\nRajesh Kumar, 9876543210, waiter\nPriya Singh, 8765432109, cashier, 18000\nAmit Verma, manager, 7654321098"}
              value={textInput}
              onChange={e => { setTextInput(e.target.value); setError(''); }}
              style={{
                width: '100%', minHeight: '120px', padding: '14px', borderRadius: '12px',
                border: '1px solid #d1d5db', fontSize: '13px', resize: 'vertical',
                fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box',
              }}
            />

            {/* CSV format hint */}
            <div style={{ marginTop: '12px', padding: '12px 14px', borderRadius: '10px', background: '#f9fafb', border: '1px solid #e5e7eb' }}>
              <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 600, color: '#374151' }}>CSV Format</p>
              <code style={{ fontSize: '11px', color: '#6b7280', lineHeight: 1.6 }}>
                Name,Phone,Role,Salary<br />
                Rajesh Kumar,9876543210,waiter,15000<br />
                Priya Singh,8765432109,cashier,18000
              </code>
            </div>

            {/* Extract button */}
            <button
              onClick={handleExtract}
              disabled={processing || (!file && !textInput.trim())}
              style={{
                width: '100%', marginTop: '16px', padding: '14px', borderRadius: '12px',
                background: processing || (!file && !textInput.trim()) ? '#d1d5db' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white', border: 'none', cursor: processing ? 'not-allowed' : 'pointer',
                fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {processing ? <><FaSpinner className="animate-spin" size={16} /> Extracting...</> : <><FaUpload size={14} /> Extract Staff Data</>}
            </button>
          </div>
        )}

        {/* Step 2: Preview & Edit */}
        {step === 2 && (
          <div style={{ padding: '0 24px 24px' }}>
            {source === 'ai' && (
              <div style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '10px', background: '#fffbeb', border: '1px solid #fde68a', fontSize: '12px', color: '#92400e' }}>
                Data extracted using AI. Please verify all fields before saving.
              </div>
            )}

            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>#</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Name *</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Phone</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Role</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Salary</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {staffData.map((s, i) => (
                    <tr key={s._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '8px 12px', color: '#9ca3af' }}>{i + 1}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          value={s.name || ''}
                          onChange={e => handleFieldChange(i, 'name', e.target.value)}
                          style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: !s.name?.trim() ? '1px solid #fca5a5' : '1px solid #e5e7eb', fontSize: '13px', outline: 'none', minWidth: '140px' }}
                          placeholder="Name"
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          value={s.phone || ''}
                          onChange={e => handleFieldChange(i, 'phone', e.target.value.replace(/[^0-9+]/g, ''))}
                          style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px', outline: 'none', minWidth: '120px' }}
                          placeholder="Phone"
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <select
                          value={s.role || 'waiter'}
                          onChange={e => handleFieldChange(i, 'role', e.target.value)}
                          style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px', outline: 'none', background: '#fff', cursor: 'pointer' }}
                        >
                          {VALID_ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          type="number"
                          value={s.salary || ''}
                          onChange={e => handleFieldChange(i, 'salary', parseFloat(e.target.value) || 0)}
                          style={{ width: '90px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px', outline: 'none' }}
                          placeholder="0"
                        />
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <button onClick={() => handleRemoveRow(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}>
                          <FaTrash size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add row */}
            <button onClick={handleAddRow} style={{
              marginTop: '12px', padding: '8px 16px', borderRadius: '8px', border: '1px dashed #d1d5db',
              background: 'none', cursor: 'pointer', fontSize: '13px', color: '#6b7280',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <FaPlus size={11} /> Add Row
            </button>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button onClick={() => { setStep(1); setError(''); }} style={{
                flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #d1d5db',
                background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '14px', color: '#374151'
              }}>
                Back
              </button>
              <button onClick={handleSave} disabled={saving || staffData.length === 0} style={{
                flex: 2, padding: '12px', borderRadius: '12px', border: 'none',
                background: saving || staffData.length === 0 ? '#d1d5db' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white', cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
                {saving ? <><FaSpinner className="animate-spin" size={14} /> Creating...</> : <><FaUserPlus size={14} /> Create {staffData.length} Staff</>}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Credentials */}
        {step === 3 && (
          <div style={{ padding: '0 24px 24px' }}>
            {/* Success */}
            <div style={{ marginBottom: '16px', padding: '14px 16px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaCheckCircle color="#22c55e" size={20} />
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: '#166534', fontSize: '14px' }}>{createdStaff.length} staff members created</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#15803d' }}>Share login credentials securely with each staff member</p>
              </div>
            </div>

            {/* Warning */}
            <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '10px', background: '#fffbeb', border: '1px solid #fde68a', fontSize: '12px', color: '#92400e' }}>
              <strong>Important:</strong> Temporary passwords expire in 7 days. Staff should change their password on first login. Share credentials securely.
            </div>

            {/* Credentials table */}
            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Phone</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Role</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Login ID</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Password</th>
                  </tr>
                </thead>
                <tbody>
                  {createdStaff.map((s, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{s.name}</td>
                      <td style={{ padding: '10px 12px', color: '#6b7280' }}>{s.phone}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                          background: s.role === 'admin' ? '#fef2f2' : s.role === 'manager' ? '#eff6ff' : '#f0fdf4',
                          color: s.role === 'admin' ? '#dc2626' : s.role === 'manager' ? '#2563eb' : '#16a34a',
                        }}>
                          {s.role.charAt(0).toUpperCase() + s.role.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 600, color: '#1f2937' }}>{s.loginId}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#6b7280' }}>{s.tempPassword}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={handleDownloadCSV} style={{
                flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #d1d5db',
                background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '13px', color: '#374151',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
                <FaDownload size={13} /> Download CSV
              </button>
              <button onClick={handleCopyAll} style={{
                flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #d1d5db',
                background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '13px', color: '#374151',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
                <FaCopy size={13} /> Copy All
              </button>
              <button onClick={handleClose} style={{
                flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white',
                cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default BulkStaffUpload;
