'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '../../../../../lib/api';
import { useToast } from '../../contexts/InvoiceToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import {
  HiPencil,
  HiTrash,
  HiMail,
  HiArrowLeft,
  HiCheckCircle,
  HiXCircle,
  HiDocumentText,
} from 'react-icons/hi';
import DownloadPDFButton from '../../components/pdf/DownloadPDFButton';

const statusBadgeMap = {
  draft: { variant: 'default', label: 'Draft' },
  sent: { variant: 'info', label: 'Sent' },
  accepted: { variant: 'success', label: 'Accepted' },
  declined: { variant: 'danger', label: 'Declined' },
  invoiced: { variant: 'warning', label: 'Invoiced' },
};

function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rs.0.00';
  return `Rs.${Number(amount).toLocaleString('en-IN', {
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

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const quoteId = params.id;

  const [quote, setQuote] = useState(null);
  const [orgData, setOrgData] = useState({});
  const [pdfSettings, setPdfSettings] = useState({ template: 'standard', colors: {} });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchQuote();
    fetchOrg();
    fetchPdfSettings();
  }, [quoteId]);

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

  async function fetchQuote() {
    setLoading(true);
    try {
      const data = await apiClient.getInvoiceQuote(quoteId);
      setQuote(data);
    } catch (err) {
      showToast(err.message || 'Failed to load quote', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    setActionLoading(true);
    try {
      await apiClient.sendInvoiceQuote(quoteId);
      showToast('Quote sent successfully!', 'success');
      fetchQuote();
    } catch (err) {
      showToast(err.message || 'Failed to send quote', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    setActionLoading(true);
    try {
      await apiClient.deleteInvoiceQuote(quoteId);
      showToast('Quote deleted', 'success');
      router.push('/invoice/quotes');
    } catch (err) {
      showToast(err.message || 'Failed to delete quote', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleMarkAccepted() {
    setActionLoading(true);
    try {
      await apiClient.acceptInvoiceQuote(quoteId);
      showToast('Quote marked as accepted', 'success');
      fetchQuote();
    } catch (err) {
      showToast(err.message || 'Failed to update quote', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleMarkDeclined() {
    setActionLoading(true);
    try {
      await apiClient.declineInvoiceQuote(quoteId);
      showToast('Quote marked as declined', 'success');
      fetchQuote();
    } catch (err) {
      showToast(err.message || 'Failed to update quote', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleConvertToInvoice() {
    setActionLoading(true);
    try {
      const data = await apiClient.convertQuoteToInvoice(quoteId);
      const invoiceId = data._id || data.id;
      showToast('Quote converted to invoice!', 'success');
      if (invoiceId) {
        router.push(`/invoice/invoices/${invoiceId}`);
      } else {
        router.push('/invoice/invoices');
      }
    } catch (err) {
      showToast(err.message || 'Failed to convert quote', 'error');
    } finally {
      setActionLoading(false);
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

  if (!quote) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Quote not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push('/invoice/quotes')}>
          Back to Quotes
        </Button>
      </div>
    );
  }

  const status = quote.status || 'draft';
  const badge = statusBadgeMap[status] || statusBadgeMap.draft;
  const items = quote.items || [];
  const customer = quote.customer || {};

  function renderActions() {
    switch (status) {
      case 'draft':
        return (
          <>
            <Button
              variant="outline"
              icon={HiPencil}
              onClick={() => router.push(`/invoice/quotes/${quoteId}/edit`)}
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
        return (
          <>
            <Button
              variant="primary"
              icon={HiDocumentText}
              onClick={handleConvertToInvoice}
              loading={actionLoading}
            >
              Convert to Invoice
            </Button>
            <Button
              variant="outline"
              icon={HiCheckCircle}
              onClick={handleMarkAccepted}
              disabled={actionLoading}
            >
              Mark as Accepted
            </Button>
            <Button
              variant="outline"
              icon={HiXCircle}
              onClick={handleMarkDeclined}
              disabled={actionLoading}
            >
              Mark as Declined
            </Button>
          </>
        );
      case 'accepted':
        return (
          <Button
            variant="primary"
            icon={HiDocumentText}
            onClick={handleConvertToInvoice}
            loading={actionLoading}
          >
            Convert to Invoice
          </Button>
        );
      case 'declined':
      case 'invoiced':
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
        onClick={() => router.push('/invoice/quotes')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer"
      >
        <HiArrowLeft className="h-4 w-4" />
        Back to Quotes
      </button>

      <PageHeader
        title={`Quote ${quote.quoteNumber || ''}`}
        subtitle={
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <DownloadPDFButton data={quote} type="quote" org={orgData} colors={pdfSettings.colors} template={pdfSettings.template} />
            {renderActions()}
          </div>
        }
      />

      {/* Quote Info */}
      <Card className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Customer</p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {customer.name || quote.customerName || '-'}
            </p>
            {customer.email && (
              <p className="text-xs text-gray-500 mt-0.5">{customer.email}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Quote Date</p>
            <p className="text-sm text-gray-900 mt-1">{formatDate(quote.quoteDate)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Expiry Date</p>
            <p className="text-sm text-gray-900 mt-1">{formatDate(quote.expiryDate)}</p>
          </div>
          {quote.reference && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Reference#</p>
              <p className="text-sm text-gray-900 mt-1">{quote.reference}</p>
            </div>
          )}
        </div>
        {quote.subject && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase">Subject</p>
            <p className="text-sm text-gray-900 mt-1">{quote.subject}</p>
          </div>
        )}
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
                  <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(item.rate)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{item.taxRate ? `${item.taxRate}%` : '-'}</td>
                  <td className="px-5 py-3 text-right font-medium text-gray-900">
                    {formatCurrency(item.amount || (item.quantity || 0) * (item.rate || 0))}
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
            <span className="font-medium">{formatCurrency(quote.subtotal)}</span>
          </div>
          {(quote.discountAmount > 0) && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Discount
                {quote.discountType === 'percentage' && quote.discountValue
                  ? ` (${quote.discountValue}%)`
                  : ''}
              </span>
              <span className="font-medium text-red-600">-{formatCurrency(quote.discountAmount)}</span>
            </div>
          )}
          {(quote.taxAmount > 0) && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">{formatCurrency(quote.taxAmount)}</span>
            </div>
          )}
          {(quote.adjustments !== 0 && quote.adjustments !== undefined && quote.adjustments !== null) && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Adjustment</span>
              <span className="font-medium">{formatCurrency(quote.adjustments)}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-2 flex justify-between">
            <span className="text-sm font-semibold text-gray-900">Total</span>
            <span className="text-lg font-bold text-gray-900">{formatCurrency(quote.total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {(quote.customerNotes || quote.termsAndConditions) && (
        <Card className="mb-6">
          {quote.customerNotes && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Customer Notes</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.customerNotes}</p>
            </div>
          )}
          {quote.termsAndConditions && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Terms & Conditions</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.termsAndConditions}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
