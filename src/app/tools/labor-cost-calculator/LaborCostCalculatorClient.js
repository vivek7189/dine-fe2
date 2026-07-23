'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function LaborCostCalculatorClient() {
  const [currency, setCurrency] = useState('$');
  const [monthlyRevenue, setMonthlyRevenue] = useState('');
  const [employees, setEmployees] = useState([
    { role: 'Chef', count: 1, hourlyWage: '', hoursPerWeek: 40 },
    { role: 'Line Cook', count: 2, hourlyWage: '', hoursPerWeek: 40 },
    { role: 'Server', count: 3, hourlyWage: '', hoursPerWeek: 30 },
    { role: 'Cashier', count: 1, hourlyWage: '', hoursPerWeek: 40 },
  ]);

  const revenue = parseFloat(monthlyRevenue) || 0;

  const updateEmployee = (index, field, value) => {
    const updated = [...employees];
    updated[index][field] = value;
    setEmployees(updated);
  };

  const addEmployee = () => {
    setEmployees([...employees, { role: 'New Role', count: 1, hourlyWage: '', hoursPerWeek: 40 }]);
  };

  const totalWeeklyLabor = employees.reduce((sum, emp) => {
    const wage = parseFloat(emp.hourlyWage) || 0;
    return sum + (wage * emp.hoursPerWeek * emp.count);
  }, 0);

  const totalMonthlyLabor = totalWeeklyLabor * 4.33;
  const laborCostPercent = revenue > 0 ? (totalMonthlyLabor / revenue) * 100 : 0;
  const totalEmployees = employees.reduce((sum, emp) => sum + emp.count, 0);

  const getStatusColor = (percent) => {
    if (percent <= 25) return { bg: '#d1fae5', color: '#059669', status: 'Excellent' };
    if (percent <= 30) return { bg: '#fef3c7', color: '#d97706', status: 'Good' };
    if (percent <= 35) return { bg: '#fed7aa', color: '#ea580c', status: 'Average' };
    return { bg: '#fee2e2', color: '#dc2626', status: 'High - Optimize' };
  };

  const status = getStatusColor(laborCostPercent);

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
              Restaurant Labor Cost Calculator
            </h1>
            <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
              Calculate your total labor costs and labor cost percentage. Optimize staffing to improve profitability.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            {/* Input Card */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>Staff Details</h2>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                  <option value="$">$ USD</option>
                  <option value="£">£ GBP</option>
                  <option value="₹">₹ INR</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Monthly Revenue</label>
                <input type="number" value={monthlyRevenue} onChange={(e) => setMonthlyRevenue(e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1.5fr', gap: '8px', marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                  <span>Role</span><span>Count</span><span>Hourly Wage</span><span>Hours/Week</span>
                </div>
                {employees.map((emp, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1.5fr', gap: '8px', marginBottom: '8px' }}>
                    <input value={emp.role} onChange={(e) => updateEmployee(idx, 'role', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }} />
                    <input type="number" value={emp.count} onChange={(e) => updateEmployee(idx, 'count', parseInt(e.target.value) || 0)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }} />
                    <input type="number" value={emp.hourlyWage} onChange={(e) => updateEmployee(idx, 'hourlyWage', e.target.value)} placeholder="0" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }} />
                    <input type="number" value={emp.hoursPerWeek} onChange={(e) => updateEmployee(idx, 'hoursPerWeek', parseInt(e.target.value) || 0)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }} />
                  </div>
                ))}
              </div>

              <button onClick={addEmployee} style={{ width: '100%', padding: '10px', backgroundColor: '#f3f4f6', border: '1px dashed #d1d5db', borderRadius: '8px', cursor: 'pointer', color: '#6b7280' }}>
                + Add Employee Role
              </button>
            </div>

            {/* Results Card */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Labor Cost Analysis</h2>

              <div style={{ marginBottom: '20px', padding: '24px', backgroundColor: status.bg, borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: status.color, marginBottom: '8px' }}>Labor Cost Percentage</p>
                <p style={{ fontSize: '48px', fontWeight: '800', color: status.color }}>{laborCostPercent.toFixed(1)}%</p>
                <p style={{ fontSize: '14px', color: status.color, fontWeight: '600' }}>{status.status}</p>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Target: 25-30%</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '10px' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Weekly Labor Cost</p>
                  <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>{currency}{totalWeeklyLabor.toLocaleString()}</p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '10px' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Monthly Labor Cost</p>
                  <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>{currency}{totalMonthlyLabor.toLocaleString()}</p>
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#dbeafe', borderRadius: '10px' }}>
                <p style={{ fontSize: '14px', color: '#1e40af', marginBottom: '4px' }}>Total Staff: {totalEmployees} employees</p>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Avg cost per employee: {currency}{totalEmployees > 0 ? (totalMonthlyLabor / totalEmployees).toFixed(0) : 0}/month</p>
              </div>
            </div>
          </div>

          {/* Benchmarks */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>Industry Labor Cost Benchmarks</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { type: 'Quick Service', range: '25-30%' },
                { type: 'Fast Casual', range: '28-32%' },
                { type: 'Casual Dining', range: '30-35%' },
                { type: 'Fine Dining', range: '35-40%' },
                { type: 'Cafes', range: '25-30%' },
                { type: 'Bars', range: '20-25%' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '10px', textAlign: 'center' }}>
                  <p style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{item.type}</p>
                  <p style={{ fontSize: '18px', color: '#059669', fontWeight: '700' }}>{item.range}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#ef4444', borderRadius: '16px', color: 'white' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Manage Staff with DineOpen</h2>
            <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>Staff scheduling, attendance tracking, and labor analytics. Free 7-day trial.</p>
            <Link href="https://dineopen.com/login" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Start Free Trial →
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
