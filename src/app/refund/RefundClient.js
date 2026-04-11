'use client';

import { useRouter } from 'next/navigation';
import { FaUtensils, FaArrowLeft } from 'react-icons/fa';
import Footer from '@/components/Footer';

export default function RefundClient() {
  const router = useRouter();

  const sectionStyle = { marginBottom: '32px' };
  const h2Style = { fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' };
  const h3Style = { fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '12px', marginTop: '20px' };
  const pStyle = { marginBottom: '16px' };
  const liStyle = { marginBottom: '8px' };
  const ulStyle = { paddingLeft: '20px' };
  const alertStyle = {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '16px 20px',
    marginBottom: '16px',
  };
  const alertTextStyle = { color: '#991b1b', fontWeight: '600', fontSize: '14px' };
  const infoStyle = {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    padding: '16px 20px',
    marginBottom: '16px',
  };
  const infoTextStyle = { color: '#1e40af', fontSize: '14px' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer'
          }} onClick={() => router.push('/')}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaUtensils color="white" size={20} />
            </div>
            <span style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937'
            }}>
              DineOpen
            </span>
          </div>

          <button
            onClick={() => router.push('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#f3f4f6'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}
          >
            <FaArrowLeft size={14} />
            Back to Home
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '60px 20px',
        backgroundColor: 'white',
        marginTop: '40px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '16px'
        }}>
          Refund &amp; Cancellation Policy
        </h1>

        <p style={{
          color: '#6b7280',
          marginBottom: '32px',
          fontSize: '14px'
        }}>
          Last updated: April 2026
        </p>

        <div style={{ lineHeight: '1.8', color: '#374151' }}>

          {/* Important Notice */}
          <section style={sectionStyle}>
            <div style={alertStyle}>
              <p style={{ ...alertTextStyle, marginBottom: '8px' }}>
                Important: Please read this policy carefully before subscribing to or using DineOpen.
              </p>
              <p style={{ color: '#991b1b', fontSize: '14px', margin: 0 }}>
                By using DineOpen, you acknowledge and agree that you are using the software entirely at your own risk. DineOpen is provided on an &quot;as-is&quot; and &quot;as-available&quot; basis without warranties of any kind.
              </p>
            </div>
          </section>

          {/* 1. General No-Refund Policy */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>1. General No-Refund Policy</h2>
            <p style={pStyle}>
              All payments made to DineOpen, including but not limited to subscription fees, setup charges, onboarding fees, and any other service charges, are <strong>non-refundable</strong>. Once a payment is processed, it will not be reversed, credited, or refunded under normal circumstances.
            </p>
            <p style={pStyle}>
              This applies to:
            </p>
            <ul style={ulStyle}>
              <li style={liStyle}>Monthly and annual subscription plans</li>
              <li style={liStyle}>One-time setup or onboarding fees</li>
              <li style={liStyle}>Add-on features or module purchases</li>
              <li style={liStyle}>Any hardware ordered through DineOpen</li>
              <li style={liStyle}>Custom development or integration charges</li>
              <li style={liStyle}>Training and consultation fees</li>
            </ul>
          </section>

          {/* 2. Use at Your Own Risk */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>2. Use at Your Own Risk</h2>
            <p style={pStyle}>
              DineOpen is a software platform designed to assist in restaurant operations, including billing, order management, inventory tracking, and reporting. However, you acknowledge and agree to the following:
            </p>

            <h3 style={h3Style}>2.1 No Liability for Billing or Financial Data Loss</h3>
            <p style={pStyle}>
              DineOpen shall <strong>not be held responsible</strong> for any billing data loss, incorrect billing calculations, tax miscalculations, revenue discrepancies, or any financial loss arising from the use of the software. It is your sole responsibility to:
            </p>
            <ul style={ulStyle}>
              <li style={liStyle}>Verify all billing amounts, tax rates, and calculations before processing transactions</li>
              <li style={liStyle}>Maintain independent records and backups of your financial data</li>
              <li style={liStyle}>Cross-check invoices and reports generated by the software</li>
              <li style={liStyle}>Ensure your tax settings, GST rates, and pricing configurations are accurate</li>
            </ul>

            <h3 style={h3Style}>2.2 No Liability for Manual Errors</h3>
            <p style={pStyle}>
              DineOpen is <strong>not responsible</strong> for any losses, damages, or discrepancies caused by:
            </p>
            <ul style={ulStyle}>
              <li style={liStyle}>Incorrect data entry by you or your staff (wrong prices, quantities, tax rates, etc.)</li>
              <li style={liStyle}>Misconfigured settings, floor plans, menu items, or pricing rules</li>
              <li style={liStyle}>Incorrect use of features such as discounts, offers, split billing, or multi-tier pricing</li>
              <li style={liStyle}>Failure to properly train staff on using the software</li>
              <li style={liStyle}>Operating the software on unsupported devices or browsers</li>
            </ul>

            <h3 style={h3Style}>2.3 No Liability for Software Errors or Downtime</h3>
            <p style={pStyle}>
              While we strive for reliability, DineOpen shall <strong>not be liable</strong> for:
            </p>
            <ul style={ulStyle}>
              <li style={liStyle}>Software bugs, glitches, or unexpected behaviour that may affect billing, orders, or reports</li>
              <li style={liStyle}>Server downtime, outages, or service interruptions (scheduled or unscheduled)</li>
              <li style={liStyle}>Data synchronisation delays or failures between devices</li>
              <li style={liStyle}>Integration failures with third-party services (payment gateways, printers, KDS, etc.)</li>
              <li style={liStyle}>Loss of data due to system failures, network issues, or device malfunctions</li>
              <li style={liStyle}>Any indirect, incidental, consequential, or punitive damages arising from software errors</li>
            </ul>

            <div style={infoStyle}>
              <p style={{ ...infoTextStyle, margin: 0 }}>
                We strongly recommend maintaining manual or independent backup records of all critical business data, including daily sales, tax collections, and inventory counts. Do not rely solely on any software system for financial record-keeping.
              </p>
            </div>
          </section>

          {/* 3. Subscription Cancellation */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>3. Subscription Cancellation</h2>
            <p style={pStyle}>
              You may cancel your DineOpen subscription at any time. However, please note:
            </p>
            <ul style={ulStyle}>
              <li style={liStyle}><strong>No refunds</strong> will be issued for the remaining unused period of your subscription</li>
              <li style={liStyle}>Your access will continue until the end of the current billing cycle</li>
              <li style={liStyle}>After cancellation, your data will be retained for 30 days, after which it may be permanently deleted</li>
              <li style={liStyle}>Cancellation does not entitle you to any pro-rated refund</li>
              <li style={liStyle}>Re-activation after cancellation may require a new subscription at the then-current pricing</li>
            </ul>
          </section>

          {/* 4. Special Case Exceptions */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>4. Special Case Exceptions (Maximum 50% Refund)</h2>
            <p style={pStyle}>
              In rare and exceptional circumstances, DineOpen may, at its <strong>sole and absolute discretion</strong>, consider a partial refund of up to a <strong>maximum of 50%</strong> of the amount paid. This is not a right or entitlement but a discretionary goodwill gesture.
            </p>
            <p style={pStyle}>
              Special cases that <em>may</em> be considered (but are not guaranteed) include:
            </p>
            <ul style={ulStyle}>
              <li style={liStyle}>Duplicate payment or accidental double-charge that can be verified in our payment records</li>
              <li style={liStyle}>A critical, verified platform-wide outage lasting more than 72 continuous hours that is solely attributable to DineOpen infrastructure failure (not third-party services, internet, or device issues)</li>
              <li style={liStyle}>A fundamental feature explicitly promised in writing at the time of purchase that was never delivered within 90 days</li>
            </ul>

            <div style={alertStyle}>
              <p style={{ ...alertTextStyle, margin: 0 }}>
                Even in approved special cases, the maximum refund shall never exceed 50% of the total amount paid for the specific billing period in question. No refund shall exceed the amount actually paid by the user.
              </p>
            </div>

            <h3 style={h3Style}>4.1 How to Request a Special Case Review</h3>
            <p style={pStyle}>
              To request a special case refund review, you must:
            </p>
            <ul style={ulStyle}>
              <li style={liStyle}>Email <strong>support@dineopen.com</strong> with the subject line &quot;Refund Request - [Your Restaurant Name]&quot;</li>
              <li style={liStyle}>Include your registered email address, restaurant ID, and payment receipt</li>
              <li style={liStyle}>Provide a detailed explanation with supporting evidence (screenshots, transaction IDs, dates, etc.)</li>
              <li style={liStyle}>Submit the request within <strong>15 days</strong> of the incident or payment in question</li>
            </ul>
            <p style={pStyle}>
              DineOpen will review the request within 15 business days and communicate the decision via email. The decision of DineOpen shall be final and binding, and no further appeals or escalations will be entertained.
            </p>
          </section>

          {/* 5. What Is NOT Eligible for Refund */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>5. What Is NOT Eligible for Any Refund</h2>
            <p style={pStyle}>
              The following situations shall <strong>not qualify</strong> for any refund, partial or full:
            </p>
            <ul style={ulStyle}>
              <li style={liStyle}>Dissatisfaction with features, design, or user interface</li>
              <li style={liStyle}>Business closure, change of ownership, or decision to switch to another software</li>
              <li style={liStyle}>Failure to use the software or underutilisation of features</li>
              <li style={liStyle}>Loss of revenue or customers attributed to software usage or non-usage</li>
              <li style={liStyle}>Issues caused by user error, misconfiguration, or lack of training</li>
              <li style={liStyle}>Internet connectivity problems, device incompatibility, or hardware failures</li>
              <li style={liStyle}>Third-party integration failures (payment gateways, delivery platforms, printers)</li>
              <li style={liStyle}>Data loss due to user actions (accidental deletion, incorrect imports, etc.)</li>
              <li style={liStyle}>Changes in government regulations, tax laws, or compliance requirements</li>
              <li style={liStyle}>Disagreement with pricing changes for future billing cycles</li>
            </ul>
          </section>

          {/* 6. Data Responsibility */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>6. Data Responsibility &amp; Backup</h2>
            <p style={pStyle}>
              You are solely responsible for the accuracy, completeness, and backup of all data entered into DineOpen. This includes but is not limited to:
            </p>
            <ul style={ulStyle}>
              <li style={liStyle}>Menu items, pricing, and category configurations</li>
              <li style={liStyle}>Tax rates, GST numbers, and billing settings</li>
              <li style={liStyle}>Customer records and order history</li>
              <li style={liStyle}>Inventory data, recipes, and stock levels</li>
              <li style={liStyle}>Staff accounts, roles, and permissions</li>
              <li style={liStyle}>Financial reports and accounting records</li>
            </ul>
            <p style={pStyle}>
              DineOpen provides data export features and we strongly recommend regularly exporting and backing up your data. DineOpen shall not be held liable for any data loss, corruption, or inaccuracy regardless of the cause.
            </p>
          </section>

          {/* 7. Limitation of Liability */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>7. Limitation of Liability</h2>
            <p style={pStyle}>
              To the maximum extent permitted by applicable law:
            </p>
            <ul style={ulStyle}>
              <li style={liStyle}>DineOpen&apos;s total aggregate liability for any and all claims arising out of or related to the use of the software shall not exceed the amount paid by you in the <strong>last one (1) month</strong> of your subscription</li>
              <li style={liStyle}>DineOpen shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, revenue, data, business opportunities, or goodwill</li>
              <li style={liStyle}>DineOpen shall not be liable for any damages arising from events beyond its reasonable control, including but not limited to natural disasters, government actions, internet outages, or third-party service failures</li>
            </ul>
          </section>

          {/* 8. Indemnification */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>8. Indemnification</h2>
            <p style={pStyle}>
              You agree to indemnify and hold harmless DineOpen, its founders, employees, partners, and affiliates from any claims, losses, damages, liabilities, costs, and expenses (including legal fees) arising from:
            </p>
            <ul style={ulStyle}>
              <li style={liStyle}>Your use or misuse of the software</li>
              <li style={liStyle}>Incorrect data or settings entered by you or your staff</li>
              <li style={liStyle}>Any violation of tax laws, business regulations, or compliance requirements</li>
              <li style={liStyle}>Any dispute with your customers, vendors, or employees related to software-generated data</li>
            </ul>
          </section>

          {/* 9. Changes to This Policy */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>9. Changes to This Policy</h2>
            <p style={pStyle}>
              DineOpen reserves the right to modify this Refund &amp; Cancellation Policy at any time without prior notice. Changes will be effective immediately upon posting on this page. Your continued use of DineOpen after any changes constitutes your acceptance of the revised policy.
            </p>
          </section>

          {/* 10. Contact */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>10. Contact Us</h2>
            <p style={pStyle}>
              If you have questions about this policy or need to submit a special case refund request, please contact us:
            </p>
            <ul style={ulStyle}>
              <li style={liStyle}>Email: <strong>support@dineopen.com</strong></li>
              <li style={liStyle}>Website: <strong>www.dineopen.com</strong></li>
            </ul>
          </section>

          {/* Governing Law */}
          <section style={sectionStyle}>
            <h2 style={h2Style}>11. Governing Law</h2>
            <p style={pStyle}>
              This policy shall be governed by and construed in accordance with the laws of India. Any disputes arising from this policy shall be subject to the exclusive jurisdiction of the courts in India.
            </p>
          </section>

          {/* Final Summary Box */}
          <div style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px',
            marginTop: '32px',
          }}>
            <p style={{ fontWeight: '700', color: '#1f2937', marginBottom: '12px', fontSize: '15px' }}>
              Summary
            </p>
            <ul style={{ ...ulStyle, margin: 0, color: '#4b5563', fontSize: '14px' }}>
              <li style={liStyle}><strong>Refunds:</strong> No refunds under normal circumstances</li>
              <li style={liStyle}><strong>Special cases:</strong> Maximum 50% refund at DineOpen&apos;s sole discretion</li>
              <li style={liStyle}><strong>Cancellation:</strong> Access continues until end of billing cycle, no pro-rated refund</li>
              <li style={liStyle}><strong>Liability:</strong> Software provided as-is, use at your own risk</li>
              <li style={liStyle}><strong>Data:</strong> You are responsible for accuracy and backups of all your data</li>
              <li style={{ ...liStyle, marginBottom: 0 }}><strong>Financial loss:</strong> DineOpen is not liable for billing errors, manual mistakes, or software issues</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ height: '60px' }} />

      <Footer />
    </div>
  );
}
