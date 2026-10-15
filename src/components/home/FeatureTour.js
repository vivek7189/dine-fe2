'use client';

// Homepage feature tour: one section per real feature, each with a short looping demo.
// A demo is a fixed 520x440 "screen" (window bar, scene, caption + progress bar) scaled to its
// column. Scene states are plain CSS classes: the player adds s1..sN to the stage as it steps,
// and elements react through on-N (fade in), off-N (fade out), x-N / y-N (swap text), hl-N
// (highlight), m-N (chat message appears), pr-N (printer prints). data-tap names what the
// pointer taps before each step. Example data only (Table 7, ₹756, sample staff names).

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { track } from '../../lib/analytics';

const STEP = 2700, HOLD = 3800, RESET = 900, MOVE = 700;

export function useDemoPlayers(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups = [];

    const fit = () => root.querySelectorAll('.ft-box').forEach((b) => {
      const k = Math.min(1, b.clientWidth / 520);
      b.style.setProperty('--k', k);
      b.querySelector('.stage').style.transform = k < 1 ? `scale(${k})` : '';
    });
    fit();
    window.addEventListener('resize', fit);
    cleanups.push(() => window.removeEventListener('resize', fit));

    root.querySelectorAll('[data-demo]').forEach((f) => {
      const st = f.querySelector('.stage');
      const n = Number(st.dataset.steps);
      const caps = st.dataset.cap.split('|');
      const taps = (st.dataset.tap || '').split('|');
      const lis = f.querySelectorAll('ol.steps li');
      const capt = st.querySelector('.capt');
      const cur = st.querySelector('.cursor');
      const prog = st.querySelector('.prog');
      prog.innerHTML = '';
      for (let i = 0; i < n; i++) prog.appendChild(document.createElement('span')).appendChild(document.createElement('b'));
      const bars = prog.querySelectorAll('b');
      let timers = [];
      let visible = false;

      const clear = () => { timers.forEach(clearTimeout); timers = []; };
      const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
      const fill = (x, ms) => {
        bars.forEach((b, i) => {
          b.style.transition = 'none';
          b.style.width = (i < x - 1 || (x === n && i === n - 1 && !ms)) ? '100%' : '0';
        });
        if (x > 0 && ms) {
          const b = bars[x - 1];
          void b.offsetWidth;
          b.style.transition = `width ${ms}ms linear`;
          b.style.width = '100%';
        }
      };
      const apply = (x, ms) => {
        for (let i = 1; i <= n; i++) st.classList.toggle(`s${i}`, i <= x);
        lis.forEach((li, i) => { li.classList.toggle('on', i === x - 1); li.classList.toggle('done', i < x - 1); });
        capt.innerHTML = x ? `<em>${x}/${n}</em>${caps[x - 1]}` : '<em>▶</em>Starting…';
        fill(x, ms || 0);
      };
      const point = (sel) => {
        const el = sel && st.querySelector(sel);
        if (!el) return false;
        const sr = st.getBoundingClientRect();
        const er = el.getBoundingClientRect();
        if (!er.width) return false;
        const sc = sr.width / 520;
        cur.style.left = `${(er.left - sr.left + er.width / 2) / sc}px`;
        cur.style.top = `${(er.top - sr.top + er.height / 2) / sc}px`;
        cur.classList.add('show');
        return true;
      };
      const go = (x) => {
        clear();
        cur.classList.remove('press');
        if (x === 0) {
          cur.classList.remove('show');
          apply(0);
          if (visible) later(() => go(1), RESET);
          return;
        }
        const dur = x === n ? HOLD : STEP;
        if (!reduce && point(taps[x - 1])) {
          later(() => {
            cur.classList.add('press');
            apply(x, dur - MOVE);
            later(() => cur.classList.remove('press'), 220);
          }, MOVE);
        } else {
          cur.classList.remove('show');
          apply(x, reduce ? 0 : dur);
        }
        if (visible && !reduce) later(() => go(x === n ? 0 : x + 1), dur);
      };

      const onStep = (i) => () => go(i + 1);
      const onKey = (i) => (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(i + 1); } };
      lis.forEach((li, i) => {
        const c = onStep(i), k = onKey(i);
        li.addEventListener('click', c);
        li.addEventListener('keydown', k);
        cleanups.push(() => { li.removeEventListener('click', c); li.removeEventListener('keydown', k); });
      });
      const replay = st.querySelector('.replay');
      const onReplay = () => go(0);
      replay.addEventListener('click', onReplay);
      cleanups.push(() => replay.removeEventListener('click', onReplay));

      apply(n); // finished frame until the demo scrolls into view
      cleanups.push(clear);
      if (reduce || !('IntersectionObserver' in window)) return;
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        const was = visible;
        visible = e.isIntersecting;
        if (visible && !was) go(0);
        else if (!visible) { clear(); cur.classList.remove('show'); }
      }), { threshold: 0.5 });
      io.observe(st);
      cleanups.push(() => io.disconnect());
    });

    return () => cleanups.forEach((fn) => fn());
  }, [rootRef]);
}

export function Player({ cls, steps, title, cap, tap, dark, children }) {
  return (
    <div className="ft-box">
      <div className={`stage ${cls}`} data-steps={steps} data-cap={cap} data-tap={tap}>
        <div className="chrome"><i /><i /><i />{title}<span className="live">LIVE DEMO</span></div>
        <div className={`area${dark ? ' dark' : ''}`}>{children}</div>
        <div className="cursor" />
        <div className="foot"><div className="capt" /><div className="prog" /><button type="button" className="replay">↻ Replay</button></div>
      </div>
    </div>
  );
}

function Text({ eyebrow, badge, title, text, value, steps, href, linkText, feature }) {
  return (
    <div className="ftext">
      <div className="eyebrow">{eyebrow}{badge && <span className="usp">{badge}</span>}</div>
      <h2>{title}</h2>
      <p>{text}</p>
      <div className="value">{value}</div>
      <ol className="steps">{steps.map((s) => <li key={s} tabIndex={0}>{s}</li>)}</ol>
      <Link className="more-link" href={href} onClick={() => track('home_feature_link', { feature })}>{linkText} →</Link>
    </div>
  );
}

const TOUR = [
  ['f-wa', 'WhatsApp orders'], ['f-pos', 'Table orders'], ['f-off', 'Offline billing'], ['f-kot', 'Kitchen tickets'],
  ['f-qr', 'QR ordering'], ['f-bill', 'WhatsApp bills'], ['f-menu', 'Menu from photo'], ['f-staff', 'Staff & salary'],
];

const MORE = [
  ['Tables & reservations', 'Merge, split and move tables', '/products/tables'],
  ['Kitchen display', 'Orders on a screen, not paper', '/features/kitchen-display-system'],
  ['Inventory & recipes', 'Stock goes down as you sell', '/products/inventory'],
  ['Many outlets', 'One dashboard for every branch', '/products/multi-restaurant'],
  ['Loyalty & offers', 'Points and WhatsApp offers', '/products/loyalty'],
  ['UPI & Paytm QR', 'Marked paid when money arrives', '/products/billing'],
  ['Talabat orders', 'Come in automatically (Gulf)', '/products/integrations'],
  ['Reports & GST/VAT', 'Daily sales, tax and item reports', '/products/billing'],
];

export default function FeatureTour() {
  const rootRef = useRef(null);
  useDemoPlayers(rootRef);

  return (
    <div className="ft" ref={rootRef}>
      <div className="tour"><div className="wrap">
        <b>See it work:</b>
        {TOUR.map(([id, label]) => (
          <a key={id} href={`#${id}`} onClick={() => track('home_tour_click', { feature: id })}>{label}</a>
        ))}
      </div></div>

      {/* 1. WhatsApp ordering */}
      <section data-demo className="feature" id="f-wa"><div className="wrap"><div className="fgrid">
        <Text feature="whatsapp-ordering" eyebrow="WhatsApp ordering" badge="0% commission"
          title="Customers order on your WhatsApp. It lands in your POS."
          text="Guests message your restaurant's WhatsApp, pick dishes from your menu and share their address. The order arrives in DineOpen with tax added and the kitchen ticket printed. When it's ready, they get a WhatsApp message."
          value="Direct orders from your own customers, with no aggregator commission on them."
          steps={['Guest says hi on your WhatsApp', 'They open your menu', 'Add dishes and send the address', 'Order lands in your POS, KOT prints', '“Order ready” goes out by itself']}
          href="/features/whatsapp-ordering" linkText="How WhatsApp ordering works" />
        <Player cls="s-wao" steps={5} title="Customer's WhatsApp → DineOpen POS"
          cap="Guest says hi on your WhatsApp|They open your menu|They add dishes and send the address|Order lands in your POS and the KOT prints|“Order ready” message goes out by itself"
          tap="|.t-menu|.t-add|.t-place|">
          <div className="phone wa"><div className="scr">
            <div className="wh"><i>SG</i><div>Spice Garden<small>Business account</small></div></div>
            <div className="chat">
              <div className="msg out m-1">Hi<span className="t">7:58 pm</span></div>
              <div className="msg m-1 d1">Welcome to Spice Garden! What would you like today?<span className="wb t-menu">View menu</span></div>
              <div className="msg m-2"><b>Biryani</b>
                <div className="row"><span>Chicken Biryani ₹260</span><span className="add t-add">Add</span></div>
                <div className="row"><span>Veg Biryani ₹220</span><span className="add">Add</span></div>
                <div className="row"><span>Raita ₹40</span><span className="add">Add</span></div></div>
              <div className="msg out m-3">2 × Chicken Biryani<br />📍 Sector 45, Gurugram<span className="t">7:59 pm</span></div>
              <div className="msg m-3 d1">Total ₹546 incl. GST<br />Delivery to Sector 45<span className="wb t-place">Place order</span></div>
              <div className="msg m-4">✅ Order #58 confirmed. We&apos;re preparing it now.<span className="t">8:00 pm</span></div>
              <div className="msg m-5">🎉 Your order #58 is ready and on its way!<span className="t">8:21 pm</span></div>
            </div>
          </div></div>
          <div className="panel pos"><div className="ph">DineOpen POS · Orders<span className="pill b">Today</span></div>
            <div className="ord new on-4"><b>#58 · WhatsApp · Delivery</b><span className="pill g"><span className="y-5">New</span><span className="x-5">Ready</span></span><small>2 × Chicken Biryani · ₹546</small><small /></div>
            <div className="ord dim"><b>#57 · Table 4</b><span className="pill a">Cooking</span><small>3 items · ₹820</small><small /></div>
            <div className="ord dim last"><b>#56 · Takeaway</b><span className="pill g">Paid</span><small>2 items · ₹310</small><small /></div>
          </div>
          <div className="panel zero on-4 d1"><span className="pill g">0%</span>No aggregator commission on this order</div>
          <div className="printer kot pr-4">KITCHEN<div className="tkt"><b>KOT #58 · DELIVERY</b>2 Chicken Biryani</div></div>
        </Player>
      </div></div></section>

      {/* 2. Table orders */}
      <section data-demo className="feature flip alt" id="f-pos"><div className="wrap"><div className="fgrid">
        <Text feature="pos" eyebrow="Table orders" title="From table to kitchen in three taps"
          text="Pick the table, tap the dishes, send the KOT. The kitchen printer prints the ticket before the waiter reaches the pass."
          value="No running to the kitchen with handwritten slips. Fewer wrong dishes."
          steps={['Pick the table', 'Tap the dishes', 'Send KOT', 'Kitchen prints the ticket']}
          href="/products/pos" linkText="See the POS" />
        <Player cls="s-ord" steps={4} title="DineOpen POS · Counter 1"
          cap="Pick table 7|Tap the dishes|Send the KOT|Kitchen prints the ticket" tap=".t7|.i2|.sk|">
          <div className="panel tables"><div className="ph">Tables</div><div className="g">
            <span>T1</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span className="t7 hl-1">T7</span><span>T8</span></div></div>
          <div className="panel menu"><div className="ph">Main course</div><div className="g">
            <span className="hl-2">Paneer Butter Masala<small>₹280</small></span><span>Veg Biryani<small>₹260</small></span>
            <span className="i2 hl-2">Butter Naan<small>₹50</small></span><span>Jeera Rice<small>₹160</small></span>
            <span className="hl-2">Dal Makhani<small>₹240</small></span><span>Chicken Tikka<small>₹320</small></span></div></div>
          <div className="panel cart"><div className="ph"><span className="y-1">Order</span><span className="x-1">Table 7 · Dine-in</span></div>
            <div className="empty off-1">Pick a table to start</div>
            <div className="rows">
              <div className="on-2"><span>Paneer Butter Masala</span><span className="mono">280</span></div>
              <div className="on-2 d1"><span>Butter Naan × 4</span><span className="mono">200</span></div>
              <div className="on-2 d2"><span>Dal Makhani</span><span className="mono">240</span></div></div>
            <div className="btnx sk"><span className="y-3">Send KOT</span><span className="x-3">✓ KOT sent</span></div></div>
          <div className="toast on-3">KOT #42 sent to kitchen</div>
          <div className="printer pr-4">KITCHEN<div className="tkt"><b>KOT #42 · T7</b>1 Paneer Butter Masala<br />4 Butter Naan<br />1 Dal Makhani</div></div>
        </Player>
      </div></div></section>

      {/* 3. Offline */}
      <section data-demo className="feature" id="f-off"><div className="wrap"><div className="fgrid">
        <Text feature="offline" eyebrow="Works offline" title="Internet down? Keep billing."
          text="A small DineOpen server runs inside your restaurant. Counter, waiter phones and kitchen printers keep talking over your Wi-Fi. When the internet is back, every bill goes up to the cloud. Rolling out to new restaurants now."
          value="A dead connection on a busy night doesn't stop a single bill."
          steps={['The internet goes down', 'Bills keep saving in the restaurant', 'Kitchen printers keep printing', 'Internet back: everything syncs']}
          href="/products/offline-pos" linkText="How offline mode works" />
        <Player cls="s-off" steps={4} dark title="DineOpen · Restaurant network"
          cap="The internet goes down|Bills keep saving in the restaurant|Kitchen printers keep printing|Internet back: all bills synced" tap="|.t-done||">
          <div className="netbar"><span>Spice Garden · Wi-Fi</span>
            <span><span className="pill g y-1">● Online</span><span className="pill r x-1"><span className="y-4">● Internet down · still billing</span><span className="x-4 ok">● Back online</span></span></span></div>
          <div className="cloud">☁ DineOpen cloud</div>
          <div className="link" /><div className="cut on-1">✕</div>
          <div className="server">Local server<small>inside your restaurant</small></div>
          <div className="panel counter"><div className="ph">Counter 1 · Bills</div>
            <div className="bl on-2"><span>#1081 · ₹756</span><span className="pill a y-4">saved here</span><span className="pill g x-4">synced ✓</span></div>
            <div className="bl on-2 d1"><span>#1082 · ₹420</span><span className="pill a y-4">saved here</span><span className="pill g x-4">synced ✓</span></div>
            <div className="btnx t-done">Complete bill</div></div>
          <div className="printer pr-3">KITCHEN<div className="tkt"><b>KOT #43 · T2</b>2 Veg Biryani<br />1 Raita</div></div>
        </Player>
      </div></div></section>

      {/* 4. KOT routing */}
      <section data-demo className="feature flip alt" id="f-kot"><div className="wrap"><div className="fgrid">
        <Text feature="kot" eyebrow="Kitchen tickets" title="Each station gets only its own items"
          text="One order, split automatically. Breads print in the tandoor, drinks print at the bar. Takeaway can print at a different counter from dine-in."
          value="Each cook sees only their dishes. Faster plates, fewer mix-ups."
          steps={['Captain sends one order', 'Tandoor items print in the tandoor', 'Drinks print at the bar', 'Takeaway prints at its own counter']}
          href="/products/kitchen" linkText="Kitchen display & KOT" />
        <Player cls="s-kot" steps={4} title="Captain app → kitchen printers"
          cap="Captain sends one order from Table 3|Tandoor items → tandoor printer|Drinks → bar printer|Takeaway orders → packing counter" tap=".t-send|||">
          <div className="panel order"><div className="ph">Table 3 · New order<span className="pill b">Captain app</span></div>
            <div className="ln"><span>4 Butter Naan</span><span className="pill r on-2">→ Tandoor</span></div>
            <div className="ln"><span>1 Chicken Tikka</span><span className="pill r on-2 d1">→ Tandoor</span></div>
            <div className="ln"><span>2 Fresh Lime Soda</span><span className="pill b on-3">→ Bar</span></div>
            <div className="ln"><span>1 Masala Chaas</span><span className="pill b on-3 d1">→ Bar</span></div>
            <div className="btnx t-send"><span className="y-1">Send to kitchen</span><span className="x-1">✓ Sent</span></div></div>
          <div className="printer p1 pr-2">TANDOOR<div className="tkt"><b>T3 · TANDOOR</b>4 Butter Naan<br />1 Chicken Tikka</div></div>
          <div className="printer p2 pr-3">BAR<div className="tkt"><b>T3 · BAR</b>2 Fresh Lime Soda<br />1 Masala Chaas</div></div>
          <div className="pill a ta on-4">Takeaway → packing counter</div>
        </Player>
      </div></div></section>

      {/* 5. QR ordering */}
      <section data-demo className="feature" id="f-qr"><div className="wrap"><div className="fgrid">
        <Text feature="qr" eyebrow="QR ordering" title="Guests order from the table. You approve it."
          text="Guests scan the QR on the table and order from their phone, no app needed. The order pops up on your POS. Accept it and it goes to the kitchen."
          value="Guests don't wait for a waiter, and nothing reaches the kitchen without your OK."
          steps={['Guest scans the table QR', 'Picks dishes on their phone', 'Order pops up on your POS', 'You accept, kitchen gets it']}
          href="/features/online-ordering" linkText="QR menu & ordering" />
        <Player cls="s-qr" steps={4} title="Table QR → guest's phone → your POS"
          cap="Guest scans the QR on Table 4|Picks dishes on the phone|New order pops up on your POS|You accept: it goes to the kitchen" tap="|.t-dosa|.t-po|.t-acc">
          <div className="tcard"><div><div className="code"><div className="scan" /></div><div className="tlabel">Table 4<br /><span>Scan to order</span></div></div></div>
          <div className="phone"><div className="scr">
            <div className="mh">Spice Garden · Table 4</div>
            <div className="mi a"><span>Masala Dosa · ₹140</span><b className="t-dosa">+</b></div>
            <div className="mi"><span>Idli Vada · ₹90</span><b>+</b></div>
            <div className="mi a"><span>Filter Coffee · ₹60</span><b>+</b></div>
            <div className="mi"><span>Pongal · ₹110</span><b>+</b></div>
            <div className="btnx po on-2 t-po"><span className="y-3">Place order · ₹200</span><span className="x-3">✓ Order sent</span></div>
            <div className="cam off-1"><div><span />Point camera at the QR</div></div>
          </div></div>
          <div className="panel pos"><div className="ph">DineOpen POS</div>
            <div className="wait off-3">Waiting for orders…</div>
            <div className="nw on-3"><span className="pill r">New QR order</span><br /><b>Table 4 · ₹200</b><br />1 Masala Dosa<br />1 Filter Coffee<span className="btnx t-acc"><span className="y-4">Accept</span><span className="x-4">✓ Sent to kitchen</span></span></div></div>
        </Player>
      </div></div></section>

      {/* 6. WhatsApp bill */}
      <section data-demo className="feature flip alt" id="f-bill"><div className="wrap"><div className="fgrid">
        <Text feature="whatsapp-bill" eyebrow="WhatsApp bills" title="Send the bill to their WhatsApp"
          text="One tap sends a PDF bill to the guest's WhatsApp. The number is saved so you can send them offers later."
          value="Less paper, and every guest becomes a contact you can bring back."
          steps={['Complete the bill', 'Tap “Send on WhatsApp”', 'Guest gets the PDF bill', 'Guest saved for offers']}
          href="/products/billing" linkText="Billing features" />
        <Player cls="s-wab" steps={4} title="DineOpen POS → guest's WhatsApp"
          cap="Complete the bill (paid by UPI)|Tap “Send on WhatsApp”|Guest gets the PDF bill|Guest saved to your customers" tap=".cb|.wab||">
          <div className="panel bill"><div className="ph">Table 7 · Bill</div>
            <div className="ln first"><span>Paneer Butter Masala</span><span className="mono">280</span></div>
            <div className="ln"><span>Butter Naan × 4</span><span className="mono">200</span></div>
            <div className="ln"><span>Dal Makhani</span><span className="mono">240</span></div>
            <div className="ln"><span>GST 5%</span><span className="mono">36</span></div>
            <div className="ln tot"><span>Total</span><span className="mono">₹756</span></div>
            <div className="btnx cb"><span className="y-1">Complete bill · UPI</span><span className="x-1">✓ Paid by UPI</span></div>
            <div className="num mono">+91 98••• ••210</div>
            <div className="btnx wab">Send on WhatsApp</div></div>
          <div className="phone wa"><div className="scr">
            <div className="wh"><i>SG</i><div>Spice Garden<small>Business account</small></div></div>
            <div className="chat">
              <div className="msg m-3">Thank you for dining with us! Your bill for Table 7 is <b>₹756</b>.<div className="pdf"><i>PDF</i>Bill-1081.pdf</div><span className="t">8:42 pm <span className="y-4">✓</span><span className="x-4 read">✓✓</span></span></div>
            </div>
          </div></div>
          <div className="panel crm on-4"><span className="pill g">Saved</span>Guest added to Customers</div>
        </Player>
      </div></div></section>

      {/* 7. Menu from photo */}
      <section data-demo className="feature" id="f-menu"><div className="wrap"><div className="fgrid">
        <Text feature="menu" eyebrow="Menu setup" title="Your paper menu becomes a digital menu"
          text="Upload a photo or PDF of your menu. DineOpen reads the dishes and prices and builds your POS menu and QR menu. Or send the photo on WhatsApp and our team does it for you."
          value="Your menu is ready in minutes. No typing 100 items by hand."
          steps={['Upload a menu photo', 'DineOpen reads it', 'Dishes and prices appear', 'Print your QR menu']}
          href="/products/menu" linkText="Menu & QR menu" />
        <Player cls="s-menu" steps={4} title="DineOpen · Menu setup"
          cap="Upload a photo of your menu|Reading dishes and prices|Your menu items are created|Print the QR menu for your tables" tap=".up||.ready .btnx|">
          <div className="drop off-1">Drop a menu<br />photo or PDF</div>
          <div className="paper on-1"><h4>SPICE GARDEN</h4>
            <div><span>Paneer Tikka</span><span>260</span></div><div><span>Veg Biryani</span><span>260</span></div>
            <div><span>Dal Makhani</span><span>240</span></div><div><span>Butter Naan</span><span>50</span></div>
            <div><span>Gulab Jamun</span><span>90</span></div><div><span>Masala Chaas</span><span>60</span></div>
            <div className="sweep" /></div>
          <div className="btnx up"><span className="y-1">Upload menu photo</span><span className="x-1">✓ Photo uploaded</span></div>
          <div className="panel list"><div className="ph">Your menu<span className="pill g on-3">auto-filled</span></div>
            <div className="wait off-3"><span className="y-2">Items will appear here</span><span className="x-2">Reading your menu…</span></div>
            <div className="items">
              <div className="it on-3">Paneer Tikka<span>₹260</span></div><div className="it on-3 d1">Veg Biryani<span>₹260</span></div>
              <div className="it on-3 d1">Dal Makhani<span>₹240</span></div><div className="it on-3 d2">Butter Naan<span>₹50</span></div>
              <div className="it on-3 d2 last">+ 2 more<span /></div></div></div>
          <div className="panel ready on-3"><span className="mini" /><span><span className="y-4">QR menu</span><span className="x-4">✓ Ready to print</span></span><span className="btnx">Print QR</span></div>
        </Player>
      </div></div></section>

      {/* 8. Staff */}
      <section data-demo className="feature flip alt" id="f-staff"><div className="wrap"><div className="fgrid">
        <Text feature="staff" eyebrow="Staff & salary" title="Attendance and salary, worked out for you"
          text="Staff punch in on their phone. You see who is in, who is late and who is on leave. At month end the salary sheet is ready, with advances taken off."
          value="No register book, and no evening with a calculator at month end."
          steps={['Staff punch in on their phone', 'You see who is in', 'Late and leave are marked', 'Salary sheet is ready']}
          href="/features/staff-management" linkText="Staff management" />
        <Player cls="s-staff" steps={4} title="Staff phone → owner's dashboard"
          cap="Captain punches in on the phone|Attendance updates for you|Late and leave are marked|Month-end salary sheet is ready" tap=".pb|||">
          <div className="phone"><div className="scr"><div className="who">Captain · Ravi</div><div className="clock">10:02</div>
            <div className="pb"><span className="y-1">Punch in</span><span className="x-1">In ✓</span></div><div className="shift">Morning shift · 10:00</div></div></div>
          <div className="panel board"><div className="ph">Today&apos;s attendance<span className="pill b">3 staff</span></div>
            <div className="rw r1"><b>Ravi · Captain</b><span><span className="x-2">10:02</span><span className="y-2">—</span></span><span><span className="pill g x-2">In</span><span className="pill n y-2">Not in</span></span></div>
            <div className="rw"><b>Salma · Cashier</b><span>10:21</span><span><span className="pill a on-3">Late</span></span></div>
            <div className="rw last"><b>Joseph · Chef</b><span>—</span><span><span className="pill b on-3 d1">Leave</span></span></div></div>
          <div className="panel sal on-4"><div className="st">October salary sheet</div>
            <div className="ln"><span>12 staff · 26 working days</span><span /></div>
            <div className="ln"><span>Advances taken off</span><span className="mono">− ₹6,000</span></div>
            <div className="ln tt"><span>To pay</span><span className="mono">₹2,42,600</span></div></div>
        </Player>
      </div></div></section>

      {/* Everything else */}
      <section className="plain"><div className="wrap">
        <div className="sec-head"><div className="eyebrow">Also included</div><h2>Everything else you run in a day</h2></div>
        <div className="more">
          {MORE.map(([t, d, href]) => <Link key={t} href={href}><b>{t}</b><span>{d}</span></Link>)}
        </div>
      </div></section>

      <style jsx global>{`
        .ft{--ink:#111827;--ink2:#374151;--muted:#6b7280;--line:#e5e7eb;--soft:#f8fafc;--tint:#fef2f2;--red:#ef4444;--red-dk:#dc2626;--green:#16a34a;--green-soft:#dcfce7;--amber-soft:#fef3c7;--amber-ink:#92400e;--blue-soft:#dbeafe;--blue-ink:#1e40af;--night:#0f172a;--night-2:#1e293b;--night-3:#334155;--wa-bg:#efe7de;--wa-head:#075e54;--wa-out:#d9fdd3;--wa-btn:#027eb5;--mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--ink);line-height:1.55}
        .ft .wrap{max-width:1160px;margin:0 auto;padding-inline:20px}
        .ft h2,.ft h3,.ft h4{margin:0;text-wrap:balance;letter-spacing:-.02em}
        .ft p{margin:0}
        .ft .tour{border-block:1px solid var(--line);background:#fff}
        .ft .tour .wrap{display:flex;gap:8px;align-items:center;padding-block:10px;overflow-x:auto;scrollbar-width:none}
        .ft .tour .wrap::-webkit-scrollbar{display:none}
        .ft .tour b{font-size:13px;white-space:nowrap;margin-right:4px}
        .ft .tour a{white-space:nowrap;text-decoration:none;font-size:13px;font-weight:600;color:var(--ink2);padding:6px 12px;border-radius:99px;background:var(--soft);border:1px solid var(--line);transition:background .2s,color .2s}
        .ft .tour a:hover{background:var(--ink);color:#fff;border-color:var(--ink)}
        .ft .feature{padding-block:88px;scroll-margin-top:80px}
        .ft .feature.alt{background:var(--soft)}
        .ft .fgrid{display:grid;grid-template-columns:1fr 1.1fr;gap:60px;align-items:center}
        .ft .flip .fgrid{grid-template-columns:1.1fr 1fr}
        .ft .flip .ftext{order:2}
        .ft .ftext{min-width:0}
        .ft .eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:12.5px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--red)}
        .ft .eyebrow .usp{background:var(--red);color:#fff;letter-spacing:.04em;padding:3px 8px;border-radius:6px;font-size:11px}
        .ft .ftext h2{font-size:clamp(28px,3.4vw,42px);font-weight:900;line-height:1.08;margin-top:10px}
        .ft .ftext>p{color:var(--muted);font-size:17px;margin-top:14px;max-width:32em}
        .ft .value{display:flex;gap:10px;align-items:flex-start;margin-top:20px;background:var(--green-soft);color:#14532d;border-radius:12px;padding:12px 14px;font-weight:600;font-size:15px;max-width:32em}
        .ft .value::before{content:"✓";flex-shrink:0;width:22px;height:22px;border-radius:50%;background:var(--green);color:#fff;display:grid;place-items:center;font-size:12px;font-weight:900;margin-top:1px}
        .ft ol.steps{list-style:none;padding:0;margin:22px 0 0;display:grid;gap:4px;counter-reset:s}
        .ft ol.steps li{counter-increment:s;display:grid;grid-template-columns:28px 1fr;gap:12px;align-items:center;padding:9px 12px;border-radius:12px;color:var(--muted);font-weight:600;font-size:15px;cursor:pointer;transition:background .3s,color .3s,box-shadow .3s}
        .ft ol.steps li::before{content:counter(s);width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:var(--line);color:#4b5563;font-weight:800;font-size:12.5px;transition:background .3s,color .3s}
        .ft ol.steps li:hover,.ft ol.steps li.done{color:var(--ink)}
        .ft ol.steps li.done::before{content:"✓";background:var(--green-soft);color:var(--green)}
        .ft ol.steps li.on{background:#fff;color:var(--ink);box-shadow:0 8px 22px -12px rgba(15,23,42,.35)}
        .ft ol.steps li.on::before{background:var(--red);color:#fff}
        .ft ol.steps li:focus-visible,.ft a:focus-visible,.ft button:focus-visible{outline:3px solid #f59e0b;outline-offset:2px}
        .ft .more-link{display:inline-block;margin-top:16px;font-weight:700;color:var(--red);text-decoration:none;font-size:15px}

        .ft .fgrid>*{min-width:0}
        .ft .ft-box{width:100%;max-width:520px;margin:0 auto;height:calc(440px * var(--k,1));overflow:hidden}
        .ft .stage{position:relative;width:520px;height:440px;border-radius:18px;background:#fff;border:1px solid var(--line);box-shadow:0 34px 70px -38px rgba(15,23,42,.45),0 2px 6px rgba(15,23,42,.05);overflow:hidden;transform-origin:top left;font-size:12.5px;color:var(--ink);text-align:left}
        .ft .chrome{position:absolute;left:0;right:0;top:0;height:36px;display:flex;align-items:center;gap:6px;padding:0 12px;border-bottom:1px solid var(--line);background:#f8fafc;font-size:11.5px;font-weight:700;color:var(--muted)}
        .ft .chrome i{width:9px;height:9px;border-radius:50%;background:#fca5a5}
        .ft .chrome i:nth-child(2){background:#fcd34d}
        .ft .chrome i:nth-child(3){background:#86efac;margin-right:8px}
        .ft .chrome .live{margin-left:auto;display:flex;align-items:center;gap:6px;color:var(--red)}
        .ft .chrome .live::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--red);animation:ftBlink 1.4s infinite}
        @keyframes ftBlink{50%{opacity:.25}}
        .ft .area{position:absolute;left:0;right:0;top:36px;height:360px;background:linear-gradient(165deg,#fff 0%,#fff6f5 100%);overflow:hidden}
        .ft .area.dark{background:linear-gradient(165deg,#0f172a,#1e293b)}
        .ft .foot{position:absolute;left:0;right:0;bottom:0;height:44px;display:flex;align-items:center;gap:12px;padding:0 12px;border-top:1px solid var(--line);background:#fff}
        .ft .foot .capt{flex:1;min-width:0;font-weight:700;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .ft .foot .capt em{font-style:normal;color:var(--red);margin-right:6px}
        .ft .foot .prog{display:flex;gap:4px;width:130px;flex-shrink:0}
        .ft .foot .prog span{flex:1;height:4px;border-radius:2px;background:#e5e7eb;overflow:hidden}
        .ft .foot .prog b{display:block;height:100%;width:0;background:var(--red)}
        .ft .foot button{border:1px solid var(--line);background:#fff;border-radius:99px;font-weight:700;font-size:11.5px;padding:5px 11px;cursor:pointer;font-family:inherit;flex-shrink:0;color:var(--ink)}
        .ft .cursor{position:absolute;left:260px;top:200px;width:28px;height:28px;margin:-14px 0 0 -14px;border-radius:50%;background:rgba(17,24,39,.22);border:2.5px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,.35);z-index:30;opacity:0;pointer-events:none;transition:left .65s cubic-bezier(.45,0,.2,1),top .65s cubic-bezier(.45,0,.2,1),opacity .3s,transform .15s}
        .ft .cursor.show{opacity:1}
        .ft .cursor.press{transform:scale(.78)}
        .ft .cursor::after{content:"";position:absolute;inset:-3px;border-radius:50%;border:2px solid var(--red);opacity:0}
        .ft .cursor.press::after{animation:ftRing .6s ease-out}
        @keyframes ftRing{0%{opacity:.9;transform:scale(.6)}100%{opacity:0;transform:scale(2.4)}}

        .ft .area *{transition:opacity .5s ease,transform .5s cubic-bezier(.2,.7,.2,1),background-color .35s,color .35s,border-color .35s,box-shadow .35s}
        .ft .on-1,.ft .on-2,.ft .on-3,.ft .on-4,.ft .on-5{opacity:0;transform:translateY(10px)}
        .ft .s1 .on-1,.ft .s2 .on-2,.ft .s3 .on-3,.ft .s4 .on-4,.ft .s5 .on-5{opacity:1;transform:none}
        .ft .s1 .on-1.d1,.ft .s2 .on-2.d1,.ft .s3 .on-3.d1,.ft .s4 .on-4.d1,.ft .s5 .on-5.d1{transition-delay:.25s}
        .ft .s1 .on-1.d2,.ft .s2 .on-2.d2,.ft .s3 .on-3.d2,.ft .s4 .on-4.d2,.ft .s5 .on-5.d2{transition-delay:.5s}
        .ft .s1 .off-1,.ft .s2 .off-2,.ft .s3 .off-3,.ft .s4 .off-4,.ft .s5 .off-5{opacity:0;transform:scale(.97)}
        .ft .stage .x-1,.ft .stage .x-2,.ft .stage .x-3,.ft .stage .x-4,.ft .stage .x-5{display:none!important}
        .ft .stage.s1 .x-1,.ft .stage.s2 .x-2,.ft .stage.s3 .x-3,.ft .stage.s4 .x-4,.ft .stage.s5 .x-5{display:inline-block!important}
        .ft .stage.s1 .y-1,.ft .stage.s2 .y-2,.ft .stage.s3 .y-3,.ft .stage.s4 .y-4,.ft .stage.s5 .y-5{display:none!important}
        .ft .s1 .hl-1,.ft .s2 .hl-2,.ft .s3 .hl-3,.ft .s4 .hl-4,.ft .s5 .hl-5{border-color:var(--red)!important;background:var(--tint)!important;color:var(--red-dk)!important}
        .ft .m-1,.ft .m-2,.ft .m-3,.ft .m-4,.ft .m-5{display:none}
        .ft .s1 .m-1,.ft .s2 .m-2,.ft .s3 .m-3,.ft .s4 .m-4,.ft .s5 .m-5{display:block;animation:ftPop .45s cubic-bezier(.2,.8,.2,1) both}
        .ft .s1 .m-1.d1,.ft .s2 .m-2.d1,.ft .s3 .m-3.d1,.ft .s4 .m-4.d1,.ft .s5 .m-5.d1{animation-delay:.55s}
        @keyframes ftPop{from{opacity:0;transform:translateY(12px) scale(.96)}to{opacity:1;transform:none}}

        .ft .panel{position:absolute;background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:0 12px 28px -18px rgba(15,23,42,.45)}
        .ft .ph{font-weight:800;font-size:12px;padding:9px 12px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;gap:8px}
        .ft .pill{display:inline-block;font-size:10.5px;font-weight:800;border-radius:99px;padding:3px 9px;white-space:nowrap}
        .ft .pill.g{background:var(--green-soft);color:var(--green)}
        .ft .pill.r{background:#fee2e2;color:var(--red-dk)}
        .ft .pill.a{background:var(--amber-soft);color:var(--amber-ink)}
        .ft .pill.b{background:var(--blue-soft);color:var(--blue-ink)}
        .ft .pill.n{background:#f1f5f9;color:var(--muted)}
        .ft .mono{font-family:var(--mono);font-variant-numeric:tabular-nums}
        .ft .btnx{display:block;text-align:center;font-weight:800;padding:9px;border-radius:9px;background:var(--red);color:#fff}
        .ft .printer{position:absolute;width:150px;height:46px;background:var(--night-3);border-radius:10px 10px 6px 6px;color:#cbd5e1;font-size:10px;font-weight:800;display:flex;align-items:flex-end;justify-content:center;padding-bottom:6px;letter-spacing:.08em}
        .ft .printer::before{content:"";position:absolute;top:7px;left:20px;right:20px;height:4px;border-radius:2px;background:#0f172a}
        .ft .printer .tkt{position:absolute;left:22px;right:22px;bottom:39px;background:#fff;font-family:var(--mono);font-size:10px;line-height:1.5;color:var(--ink);padding:7px 9px;letter-spacing:0;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,.18);clip-path:inset(100% 0 0 0);transition:clip-path 1.1s steps(9,end)}
        .ft .printer .tkt b{display:block;border-bottom:1px dashed #94a3b8;margin-bottom:3px;font-weight:800}
        .ft .s1 .pr-1 .tkt,.ft .s2 .pr-2 .tkt,.ft .s3 .pr-3 .tkt,.ft .s4 .pr-4 .tkt,.ft .s5 .pr-5 .tkt{clip-path:inset(0 0 0 0)}
        .ft .phone{position:absolute;width:176px;height:336px;border-radius:28px;background:#0f172a;padding:7px;box-shadow:0 22px 40px -22px rgba(15,23,42,.7)}
        .ft .phone::before{content:"";position:absolute;top:11px;left:50%;width:46px;height:5px;margin-left:-23px;border-radius:3px;background:#1e293b;z-index:3}
        .ft .phone .scr{width:100%;height:100%;border-radius:22px;background:#fff;overflow:hidden;position:relative}

        .ft .wa .scr{background:var(--wa-bg)}
        .ft .wa .wh{position:absolute;left:0;right:0;top:0;height:46px;background:var(--wa-head);color:#fff;display:flex;align-items:center;gap:8px;padding:14px 10px 0;font-weight:800;font-size:11px;z-index:2}
        .ft .wa .wh i{width:22px;height:22px;border-radius:50%;background:#fff;color:var(--wa-head);font-style:normal;display:grid;place-items:center;font-size:9px}
        .ft .wa .wh small{display:block;font-weight:500;opacity:.8;font-size:9px}
        .ft .chat{position:absolute;left:0;right:0;top:46px;bottom:0;padding:8px 7px;display:flex;flex-direction:column;justify-content:flex-end;gap:5px;overflow:hidden}
        .ft .msg{max-width:88%;background:#fff;border-radius:9px 9px 9px 2px;padding:6px 8px;font-size:10.5px;line-height:1.4;box-shadow:0 1px 1px rgba(0,0,0,.08)}
        .ft .msg.out{align-self:flex-end;background:var(--wa-out);border-radius:9px 9px 2px 9px}
        .ft .msg .t{display:block;text-align:right;font-size:8.5px;color:#64748b;margin-top:2px}
        .ft .msg .t .read{color:#34b7f1}
        .ft .msg .wb{display:block;margin-top:6px;border-top:1px solid #e2e8f0;padding-top:5px;text-align:center;color:var(--wa-btn);font-weight:800}
        .ft .msg .row{display:flex;justify-content:space-between;gap:6px;padding:3px 0;border-top:1px solid #f1f5f9}
        .ft .msg .add{color:var(--wa-btn);font-weight:800;border:1px solid #bae6fd;border-radius:5px;padding:0 5px}
        .ft .msg .pdf{display:flex;gap:6px;align-items:center;background:#f1f5f9;border-radius:6px;padding:5px;margin-top:5px;font-weight:800}
        .ft .msg .pdf i{font-style:normal;background:var(--red);color:#fff;border-radius:4px;padding:1px 4px;font-size:8.5px}

        .ft .s-wao .phone{left:28px;top:12px}
        .ft .s-wao .pos{left:236px;top:26px;width:258px}
        .ft .s-wao .ord{display:grid;grid-template-columns:1fr auto;gap:2px 8px;padding:9px 12px;border-bottom:1px solid var(--line);align-items:center}
        .ft .s-wao .ord.last{border-bottom:0}
        .ft .s-wao .ord small{color:var(--muted);font-size:10.5px}
        .ft .s-wao .ord.new{background:#f0fdf4;border-left:3px solid var(--green)}
        .ft .s-wao .ord.dim{opacity:.55}
        .ft .s-wao .kot{left:300px;top:300px}
        .ft .s-wao .zero{left:236px;top:220px;width:258px;padding:9px 12px;font-weight:700;font-size:11.5px;display:flex;gap:8px;align-items:center}

        .ft .s-ord .tables{left:14px;top:14px;width:118px}
        .ft .s-ord .tables .g{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:10px}
        .ft .s-ord .tables .g span{border:1.5px solid var(--line);border-radius:8px;text-align:center;padding:7px 0;font-weight:800;font-size:11.5px}
        .ft .s-ord.s4 .t7{background:var(--amber-soft)!important;border-color:#f59e0b!important;color:var(--amber-ink)!important}
        .ft .s-ord .menu{left:144px;top:14px;width:178px}
        .ft .s-ord .menu .g{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:10px}
        .ft .s-ord .menu .g span{border:1.5px solid var(--line);border-radius:8px;padding:7px;font-weight:700;font-size:11px;line-height:1.25}
        .ft .s-ord .menu .g small{display:block;color:var(--muted);font-family:var(--mono);font-weight:500}
        .ft .s-ord .cart{left:334px;top:14px;width:172px;height:232px;display:flex;flex-direction:column}
        .ft .s-ord .cart .rows{padding:8px 12px;display:grid;gap:7px;flex:1;align-content:start}
        .ft .s-ord .cart .rows div{display:flex;justify-content:space-between;gap:6px}
        .ft .s-ord .cart .sk{margin:0 10px 10px}
        .ft .s-ord.s3 .cart .sk{background:var(--green)}
        .ft .s-ord .empty{color:var(--muted);text-align:center;padding-top:40px;position:absolute;left:0;right:0;top:34px}
        .ft .s-ord .printer{left:166px;top:296px}
        .ft .s-ord .toast{position:absolute;left:338px;top:262px;width:164px;text-align:center;background:var(--night);color:#fff;font-weight:700;padding:8px 10px;border-radius:10px;font-size:11px}

        .ft .s-off .netbar{position:absolute;left:14px;right:14px;top:12px;display:flex;justify-content:space-between;align-items:center;color:#e2e8f0;font-weight:700}
        .ft .s-off .netbar .ok{color:var(--green)}
        .ft .s-off .cloud{position:absolute;left:190px;top:52px;width:140px;text-align:center;color:#cbd5e1;font-weight:700;border:1.5px solid #475569;border-radius:12px;padding:7px 0}
        .ft .s-off .link{position:absolute;left:259px;top:90px;width:2px;height:30px;background:#64748b}
        .ft .s-off .cut{position:absolute;left:250px;top:94px;width:20px;height:20px;border-radius:50%;background:var(--red);color:#fff;font-weight:900;font-size:12px;display:grid;place-items:center}
        .ft .s-off.s1 .cloud{opacity:.4}
        .ft .s-off.s1 .link{background:repeating-linear-gradient(180deg,var(--red) 0 4px,transparent 4px 8px)}
        .ft .s-off.s4 .cloud{opacity:1;border-color:var(--green);color:#86efac}
        .ft .s-off.s4 .link{background:var(--green)}
        .ft .s-off.s4 .cut{opacity:0}
        .ft .s-off .server{position:absolute;left:180px;top:122px;width:160px;background:var(--red);color:#fff;border-radius:14px;padding:11px 0;text-align:center;font-weight:800}
        .ft .s-off .server small{display:block;font-family:var(--mono);font-weight:500;font-size:10px;opacity:.85}
        .ft .s-off.s1 .server{animation:ftPulse 1.6s infinite}
        .ft .s-off.s4 .server{animation:none}
        @keyframes ftPulse{0%{box-shadow:0 0 0 0 rgba(239,68,68,.55)}100%{box-shadow:0 0 0 18px rgba(239,68,68,0)}}
        .ft .s-off .counter{left:14px;top:176px;width:250px;background:var(--night-2);border-color:var(--night-3);color:#e2e8f0}
        .ft .s-off .counter .ph{border-color:var(--night-3)}
        .ft .s-off .bl{display:flex;justify-content:space-between;align-items:center;padding:6px 12px;gap:6px}
        .ft .s-off .counter .btnx{margin:6px 10px 10px}
        .ft .s-off .printer{left:330px;top:296px;background:#475569}

        .ft .s-kot .order{left:135px;top:12px;width:250px}
        .ft .s-kot .order .ln{display:flex;justify-content:space-between;align-items:center;padding:6px 12px;gap:6px}
        .ft .s-kot .order .btnx{margin:6px 10px 10px}
        .ft .s-kot.s1 .order .btnx{background:var(--green)}
        .ft .s-kot .p1{left:30px;top:296px}
        .ft .s-kot .p2{left:340px;top:296px}
        .ft .s-kot .ta{position:absolute;left:200px;top:300px;width:120px;text-align:center;white-space:normal;line-height:1.3}

        .ft .s-qr .tcard{position:absolute;left:16px;top:40px;width:124px;height:168px;background:#fff;border:1px solid var(--line);border-radius:14px;display:grid;place-items:center;text-align:center;font-weight:800;font-size:11px;box-shadow:0 12px 28px -18px rgba(15,23,42,.45)}
        .ft .s-qr .tlabel{margin-top:9px}
        .ft .s-qr .tlabel span{color:var(--muted);font-weight:600}
        .ft .s-qr .code{width:76px;height:76px;margin:0 auto;background:conic-gradient(from 90deg at 30% 30%,#111 25%,#fff 0) 0 0/19px 19px;border:6px solid #111;position:relative;overflow:hidden}
        .ft .s-qr .scan{position:absolute;left:0;right:0;height:3px;top:0;background:var(--red);box-shadow:0 0 10px var(--red);opacity:0}
        .ft .s-qr.s1:not(.s2) .scan{opacity:1;animation:ftScan 1.1s linear infinite}
        @keyframes ftScan{0%{top:0}100%{top:100%}}
        .ft .s-qr .phone{left:156px;top:12px}
        .ft .s-qr .cam{position:absolute;inset:0;background:#111827;color:#cbd5e1;display:grid;place-items:center;text-align:center;font-weight:700;font-size:11px}
        .ft .s-qr .cam span{display:block;width:90px;height:90px;margin:0 auto 10px;border:2px dashed #64748b;border-radius:12px}
        .ft .s-qr .mh{background:var(--red);color:#fff;font-weight:800;padding:18px 10px 10px;font-size:11.5px}
        .ft .s-qr .mi{display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-bottom:1px solid var(--line);font-size:11px;font-weight:600}
        .ft .s-qr .mi b{font-size:11px;border:1.5px solid var(--red);color:var(--red);border-radius:6px;padding:0 7px}
        .ft .s-qr.s2 .mi.a b{background:var(--red);color:#fff}
        .ft .s-qr .po{position:absolute;left:10px;right:10px;bottom:12px}
        .ft .s-qr.s3 .po{background:var(--green)}
        .ft .s-qr .pos{left:350px;top:26px;width:156px}
        .ft .s-qr .nw{margin:-62px 10px 10px;border:2px solid var(--red);border-radius:10px;padding:9px;line-height:1.5}
        .ft .s-qr .nw .btnx{margin-top:7px;padding:7px}
        .ft .s-qr.s4 .nw{border-color:var(--green)}
        .ft .s-qr.s4 .nw .btnx{background:var(--green-soft);color:var(--green)}
        .ft .s-qr .wait{color:var(--muted);text-align:center;padding:30px 8px}

        .ft .s-wab .bill{left:18px;top:18px;width:206px}
        .ft .s-wab .bill .ln{display:flex;justify-content:space-between;padding:4px 12px}
        .ft .s-wab .bill .ln.first{padding-top:8px}
        .ft .s-wab .bill .tot{font-weight:900;font-size:15px;border-top:1px dashed var(--line);margin-top:4px;padding-top:8px}
        .ft .s-wab .bill .cb{margin:10px 12px 0}
        .ft .s-wab.s1 .bill .cb{background:var(--green)}
        .ft .s-wab .bill .num{margin:8px 12px 0;border:1.5px solid var(--line);border-radius:8px;padding:6px 8px;color:var(--muted)}
        .ft .s-wab .bill .wab{margin:8px 12px 12px;background:#25d366}
        .ft .s-wab .phone{left:300px;top:12px}
        .ft .s-wab .crm{left:18px;top:316px;padding:9px 12px;font-weight:700;display:flex;gap:8px;align-items:center}

        .ft .s-menu .drop{position:absolute;left:24px;top:24px;width:190px;height:250px;border:2px dashed #cbd5e1;border-radius:14px;display:grid;place-items:center;text-align:center;color:var(--muted);font-weight:600}
        .ft .s-menu .paper{position:absolute;left:30px;top:28px;width:178px;height:244px;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:14px;box-shadow:0 12px 24px -14px rgba(0,0,0,.45);font-family:Georgia,'Times New Roman',serif;color:#78350f;overflow:hidden}
        .ft .s-menu.s1 .paper{transform:rotate(-2deg)}
        .ft .s-menu .paper h4{margin:0 0 8px;text-align:center;font-size:13px;letter-spacing:.12em}
        .ft .s-menu .paper div{display:flex;justify-content:space-between;font-size:11px;border-bottom:1px dotted #d6b77a;padding:4px 0}
        .ft .s-menu .paper .sweep{position:absolute;left:0;right:0;height:30px;top:-34px;padding:0;border:0;background:linear-gradient(180deg,transparent,rgba(239,68,68,.35),transparent);opacity:0}
        .ft .s-menu.s2:not(.s3) .sweep{opacity:1;animation:ftSweep 1.3s linear infinite}
        @keyframes ftSweep{0%{top:-34px}100%{top:100%}}
        .ft .s-menu .up{position:absolute;left:24px;top:292px;width:190px}
        .ft .s-menu .list{left:260px;top:20px;width:240px}
        .ft .s-menu .list .items{margin-top:-96px}
        .ft .s-menu .list .it{display:flex;justify-content:space-between;align-items:center;padding:7px 12px;border-bottom:1px solid var(--line);font-weight:600}
        .ft .s-menu .list .it.last{border-bottom:0}
        .ft .s-menu .list .it span{font-family:var(--mono);color:var(--muted)}
        .ft .s-menu .list .wait{padding:40px 12px;text-align:center;color:var(--muted)}
        .ft .s-menu .ready{left:260px;top:262px;width:240px;padding:9px 12px;display:flex;gap:10px;align-items:center;font-weight:800}
        .ft .s-menu .ready .mini{width:30px;height:30px;flex-shrink:0;background:conic-gradient(from 90deg at 30% 30%,#111 25%,#fff 0) 0 0/9px 9px;border:3px solid #111}
        .ft .s-menu .ready .btnx{margin-left:auto;padding:6px 10px;font-size:11px}

        .ft .s-staff .phone{left:28px;top:12px}
        .ft .s-staff .scr{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:12px}
        .ft .s-staff .who{font-weight:800;font-size:12px}
        .ft .s-staff .clock{font-family:var(--mono);font-size:24px;font-weight:700}
        .ft .s-staff .shift{color:var(--muted);font-size:10.5px}
        .ft .s-staff .pb{width:100px;height:100px;border-radius:50%;background:var(--red);color:#fff;font-weight:900;display:grid;place-items:center;font-size:13px;box-shadow:0 0 0 8px #fee2e2}
        .ft .s-staff.s1 .pb{background:var(--green);box-shadow:0 0 0 8px var(--green-soft)}
        .ft .s-staff .board{left:232px;top:20px;width:272px}
        .ft .s-staff .rw{display:grid;grid-template-columns:1fr 52px 66px;gap:8px;align-items:center;padding:9px 12px;border-bottom:1px solid var(--line)}
        .ft .s-staff .rw.last{border-bottom:0}
        .ft .s-staff .rw>span{font-family:var(--mono);color:var(--muted);font-size:11px}
        .ft .s-staff.s2 .r1{background:#f0fdf4}
        .ft .s-staff .sal{left:232px;top:196px;width:272px;padding:11px 12px}
        .ft .s-staff .sal .st{font-weight:800;margin-bottom:6px}
        .ft .s-staff .sal .ln{display:flex;justify-content:space-between;padding:2px 0}
        .ft .s-staff .sal .tt{font-weight:900;font-size:14px;border-top:1px dashed var(--line);margin-top:5px;padding-top:7px}

        .ft .plain{padding-block:84px}
        .ft .sec-head{text-align:center;max-width:680px;margin:0 auto 36px}
        .ft .sec-head h2{font-size:clamp(28px,3.4vw,40px);font-weight:900;line-height:1.1;margin-top:10px}
        .ft .more{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--line);border-radius:16px;overflow:hidden;background:#fff}
        .ft .more a{padding:18px;border-right:1px solid var(--line);border-bottom:1px solid var(--line);text-decoration:none;color:inherit;transition:background .2s}
        .ft .more a:hover{background:var(--soft)}
        .ft .more a:nth-child(4n){border-right:0}
        .ft .more a:nth-last-child(-n+4){border-bottom:0}
        .ft .more b{display:block;font-size:15px}
        .ft .more span{font-size:13.5px;color:var(--muted)}

        @media (max-width:960px){
          .ft .fgrid,.ft .flip .fgrid{grid-template-columns:1fr;gap:32px}
          .ft .flip .ftext{order:0}
          .ft .more{grid-template-columns:1fr 1fr}
          .ft .more a{border-right:1px solid var(--line)!important;border-bottom:1px solid var(--line)!important}
          .ft .more a:nth-child(2n){border-right:0!important}
        }
        @media (max-width:560px){
          .ft .feature,.ft .plain{padding-block:60px}
          .ft .more{grid-template-columns:1fr}
          .ft .more a{border-right:0!important}
          .ft .foot .replay{min-height:56px;padding-inline:18px;font-size:16px}
        }
        @media (prefers-reduced-motion:reduce){.ft .area *,.ft .cursor{transition:none!important;animation:none!important}}
      `}</style>
    </div>
  );
}
