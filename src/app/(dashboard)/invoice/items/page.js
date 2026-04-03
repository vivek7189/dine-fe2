'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HiSearch, HiCube, HiPlus } from 'react-icons/hi';
import apiClient from '../../../../lib/api';
import PageHeader from '../components/layout/PageHeader';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Tabs from '../components/ui/Tabs';
import EmptyState from '../components/ui/EmptyState';

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '0.00';
  return Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const filterTabs = [
  { key: 'all', label: 'All' },
  { key: 'goods', label: 'Goods' },
  { key: 'service', label: 'Service' },
];

export default function ItemsPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchDebounced) params.set('search', searchDebounced);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      const qs = params.toString();
      const data = await apiClient.getInvoiceItems(qs || '');
      setItems(data.items || data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [searchDebounced, typeFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      width: '100px',
      render: (value) => (
        <Badge variant={value === 'goods' ? 'info' : 'warning'}>
          {value === 'goods' ? 'Goods' : 'Service'}
        </Badge>
      ),
    },
    {
      key: 'unit',
      label: 'Unit',
      width: '100px',
    },
    {
      key: 'sellingPrice',
      label: 'Selling Price',
      width: '140px',
      render: (value) => (
        <span className="font-medium">
          {'\u20B9'}{formatCurrency(value || 0)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '100px',
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'default'}>
          {value === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const hasItems = !loading && items.length > 0;
  const isEmpty = !loading && items.length === 0 && !searchDebounced && typeFilter === 'all';
  const noResults = !loading && items.length === 0 && (searchDebounced || typeFilter !== 'all');

  return (
    <div>
      <PageHeader
        title="Items"
        subtitle="Manage your products and services"
        actions={
          <Link href="/invoice/items/new">
            <Button icon={HiPlus}>New Item</Button>
          </Link>
        }
      />

      {/* Filter Tabs */}
      {!isEmpty && (
        <div className="mb-4">
          <Tabs tabs={filterTabs} activeTab={typeFilter} onChange={setTypeFilter} />
        </div>
      )}

      {/* Search */}
      {!isEmpty && (
        <div className="mb-4">
          <div className="relative max-w-md">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {isEmpty && (
        <EmptyState
          icon={HiCube}
          title="No items yet"
          description="Add your first product or service to start creating invoices."
          action={
            <Link href="/invoice/items/new">
              <Button icon={HiPlus}>Add Item</Button>
            </Link>
          }
        />
      )}

      {/* No Results */}
      {noResults && (
        <EmptyState
          icon={HiSearch}
          title="No items found"
          description="Try adjusting your search or filter to find what you are looking for."
        />
      )}

      {/* Table */}
      {(hasItems || loading) && (
        <Table
          columns={columns}
          data={items}
          loading={loading}
          emptyMessage="No items found"
          onRowClick={(row) => router.push(`/invoice/items/${row._id || row.id}`)}
        />
      )}
    </div>
  );
}
