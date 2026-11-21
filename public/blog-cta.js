/* DineOpen owner sign-up box for the static blog posts (public/blog, public/hi/blog).
   Same idea as src/components/BlogOwnerCTA.js: message matches the post topic, price matches the
   visitor's country (prices as on /pricing; India shows ₹899, never ₹299). Inserted once, mid-article
   (before the 3rd <h2> in main.content), else at the end of main.content. Loaded by site-analytics.js
   on blog pages only. Any error = no box; the page is never affected. */
(function () {
  try {
    if (window.__dineBlogCta) return;
    window.__dineBlogCta = true;
    var path = location.pathname || '';
    if (!/^\/(hi\/)?blog\/[^/]+/.test(path)) return;
    var main = document.querySelector('main.content');
    if (!main) return;

    var PRICE = {
      US: '$20/month', CA: 'US$20/month', AU: 'US$20/month', GB: '£16/month', IE: 'US$20/month',
      AE: 'AED 75/month', SA: 'SAR 75/month', QA: 'US$20/month', KW: 'KWD 6/month', BH: 'BHD 8/month',
      OM: 'US$20/month', IN: '₹899/month', KE: 'US$20/month', NG: 'US$20/month', ZA: 'US$20/month', SG: 'US$20/month'
    };
    var TZ = {
      'Europe/London': 'GB', 'Europe/Dublin': 'IE', 'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Asia/Qatar': 'QA',
      'Asia/Kuwait': 'KW', 'Asia/Bahrain': 'BH', 'Asia/Muscat': 'OM', 'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
      'Africa/Nairobi': 'KE', 'Africa/Lagos': 'NG', 'Africa/Johannesburg': 'ZA', 'Asia/Singapore': 'SG',
      'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Edmonton': 'CA', 'America/Winnipeg': 'CA',
      'America/Halifax': 'CA', 'America/Regina': 'CA', 'America/St_Johns': 'CA', 'America/Montreal': 'CA'
    };
    var country = 'US';
    try {
      var q = (new URLSearchParams(location.search).get('country') || '').toUpperCase();
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (PRICE[q]) country = q;
      else if (TZ[tz]) country = TZ[tz];
      else if (tz.indexOf('Australia/') === 0) country = 'AU';
    } catch (e) { /* USD */ }
    var hindi = path.indexOf('/hi/') === 0;
    if (hindi && !/^\?/.test(location.search) && country === 'US') country = 'IN';

    var slug = path.replace(/^\/(hi\/)?blog\//, '').replace(/\.html$/, '').replace(/\/$/, '');
    var T = hindi ? {
      starter: ['फ़ूड बिज़नेस शुरू करने वाले हैं या पहले से चला रहे हैं?', 'पहले दिन से पहले बिलिंग, मेनू, QR ऑर्डर और स्टॉक तैयार करें। सेटअप में लगभग 5 मिनट लगते हैं।'],
      delivery: ['रोज़ के ग्राहकों पर कमीशन देना बंद करें', 'अपने QR मेनू और ऑर्डर लिंक से 0% कमीशन पर ऑर्डर लें, और Swiggy/Zomato की बिक्री भी उसी रिपोर्ट में देखें।'],
      pos: ['बिना कॉन्ट्रैक्ट रेस्टोरेंट POS आज़माएं', 'बिलिंग, KOT, QR ऑर्डर, स्टॉक और रिपोर्ट किसी भी फ़ोन या टैबलेट पर।'],
      cost: ['हर दिन असली फ़ूड कॉस्ट देखें', 'बिक्री के साथ रेसिपी से स्टॉक अपने आप घटता है, फ़ूड कॉस्ट और मार्जिन अपने आप अपडेट होते हैं।'],
      staff: ['स्टाफ़, शिफ़्ट और सैलरी एक ऐप में', 'हाज़िरी, रोटा और सैलरी शीट, बिक्री के साथ, बिना एक्सेल के।'],
      tax: ['सही GST के साथ बिल, अपने आप', 'टैक्स एक बार सेट करें, हर बिल और रिपोर्ट में सही GST।'],
      general: ['अपना रेस्टोरेंट DineOpen पर चलाएं', 'POS, QR ऑर्डर, स्टॉक, स्टाफ़ और रिपोर्ट एक ऐप में।'],
      line: '7 दिन फ़्री ट्रायल · फिर {p} से · कोई कॉन्ट्रैक्ट नहीं', btn: 'फ़्री ट्रायल शुरू करें →'
    } : {
      starter: ['Opening soon, or already running a food business?', 'Get billing, menu, QR ordering and stock ready before day one. It takes about 5 minutes to set up.'],
      delivery: ['Stop paying commission on repeat orders', 'Take orders from your own QR menu and ordering link at 0% commission, and keep delivery-app sales in the same reports.'],
      pos: ['Try a restaurant POS without a contract', 'Billing, KOT and kitchen display, QR ordering, inventory and reports on any tablet or phone. Set up in minutes.'],
      cost: ['See your real food cost every day', 'DineOpen deducts stock from recipes as you sell, so food cost and margins update on their own.'],
      staff: ['Staff, shifts and payroll in one app', 'Attendance, rotas and salary sheets next to your sales, without spreadsheets.'],
      tax: ['Bills with the right tax, automatically', 'Set your country tax once (VAT, GST, HST or sales tax) and every bill and report gets it right.'],
      general: ['Run your restaurant on DineOpen', 'POS, QR ordering, inventory, staff and reports in one app, on any device.'],
      line: '7-day free trial · then from {p} · no contract', btn: 'Start free trial →'
    };
    var key = 'general';
    if (/how-to-(start|open)|cost-to-open|business-plan|kaise|khole|license|startup/i.test(slug)) key = 'starter';
    else if (/deliveroo|doordash|uber-?eats|just-?eat|skip|swiggy|zomato|talabat|commission|delivery|direct-order|online-order/i.test(slug)) key = 'delivery';
    else if (/(^|-)pos(-|$)|epos|billing|point-of-sale|toast|square|clover|lightspeed|petpooja|posist|software|kot|kds/i.test(slug)) key = 'pos';
    else if (/food-cost|menu-pric|margin|profit|waste|inventory|recipe/i.test(slug)) key = 'cost';
    else if (/staff|labou?r|payroll|salary|attendance|shift|hiring|hire/i.test(slug)) key = 'staff';
    else if (/tax|vat|gst|hst|invoice/i.test(slug)) key = 'tax';

    var href = '/login?utm_source=dineopen&utm_medium=blog&utm_campaign=' + encodeURIComponent(slug || 'blog');
    var box = document.createElement('aside');
    box.setAttribute('aria-label', 'Try DineOpen');
    box.style.cssText = 'margin:28px 0;padding:20px 22px;border-radius:14px;border:1px solid #fecaca;background:linear-gradient(135deg,#fff7f6,#fff);display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between;font-family:inherit;';
    var left = document.createElement('div'); left.style.cssText = 'flex:1 1 260px;min-width:0;';
    var h = document.createElement('div'); h.style.cssText = 'font-weight:800;font-size:18px;color:#111827;line-height:1.3;'; h.textContent = T[key][0];
    var p = document.createElement('div'); p.style.cssText = 'font-size:15px;color:#4b5563;margin-top:6px;line-height:1.55;'; p.textContent = T[key][1];
    var s = document.createElement('div'); s.style.cssText = 'font-size:13px;color:#6b7280;margin-top:8px;'; s.textContent = T.line.replace('{p}', PRICE[country] || PRICE.US);
    left.appendChild(h); left.appendChild(p); left.appendChild(s);
    var a = document.createElement('a'); a.href = href; a.textContent = T.btn;
    a.style.cssText = 'background:#ef4444;color:#fff;padding:12px 18px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;white-space:nowrap;';
    a.addEventListener('click', function () {
      try { window.posthog && window.posthog.capture('blog_cta_click', { slug: slug, country: country, topic: key, placement: 'static_mid' }); } catch (e) { /* optional */ }
    });
    box.appendChild(left); box.appendChild(a);

    var h2s = main.querySelectorAll('h2');
    if (h2s.length >= 4) h2s[2].parentNode.insertBefore(box, h2s[2]);
    else main.appendChild(box);
  } catch (e) { /* never break the page */ }
})();
