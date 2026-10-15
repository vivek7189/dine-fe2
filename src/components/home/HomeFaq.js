// Homepage FAQ. Answers live in the HTML (native <details>), so search engines and AI answer
// engines read every answer even when it is collapsed. The FAQPage JSON-LD is built from the
// same list, so the structured data always matches what visitors see.

const GROUPS = [
  {
    title: 'About DineOpen',
    items: [
      ['What is DineOpen?',
        'DineOpen is a restaurant POS system and management app. You take orders at the counter, at the table, by QR code and on WhatsApp, print kitchen tickets, send bills on WhatsApp, and manage your menu, table reservations, inventory, staff and reports in one place. Plans start at $20/month, or ₹899/month in India.'],
      ['How does DineOpen work?',
        'Sign up with your mobile number and add your menu, or send us a photo of it and we set it up for free. Add your tables and tax, then start billing. Orders from the counter, the waiter app, QR codes and WhatsApp all land on one screen, the kitchen gets its tickets, and sales reports update in real time.'],
      ['Why choose DineOpen over a traditional POS system?',
        'A traditional POS usually means buying terminals, paying a setup fee and signing a long contract. DineOpen runs on the phone, tablet or computer you already own, has no setup fee and takes no cut of your sales, and you can cancel anytime. You also get QR ordering, WhatsApp ordering, inventory and staff tools in the same app instead of paying for add-ons.'],
      ['Who uses DineOpen?',
        'Restaurants, cafes, bars, cloud kitchens, bakeries, food trucks, quick-service outlets, fine dining and hotel restaurants. It works for a single outlet and for multi-location groups, which can share one menu and see reports for every outlet together.'],
      ['Is DineOpen good for small restaurants and cafes?',
        'Yes. You can start on a single phone with no hardware, plans start at ₹899/month in India or $20/month elsewhere, and our team sets up your menu for free. You can add a printer, a waiter app or a second outlet later as you grow.'],
    ],
  },
  {
    title: 'Features',
    items: [
      ['How do customers order on WhatsApp?',
        "You connect your restaurant's WhatsApp Business number once. Customers message it, pick dishes from your menu (or open a menu link) and place the order. It comes into DineOpen like any other order, with tax added and the kitchen ticket printed, and the customer gets a message when it's ready."],
      ['How do QR code menus work?',
        'DineOpen gives each table its own QR code. Guests scan it with their phone camera, no app needed, browse your menu and place the order. The order reaches your POS and kitchen straight away, or waits for staff to approve it if you turn that on. Price and menu changes show up immediately.'],
      ['Does DineOpen work offline?',
        'Yes. With the DineOpen desktop app and the small in-restaurant server, the counter, waiter phones and kitchen printers keep working over your Wi-Fi when the internet goes down. When the connection is back, every bill syncs to the cloud. Offline mode is rolling out to new restaurants now, so ask our team to set it up for you.'],
      ['Does DineOpen manage inventory?',
        'Yes. Track stock items, link recipes to dishes so ingredients are deducted on every sale, get low-stock alerts and raise purchase orders to your suppliers. Outlets can share or keep separate stock.'],
      ['What reports and analytics does DineOpen give?',
        'A live dashboard shows sales, orders, top items, peak hours and payment modes. Detailed reports cover item-wise sales, staff, tax and day-end closing, and you can get a daily summary by email.'],
      ['Does DineOpen handle GST, VAT and sales tax?',
        'Yes. Set up GST, VAT or sales tax the way your country needs it, with tax-inclusive or tax-exclusive prices. Bills show the right tax breakdown and your tax reports are ready for filing.'],
      ['Do I need special hardware?',
        'No. DineOpen runs in a web browser and on the iPhone, Android, Windows and Mac apps, so you can start on the phone or laptop you already have. Add a USB, Bluetooth or network receipt printer whenever you need one.'],
    ],
  },
  {
    title: 'Pricing & trust',
    items: [
      ['How much does DineOpen cost?',
        'Starter is $20/month, Growth $50/month and Pro $99/month (£16/£40/£79 in the UK). In India, plans start at ₹899/month. There is no setup fee and no cut of your sales, and you can cancel anytime. Larger chains can ask us for custom pricing.'],
      ['Can I try DineOpen for free?',
        'Yes. Every new account gets a 7-day free trial with all features. No card is needed to start, and our team can set up your menu from a photo.'],
      ['What countries does DineOpen support?',
        'Restaurants use DineOpen in India, the UK, the US, the UAE, Saudi Arabia and other countries. Bills use your local currency and tax (GST, VAT or sales tax), and the app works in English, Hindi, Arabic and 6 more languages.'],
      ['Is my data secure?',
        'Your data is sent over an encrypted connection and stored in secured cloud databases with daily backups. Only the staff you add can log in, and you choose what each role can see and do.'],
    ],
  },
];

const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: GROUPS.flatMap((g) => g.items).map(([q, a]) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

export default function HomeFaq() {
  return (
    <section className="hf" id="faq">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      <div className="hf-in">
        <h2>Frequently Asked Questions</h2>
        <p className="hf-sub">Straight answers about DineOpen. Still unsure? <a href="https://wa.me/919528632779" target="_blank" rel="noopener noreferrer">Ask us on WhatsApp</a>.</p>
        {GROUPS.map((g, gi) => (
          <div key={g.title} className="hf-group">
            <p className="hf-gt">{g.title}</p>
            <div className="hf-list">
              {g.items.map(([q, a], i) => (
                <details key={q} className="hf-item" open={gi === 0 && i === 0}>
                  <summary><h3>{q}</h3><span className="hf-ic" aria-hidden="true" /></summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        .hf{padding:88px 20px;background:#fff}
        .hf-in{max-width:860px;margin:0 auto}
        .hf h2{font-size:clamp(28px,4vw,42px);font-weight:800;color:#111827;text-align:center;letter-spacing:-.02em;margin:0}
        .hf-sub{text-align:center;color:#6b7280;font-size:16px;margin:12px 0 44px}
        .hf-sub a{color:#111827;font-weight:700;text-decoration:underline;text-underline-offset:3px;text-decoration-color:#d1d5db}
        .hf-group+.hf-group{margin-top:36px}
        .hf-gt{font-size:12.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#ef4444;margin:0 0 10px}
        .hf-list{border:1px solid #eef0f3;border-radius:16px;background:#fff;overflow:hidden}
        .hf-item+.hf-item{border-top:1px solid #eef0f3}
        .hf-item summary{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 22px;cursor:pointer;list-style:none}
        .hf-item summary::-webkit-details-marker{display:none}
        .hf-item summary:hover{background:#fafafa}
        .hf-item h3{margin:0;font-size:16.5px;font-weight:700;color:#111827;line-height:1.4}
        .hf-ic{position:relative;width:28px;height:28px;flex-shrink:0;border-radius:50%;background:#f3f4f6;transition:background .2s,transform .25s}
        .hf-ic::before,.hf-ic::after{content:"";position:absolute;left:50%;top:50%;width:11px;height:2px;border-radius:2px;background:#374151;transform:translate(-50%,-50%)}
        .hf-ic::after{transform:translate(-50%,-50%) rotate(90deg);transition:transform .25s}
        .hf-item[open] .hf-ic{background:#fee2e2}
        .hf-item[open] .hf-ic::before,.hf-item[open] .hf-ic::after{background:#ef4444}
        .hf-item[open] .hf-ic::after{transform:translate(-50%,-50%) rotate(0deg)}
        .hf-item p{margin:0;padding:0 22px 20px;font-size:15.5px;line-height:1.7;color:#4b5563;max-width:46em}
        @media (max-width:520px){
          .hf{padding:60px 16px}
          .hf-item summary{padding:16px}
          .hf-item h3{font-size:15.5px}
          .hf-item p{padding:0 16px 18px;font-size:15px}
        }
      `}</style>
    </section>
  );
}
