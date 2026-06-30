'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '../../../../../lib/api';
import { useToast } from '../../contexts/InvoiceToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { HiPencil, HiTrash, HiArrowLeft, HiRefresh } from 'react-icons/hi';
import DownloadPDFButton from '../../components/pdf/DownloadPDFButton';
import { useCurrency } from '../../../../../contexts/CurrencyContext';

const statusBadgeMap = {
  draft: { variant: 'default', label: 'Draft' },
  sent: { variant: 'info', label: 'Sent' },
  returned: { variant: 'success', label: 'Returned' },
};

const challanTypeLabels = {
  supply_on_approval: 'Supply on Approval',
  job_work: 'Job Work',
  supply_return: 'Supply Return',
};

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ChallanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const { getCurrencySymbol } = useCurrency();
  const cs = getCurrencySymbol();

  function formatCurrency(amount) {
    if (amount === null || amount === undefined) return `${cs}0.00`;
    return `${cs}${Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  const [challan, setChallan] = useState(null);
  const [orgData, setOrgData] = useState({});
  const [pdfSettings, setPdfSettings] = useState({ template: 'standard', colors: {} });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [markingReturned, setMarkingReturned] = useState(false);

  useEffect(() => {
    fetchChallan();
    fetchOrg();
    fetchPdfSettings();
  }, [params.id]);

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

  async function fetchChallan() {
    setLoading(true);
    try {
      const data = await apiClient.getInvoiceChallan(params.id);
      setChallan(data);
    } catch (err) {
      showToast(err.message || 'Failed to load challan', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiClient.deleteInvoiceChallan(params.id);
      showToast('Challan deleted successfully', 'success');
      router.push('/invoice/challans');
    } catch (err) {
      showToast(err.message || 'Failed to delete challan', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  async function handleMarkReturned() {
    setMarkingReturned(true);
    try {
      await apiClient.updateInvoiceChallan(params.id, {
        status: 'returned',
      });
      showToast('Challan marked as returned', 'success');
      fetchChallan();
    } catch (err) {
      showToast(err.message || 'Failed to update challan', 'error');
    } finally {
      setMarkingReturned(false);
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Delivery Challan" />
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!challan) {
    return (
      <div>
        <PageHeader title="Delivery Challan" />
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">Challan not found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/invoice/challans')}
            >
              Back to Challans
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isDraft = challan.status === 'draft';
  const isSent = challan.status === 'sent';
  const badge = statusBadgeMap[challan.status] || statusBadgeMap.draft;

  return (
    <div>
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/invoice/challans')}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <HiArrowLeft className="h-5 w-5" />
            </button>
            <span>{challan.challanNumber || 'Delivery Challan'}</span>
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            {challan && <DownloadPDFButton data={challan} type="challan" org={orgData} colors={pdfSettings.colors} template={pdfSettings.template} />}
            {isSent && (
              <Button
                variant="outline"
                icon={HiRefresh}
                loading={markingReturned}
                onClick={handleMarkReturned}
              >
                Mark as Returned
              </Button>
            )}
            {isDraft && (
              <>
                <Button
                  variant="outline"
                  icon={HiPencil}
                  onClick={() => router.push(`/invoice/challans/${params.id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  icon={HiTrash}
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="space-y-6">
        {/* Challan Info */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Customer</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {challan.customer?.name || challan.customerName || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Date</p>
              <p className="text-sm text-gray-900 mt-1">{formatDate(challan.challanDate)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Challan Type</p>
              <p className="text-sm text-gray-900 mt-1">
                {challanTypeLabels[challan.challanType] || challan.challanType || '-'}
              </p>
            </div>
            {challan.referenceNumber && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Reference#</p>
                <p className="text-sm text-gray-900 mt-1">{challan.referenceNumber}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Items Table */}
        <Card title="Items">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase w-8">#</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Item</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase w-24">Qty</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase w-32">Rate</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase w-32">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(challan.items || []).map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(item.rate)}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(item.amount || (item.quantity * item.rate))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-4 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sub Total</span>
                <span className="font-medium">{formatCurrency(challan.subtotal)}</span>
              </div>
              {(challan.discount > 0 || challan.discountAmount > 0) && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount ({challan.discount || 0}%)</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(challan.discountAmount)}
                  </span>
                </div>
              )}
              {challan.adjustments !== 0 && challan.adjustments !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Adjustment</span>
                  <span className="font-medium">{formatCurrency(challan.adjustments)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-gray-900 text-base">{formatCurrency(challan.total)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Delivery Challan"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete challan <span className="font-semibold">{challan.challanNumber}</span>?
          This action cannot be undone.
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
