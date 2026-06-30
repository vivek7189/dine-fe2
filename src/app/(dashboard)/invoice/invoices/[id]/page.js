'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '../../../../../lib/api';
import { useToast } from '../../contexts/InvoiceToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { HiPencil, HiTrash, HiMail, HiCurrencyRupee, HiArrowLeft, HiBan } from 'react-icons/hi';
import DownloadPDFButton from '../../components/pdf/DownloadPDFButton';
import { useCurrency } from '../../../../../contexts/CurrencyContext';

const statusBadgeMap = {
  draft: { variant: 'default', label: 'Draft' },
  sent: { variant: 'info', label: 'Sent' },
  overdue: { variant: 'danger', label: 'Overdue' },
  paid: { variant: 'success', label: 'Paid' },
  void: { variant: 'warning', label: 'Void' },
};

const paymentModeOptions = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'other', label: 'Other' },
];

function formatCurrency(amount, currencySymbol, fallbackSymbol = 'Rs.') {
  const cs = currencySymbol || fallbackSymbol;
  if (amount === null || amount === undefined || isNaN(amount)) return `${cs}0.00`;
  return `${cs}${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateForInput(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { getCurrencySymbol } = useCurrency();
  const cs = getCurrencySymbol();
  const invoiceId = params.id;

  const [invoice, setInvoice] = useState(null);
  const [orgData, setOrgData] = useState({});
  const [pdfSettings, setPdfSettings] = useState({ template: 'standard', colors: {} });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Payment modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payment, setPayment] = useState({
    amount: '',
    date: formatDateForInput(new Date()),
    paymentMode: 'cash',
    reference: '',
    notes: '',
  });
  const [paymentSaving, setPaymentSaving] = useState(false);

  useEffect(() => {
    fetchInvoice();
    fetchOrg();
    fetchPdfSettings();
  }, [invoiceId]);

  async function fetchOrg() {
    try {
      const org = await apiClient.getInvoiceOrg();
      setOrgData(org || {});
    } catch { /* ignore */ }
  }

  async function fetchPdfSettings() {
    try {
      const s = await apiClient.getInvoiceSettings();
      setPdfSettings({ template: s.pdfTemplate || 'standard', colors: s.pdfColors || {} });
    } catch { /* use defaults */ }
  }

  async function fetchInvoice() {
    setLoading(true);
    try {
      const data = await apiClient.getInvoice(invoiceId);
      setInvoice(data);
    } catch (err) {
      showToast(err.message || 'Failed to load invoice', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    setActionLoading(true);
    try {
      await apiClient.sendInvoice(invoiceId);
      showToast('Invoice sent successfully!', 'success');
      fetchInvoice();
    } catch (err) {
      showToast(err.message || 'Failed to send invoice', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    setActionLoading(true);
    try {
      await apiClient.deleteInvoice(invoiceId);
      showToast('Invoice deleted', 'success');
      router.push('/invoice/invoices');
    } catch (err) {
      showToast(err.message || 'Failed to delete invoice', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleVoid() {
    if (!confirm('Are you sure you want to void this invoice?')) return;
    setActionLoading(true);
    try {
      await apiClient.voidInvoice(invoiceId);
      showToast('Invoice voided', 'success');
      fetchInvoice();
    } catch (err) {
      showToast(err.message || 'Failed to void invoice', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRecordPayment() {
    if (!payment.amount || Number(payment.amount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    setPaymentSaving(true);
    try {
      await apiClient.createInvoicePayment({
        invoiceId,
        customerId: invoice.customerId,
        amount: Number(payment.amount),
        paymentDate: payment.date,
        paymentMode: payment.paymentMode,
        referenceNumber: payment.reference,
        notes: payment.notes,
      });
      showToast('Payment recorded successfully!', 'success');
      setPaymentModalOpen(false);
      setPayment({
        amount: '',
        date: formatDateForInput(new Date()),
        paymentMode: 'cash',
        reference: '',
        notes: '',
      });
      fetchInvoice();
    } catch (err) {
      showToast(err.message || 'Failed to record payment', 'error');
    } finally {
      setPaymentSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="h-64 bg-gray-100 rounded-lg" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Invoice not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push('/invoice/invoices')}>
          Back to Invoices
        </Button>
      </div>
    );
  }

  const status = invoice.status || 'draft';
  const badge = statusBadgeMap[status] || statusBadgeMap.draft;
  const items = invoice.items || [];
  const customer = invoice.customer || {};

  // Build actions based on status
  function renderActions() {
    switch (status) {
      case 'draft':
        return (
          <>
            <Button
              variant="outline"
              icon={HiPencil}
              onClick={() => router.push(`/invoice/invoices/${invoiceId}/edit`)}
              disabled={actionLoading}
            >
              Edit
            </Button>
            <Button
              variant="primary"
              icon={HiMail}
              onClick={handleSend}
              loading={actionLoading}
            >
              Send
            </Button>
            <Button
              variant="danger"
              icon={HiTrash}
              onClick={handleDelete}
              disabled={actionLoading}
            >
              Delete
            </Button>
          </>
        );
      case 'sent':
      case 'overdue':
        return (
          <>
            <Button
              variant="primary"
              icon={HiCurrencyRupee}
              onClick={() => {
                setPayment((prev) => ({
                  ...prev,
                  amount: invoice.balanceDue || invoice.total || '',
                }));
                setPaymentModalOpen(true);
              }}
            >
              Record Payment
            </Button>
            <Button
              variant="outline"
              icon={HiBan}
              onClick={handleVoid}
              disabled={actionLoading}
            >
              Void
            </Button>
          </>
        );
      case 'paid':
        return null;
      default:
        return null;
    }
  }

  return (
    <div>
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.push('/invoice/invoices')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer"
      >
        <HiArrowLeft className="h-4 w-4" />
        Back to Invoices
      </button>

      <PageHeader
        title={`Invoice ${invoice.invoiceNumber || ''}`}
        subtitle={
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <DownloadPDFButton data={invoice} type="invoice" org={orgData} colors={pdfSettings.colors} template={pdfSettings.template} />
            {renderActions()}
          </div>
        }
      />

      {/* Invoice Info */}
      <Card className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Customer</p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {customer.name || invoice.customerName || '-'}
            </p>
            {customer.email && (
              <p className="text-xs text-gray-500 mt-0.5">{customer.email}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Invoice Date</p>
            <p className="text-sm text-gray-900 mt-1">{formatDate(invoice.invoiceDate)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Due Date</p>
            <p className="text-sm text-gray-900 mt-1">{formatDate(invoice.dueDate)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Terms</p>
            <p className="text-sm text-gray-900 mt-1 capitalize">
              {invoice.paymentTerms?.replace(/_/g, ' ') || '-'}
            </p>
          </div>
        </div>
      </Card>

      {/* Items Table */}
      <Card title="Items" className="mb-6">
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Item</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Qty</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Rate</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Tax</th>
                <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <tr key={item._id || item.id || idx}>
                  <td className="px-5 py-3 text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{item.name || '-'}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{item.quantity || 0}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(item.rate, invoice?.currencySymbol, cs)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{item.taxRate ? `${item.taxRate}%` : '-'}</td>
                  <td className="px-5 py-3 text-right font-medium text-gray-900">
                    {formatCurrency(item.amount || (item.quantity || 0) * (item.rate || 0), invoice?.currencySymbol, cs)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-full md:w-80 bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sub Total</span>
            <span className="font-medium">{formatCurrency(invoice.subtotal, invoice?.currencySymbol, cs)}</span>
          </div>
          {(invoice.discountAmount > 0) && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Discount
                {invoice.discountType === 'percentage' && invoice.discountValue
                  ? ` (${invoice.discountValue}%)`
                  : ''}
              </span>
              <span className="font-medium text-red-600">-{formatCurrency(invoice.discountAmount, invoice?.currencySymbol, cs)}</span>
            </div>
          )}
          {(invoice.taxAmount > 0) && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">{formatCurrency(invoice.taxAmount, invoice?.currencySymbol, cs)}</span>
            </div>
          )}
          {(invoice.adjustments !== 0 && invoice.adjustments !== undefined && invoice.adjustments !== null) && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Adjustment</span>
              <span className="font-medium">{formatCurrency(invoice.adjustments, invoice?.currencySymbol, cs)}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-2 flex justify-between">
            <span className="text-sm font-semibold text-gray-900">Total</span>
            <span className="text-lg font-bold text-gray-900">{formatCurrency(invoice.total, invoice?.currencySymbol, cs)}</span>
          </div>
          {invoice.balanceDue !== undefined && invoice.balanceDue !== invoice.total && (
            <div className="flex justify-between text-sm pt-1">
              <span className="text-gray-600">Balance Due</span>
              <span className="text-lg font-bold text-blue-600">{formatCurrency(invoice.balanceDue, invoice?.currencySymbol, cs)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {(invoice.customerNotes || invoice.termsAndConditions) && (
        <Card className="mb-6">
          {invoice.customerNotes && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Customer Notes</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.customerNotes}</p>
            </div>
          )}
          {invoice.termsAndConditions && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Terms & Conditions</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.termsAndConditions}</p>
            </div>
          )}
        </Card>
      )}

      {/* Payments History */}
      {invoice.payments && invoice.payments.length > 0 && (
        <Card title="Payment History" className="mb-6">
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Mode</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Reference</th>
                  <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.payments.map((pmt, idx) => (
                  <tr key={pmt._id || pmt.id || idx}>
                    <td className="px-5 py-3 text-gray-700">{formatDate(pmt.paymentDate || pmt.date)}</td>
                    <td className="px-4 py-3 text-gray-700 capitalize">{pmt.paymentMode?.replace(/_/g, ' ') || '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{pmt.referenceNumber || pmt.reference || '-'}</td>
                    <td className="px-5 py-3 text-right font-medium text-green-600">{formatCurrency(pmt.amount, invoice?.currencySymbol, cs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Record Payment"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Amount"
            type="number"
            required
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={payment.amount}
            onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
          />
          <Input
            label="Payment Date"
            type="date"
            required
            value={payment.date}
            onChange={(e) => setPayment({ ...payment, date: e.target.value })}
          />
          <Select
            label="Payment Mode"
            required
            options={paymentModeOptions}
            value={payment.paymentMode}
            onChange={(e) => setPayment({ ...payment, paymentMode: e.target.value })}
          />
          <Input
            label="Reference#"
            placeholder="e.g., Transaction ID, Cheque number"
            value={payment.reference}
            onChange={(e) => setPayment({ ...payment, reference: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              rows={2}
              placeholder="Any additional notes"
              value={payment.notes}
              onChange={(e) => setPayment({ ...payment, notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={paymentSaving}
              onClick={handleRecordPayment}
            >
              Record Payment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
