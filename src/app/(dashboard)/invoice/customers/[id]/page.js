'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { HiPencil, HiTrash, HiX, HiPlus, HiArrowLeft, HiMail, HiPhone, HiOfficeBuilding, HiLocationMarker } from 'react-icons/hi';
import apiClient from '../../../../../lib/api';
import { useToast } from '../../contexts/InvoiceToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Tabs from '../../components/ui/Tabs';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';

const salutationOptions = [
  { value: '', label: 'Salutation' },
  { value: 'Mr.', label: 'Mr.' },
  { value: 'Mrs.', label: 'Mrs.' },
  { value: 'Ms.', label: 'Ms.' },
  { value: 'Dr.', label: 'Dr.' },
];

const currencyOptions = [
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
];

const paymentTermsOptions = [
  { value: '', label: 'Select payment terms' },
  { value: 'due_on_receipt', label: 'Due on Receipt' },
  { value: 'net_15', label: 'Net 15' },
  { value: 'net_30', label: 'Net 30' },
  { value: 'net_45', label: 'Net 45' },
  { value: 'net_60', label: 'Net 60' },
];

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
];

const formTabs = [
  { key: 'otherDetails', label: 'Other Details' },
  { key: 'address', label: 'Address' },
  { key: 'contactPersons', label: 'Contact Persons' },
  { key: 'remarks', label: 'Remarks' },
];

const emptyAddress = {
  street: '',
  city: '',
  state: '',
  zip: '',
  country: 'India',
};

const emptyContactPerson = {
  salutation: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
};

const paymentTermsLabels = {
  due_on_receipt: 'Due on Receipt',
  net_15: 'Net 15',
  net_30: 'Net 30',
  net_45: 'Net 45',
  net_60: 'Net 60',
};

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '0.00';
  return Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatAddress(addr) {
  if (!addr) return null;
  const parts = [addr.street, addr.city, addr.state, addr.zip, addr.country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const customerId = params.id;

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('otherDetails');
  const [errors, setErrors] = useState({});
  const [copyBilling, setCopyBilling] = useState(false);

  const [form, setForm] = useState(null);

  useEffect(() => {
    async function fetchCustomer() {
      setLoading(true);
      try {
        const data = await apiClient.getInvoiceCustomer(customerId);
        const c = data;
        setCustomer(c);
        initForm(c);
      } catch {
        showToast('Failed to load customer', 'error');
        router.push('/invoice/customers');
      } finally {
        setLoading(false);
      }
    }
    fetchCustomer();
  }, [customerId]);

  function initForm(c) {
    setForm({
      customerType: c.customerType || 'business',
      salutation: c.salutation || '',
      firstName: c.firstName || '',
      lastName: c.lastName || '',
      companyName: c.companyName || '',
      displayName: c.displayName || '',
      currency: c.currency || 'INR',
      email: c.email || '',
      workPhone: c.workPhone || '',
      mobile: c.mobile || '',
      language: c.language || 'en',
      pan: c.pan || '',
      paymentTerms: c.paymentTerms || '',
      billingAddress: c.billingAddress || { ...emptyAddress },
      shippingAddress: c.shippingAddress || { ...emptyAddress },
      contactPersons: c.contactPersons || [],
      remarks: c.remarks || '',
    });
  }

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function updateAddress(type, field, value) {
    setForm((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  }

  function handleCopyBilling(checked) {
    setCopyBilling(checked);
    if (checked) {
      setForm((prev) => ({
        ...prev,
        shippingAddress: { ...prev.billingAddress },
      }));
    }
  }

  function addContactPerson() {
    setForm((prev) => ({
      ...prev,
      contactPersons: [...prev.contactPersons, { ...emptyContactPerson }],
    }));
  }

  function updateContactPerson(index, field, value) {
    setForm((prev) => {
      const updated = [...prev.contactPersons];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, contactPersons: updated };
    });
  }

  function removeContactPerson(index) {
    setForm((prev) => ({
      ...prev,
      contactPersons: prev.contactPersons.filter((_, i) => i !== index),
    }));
  }

  function validate() {
    const newErrors = {};
    if (!form.displayName.trim()) newErrors.displayName = 'Display name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const data = await apiClient.updateInvoiceCustomer(customerId, form);
      const updated = data;
      setCustomer(updated);
      initForm(updated);
      setEditing(false);
      showToast('Customer updated successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update customer', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiClient.deleteInvoiceCustomer(customerId);
      showToast('Customer deleted successfully', 'success');
      router.push('/invoice/customers');
    } catch (err) {
      showToast(err.message || 'Failed to delete customer', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  function handleCancelEdit() {
    initForm(customer);
    setEditing(false);
    setErrors({});
  }

  if (loading) {
    return (
      <div>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!customer) return null;

  // View mode
  if (!editing) {
    const billingStr = formatAddress(customer.billingAddress);
    const shippingStr = formatAddress(customer.shippingAddress);

    return (
      <div>
        <PageHeader
          title={customer.displayName}
          subtitle={customer.companyName || undefined}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="ghost" icon={HiArrowLeft} onClick={() => router.push('/invoice/customers')}>
                Back
              </Button>
              <Button variant="outline" icon={HiPencil} onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button variant="danger" icon={HiTrash} onClick={() => setShowDeleteModal(true)}>
                Delete
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Customer Details
                  </h3>
                  <Badge variant={customer.status === 'active' ? 'success' : 'default'}>
                    {customer.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Customer Type</p>
                    <p className="text-sm text-gray-900 capitalize">{customer.customerType || 'Business'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Display Name</p>
                    <p className="text-sm font-medium text-gray-900">{customer.displayName}</p>
                  </div>
                  {customer.companyName && (
                    <div>
                      <p className="text-xs text-gray-500">Company Name</p>
                      <p className="text-sm text-gray-900 flex items-center gap-1.5">
                        <HiOfficeBuilding className="h-3.5 w-3.5 text-gray-400" />
                        {customer.companyName}
                      </p>
                    </div>
                  )}
                  {customer.email && (
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-gray-900 flex items-center gap-1.5">
                        <HiMail className="h-3.5 w-3.5 text-gray-400" />
                        {customer.email}
                      </p>
                    </div>
                  )}
                  {(customer.workPhone || customer.mobile) && (
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm text-gray-900 flex items-center gap-1.5">
                        <HiPhone className="h-3.5 w-3.5 text-gray-400" />
                        {customer.workPhone || customer.mobile}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Currency</p>
                    <p className="text-sm text-gray-900">{customer.currency || 'INR'}</p>
                  </div>
                  {customer.pan && (
                    <div>
                      <p className="text-xs text-gray-500">PAN</p>
                      <p className="text-sm text-gray-900">{customer.pan}</p>
                    </div>
                  )}
                  {customer.paymentTerms && (
                    <div>
                      <p className="text-xs text-gray-500">Payment Terms</p>
                      <p className="text-sm text-gray-900">{paymentTermsLabels[customer.paymentTerms] || customer.paymentTerms}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Addresses */}
            {(billingStr || shippingStr) && (
              <Card>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Addresses</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {billingStr && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Billing Address</p>
                      <p className="text-sm text-gray-900 flex items-start gap-1.5">
                        <HiLocationMarker className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        {billingStr}
                      </p>
                    </div>
                  )}
                  {shippingStr && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Shipping Address</p>
                      <p className="text-sm text-gray-900 flex items-start gap-1.5">
                        <HiLocationMarker className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        {shippingStr}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Contact Persons */}
            {customer.contactPersons && customer.contactPersons.length > 0 && (
              <Card>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Contact Persons</h3>
                <div className="space-y-3">
                  {customer.contactPersons.map((person, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                        {(person.firstName?.[0] || '').toUpperCase()}
                        {(person.lastName?.[0] || '').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {[person.salutation, person.firstName, person.lastName].filter(Boolean).join(' ')}
                        </p>
                        <p className="text-xs text-gray-500">{[person.email, person.phone].filter(Boolean).join(' | ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Remarks */}
            {customer.remarks && (
              <Card>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Remarks</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{customer.remarks}</p>
              </Card>
            )}
          </div>

          {/* Sidebar - Receivables */}
          <div>
            <Card>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Receivables</h3>
              <p className="text-2xl font-bold text-gray-900">
                {'\u20B9'}{formatCurrency(customer.receivables || 0)}
              </p>
            </Card>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Customer"
        >
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete <strong>{customer.displayName}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </Modal>
      </div>
    );
  }

  // Edit mode
  return (
    <div>
      <PageHeader
        title="Edit Customer"
        actions={
          <Button variant="ghost" icon={HiX} onClick={handleCancelEdit}>
            Cancel
          </Button>
        }
      />

      <form onSubmit={handleSave}>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 space-y-6">
            {/* Customer Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="customerType"
                    value="business"
                    checked={form.customerType === 'business'}
                    onChange={(e) => updateForm('customerType', e.target.value)}
                    className="text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Business</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="customerType"
                    value="individual"
                    checked={form.customerType === 'individual'}
                    onChange={(e) => updateForm('customerType', e.target.value)}
                    className="text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Individual</span>
                </label>
              </div>
            </div>

            {/* Primary Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Contact</label>
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-2">
                  <Select
                    options={salutationOptions}
                    value={form.salutation}
                    onChange={(e) => updateForm('salutation', e.target.value)}
                  />
                </div>
                <div className="col-span-5">
                  <Input placeholder="First Name" value={form.firstName} onChange={(e) => updateForm('firstName', e.target.value)} />
                </div>
                <div className="col-span-5">
                  <Input placeholder="Last Name" value={form.lastName} onChange={(e) => updateForm('lastName', e.target.value)} />
                </div>
              </div>
            </div>

            {form.customerType === 'business' && (
              <Input label="Company Name" placeholder="Enter company name" value={form.companyName} onChange={(e) => updateForm('companyName', e.target.value)} />
            )}

            <Input label="Display Name" required placeholder="Enter display name" value={form.displayName} onChange={(e) => updateForm('displayName', e.target.value)} error={errors.displayName} />

            <Select label="Currency" options={currencyOptions} value={form.currency} onChange={(e) => updateForm('currency', e.target.value)} />

            <Input label="Email Address" type="email" placeholder="Enter email address" value={form.email} onChange={(e) => updateForm('email', e.target.value)} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-2">
                  <div className="w-20 flex-shrink-0"><Input value="+91" disabled /></div>
                  <Input placeholder="Work Phone" value={form.workPhone} onChange={(e) => updateForm('workPhone', e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <div className="w-20 flex-shrink-0"><Input value="+91" disabled /></div>
                  <Input placeholder="Mobile" value={form.mobile} onChange={(e) => updateForm('mobile', e.target.value)} />
                </div>
              </div>
            </div>

            <Select label="Customer Language" options={languageOptions} value={form.language} onChange={(e) => updateForm('language', e.target.value)} />
          </div>

          {/* Tabs Section */}
          <div className="border-t border-gray-200">
            <div className="px-6 pt-4">
              <Tabs tabs={formTabs} activeTab={activeTab} onChange={setActiveTab} />
            </div>
            <div className="p-6">
              {activeTab === 'otherDetails' && (
                <div className="space-y-4 max-w-lg">
                  <Input label="PAN" placeholder="Enter PAN number" value={form.pan} onChange={(e) => updateForm('pan', e.target.value.toUpperCase())} />
                  <Select label="Payment Terms" options={paymentTermsOptions} value={form.paymentTerms} onChange={(e) => updateForm('paymentTerms', e.target.value)} />
                </div>
              )}
              {activeTab === 'address' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Billing Address</h3>
                    <div className="space-y-3">
                      <Input label="Street" placeholder="Street address" value={form.billingAddress.street} onChange={(e) => updateAddress('billingAddress', 'street', e.target.value)} />
                      <Input label="City" placeholder="City" value={form.billingAddress.city} onChange={(e) => updateAddress('billingAddress', 'city', e.target.value)} />
                      <Input label="State" placeholder="State" value={form.billingAddress.state} onChange={(e) => updateAddress('billingAddress', 'state', e.target.value)} />
                      <Input label="Zip Code" placeholder="Zip code" value={form.billingAddress.zip} onChange={(e) => updateAddress('billingAddress', 'zip', e.target.value)} />
                      <Input label="Country" placeholder="Country" value={form.billingAddress.country} onChange={(e) => updateAddress('billingAddress', 'country', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">Shipping Address</h3>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={copyBilling} onChange={(e) => handleCopyBilling(e.target.checked)} className="rounded border-gray-300 text-blue-500 focus:ring-blue-500" />
                        <span className="text-xs text-gray-600">Copy Billing Address</span>
                      </label>
                    </div>
                    <div className="space-y-3">
                      <Input label="Street" placeholder="Street address" value={form.shippingAddress.street} onChange={(e) => updateAddress('shippingAddress', 'street', e.target.value)} />
                      <Input label="City" placeholder="City" value={form.shippingAddress.city} onChange={(e) => updateAddress('shippingAddress', 'city', e.target.value)} />
                      <Input label="State" placeholder="State" value={form.shippingAddress.state} onChange={(e) => updateAddress('shippingAddress', 'state', e.target.value)} />
                      <Input label="Zip Code" placeholder="Zip code" value={form.shippingAddress.zip} onChange={(e) => updateAddress('shippingAddress', 'zip', e.target.value)} />
                      <Input label="Country" placeholder="Country" value={form.shippingAddress.country} onChange={(e) => updateAddress('shippingAddress', 'country', e.target.value)} />
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'contactPersons' && (
                <div>
                  {form.contactPersons.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500 mb-3">No contact persons added yet.</p>
                      <Button type="button" variant="outline" size="sm" icon={HiPlus} onClick={addContactPerson}>
                        Add Contact Person
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {form.contactPersons.map((person, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">Contact Person {index + 1}</span>
                            <Button type="button" variant="ghost" size="sm" icon={HiTrash} onClick={() => removeContactPerson(index)} className="text-red-500 hover:text-red-700" />
                          </div>
                          <div className="grid grid-cols-12 gap-3 mb-3">
                            <div className="col-span-2">
                              <Select options={salutationOptions} value={person.salutation} onChange={(e) => updateContactPerson(index, 'salutation', e.target.value)} />
                            </div>
                            <div className="col-span-5">
                              <Input placeholder="First Name" value={person.firstName} onChange={(e) => updateContactPerson(index, 'firstName', e.target.value)} />
                            </div>
                            <div className="col-span-5">
                              <Input placeholder="Last Name" value={person.lastName} onChange={(e) => updateContactPerson(index, 'lastName', e.target.value)} />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input placeholder="Email" type="email" value={person.email} onChange={(e) => updateContactPerson(index, 'email', e.target.value)} />
                            <Input placeholder="Phone" value={person.phone} onChange={(e) => updateContactPerson(index, 'phone', e.target.value)} />
                          </div>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" icon={HiPlus} onClick={addContactPerson}>
                        Add Another
                      </Button>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'remarks' && (
                <div className="max-w-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea
                    rows={4}
                    placeholder="Add any notes or remarks about this customer..."
                    value={form.remarks}
                    onChange={(e) => updateForm('remarks', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400 resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center gap-3">
            <Button type="submit" loading={saving}>Save</Button>
            <Button type="button" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
