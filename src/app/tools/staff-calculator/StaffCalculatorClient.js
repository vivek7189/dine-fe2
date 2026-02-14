'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaUsers, FaUtensils, FaConciergeBell, FaCalculator } from 'react-icons/fa';

export default function StaffCalculatorClient() {
  const [covers, setCovers] = useState(50);
  const [serviceStyle, setServiceStyle] = useState('casual');
  const [operatingHours, setOperatingHours] = useState(12);
  const [daysPerWeek, setDaysPerWeek] = useState(7);
  const [calculated, setCalculated] = useState(false);

  const serviceMultipliers = {
    qsr: { name: 'QSR/Fast Food', serverRatio: 30, kitchenRatio: 40, description: 'Counter service, quick turnover' },
    casual: { name: 'Casual Dining', serverRatio: 15, kitchenRatio: 25, description: 'Table service, moderate pace' },
    fineDining: { name: 'Fine Dining', serverRatio: 8, kitchenRatio: 15, description: 'Full table service, detailed attention' },
    cafe: { name: 'Cafe/Bakery', serverRatio: 25, kitchenRatio: 35, description: 'Counter + limited table service' },
    bar: { name: 'Bar/Pub', serverRatio: 20, kitchenRatio: 30, description: 'Bar service with food' },
  };

  const calculateStaff = () => {
    const style = serviceMultipliers[serviceStyle];

    // FOH Staff
    const serversPerShift = Math.ceil(covers / style.serverRatio);
    const hostsPerShift = covers > 40 ? Math.ceil(covers / 60) : 0;
    const cashiersPerShift = serviceStyle === 'qsr' ? Math.ceil(covers / 50) : 1;
    const bussersPerShift = serviceStyle === 'fineDining' ? Math.ceil(serversPerShift / 2) : Math.ceil(serversPerShift / 3);

    // Kitchen Staff
    const cooksPerShift = Math.ceil(covers / style.kitchenRatio);
    const prepCooksPerShift = Math.ceil(cooksPerShift / 2);
    const dishwashersPerShift = Math.ceil(covers / 50);

    // Management
    const managers = covers > 60 ? 2 : 1;

    // Calculate total with shift coverage (assuming 2 shifts for full coverage)
    const shiftsPerDay = operatingHours > 8 ? 2 : 1;
    const weeklyHoursPerEmployee = 48; // Standard in India
    const hoursPerShift = operatingHours / shiftsPerDay;

    // Multiplier for coverage (including offs)
    const coverageMultiplier = (daysPerWeek * operatingHours) / weeklyHoursPerEmployee;

    const totalFOH = Math.ceil((serversPerShift + hostsPerShift + cashiersPerShift + bussersPerShift) * coverageMultiplier);
    const totalKitchen = Math.ceil((cooksPerShift + prepCooksPerShift + dishwashersPerShift) * coverageMultiplier);
    const totalManagement = managers;

    return {
      perShift: {
        servers: serversPerShift,
        hosts: hostsPerShift,
        cashiers: cashiersPerShift,
        bussers: bussersPerShift,
        cooks: cooksPerShift,
        prepCooks: prepCooksPerShift,
        dishwashers: dishwashersPerShift,
      },
      total: {
        foh: totalFOH,
        kitchen: totalKitchen,
        management: totalManagement,
        grand: totalFOH + totalKitchen + totalManagement,
      },
      shiftsPerDay,
    };
  };

  const staff = calculateStaff();

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Restaurant Staff Calculator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Calculate optimal staffing levels based on your restaurant size and service style.
            </p>
          </div>
        </section>

        {/* Calculator */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
              {/* Inputs */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Restaurant Details</h3>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Seating Capacity (Covers)
                  </label>
                  <input
                    type="number"
                    value={covers}
                    onChange={(e) => setCovers(parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Service Style
                  </label>
                  <select
                    value={serviceStyle}
                    onChange={(e) => setServiceStyle(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  >
                    {Object.entries(serviceMultipliers).map(([key, val]) => (
                      <option key={key} value={key}>{val.name} - {val.description}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Operating Hours per Day
                  </label>
                  <input
                    type="number"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(parseInt(e.target.value) || 8)}
                    min="4"
                    max="24"
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Days Open per Week
                  </label>
                  <input
                    type="number"
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(parseInt(e.target.value) || 6)}
                    min="1"
                    max="7"
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  />
                </div>

                <button
                  onClick={() => setCalculated(true)}
                  style={{ width: '100%', padding: '14px', backgroundColor: '#0891b2', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <FaCalculator /> Calculate Staff
                </button>
              </div>

              {/* Results */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Staffing Recommendation</h3>

                {/* Per Shift */}
                <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#ecfeff', borderRadius: '12px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0e7490', marginBottom: '16px' }}>Per Shift ({staff.shiftsPerDay} shift{staff.shiftsPerDay > 1 ? 's' : ''}/day)</h4>

                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Front of House</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '6px', fontSize: '13px' }}>
                        <span style={{ color: '#6b7280' }}>Servers:</span> <strong>{staff.perShift.servers}</strong>
                      </div>
                      {staff.perShift.hosts > 0 && (
                        <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '6px', fontSize: '13px' }}>
                          <span style={{ color: '#6b7280' }}>Hosts:</span> <strong>{staff.perShift.hosts}</strong>
                        </div>
                      )}
                      <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '6px', fontSize: '13px' }}>
                        <span style={{ color: '#6b7280' }}>Cashiers:</span> <strong>{staff.perShift.cashiers}</strong>
                      </div>
                      <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '6px', fontSize: '13px' }}>
                        <span style={{ color: '#6b7280' }}>Bussers:</span> <strong>{staff.perShift.bussers}</strong>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Kitchen</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '6px', fontSize: '13px' }}>
                        <span style={{ color: '#6b7280' }}>Line Cooks:</span> <strong>{staff.perShift.cooks}</strong>
                      </div>
                      <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '6px', fontSize: '13px' }}>
                        <span style={{ color: '#6b7280' }}>Prep Cooks:</span> <strong>{staff.perShift.prepCooks}</strong>
                      </div>
                      <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '6px', fontSize: '13px' }}>
                        <span style={{ color: '#6b7280' }}>Dishwashers:</span> <strong>{staff.perShift.dishwashers}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Staff */}
                <div style={{ padding: '20px', backgroundColor: '#0891b2', borderRadius: '12px', color: 'white' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', opacity: 0.9 }}>Total Staff Required (with weekly offs)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '24px', fontWeight: '800' }}>{staff.total.foh}</p>
                      <p style={{ fontSize: '11px', opacity: 0.8 }}>FOH</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '24px', fontWeight: '800' }}>{staff.total.kitchen}</p>
                      <p style={{ fontSize: '11px', opacity: 0.8 }}>Kitchen</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '24px', fontWeight: '800' }}>{staff.total.management}</p>
                      <p style={{ fontSize: '11px', opacity: 0.8 }}>Managers</p>
                    </div>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', opacity: 0.9 }}>Total Team Size</p>
                    <p style={{ fontSize: '36px', fontWeight: '800' }}>{staff.total.grand}</p>
                    <p style={{ fontSize: '12px', opacity: 0.8 }}>employees</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>Staffing Tips</h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {[
                { title: 'Start lean, scale up', desc: 'Begin with minimum staff and add as demand grows. Overstaffing kills margins.' },
                { title: 'Cross-train employees', desc: 'Train staff for multiple roles to handle rush hours and absences efficiently.' },
                { title: 'Track labor cost %', desc: 'Keep labor costs between 25-35% of revenue. Use scheduling software to optimize.' },
                { title: 'Peak hour staffing', desc: 'Schedule extra staff for lunch (12-2pm) and dinner (7-10pm) rush periods.' },
              ].map((tip, idx) => (
                <div key={idx} style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', borderLeft: '4px solid #0891b2' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{tip.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 20px', backgroundColor: '#0891b2', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Manage Staff Scheduling Easily</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>DineOpen tracks attendance, manages shifts, and calculates payroll automatically.</p>
            <Link href="https://dineopen.com/login" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#0891b2', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Start Free Trial
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
