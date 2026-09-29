// The analytics endpoints answer { success, data: { …totals, rows } }, but these report pages were
// written for a different shape ({ summary, staff | orders | events | promotions }) — so Staff Sales,
// Promotions, Comps, Split Bills, Audit Trail and Reprint Log always showed 0 / empty.
// Each adapter maps the API response to the shape its page reads. A response that is already in the
// page's shape (no `data` object) is returned unchanged.
import { orderDisplayNumber } from '../utils/orderNumber';

const body = (res) => (res && res.data && typeof res.data === 'object' && !Array.isArray(res.data) ? res.data : null);
const arr = (v) => (Array.isArray(v) ? v : []);
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

export function adaptStaffSales(res) {
  const d = body(res);
  if (!d) return res;
  return {
    success: res.success,
    dateRange: d.dateRange,
    staff: arr(d.staff),
    summary: {
      totalStaff: num(d.totalStaff),
      totalRevenue: num(d.totalRevenue),
      avgRevenuePerStaff: num(d.avgRevenuePerStaff),
      totalTips: num(d.totalTips),
    },
  };
}

export function adaptPromotionReport(res) {
  const d = body(res);
  if (!d) return res;
  const promotions = arr(d.offers).map((o) => ({
    ...o,
    source: o.type || 'offer',
    affectedOrders: num(o.usageCount),
  }));
  const byType = {};
  promotions.forEach((p) => {
    const t = byType[p.source] || (byType[p.source] = { count: 0, total: 0 });
    t.count += num(p.usageCount);
    t.total += num(p.totalDiscount);
  });
  return {
    success: res.success,
    dateRange: d.dateRange,
    promotions,
    byType,
    summary: {
      totalPromotionsUsed: num(d.totalOffersUsed),
      totalDiscountGiven: num(d.totalDiscountGiven),
      avgDiscountPerOrder: num(d.avgDiscountPerOrder),
      discountAsPercentOfRevenue: num(d.discountPercentOfRevenue),
      totalOrders: num(d.totalOrders),
    },
  };
}

export function adaptCompReport(res) {
  const d = body(res);
  if (!d) return res;
  return {
    success: res.success,
    dateRange: d.dateRange,
    orders: arr(d.orders).map((o) => ({
      ...o,
      id: o.id || o.orderId,
      createdAt: o.createdAt || o.date,
      totalAmount: o.totalAmount != null ? o.totalAmount : o.originalTotal,
      items: arr(o.items).map((it) => (typeof it === 'string' ? { name: it, qty: '' } : it)),
    })),
    summary: {
      totalCompOrders: num(d.totalCompOrders),
      totalCompValue: num(d.totalValueComped),
      percentOfOrders: num(d.percentOfOrders),
      totalOrdersInPeriod: num(d.totalOrders),
    },
  };
}

export function adaptSplitBills(res) {
  const d = body(res);
  if (!d) return res;
  const orders = arr(d.orders).map((o) => ({
    ...o,
    id: o.id || o.orderId,
    createdAt: o.createdAt || o.date,
    splitPayments: arr(o.splitPayments).length ? o.splitPayments : arr(o.splits),
  }));
  // Per payment method: number of split parts and their amount (what the page's cards show).
  const methodBreakdown = {};
  orders.forEach((o) => arr(o.splitPayments).forEach((sp) => {
    const m = sp.method || sp.paymentMethod || 'cash';
    const t = methodBreakdown[m] || (methodBreakdown[m] = { count: 0, total: 0 });
    t.count += 1;
    t.total += num(sp.amount);
  }));
  return {
    success: res.success,
    dateRange: d.dateRange,
    orders,
    methodBreakdown,
    summary: {
      totalSplitOrders: num(d.totalSplitOrders),
      avgSplitsPerOrder: num(d.avgSplitCount),
      mostCommonMethod: d.commonMethod && d.commonMethod !== '-' ? d.commonMethod : '',
      splitPercentage: num(d.splitPercentage),
      totalOrders: num(d.totalOrders),
    },
  };
}

export function adaptAuditTrail(res) {
  const d = body(res);
  if (!d) return res;
  const s = d.summary || {};
  return {
    success: res.success,
    dateRange: d.dateRange,
    // orderLabel: the short order number (#152) when the event carries it, else the long order id
    events: arr(d.events).map((e) => ({
      ...e,
      orderLabel: (e.dailyOrderId != null || e.orderNumberDisplay != null) ? `#${orderDisplayNumber(e)}` : (e.orderNumber || ''),
    })),
    summary: {
      ...s,
      totalEvents: num(d.totalEvents),
      edits: num(s.edited),
      cancellations: num(s.cancelled) + num(s.voided),
      reprints: num(s.reprinted),
    },
  };
}

export function adaptReprintLog(res) {
  const d = body(res);
  if (!d) return res;
  const orders = arr(d.orders).map((o) => ({
    ...o,
    id: o.id || o.orderId,
    createdAt: o.createdAt || o.date,
    billReprintCount: o.billReprintCount != null ? o.billReprintCount : num(o.reprintCount),
    billReprintHistory: arr(o.billReprintHistory).length ? o.billReprintHistory : arr(o.reprintHistory),
  }));
  return {
    success: res.success,
    dateRange: d.dateRange,
    orders,
    totalReprints: num(d.totalReprints),
    totalOrdersWithReprints: orders.length,
    reprintPercentage: num(d.reprintPercentage),
    totalOrdersInPeriod: num(d.totalOrders),
    topReprinter: d.topReprinter || null,
  };
}
