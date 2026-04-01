'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiX, HiPlus, HiTrash } from 'react-icons/hi';
import apiClient from '../../../../../lib/api';
import { useToast } from '../../contexts/InvoiceToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Tabs from '../../components/ui/Tabs';

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

export default function NewCustomerPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('otherDetails');
  const [errors, setErrors] = useState({});
  const [showDisplaySuggestions, setShowDisplaySuggestions] = useState(false);

  const [form, setForm] = useState({
    customerType: 'business',
    salutation: '',
    firstName: '',
    lastName: '',
    companyName: '',
    displayName: '',
    currency: 'INR',
    email: '',
    workPhone: '',
    mobile: '',
    language: 'en',
    pan: '',
    paymentTerms: '',
    billingAddress: { ...emptyAddress },
    shippingAddress: { ...emptyAddress },
    contactPersons: [],
    remarks: '',
  });

  const [copyBilling, setCopyBilling] = useState(false);

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
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

  // Generate display name suggestions from form fields
  function getDisplayNameSuggestions() {
    const suggestions = [];
    const full = [form.firstName, form.lastName].filter(Boolean).join(' ');
    if (full) suggestions.push(full);
    if (form.salutation && full) suggestions.push(`${form.salutation} ${full}`);
    if (form.companyName) suggestions.push(form.companyName);
    if (form.firstName && form.companyName) suggestions.push(`${form.firstName}, ${form.companyName}`);
    return [...new Set(suggestions)];
  }

  function validate() {
    const newErrors = {};
    if (!form.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await apiClient.createInvoiceCustomer(form);
      showToast('Customer created successfully', 'success');
      router.push('/invoice/customers');
    } catch (err) {
      showToast(err.message || 'Failed to create customer', 'error');
    } finally {
      setSaving(false);
    }
  }

  const displaySuggestions = getDisplayNameSuggestions();

  return (
    <div>
      <PageHeader
        title="New Customer"
        actions={
          <Button
            variant="ghost"
            icon={HiX}
            onClick={() => router.push('/invoice/customers')}
          >
            Close
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 space-y-6">
            {/* Customer Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Type
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Contact
              </label>
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-2">
                  <Select
                    options={salutationOptions}
                    value={form.salutation}
                    onChange={(e) => updateForm('salutation', e.target.value)}
                    placeholder="Salutation"
                  />
                </div>
                <div className="col-span-5">
                  <Input
                    placeholder="First Name"
                    value={form.firstName}
                    onChange={(e) => updateForm('firstName', e.target.value)}
                  />
                </div>
                <div className="col-span-5">
                  <Input
                    placeholder="Last Name"
                    value={form.lastName}
                    onChange={(e) => updateForm('lastName', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Company Name - shown only for business */}
            {form.customerType === 'business' && (
              <Input
                label="Company Name"
                placeholder="Enter company name"
                value={form.companyName}
                onChange={(e) => updateForm('companyName', e.target.value)}
              />
            )}

            {/* Display Name */}
            <div className="relative">
              <Input
                label="Display Name"
                required
                placeholder="Enter display name"
                value={form.displayName}
                onChange={(e) => updateForm('displayName', e.target.value)}
                onFocus={() => setShowDisplaySuggestions(true)}
                onBlur={() => setTimeout(() => setShowDisplaySuggestions(false), 200)}
                error={errors.displayName}
              />
              {showDisplaySuggestions && displaySuggestions.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {displaySuggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                      onMouseDown={() => {
                        updateForm('displayName', suggestion);
                        setShowDisplaySuggestions(false);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency */}
            <Select
              label="Currency"
              options={currencyOptions}
              value={form.currency}
              onChange={(e) => updateForm('currency', e.target.value)}
            />

            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={(e) => updateForm('email', e.target.value)}
            />

            {/* Phone Numbers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-2">
                  <div className="w-20 flex-shrink-0">
                    <Input value="+91" disabled />
                  </div>
                  <Input
                    placeholder="Work Phone"
                    value={form.workPhone}
                    onChange={(e) => updateForm('workPhone', e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="w-20 flex-shrink-0">
                    <Input value="+91" disabled />
                  </div>
                  <Input
                    placeholder="Mobile"
                    value={form.mobile}
                    onChange={(e) => updateForm('mobile', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Language */}
            <Select
              label="Customer Language"
              options={languageOptions}
              value={form.language}
              onChange={(e) => updateForm('language', e.target.value)}
            />
          </div>

          {/* Tabs Section */}
          <div className="border-t border-gray-200">
            <div className="px-6 pt-4">
              <Tabs tabs={formTabs} activeTab={activeTab} onChange={setActiveTab} />
            </div>

            <div className="p-6">
              {/* Other Details Tab */}
              {activeTab === 'otherDetails' && (
                <div className="space-y-4 max-w-lg">
                  <Input
                    label="PAN"
                    placeholder="Enter PAN number"
                    value={form.pan}
                    onChange={(e) => updateForm('pan', e.target.value.toUpperCase())}
                  />
                  <Select
                    label="Payment Terms"
                    options={paymentTermsOptions}
                    value={form.paymentTerms}
                    onChange={(e) => updateForm('paymentTerms', e.target.value)}
                  />
                </div>
              )}

              {/* Address Tab */}
              {activeTab === 'address' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Billing Address */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Billing Address</h3>
                    <div className="space-y-3">
                      <Input
                        label="Street"
                        placeholder="Street address"
                        value={form.billingAddress.street}
                        onChange={(e) => updateAddress('billingAddress', 'street', e.target.value)}
                      />
                      <Input
                        label="City"
                        placeholder="City"
                        value={form.billingAddress.city}
                        onChange={(e) => updateAddress('billingAddress', 'city', e.target.value)}
                      />
                      <Input
                        label="State"
                        placeholder="State"
                        value={form.billingAddress.state}
                        onChange={(e) => updateAddress('billingAddress', 'state', e.target.value)}
                      />
                      <Input
                        label="Zip Code"
                        placeholder="Zip code"
                        value={form.billingAddress.zip}
                        onChange={(e) => updateAddress('billingAddress', 'zip', e.target.value)}
                      />
                      <Input
                        label="Country"
                        placeholder="Country"
                        value={form.billingAddress.country}
                        onChange={(e) => updateAddress('billingAddress', 'country', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">Shipping Address</h3>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={copyBilling}
                          onChange={(e) => handleCopyBilling(e.target.checked)}
                          className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-600">Copy Billing Address</span>
                      </label>
                    </div>
                    <div className="space-y-3">
                      <Input
                        label="Street"
                        placeholder="Street address"
                        value={form.shippingAddress.street}
                        onChange={(e) => updateAddress('shippingAddress', 'street', e.target.value)}
                      />
                      <Input
                        label="City"
                        placeholder="City"
                        value={form.shippingAddress.city}
                        onChange={(e) => updateAddress('shippingAddress', 'city', e.target.value)}
                      />
                      <Input
                        label="State"
                        placeholder="State"
                        value={form.shippingAddress.state}
                        onChange={(e) => updateAddress('shippingAddress', 'state', e.target.value)}
                      />
                      <Input
                        label="Zip Code"
                        placeholder="Zip code"
                        value={form.shippingAddress.zip}
                        onChange={(e) => updateAddress('shippingAddress', 'zip', e.target.value)}
                      />
                      <Input
                        label="Country"
                        placeholder="Country"
                        value={form.shippingAddress.country}
                        onChange={(e) => updateAddress('shippingAddress', 'country', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Persons Tab */}
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
                            <span className="text-sm font-medium text-gray-700">
                              Contact Person {index + 1}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              icon={HiTrash}
                              onClick={() => removeContactPerson(index)}
                              className="text-red-500 hover:text-red-700"
                            />
                          </div>
                          <div className="grid grid-cols-12 gap-3 mb-3">
                            <div className="col-span-2">
                              <Select
                                options={salutationOptions}
                                value={person.salutation}
                                onChange={(e) => updateContactPerson(index, 'salutation', e.target.value)}
                              />
                            </div>
                            <div className="col-span-5">
                              <Input
                                placeholder="First Name"
                                value={person.firstName}
                                onChange={(e) => updateContactPerson(index, 'firstName', e.target.value)}
                              />
                            </div>
                            <div className="col-span-5">
                              <Input
                                placeholder="Last Name"
                                value={person.lastName}
                                onChange={(e) => updateContactPerson(index, 'lastName', e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input
                              placeholder="Email"
                              type="email"
                              value={person.email}
                              onChange={(e) => updateContactPerson(index, 'email', e.target.value)}
                            />
                            <Input
                              placeholder="Phone"
                              value={person.phone}
                              onChange={(e) => updateContactPerson(index, 'phone', e.target.value)}
                            />
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

              {/* Remarks Tab */}
              {activeTab === 'remarks' && (
                <div className="max-w-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
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
            <Button type="submit" loading={saving}>
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/invoice/customers')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
