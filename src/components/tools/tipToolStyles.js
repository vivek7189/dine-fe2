// Shared look for the tip calculator and tip pooling calculator pages (scoped under .tt).
import css from 'styled-jsx/css';

export const tipToolStyles = css.global`
  .tt{--ink:#0f172a;--body:#334155;--muted:#64748b;--line:#e2e8f0;--soft:#f8fafc;--red:#ef4444;--red-d:#dc2626;--red-soft:#fef2f2;--green:#16a34a;--green-soft:#f0fdf4;
    background:#fff;color:var(--body);padding-top:0;font-size:16px}
  .tt *{box-sizing:border-box}
  .tt .wrap{max-width:1080px;margin:0 auto;padding:0 20px}
  .tt .crumb{font-size:13px;color:var(--muted);padding-top:24px}
  .tt .crumb a{color:var(--muted);text-decoration:none}
  .tt .crumb a:hover{color:var(--red)}
  .tt .head{text-align:center;padding:28px 0 28px}
  .tt h1{font-size:clamp(30px,4.6vw,46px);font-weight:900;letter-spacing:-.03em;color:var(--ink);line-height:1.1;margin:0}
  .tt .lede{font-size:clamp(16px,1.8vw,18px);color:var(--muted);max-width:40em;margin:14px auto 0;line-height:1.6}

  .tt .app{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:20px;align-items:start}
  .tt .card{min-width:0;background:#fff;border:1px solid var(--line);border-radius:20px;padding:24px;box-shadow:0 1px 2px rgba(15,23,42,.04),0 12px 32px -24px rgba(15,23,42,.25)}
  .tt .field+.field{margin-top:22px}
  .tt .lbl{display:flex;justify-content:space-between;align-items:baseline;font-size:13px;font-weight:700;color:var(--ink);margin-bottom:8px;letter-spacing:.01em}
  .tt .lbl small{font-weight:500;color:var(--muted);font-size:12.5px}
  .tt .money{display:flex;border:1.5px solid var(--line);border-radius:14px;overflow:hidden;background:#fff;transition:border-color .15s,box-shadow .15s}
  .tt .money:focus-within{border-color:var(--red);box-shadow:0 0 0 4px rgba(239,68,68,.1)}
  .tt .money select{border:0;background:var(--soft);padding:0 10px;font:inherit;font-size:16px;font-weight:700;color:var(--ink);border-right:1px solid var(--line);cursor:pointer}
  .tt .money input{flex:1;min-width:0;width:100%;border:0;outline:0;padding:14px 16px;font:inherit;font-size:26px;font-weight:800;color:var(--ink);background:transparent}
  .tt .money input::placeholder{color:#cbd5e1}
  .tt .inp{width:100%;border:1.5px solid var(--line);border-radius:12px;padding:12px 14px;font:inherit;font-size:16px;color:var(--ink);background:#fff;outline:0;transition:border-color .15s,box-shadow .15s}
  .tt .inp:focus{border-color:var(--red);box-shadow:0 0 0 4px rgba(239,68,68,.1)}
  .tt .chips{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}
  .tt .chip{border:1.5px solid var(--line);background:#fff;border-radius:12px;padding:12px 0;font:inherit;font-weight:800;font-size:15px;color:var(--ink);cursor:pointer;transition:all .15s;min-height:46px}
  .tt .chip:hover{border-color:#fca5a5}
  .tt .chip.on{background:var(--red);border-color:var(--red);color:#fff}
  .tt .row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .tt .stepper{display:flex;align-items:center;border:1.5px solid var(--line);border-radius:14px;overflow:hidden}
  .tt .stepper button{width:52px;height:50px;border:0;background:var(--soft);font-size:22px;font-weight:700;color:var(--ink);cursor:pointer}
  .tt .stepper button:disabled{color:#cbd5e1;cursor:default}
  .tt .stepper output{flex:1;text-align:center;font-weight:800;font-size:18px;color:var(--ink)}
  .tt .seg{display:flex;background:var(--soft);border:1px solid var(--line);border-radius:12px;padding:3px;gap:3px}
  .tt .seg button{flex:1;border:0;background:transparent;border-radius:9px;padding:10px 6px;font:inherit;font-size:14px;font-weight:700;color:var(--muted);cursor:pointer;min-height:42px}
  .tt .seg button.on{background:#fff;color:var(--ink);box-shadow:0 1px 3px rgba(15,23,42,.12)}
  .tt .toggle{display:flex;align-items:center;gap:10px;font-size:14.5px;font-weight:600;color:var(--ink);cursor:pointer;user-select:none}
  .tt .toggle input{width:20px;height:20px;accent-color:var(--red)}
  .tt .hint{font-size:13px;color:var(--muted);margin:8px 0 0;line-height:1.5}

  .tt .res{position:sticky;top:88px;background:var(--ink);color:#fff;border-radius:20px;padding:24px;box-shadow:0 24px 50px -28px rgba(15,23,42,.6)}
  .tt .res .k{font-size:12.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#94a3b8}
  .tt .res .big{font-size:clamp(38px,5vw,52px);font-weight:900;letter-spacing:-.03em;line-height:1.05;margin:6px 0 2px;font-variant-numeric:tabular-nums}
  .tt .res .sub{font-size:14px;color:#cbd5e1}
  .tt .res .grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:rgba(255,255,255,.1);border-radius:14px;overflow:hidden;margin-top:20px}
  .tt .res .grid div{background:#1e293b;padding:14px 16px}
  .tt .res .grid b{display:block;font-size:20px;font-weight:800;margin-top:4px;font-variant-numeric:tabular-nums}
  .tt .res .grid span{font-size:12.5px;color:#94a3b8;font-weight:600}
  .tt .res .acts{display:flex;gap:8px;margin-top:16px}
  .tt .res .acts button{flex:1;border:1px solid rgba(255,255,255,.18);background:transparent;color:#fff;border-radius:12px;padding:11px;font:inherit;font-weight:700;font-size:14px;cursor:pointer;min-height:44px}
  .tt .res .acts button:hover{background:rgba(255,255,255,.08)}
  .tt .res .note{font-size:12.5px;color:#94a3b8;margin:12px 0 0;line-height:1.5}

  .tt .tbl{width:100%;border-collapse:collapse;font-size:15px;font-variant-numeric:tabular-nums}
  .tt .tbl th{text-align:left;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:700;padding:10px 12px;border-bottom:1px solid var(--line)}
  .tt .tbl td{padding:11px 12px;border-bottom:1px solid #f1f5f9;color:var(--ink)}
  .tt .tbl tr:last-child td{border-bottom:0}
  .tt .tbl .num{text-align:right}
  .tt .tbl tr.hl td{background:var(--red-soft);font-weight:800}
  .tt .tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid var(--line);border-radius:16px}

  .tt .sec{padding:56px 0 0}
  .tt .sec h2{font-size:clamp(24px,3vw,32px);font-weight:850;letter-spacing:-.02em;color:var(--ink);margin:0 0 10px;line-height:1.2}
  .tt .sec .intro{color:var(--muted);margin:0 0 22px;max-width:46em;line-height:1.65}
  .tt .prose{max-width:760px}
  .tt .prose p,.tt .prose li{line-height:1.75;color:var(--body)}
  .tt .prose h3{font-size:19px;color:var(--ink);margin:26px 0 8px}
  .tt .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .tt .step{border:1px solid var(--line);border-radius:16px;padding:18px;background:#fff}
  .tt .step i{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;background:var(--red-soft);color:var(--red);font-style:normal;font-weight:900;font-size:14px}
  .tt .step h3{font-size:16px;color:var(--ink);margin:12px 0 6px}
  .tt .step p{font-size:14.5px;color:var(--body);margin:0;line-height:1.6}
  .tt .formula{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:var(--soft);border:1px solid var(--line);border-radius:12px;padding:14px 16px;font-size:14.5px;color:var(--ink);overflow-x:auto}

  .tt .faq{border:1px solid var(--line);border-radius:16px;overflow:hidden;max-width:820px}
  .tt .faq details+details{border-top:1px solid var(--line)}
  .tt .faq summary{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:17px 20px;cursor:pointer;list-style:none}
  .tt .faq summary::-webkit-details-marker{display:none}
  .tt .faq summary:hover{background:#fafafa}
  .tt .faq summary h3{margin:0;font-size:16px;font-weight:700;color:var(--ink);line-height:1.4}
  .tt .faq summary::after{content:"+";flex-shrink:0;width:26px;height:26px;border-radius:50%;background:#f1f5f9;display:grid;place-items:center;font-weight:700;color:var(--body)}
  .tt .faq details[open] summary::after{content:"–";background:#fee2e2;color:var(--red)}
  .tt .faq p{margin:0;padding:0 20px 18px;line-height:1.7;color:var(--body);font-size:15px}

  .tt .owner{margin:64px 0 0;display:grid;grid-template-columns:1fr auto;gap:20px;align-items:center;border-radius:22px;padding:28px;background:linear-gradient(135deg,#fff7f7,#fff);border:1px solid #fde2e2}
  .tt .owner h2{font-size:22px;margin:0 0 6px;color:var(--ink)}
  .tt .owner p{margin:0;color:var(--body);line-height:1.6}
  .tt .owner ul{margin:10px 0 0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:6px 16px}
  .tt .owner li{font-size:14px;font-weight:600;color:var(--ink)}
  .tt .owner li::before{content:"✓ ";color:var(--green)}
  .tt .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:12px;padding:14px 22px;font:inherit;font-weight:800;font-size:15.5px;color:#fff;background:var(--red);text-decoration:none;white-space:nowrap;cursor:pointer;min-height:48px}
  .tt .btn:hover{background:var(--red-d)}
  .tt .btn.ghost{background:#fff;color:var(--ink);border:1.5px solid var(--line)}
  .tt .btn.ghost:hover{border-color:var(--red);color:var(--red)}
  .tt .related{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
  .tt .related a{display:block;border:1px solid var(--line);border-radius:16px;padding:16px 18px;text-decoration:none;transition:border-color .15s,transform .15s}
  .tt .related a:hover{border-color:var(--red);transform:translateY(-2px)}
  .tt .related b{display:block;color:var(--ink);font-size:15.5px}
  .tt .related span{display:block;color:var(--muted);font-size:13.5px;margin-top:4px;line-height:1.5}
  .tt .updated{font-size:13px;color:var(--muted);margin:40px 0 64px}
  .tt .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}

  @media (max-width:860px){
    .tt .app{grid-template-columns:minmax(0,1fr)}
    .tt .res{position:static}
    .tt .steps,.tt .related{grid-template-columns:1fr}
    .tt .owner{grid-template-columns:1fr}
  }
  @media (max-width:520px){
    .tt .wrap{padding:0 16px}
    .tt .card,.tt .res{padding:18px;border-radius:18px}
    .tt .chips{grid-template-columns:repeat(3,1fr)}
    .tt .row2{grid-template-columns:1fr}
    .tt .tbl{font-size:14px}
    .tt .tbl th,.tt .tbl td{padding:10px 9px}
    .tt .sec{padding-top:44px}
    .tt .owner{padding:20px}
    .tt .owner .btn{width:100%}
  }
  @media print{
    header,footer,nav,.tt .no-print{display:none!important}
    .tt{padding-top:0}
    .tt .res{position:static;background:#fff;color:#000;box-shadow:none;border:1px solid #000}
  }
`;
