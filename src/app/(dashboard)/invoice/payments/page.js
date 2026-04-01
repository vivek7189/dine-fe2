'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../../../../lib/api';
import { useToast } from '../contexts/InvoiceToastContext';
import PageHeader from '../components/layout/PageHeader';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import {
  HiPlus,
  HiCurrencyRupee,
  HiCreditCard,
  HiOfficeBuilding,
  HiDeviceMobile,
  HiHand,
  HiArrowRight,
  HiUpload,
  HiMail,
  HiClock,
  HiCheckCircle,
} from 'react-icons/hi';

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return 'Rs.0.00';
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

const paymentModeLabels = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  upi: 'UPI',
  credit_card: 'Credit Card',
  cheque: 'Cheque',
  other: 'Other',
};

function PaymentLifecycleDiagram() {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <HiCurrencyRupee className="h-10 w-10 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Collection Lifecycle</h3>
        <p className="text-sm text-gray-500 text-center max-w-lg mb-8">
          Track payments from invoice creation to collection. Here is how the payment reminder flow works:
        </p>

        {/* Lifecycle Flow */}
        <div className="flex items-center gap-2 flex-wrap justify-center mb-8">
          {[
            { icon: HiMail, label: 'Initial Request', color: 'bg-blue-100 text-blue-700' },
            { icon: HiClock, label: 'Reminder 1', color: 'bg-amber-100 text-amber-700' },
            { icon: HiClock, label: 'Reminder 2', color: 'bg-orange-100 text-orange-700' },
            { icon: HiClock, label: 'Reminder N', color: 'bg-red-100 text-red-700' },
            { icon: HiCheckCircle, label: 'Payment Received', color: 'bg-green-100 text-green-700' },
          ].map((step, idx, arr) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${step.color}`}>
                <step.icon className="h-4 w-4" />
                <span className="text-xs font-medium whitespace-nowrap">{step.label}</span>
              </div>
              {idx < arr.length - 1 && (
                <HiArrowRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Payment Modes */}
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          Accepted Payment Modes
        </p>
        <div className="flex items-center gap-4 flex-wrap justify-center mb-8">
          {[
            { icon: HiDeviceMobile, label: 'UPI', color: 'text-purple-600 bg-purple-50' },
            { icon: HiCreditCard, label: 'Credit Card', color: 'text-blue-600 bg-blue-50' },
            { icon: HiOfficeBuilding, label: 'Bank Transfer', color: 'text-emerald-600 bg-emerald-50' },
            { icon: HiHand, label: 'Manual/Offline', color: 'text-gray-600 bg-gray-50' },
          ].map((mode) => (
            <div
              key={mode.label}
              className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border border-gray-100 ${mode.color}`}
            >
              <mode.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{mode.label}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => window.location.href = '/invoice/invoices?status=sent'}
          >
            Go to Unpaid Invoices
          </Button>
          <Button
            variant="outline"
            icon={HiUpload}
            onClick={() => {}}
          >
            Import Payments
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function PaymentsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    setLoading(true);
    try {
      const data = await apiClient.getInvoicePayments();
      setPayments(data.payments || data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load payments', 'error');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    {
      key: 'paymentNumber',
      label: 'Payment#',
      render: (val) => (
        <span className="font-medium text-blue-600">{val}</span>
      ),
    },
    {
      key: 'customerName',
      label: 'Customer',
      render: (val, row) => row.customer?.name || row.customerName || '-',
    },
    {
      key: 'invoiceNumber',
      label: 'Invoice#',
      render: (val, row) => row.invoice?.invoiceNumber || row.invoiceNumber || '-',
    },
    {
      key: 'paymentDate',
      label: 'Date',
      render: (val) => formatDate(val),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (val) => (
        <span className="font-semibold text-green-700">{formatCurrency(val)}</span>
      ),
    },
    {
      key: 'paymentMode',
      label: 'Mode',
      render: (val) => (
        <span className="text-gray-700">{paymentModeLabels[val] || val || '-'}</span>
      ),
    },
  ];

  const hasPayments = !loading && payments.length > 0;
  const isEmpty = !loading && payments.length === 0;

  return (
    <div>
      <PageHeader
        title="Payments Received"
        subtitle="Track payments from your customers"
        actions={
          <Button
            icon={HiPlus}
            onClick={() => router.push('/invoice/payments/new')}
          >
            New Payment
          </Button>
        }
      />

      {loading && (
        <Table
          columns={columns}
          data={[]}
          loading={true}
          emptyMessage="No payments found"
        />
      )}

      {isEmpty && <PaymentLifecycleDiagram />}

      {hasPayments && (
        <Table
          columns={columns}
          data={payments}
          loading={false}
          emptyMessage="No payments found"
        />
      )}
    </div>
  );
}
