import { useState, useEffect, useMemo, useRef } from "react";
import { createRateRequest } from "../api/orderApi";

/* ============================================================================
   PAGE 6 — RATE REQUEST CONSOLE
   High-tech redesign: holographic HUD console, telemetry deck, scan sweeps.
   Behaviour, props and API contract are identical to the previous version.
   ========================================================================== */

const CSS = `
.p6-root{
  --bg-0:#03060d;
  --bg-1:#070c16;
  --panel:rgba(14,22,38,0.72);
  --panel-2:rgba(9,15,27,0.86);
  --cy:#22d3ee;
  --cy-2:#38bdf8;
  --vi:#8b5cf6;
  --mint:#2ee6a8;
  --danger:#ff4d6d;
  --warn:#ffb547;
  --txt:#eaf3ff;
  --soft:#aebfd8;
  --muted:#7286a4;
  --dim:#4a5b78;
  --line:rgba(125,180,255,0.13);
  --line-2:rgba(125,180,255,0.22);
  --hot:rgba(34,211,238,0.42);
  --glass:rgba(255,255,255,0.035);
  --mono:ui-monospace,"SFMono-Regular","JetBrains Mono","Roboto Mono",Menlo,monospace;
  --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,"Helvetica Neue",Arial,sans-serif;

  min-height:100vh;
  box-sizing:border-box;
  display:flex;
  justify-content:center;
  align-items:stretch;
  padding:0;
  overflow-x:hidden;
  font-family:var(--sans);
  color:var(--txt);
  background:
    radial-gradient(1100px 560px at 50% -10%, rgba(34,211,238,0.13), transparent 60%),
    radial-gradient(760px 520px at 6% 108%, rgba(139,92,246,0.13), transparent 62%),
    linear-gradient(180deg,#03060d 0%,#070c16 55%,#04070f 100%);
}
.p6-root *,.p6-root *::before,.p6-root *::after{box-sizing:border-box;}

/* ---------- device frame ---------- */
.p6-frame{
  position:relative;
  isolation:isolate;
  width:100%;
  max-width:100%;
  min-height:100vh;
  height:100dvh;
  display:flex;
  flex-direction:column;
  overflow:hidden;
  background:linear-gradient(180deg,#0a1120 0%,#070c17 48%,#04070e 100%);
}
@media (min-width:700px){
  .p6-root{align-items:center;padding:36px 20px;}
  .p6-frame{
    width:390px;height:844px;min-height:0;
    border-radius:44px;
    border:1px solid rgba(125,180,255,0.16);
    box-shadow:
      0 50px 130px rgba(0,0,0,0.72),
      0 0 0 1px rgba(34,211,238,0.10),
      0 0 90px rgba(34,211,238,0.10),
      inset 0 1px 0 rgba(255,255,255,0.07);
  }
}

/* ---------- ambient layers ---------- */
.p6-layer{position:absolute;inset:0;pointer-events:none;z-index:0;}
.p6-grid{
  background-image:
    linear-gradient(rgba(125,180,255,0.05) 1px,transparent 1px),
    linear-gradient(90deg,rgba(125,180,255,0.05) 1px,transparent 1px);
  background-size:30px 30px;
  -webkit-mask-image:linear-gradient(180deg,rgba(0,0,0,.95) 0%,rgba(0,0,0,.28) 58%,transparent 86%);
  mask-image:linear-gradient(180deg,rgba(0,0,0,.95) 0%,rgba(0,0,0,.28) 58%,transparent 86%);
}
.p6-aurora-a,.p6-aurora-b{filter:blur(46px);opacity:.55;}
.p6-aurora-a{
  inset:auto auto 0 -40px;width:300px;height:280px;
  background:radial-gradient(closest-side,rgba(139,92,246,0.42),transparent 72%);
  animation:p6-drift-a 16s ease-in-out infinite;
}
.p6-aurora-b{
  inset:-120px -60px auto auto;width:320px;height:300px;
  background:radial-gradient(closest-side,rgba(34,211,238,0.34),transparent 72%);
  animation:p6-drift-b 19s ease-in-out infinite;
}
.p6-sweep{
  position:absolute;left:0;right:0;height:120px;z-index:1;pointer-events:none;
  background:linear-gradient(180deg,transparent,rgba(34,211,238,0.055) 45%,rgba(56,189,248,0.13) 50%,rgba(34,211,238,0.055) 55%,transparent);
  animation:p6-sweep 7.5s linear infinite;
}
.p6-noise{
  opacity:.16;mix-blend-mode:overlay;
  background-image:radial-gradient(rgba(255,255,255,.5) .5px,transparent .5px);
  background-size:3px 3px;
}

/* ---------- HUD corner brackets ---------- */
.p6-corner{position:absolute;width:12px;height:12px;pointer-events:none;opacity:.75;}
.p6-corner.tl{top:-1px;left:-1px;border-top:1.5px solid var(--hot);border-left:1.5px solid var(--hot);border-top-left-radius:6px;}
.p6-corner.tr{top:-1px;right:-1px;border-top:1.5px solid var(--hot);border-right:1.5px solid var(--hot);border-top-right-radius:6px;}
.p6-corner.bl{bottom:-1px;left:-1px;border-bottom:1.5px solid var(--hot);border-left:1.5px solid var(--hot);border-bottom-left-radius:6px;}
.p6-corner.br{bottom:-1px;right:-1px;border-bottom:1.5px solid var(--hot);border-right:1.5px solid var(--hot);border-bottom-right-radius:6px;}

/* ---------- header ---------- */
.p6-header{
  position:relative;z-index:4;flex-shrink:0;
  padding:calc(14px + env(safe-area-inset-top,0px)) 16px 14px;
  background:linear-gradient(180deg,rgba(6,11,20,0.94),rgba(6,11,20,0.72));
  backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  border-bottom:1px solid var(--line);
  box-shadow:0 14px 36px rgba(0,0,0,0.42);
}
@media (min-width:700px){.p6-header{padding:22px 18px 14px;}}
.p6-header::after{
  content:"";position:absolute;left:0;right:0;bottom:-1px;height:1px;
  background:linear-gradient(90deg,transparent,rgba(34,211,238,0.75),rgba(139,92,246,0.55),transparent);
  opacity:.8;
}
.p6-topbar{display:flex;align-items:center;justify-content:space-between;gap:8px;}
.p6-chip{
  display:inline-flex;align-items:center;gap:7px;
  min-height:38px;padding:0 12px;border-radius:11px;
  background:var(--glass);border:1px solid var(--line);
  color:var(--soft);font-family:var(--mono);font-size:11px;font-weight:600;
  letter-spacing:.1em;text-transform:uppercase;cursor:pointer;
  transition:border-color .16s,background .16s,color .16s,transform .12s,box-shadow .2s;
  -webkit-tap-highlight-color:transparent;
}
.p6-chip:not(:disabled):hover{
  color:#fff;border-color:var(--hot);background:rgba(34,211,238,0.09);
  box-shadow:0 0 0 3px rgba(34,211,238,0.08);
}
.p6-chip:not(:disabled):active{transform:translateY(1px);}
.p6-chip:disabled{opacity:.42;cursor:not-allowed;}

.p6-link-state{
  display:inline-flex;align-items:center;gap:7px;
  padding:6px 11px;border-radius:999px;
  background:linear-gradient(180deg,rgba(34,211,238,0.16),rgba(34,211,238,0.05));
  border:1px solid var(--hot);
  color:#9beaf7;font-family:var(--mono);font-size:9.5px;font-weight:700;
  letter-spacing:.16em;text-transform:uppercase;
  box-shadow:0 0 20px rgba(34,211,238,0.16);
}
.p6-dot{width:6px;height:6px;border-radius:50%;background:var(--cy);box-shadow:0 0 9px var(--cy);animation:p6-breathe 2.4s ease-in-out infinite;}

.p6-eyebrow{
  margin-top:14px;display:flex;align-items:center;gap:8px;
  font-family:var(--mono);font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:var(--muted);
}
.p6-eyebrow .rule{flex:1;height:1px;background:linear-gradient(90deg,var(--line-2),transparent);}
.p6-title{
  margin:8px 0 0;font-size:25px;line-height:1.14;font-weight:800;letter-spacing:-0.025em;
  background:linear-gradient(96deg,#ffffff 8%,#a5eaff 48%,#c4b5fd 96%);
  -webkit-background-clip:text;background-clip:text;color:transparent;
}
.p6-sub{margin:7px 0 0;font-size:12.5px;line-height:1.55;color:var(--muted);}

/* ---------- telemetry deck ---------- */
.p6-deck{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:15px;}
.p6-tile{
  position:relative;overflow:hidden;min-width:0;
  padding:9px 10px 10px;border-radius:12px;
  background:linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.015));
  border:1px solid var(--line);
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.06);
}
.p6-tile-val{font-family:var(--mono);font-size:19px;font-weight:700;line-height:1.1;letter-spacing:-0.02em;color:var(--txt);}
.p6-tile-val.cy{color:#8ce8fb;text-shadow:0 0 18px rgba(34,211,238,0.35);}
.p6-tile-val.vi{color:#c4b5fd;text-shadow:0 0 18px rgba(139,92,246,0.3);}
.p6-tile-lab{margin-top:4px;font-family:var(--mono);font-size:8.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);}
.p6-tile-bar{margin-top:7px;height:2px;border-radius:2px;background:rgba(125,180,255,0.12);overflow:hidden;}
.p6-tile-bar > i{display:block;height:100%;border-radius:2px;background:linear-gradient(90deg,var(--cy),var(--vi));animation:p6-grow 900ms cubic-bezier(.2,.8,.2,1) both;}

/* ---------- readiness strip ---------- */
.p6-ready{
  display:flex;align-items:center;gap:11px;margin-top:9px;padding:9px 11px;
  border-radius:12px;background:rgba(255,255,255,0.028);border:1px solid var(--line);
}
.p6-ready-txt{flex:1;min-width:0;}
.p6-ready-t{font-family:var(--mono);font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);}
.p6-ready-v{margin-top:3px;font-size:12px;font-weight:600;color:var(--soft);}
.p6-ring{flex-shrink:0;transform:rotate(-90deg);}
.p6-ring circle{transition:stroke-dashoffset .55s cubic-bezier(.2,.8,.2,1);}
.p6-ring-label{
  position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  font-family:var(--mono);font-size:10.5px;font-weight:700;color:#9beaf7;
}
.p6-ring-wrap{position:relative;width:44px;height:44px;flex-shrink:0;}

/* ---------- main scroll ---------- */
.p6-main{
  position:relative;z-index:2;flex:1;overflow-y:auto;overflow-x:hidden;
  padding:16px 16px 26px;-webkit-overflow-scrolling:touch;
}
@media (min-width:700px){.p6-main{padding:16px 18px 24px;}}
.p6-main::-webkit-scrollbar{width:4px;}
.p6-main::-webkit-scrollbar-track{background:transparent;}
.p6-main::-webkit-scrollbar-thumb{background:rgba(125,180,255,0.2);border-radius:999px;}

.p6-sec{display:flex;align-items:center;gap:9px;margin:2px 2px 12px;}
.p6-sec-i{
  width:20px;height:20px;border-radius:6px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  background:rgba(34,211,238,0.1);border:1px solid var(--hot);color:var(--cy);
}
.p6-sec-t{font-family:var(--mono);font-size:10.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#8ce8fb;}
.p6-sec .rule{flex:1;height:1px;background:linear-gradient(90deg,var(--line-2),transparent);}
.p6-sec-n{font-family:var(--mono);font-size:9.5px;color:var(--dim);letter-spacing:.1em;}
`;

const CSS_2 = `
/* ---------- alert banner ---------- */
.p6-alert{
  position:relative;overflow:hidden;
  display:flex;gap:10px;align-items:flex-start;
  padding:12px;margin-bottom:13px;border-radius:14px;
  background:linear-gradient(180deg,rgba(255,77,109,0.14),rgba(255,77,109,0.05));
  border:1px solid rgba(255,77,109,0.45);
  box-shadow:0 0 28px rgba(255,77,109,0.1);
}
.p6-alert::before{
  content:"";position:absolute;left:0;top:0;bottom:0;width:2px;
  background:linear-gradient(180deg,transparent,var(--danger),transparent);
  animation:p6-pulse 1.8s ease-in-out infinite;
}
.p6-alert-b{flex:1;min-width:0;}
.p6-alert-t{font-family:var(--mono);font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#ffb3bf;}
.p6-alert-x{margin-top:4px;font-size:12px;line-height:1.5;color:#ffc9d1;}
.p6-alert-btn{
  flex-shrink:0;align-self:center;
  font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
  color:#ffd6dc;background:rgba(255,77,109,0.18);border:1px solid rgba(255,77,109,0.5);
  border-radius:9px;padding:8px 10px;cursor:pointer;transition:background .16s,transform .12s;
}
.p6-alert-btn:hover{background:rgba(255,77,109,0.3);}
.p6-alert-btn:active{transform:translateY(1px);}

/* ---------- material card ---------- */
.p6-card{
  position:relative;overflow:hidden;margin-bottom:13px;border-radius:17px;
  background:linear-gradient(180deg,rgba(18,28,47,0.82),rgba(9,15,27,0.9));
  border:1px solid var(--line);
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.06),0 16px 40px rgba(0,0,0,0.42);
  transition:border-color .2s,box-shadow .25s,transform .2s;
}
.p6-card::before{
  content:"";position:absolute;left:14px;right:14px;top:0;height:1px;
  background:linear-gradient(90deg,transparent,var(--hot),transparent);
}
.p6-card:hover{border-color:var(--line-2);box-shadow:inset 0 1px 0 rgba(255,255,255,0.07),0 20px 46px rgba(0,0,0,0.5),0 0 0 1px rgba(34,211,238,0.1);}
.p6-card.exp{border-color:rgba(255,77,109,0.5);box-shadow:inset 0 1px 0 rgba(255,255,255,0.05),0 16px 40px rgba(0,0,0,0.42),0 0 0 1px rgba(255,77,109,0.14);}
.p6-card.exp::before{background:linear-gradient(90deg,transparent,rgba(255,77,109,0.7),transparent);}

.p6-cardhead{display:flex;gap:12px;padding:14px 14px 10px;align-items:flex-start;}
.p6-thumbwrap{position:relative;width:68px;height:68px;flex-shrink:0;border-radius:14px;overflow:hidden;border:1px solid var(--line-2);background:#060a12;}
.p6-thumb{width:100%;height:100%;object-fit:cover;display:block;}
.p6-thumbwrap::after{
  content:"";position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(180deg,rgba(34,211,238,0.16),transparent 42%);
  mix-blend-mode:screen;
}
.p6-thumb-ph{
  width:68px;height:68px;flex-shrink:0;border-radius:14px;
  display:flex;align-items:center;justify-content:center;
  background:rgba(125,180,255,0.05);border:1px dashed var(--line-2);color:var(--dim);
}
.p6-cardinfo{flex:1;min-width:0;}
.p6-namerow{display:flex;align-items:center;gap:7px;flex-wrap:wrap;}
.p6-name{margin:0;font-size:15px;font-weight:700;letter-spacing:-0.01em;color:var(--txt);}
.p6-idx{
  margin-top:4px;display:inline-block;font-family:var(--mono);font-size:9px;
  letter-spacing:.14em;text-transform:uppercase;color:var(--dim);
}
.p6-code{margin-top:2px;font-family:var(--mono);font-size:11.5px;color:var(--soft);letter-spacing:.02em;}
.p6-meta{display:flex;align-items:center;gap:5px;margin-top:5px;font-size:11px;color:var(--muted);line-height:1.4;}

.p6-tag{
  display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:999px;
  font-family:var(--mono);font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
}
.p6-tag.ok{color:#7ff0c6;background:rgba(46,230,168,0.12);border:1px solid rgba(46,230,168,0.38);}
.p6-tag.bad{color:#ffb3bf;background:rgba(255,77,109,0.15);border:1px solid rgba(255,77,109,0.5);}
.p6-tag.neu{color:var(--muted);background:rgba(255,255,255,0.05);border:1px solid var(--line);}
.p6-tag-dot{width:5px;height:5px;border-radius:50%;background:var(--mint);box-shadow:0 0 7px var(--mint);}

.p6-totals{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:4px 14px 12px;}
.p6-total{
  display:flex;align-items:baseline;gap:6px;padding:9px 12px;border-radius:12px;
  background:rgba(34,211,238,0.05);border:1px solid rgba(34,211,238,0.16);
}
.p6-total-v{font-family:var(--mono);font-size:17px;font-weight:700;color:#8ce8fb;}
.p6-total-l{font-family:var(--mono);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);}

.p6-vblock{border-top:1px solid var(--line);padding:12px 14px;background:rgba(0,0,0,0.24);}
.p6-vtitle{font-family:var(--mono);font-size:9.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-bottom:9px;}
.p6-vrow{display:flex;align-items:center;gap:8px;padding:5px 0;}
.p6-vname-cell{display:flex;align-items:center;gap:7px;flex:1;min-width:0;}
.p6-vname{font-size:12.5px;font-weight:500;color:var(--soft);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.p6-vqty{font-family:var(--mono);font-size:10.5px;color:var(--muted);white-space:nowrap;}
.p6-vtons{font-family:var(--mono);font-size:12.5px;font-weight:700;color:#8ce8fb;white-space:nowrap;min-width:52px;text-align:right;}

.p6-note{
  display:flex;gap:8px;align-items:flex-start;margin:0 14px 12px;padding:10px 12px;
  border-radius:12px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.32);
  color:#cbbcfd;font-size:12px;line-height:1.5;
}
.p6-cardacts{display:flex;gap:8px;padding:0 14px 14px;}
.p6-act{
  flex:1;display:inline-flex;align-items:center;justify-content:center;gap:7px;
  min-height:42px;border-radius:12px;cursor:pointer;
  background:var(--glass);border:1px solid var(--line);color:var(--soft);
  font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;
  transition:background .16s,border-color .16s,color .16s,box-shadow .2s,transform .12s;
  -webkit-tap-highlight-color:transparent;
}
.p6-act:not(:disabled):hover{color:#fff;border-color:var(--hot);background:rgba(34,211,238,0.08);}
.p6-act:not(:disabled):active{transform:translateY(1px);}
.p6-act:disabled{opacity:.42;cursor:not-allowed;}
.p6-act.pri{
  color:#a5f0ff;background:linear-gradient(180deg,rgba(34,211,238,0.16),rgba(34,211,238,0.06));
  border-color:var(--hot);
}
.p6-act.pri:not(:disabled):hover{box-shadow:0 0 0 3px rgba(34,211,238,0.1),0 8px 22px rgba(34,211,238,0.18);}

/* ---------- fields ---------- */
.p6-field{margin-bottom:15px;}
.p6-labrow{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:7px;}
.p6-lab{font-family:var(--mono);font-size:10.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--soft);}
.p6-req{color:var(--cy);margin-left:3px;}
.p6-hint{font-family:var(--mono);font-size:10px;color:var(--muted);font-variant-numeric:tabular-nums;}
.p6-ctrl{position:relative;}
.p6-ctrl-i{position:absolute;left:12px;top:24px;transform:translateY(-50%);display:flex;color:var(--dim);pointer-events:none;z-index:1;transition:color .18s;}
.p6-ctrl:focus-within .p6-ctrl-i{color:var(--cy);}
.p6-helper{font-size:11px;color:var(--muted);line-height:1.5;margin-top:6px;}
.p6-err{display:flex;align-items:center;gap:6px;margin-top:6px;font-size:11.5px;color:#ff8fa3;font-weight:500;line-height:1.4;}

.p6-input,.p6-area{
  width:100%;background:rgba(125,180,255,0.05);color:var(--txt);
  border:1px solid var(--line);border-radius:12px;
  font-family:inherit;font-size:14px;outline:none;
  transition:border-color .18s,box-shadow .18s,background .18s;
}
.p6-input{height:48px;padding:0 12px 0 38px;}
.p6-area{min-height:92px;padding:11px 12px;line-height:1.5;resize:vertical;}
.p6-input:focus,.p6-area:focus{
  border-color:var(--hot);background:rgba(34,211,238,0.07);
  box-shadow:0 0 0 3px rgba(34,211,238,0.12),0 0 24px rgba(34,211,238,0.12) inset;
}
.p6-input::placeholder,.p6-area::placeholder{color:#55688a;}
.p6-date::-webkit-calendar-picker-indicator{
  filter:invert(0.78) sepia(0.7) saturate(4) hue-rotate(150deg);cursor:pointer;opacity:.9;
}
.p6-phone{
  display:flex;align-items:center;border-radius:12px;overflow:hidden;
  border:1px solid var(--line);background:rgba(125,180,255,0.05);
  transition:border-color .18s,box-shadow .18s,background .18s;
}
.p6-phone:focus-within{
  border-color:var(--hot);background:rgba(34,211,238,0.07);
  box-shadow:0 0 0 3px rgba(34,211,238,0.12);
}
.p6-prefix{
  height:48px;display:flex;align-items:center;padding:0 12px 0 14px;
  font-family:var(--mono);font-size:13px;font-weight:700;color:#8ce8fb;
  background:rgba(34,211,238,0.1);border-right:1px solid var(--line);flex-shrink:0;
}
.p6-phone input{
  flex:1;min-width:0;height:48px;padding:0 12px;background:transparent;color:var(--txt);
  border:none;outline:none;font-family:var(--mono);font-size:15px;letter-spacing:.08em;font-weight:600;
}
.p6-readout{display:flex;align-items:center;gap:6px;margin:-8px 0 15px;font-family:var(--mono);font-size:11px;color:#8ce8fb;letter-spacing:.06em;}

/* ---------- consent ---------- */
.p6-consent-wrap{margin:2px 0 18px;}
.p6-consent{
  display:flex;align-items:flex-start;gap:11px;cursor:pointer;padding:11px 12px;
  border-radius:13px;background:rgba(255,255,255,0.026);border:1px solid var(--line);
  transition:border-color .18s,background .18s;
}
.p6-consent:hover{border-color:var(--line-2);}
.p6-consent input{position:absolute;opacity:0;width:1px;height:1px;margin:0;}
.p6-box{
  width:22px;height:22px;border-radius:7px;flex-shrink:0;margin-top:1px;
  display:flex;align-items:center;justify-content:center;
  background:rgba(255,255,255,0.04);border:1px solid var(--line-2);
  transition:background .18s,border-color .18s,box-shadow .18s,transform .18s;
}
.p6-consent input:checked + .p6-box{
  background:linear-gradient(135deg,#22d3ee,#8b5cf6);border-color:transparent;
  box-shadow:0 0 16px rgba(34,211,238,0.45);transform:scale(1.04);
}
.p6-consent input:focus-visible + .p6-box{box-shadow:0 0 0 3px rgba(34,211,238,0.22);}
.p6-consent-t{font-size:12px;color:var(--soft);line-height:1.55;}

/* ---------- notice + steps ---------- */
.p6-notice{
  position:relative;overflow:hidden;padding:14px 15px;border-radius:16px;margin-bottom:13px;
  background:linear-gradient(180deg,rgba(139,92,246,0.13),rgba(34,211,238,0.05));
  border:1px solid rgba(139,92,246,0.3);box-shadow:inset 0 1px 0 rgba(255,255,255,0.06);
}
.p6-notice-h{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
.p6-notice-t{font-family:var(--mono);font-size:10.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#c4b5fd;}
.p6-notice-x{margin:0;font-size:12px;color:var(--soft);line-height:1.6;}

.p6-steps{padding:15px;border-radius:16px;background:rgba(255,255,255,0.028);border:1px solid var(--line);box-shadow:inset 0 1px 0 rgba(255,255,255,0.05);}
.p6-steps-t{font-family:var(--mono);font-size:10.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#8ce8fb;margin-bottom:13px;}
.p6-step{position:relative;display:flex;align-items:flex-start;gap:12px;padding-bottom:14px;}
.p6-step:last-child{padding-bottom:0;}
.p6-step:not(:last-child)::before{
  content:"";position:absolute;left:12px;top:24px;bottom:2px;width:1px;
  background:linear-gradient(180deg,var(--hot),rgba(139,92,246,0.28));
}
.p6-stepn{
  width:25px;height:25px;border-radius:50%;flex-shrink:0;z-index:1;
  display:flex;align-items:center;justify-content:center;
  font-family:var(--mono);font-size:11px;font-weight:700;color:#8ce8fb;
  background:rgba(6,11,20,0.95);border:1px solid var(--hot);
  box-shadow:0 0 12px rgba(34,211,238,0.2);
}
.p6-stept{flex:1;font-size:12.5px;color:var(--soft);line-height:1.5;padding-top:4px;}

/* ---------- footer ---------- */
.p6-footer{
  position:relative;z-index:4;flex-shrink:0;
  padding:12px 16px calc(14px + env(safe-area-inset-bottom,0px));
  background:linear-gradient(180deg,rgba(6,11,20,0.78),rgba(4,7,14,0.96));
  backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  border-top:1px solid var(--line);box-shadow:0 -16px 38px rgba(0,0,0,0.5);
}
@media (min-width:700px){.p6-footer{padding:12px 18px 16px;}}
.p6-submit{
  position:relative;overflow:hidden;
  display:flex;align-items:center;justify-content:center;gap:9px;
  width:100%;min-height:52px;border-radius:14px;cursor:pointer;
  background:linear-gradient(115deg,#22d3ee 0%,#3b9cf0 48%,#8b5cf6 100%);
  color:#04121b;font-family:var(--mono);font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
  border:1px solid rgba(255,255,255,0.26);
  box-shadow:0 12px 32px rgba(34,211,238,0.28),inset 0 1px 0 rgba(255,255,255,0.45);
  transition:transform .14s,box-shadow .2s,opacity .2s,filter .2s;
  -webkit-tap-highlight-color:transparent;
}
.p6-submit::after{
  content:"";position:absolute;top:0;bottom:0;width:38%;left:-45%;
  background:linear-gradient(100deg,transparent,rgba(255,255,255,0.45),transparent);
  animation:p6-shine 2.8s ease-in-out infinite;
}
.p6-submit:not(:disabled):hover{transform:translateY(-1px);box-shadow:0 18px 40px rgba(34,211,238,0.36),inset 0 1px 0 rgba(255,255,255,0.5);}
.p6-submit:not(:disabled):active{transform:translateY(0);}
.p6-submit:disabled{opacity:.45;cursor:not-allowed;box-shadow:none;filter:grayscale(.55);transform:none;}
.p6-submit:disabled::after{display:none;}

.p6-submit-err{
  display:flex;align-items:flex-start;gap:8px;padding:10px 12px;border-radius:12px;margin-bottom:10px;
  background:rgba(255,77,109,0.13);border:1px solid rgba(255,77,109,0.42);
}
.p6-submit-err span.t{flex:1;font-size:12px;color:#ffc9d1;line-height:1.45;}
.p6-dismiss{
  flex-shrink:0;font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
  color:#ffd6dc;background:rgba(255,77,109,0.18);border:1px solid rgba(255,77,109,0.5);
  border-radius:9px;padding:6px 10px;cursor:pointer;
}
.p6-fwarn{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:10px;font-family:var(--mono);font-size:10px;letter-spacing:.08em;color:#ff8fa3;text-transform:uppercase;}
.p6-fnote{display:flex;align-items:center;justify-content:center;gap:5px;margin-top:10px;font-family:var(--mono);font-size:9.5px;letter-spacing:.08em;color:var(--dim);text-transform:uppercase;}

/* ---------- overlays ---------- */
.p6-ov{
  position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;
  padding:16px;background:rgba(2,4,9,0.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
}
@media (min-width:700px){.p6-ov{padding:40px;}}
.p6-pv{
  width:100%;max-width:560px;max-height:100%;display:flex;flex-direction:column;overflow-y:auto;
  background:linear-gradient(180deg,#0d1626 0%,#060b15 100%);
  border:1px solid var(--line-2);border-radius:22px;
  box-shadow:0 44px 130px rgba(0,0,0,0.76),0 0 0 1px rgba(34,211,238,0.1),0 0 80px rgba(34,211,238,0.08);
}
.p6-pv-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid var(--line);}
.p6-pv-t{font-family:var(--mono);font-size:11.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#8ce8fb;}
.p6-close{
  display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:10px;
  background:var(--glass);border:1px solid var(--line);color:var(--soft);cursor:pointer;flex-shrink:0;
  transition:border-color .16s,color .16s,background .16s;
}
.p6-close:hover{border-color:var(--hot);color:#fff;background:rgba(34,211,238,0.08);}
.p6-pv-imgwrap{position:relative;background:#04070e;display:flex;align-items:center;justify-content:center;padding:12px;border-bottom:1px solid var(--line);}
.p6-pv-img{width:100%;max-height:300px;object-fit:contain;border-radius:12px;background:#04070e;}
@media (min-width:700px){.p6-pv-img{max-height:380px;}}
.p6-pv-noimg{display:flex;flex-direction:column;align-items:center;gap:10px;padding:48px 20px;color:var(--dim);font-size:13px;}
.p6-pv-body{padding:14px 16px 16px;display:flex;flex-direction:column;gap:8px;}
.p6-pv-row{display:flex;justify-content:space-between;gap:16px;font-size:12.5px;padding-bottom:7px;border-bottom:1px dashed var(--line);}
.p6-pv-row:last-of-type{border-bottom:none;}
.p6-pv-k{font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);}
.p6-pv-v{color:var(--txt);text-align:right;font-weight:600;}
.p6-pv-disc{
  margin:4px 0 0;font-size:11.5px;color:var(--muted);line-height:1.55;
  padding:10px 12px;border:1px dashed var(--line-2);border-radius:12px;background:rgba(255,255,255,0.026);
}

/* ---------- empty ---------- */
.p6-empty{display:flex;flex-direction:column;align-items:center;text-align:center;padding:46px 20px;gap:8px;}
.p6-empty-i{
  position:relative;width:76px;height:76px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;color:#8ce8fb;
  background:radial-gradient(circle at 34% 28%,rgba(34,211,238,0.3),rgba(139,92,246,0.12));
  border:1px solid var(--hot);box-shadow:0 0 50px rgba(34,211,238,0.18);
}
.p6-empty-i::after{content:"";position:absolute;inset:-8px;border-radius:50%;border:1px dashed rgba(34,211,238,0.28);animation:p6-spin 14s linear infinite;}
.p6-empty-t{font-size:19px;font-weight:700;margin-top:14px;color:var(--txt);letter-spacing:-0.01em;}
.p6-empty-x{font-size:13px;color:var(--muted);line-height:1.6;max-width:300px;margin:0 0 8px;}
.p6-empty-btn{
  margin-top:10px;display:inline-flex;align-items:center;justify-content:center;gap:8px;
  min-height:48px;padding:0 22px;border-radius:14px;cursor:pointer;
  background:linear-gradient(115deg,#22d3ee,#8b5cf6);color:#04121b;
  font-family:var(--mono);font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
  border:1px solid rgba(255,255,255,0.26);
  box-shadow:0 12px 30px rgba(34,211,238,0.3),inset 0 1px 0 rgba(255,255,255,0.45);
  transition:transform .14s,box-shadow .2s;
}
.p6-empty-btn:hover{transform:translateY(-1px);box-shadow:0 18px 38px rgba(34,211,238,0.38);}

/* ---------- success ---------- */
.p6-pop-ov{
  position:fixed;inset:0;z-index:1100;display:flex;align-items:center;justify-content:center;
  padding:20px;background:rgba(2,4,9,0.9);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
}
.p6-pop{
  position:relative;overflow:hidden;width:100%;max-width:400px;
  padding:30px 24px 24px;border-radius:26px;
  display:flex;flex-direction:column;align-items:center;text-align:center;
  background:linear-gradient(180deg,#0e1a2b 0%,#060b15 100%);
  border:1px solid rgba(46,230,168,0.32);
  box-shadow:0 44px 130px rgba(0,0,0,0.78),0 0 60px rgba(46,230,168,0.12);
}
.p6-pop-glow{position:absolute;top:-96px;left:50%;transform:translateX(-50%);width:280px;height:220px;pointer-events:none;background:radial-gradient(closest-side,rgba(46,230,168,0.2),transparent 70%);}
.p6-pop-sym{
  position:relative;width:66px;height:66px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;color:#04120b;
  background:radial-gradient(circle at 32% 28%,#7ef7c7,#22c48a);
  border:1px solid rgba(255,255,255,0.35);
  box-shadow:0 12px 36px rgba(46,230,168,0.42),inset 0 1px 0 rgba(255,255,255,0.5);
}
.p6-pop-sym::after,.p6-pop-sym::before{
  content:"";position:absolute;inset:-10px;border-radius:50%;
  border:1px solid rgba(46,230,168,0.4);animation:p6-ripple 2.6s ease-out infinite;
}
.p6-pop-sym::before{animation-delay:1.3s;}
.p6-pop-t{font-size:20px;font-weight:800;margin-top:18px;color:var(--txt);letter-spacing:-0.01em;}
.p6-pop-id{
  margin-top:9px;font-family:var(--mono);font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
  color:#8ce8fb;background:rgba(34,211,238,0.1);border:1px solid var(--hot);border-radius:999px;padding:6px 12px;
}
.p6-pop-st{margin-top:16px;display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7ff0c6;}
.p6-pop-dot{width:8px;height:8px;border-radius:50%;background:var(--mint);box-shadow:0 0 11px var(--mint);animation:p6-pulse 1.4s ease-in-out infinite;}
.p6-pop-x{margin-top:10px;font-size:12.5px;color:var(--muted);line-height:1.6;max-width:300px;}
.p6-pop-done{
  margin-top:22px;width:100%;height:50px;border-radius:14px;cursor:pointer;
  background:linear-gradient(115deg,#4ff0b6,#22c48a);color:#04120b;
  font-family:var(--mono);font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
  border:1px solid rgba(255,255,255,0.26);
  box-shadow:0 12px 30px rgba(46,230,168,0.3),inset 0 1px 0 rgba(255,255,255,0.45);
  transition:transform .14s,box-shadow .2s;
}
.p6-pop-done:hover{transform:translateY(-1px);box-shadow:0 18px 38px rgba(46,230,168,0.38);}

/* ---------- utilities ---------- */
.p6-spinner{
  width:16px;height:16px;border-radius:50%;flex-shrink:0;
  border:2px solid rgba(4,18,27,0.28);border-top-color:rgba(4,18,27,0.9);
  animation:p6-spin 700ms linear infinite;
}
.p6-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
.p6-root :focus-visible{outline:2px solid var(--cy);outline-offset:2px;}
.p6-root ::selection{background:rgba(34,211,238,0.3);}
.p6-fade{animation:p6-fade 180ms ease both;}
.p6-rise{animation:p6-rise 320ms cubic-bezier(.2,.8,.2,1) both;}
.p6-pop-in{animation:p6-popin 300ms cubic-bezier(.2,.9,.3,1.1) both;}

@keyframes p6-spin{to{transform:rotate(360deg);}}
@keyframes p6-fade{from{opacity:0;}to{opacity:1;}}
@keyframes p6-rise{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}}
@keyframes p6-popin{from{opacity:0;transform:scale(.92);}to{opacity:1;transform:scale(1);}}
@keyframes p6-pulse{0%,100%{opacity:1;}50%{opacity:.25;}}
@keyframes p6-breathe{0%,100%{opacity:.6;transform:scale(1);}50%{opacity:1;transform:scale(1.25);}}
@keyframes p6-grow{from{width:0;}}
@keyframes p6-shine{0%{left:-45%;}55%,100%{left:125%;}}
@keyframes p6-ripple{0%{transform:scale(.9);opacity:.7;}100%{transform:scale(1.5);opacity:0;}}
@keyframes p6-sweep{0%{top:-140px;}100%{top:100%;}}
@keyframes p6-drift-a{0%,100%{transform:translate(0,0);}50%{transform:translate(30px,-26px);}}
@keyframes p6-drift-b{0%,100%{transform:translate(0,0);}50%{transform:translate(-28px,26px);}}

@media (prefers-reduced-motion:reduce){
  .p6-root *,.p6-root *::before,.p6-root *::after{
    animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;
  }
  .p6-sweep{display:none;}
}
`;

/* ============================ icons ============================ */

const ICON_PATHS = {
  back: <path d="M15 18l-6-6 6-6" />,
  edit: <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />,
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </>
  ),
  location: (
    <>
      <path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  check: <path d="M20 6L9 17l-5-5" />,
  close: <path d="M18 6L6 18M6 6l12 12" />,
  truck: (
    <>
      <path d="M1 3h15v13H1z" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2" />
      <circle cx="18.5" cy="18.5" r="2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  alert: (
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </>
  ),
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  phone: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  ),
  note: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </>
  ),
  layers: (
    <>
      <path d="M12 2l10 6-10 6L2 8z" />
      <path d="M2 14l10 6 10-6" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  cpu: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    </>
  ),
  radar: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 12l6-4" />
    </>
  ),
  send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />,
};

function Icon({ name, size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICON_PATHS[name] || ICON_PATHS.info}
    </svg>
  );
}

/* ============================ helpers ============================ */

function getIndiaTodayParts() {
  const now = new Date();
  const ist = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 330 * 60000);
  return { year: ist.getUTCFullYear(), month: ist.getUTCMonth() + 1, day: ist.getUTCDate() };
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function parseDateKey(value) {
  if (typeof value !== "string" || !value) return null;
  const parts = value.split("-");
  if (parts.length !== 3) return null;
  const [y, m, d] = parts.map((p) => Number(p));
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return null;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return { year: y, month: m, day: d };
}

function isNotPastDate(value) {
  const parts = parseDateKey(value);
  if (!parts) return false;
  const t = getIndiaTodayParts();
  const startOfToday = new Date(t.year, t.month - 1, t.day).getTime();
  const selected = new Date(parts.year, parts.month - 1, parts.day).getTime();
  return selected >= startOfToday;
}

function isMaterialExpired(material) {
  const parts = parseDateKey(material && material.sampleExpiresAt);
  if (!parts) return false;
  const t = getIndiaTodayParts();
  const startOfToday = new Date(t.year, t.month - 1, t.day).getTime();
  const expiry = new Date(parts.year, parts.month - 1, parts.day).getTime();
  return expiry < startOfToday;
}

function formatDateDisplay(value) {
  const parts = parseDateKey(value);
  if (!parts) return value || "";
  const d = new Date(parts.year, parts.month - 1, parts.day);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "Not provided";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function normalizeStoredContact(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length > 10 && digits.slice(0, 2) === "91") {
    return digits.slice(2).slice(0, 10);
  }
  return digits.slice(0, 10);
}

function normalizeMaterials(items) {
  const result = [];
  items.forEach((raw) => {
    if (!raw || typeof raw !== "object") return;
    const rawVehicles = Array.isArray(raw.vehicles) ? raw.vehicles : [];
    const vehicles = rawVehicles
      .map((v) => {
        const quantity = Number(v && v.quantity) || 0;
        const capacityTons = Number(v && v.capacityTons) || 0;
        const totalTons = quantity > 0 ? capacityTons * quantity : 0;
        return {
          vehicleId: v && v.vehicleId !== undefined && v.vehicleId !== null ? v.vehicleId : "",
          vehicleName: v && v.vehicleName ? v.vehicleName : "Vehicle",
          capacityTons,
          quantity,
          totalTons: Math.round(totalTons * 100) / 100,
        };
      })
      .filter((v) => v.quantity > 0);
    if (vehicles.length === 0) return;
    const totalVehicles = vehicles.reduce((sum, v) => sum + v.quantity, 0);
    const totalTons =
      Math.round(vehicles.reduce((sum, v) => sum + v.totalTons, 0) * 100) / 100;
    result.push({
      sampleId: raw.sampleId !== undefined && raw.sampleId !== null ? raw.sampleId : "",
      materialName: raw.materialName || "Material",
      sampleCode: raw.sampleCode !== undefined && raw.sampleCode !== null ? raw.sampleCode : "",
      sampleImageUrl: raw.sampleImageUrl || "",
      sampleSourceArea: raw.sampleSourceArea || "",
      sampleUploadedAt: raw.sampleUploadedAt || "",
      sampleExpiresAt: raw.sampleExpiresAt || "",
      sampleAdminNote: raw.sampleAdminNote || "",
      vehicles,
      totalVehicles,
      totalTons,
      expired: isMaterialExpired(raw),
    });
  });
  return result;
}

function computeTotals(materials) {
  return {
    totalMaterials: materials.length,
    totalVehicles: materials.reduce((sum, m) => sum + (m.totalVehicles || 0), 0),
    totalTons:
      Math.round(materials.reduce((sum, m) => sum + (m.totalTons || 0), 0) * 100) / 100,
  };
}

function buildValidation(date, contact, address) {
  const errors = {};
  if (!date) {
    errors.requestedArrivalDate = "Choose a requested arrival date.";
  } else if (!isNotPastDate(date)) {
    errors.requestedArrivalDate = "Delivery date cannot be in the past.";
  }
  if (!contact || contact.length !== 10) {
    errors.contactNumber = "Enter the complete 10-digit mobile number.";
  }
  const trimmedAddress = String(address || "").trim();
  if (!trimmedAddress) {
    errors.deliveryAddress = "Enter the delivery address.";
  } else if (trimmedAddress.length < 10) {
    errors.deliveryAddress = "Delivery address must be at least 10 characters.";
  } else if (trimmedAddress.length > 1000) {
    errors.deliveryAddress = "Delivery address must be under 1,000 characters.";
  }
  return errors;
}

function useInjectedStyles() {
  useEffect(() => {
    const id = "page6-hud-css";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = CSS + CSS_2;
    document.head.appendChild(el);
  }, []);
}

/* ============================ components ============================ */

function Tile({ label, value, tone }) {
  return (
    <div className="p6-tile">
      <div className={`p6-tile-val ${tone || ""}`}>{value}</div>
      <div className="p6-tile-lab">{label}</div>
      <div className="p6-tile-bar">
        <i style={{ width: "100%" }} />
      </div>
    </div>
  );
}

function ReadinessRing({ percent }) {
  const r = 18;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - percent / 100);
  return (
    <div className="p6-ring-wrap">
      <svg className="p6-ring" width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke="rgba(125,180,255,0.14)"
          strokeWidth="3"
        />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke={percent === 100 ? "#2ee6a8" : "#22d3ee"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ filter: "drop-shadow(0 0 5px rgba(34,211,238,0.6))" }}
        />
      </svg>
      <span className="p6-ring-label" style={percent === 100 ? { color: "#7ff0c6" } : undefined}>
        {percent}%
      </span>
    </div>
  );
}

function SectionLabel({ icon, title, count }) {
  return (
    <div className="p6-sec">
      <span className="p6-sec-i">
        <Icon name={icon} size={11} strokeWidth={2} />
      </span>
      <span className="p6-sec-t">{title}</span>
      <span className="rule" />
      {count !== undefined ? <span className="p6-sec-n">{count}</span> : null}
    </div>
  );
}

function VehicleBreakdown({ vehicles }) {
  return (
    <div className="p6-vblock">
      <div className="p6-vtitle">Vehicle breakdown</div>
      {vehicles.map((v, i) => (
        <div className="p6-vrow" key={v.vehicleId || i}>
          <span className="p6-vname-cell">
            <Icon name="truck" size={13} color="#4a5b78" />
            <span className="p6-vname">{v.vehicleName}</span>
          </span>
          <span className="p6-vqty">
            {v.quantity} × {v.capacityTons} T
          </span>
          <span className="p6-vtons">{v.totalTons} T</span>
        </div>
      ))}
    </div>
  );
}

function SelectedMaterialCard({ material, index, busy, onViewImage, onEdit }) {
  const hasImage = !!material.sampleImageUrl;
  return (
    <article
      className={`p6-card p6-rise${material.expired ? " exp" : ""}`}
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
    >
      <div className="p6-cardhead">
        {hasImage ? (
          <div className="p6-thumbwrap">
            <img
              className="p6-thumb"
              src={material.sampleImageUrl}
              alt={`${material.materialName} sample reference`}
              loading="lazy"
            />
          </div>
        ) : (
          <div className="p6-thumb-ph" aria-hidden="true">
            <Icon name="image" size={20} />
          </div>
        )}

        <div className="p6-cardinfo">
          <div className="p6-namerow">
            <h3 className="p6-name">{material.materialName}</h3>
            {material.expired ? (
              <span className="p6-tag bad">
                <Icon name="alert" size={9} strokeWidth={2.6} />
                Expired
              </span>
            ) : material.sampleExpiresAt ? (
              <span className="p6-tag ok">
                <span className="p6-tag-dot" />
                Fresh
              </span>
            ) : (
              <span className="p6-tag neu">Expiry not set</span>
            )}
          </div>
          <div className="p6-idx">Material {pad2(index + 1)}</div>
          <div className="p6-code">
            {material.sampleCode ? `SMP · ${material.sampleCode}` : "Sample"}
          </div>
          <div className="p6-meta">
            <Icon name="location" size={11} color="#4a5b78" />
            {material.sampleSourceArea || "Source area not specified"}
          </div>
          <div className="p6-meta">
            <Icon name="clock" size={11} color="#4a5b78" />
            <span>
              Uploaded {formatDateTime(material.sampleUploadedAt)}
              {material.sampleExpiresAt
                ? ` · expires ${formatDateDisplay(material.sampleExpiresAt)}`
                : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="p6-totals">
        <div className="p6-total">
          <span className="p6-total-v">{material.totalVehicles}</span>
          <span className="p6-total-l">vehicles</span>
        </div>
        <div className="p6-total">
          <span className="p6-total-v">{material.totalTons}</span>
          <span className="p6-total-l">tons</span>
        </div>
      </div>

      <VehicleBreakdown vehicles={material.vehicles} />

      {material.sampleAdminNote ? (
        <div className="p6-note">
          <Icon name="info" size={13} color="#c4b5fd" />
          <span style={{ flex: 1 }}>{material.sampleAdminNote}</span>
        </div>
      ) : null}

      <div className="p6-cardacts">
        <button
          type="button"
          className="p6-act"
          onClick={() => onViewImage(material)}
          disabled={!hasImage || busy}
        >
          <Icon name="image" size={13} />
          View image
        </button>
        <button type="button" className="p6-act pri" onClick={onEdit} disabled={busy}>
          <Icon name="edit" size={12} />
          Edit
        </button>
      </div>
    </article>
  );
}

function DeliveryField({ label, required, error, helper, hint, icon, children }) {
  return (
    <div className="p6-field">
      <div className="p6-labrow">
        <span className="p6-lab">
          {label}
          {required ? (
            <span className="p6-req" aria-hidden="true">
              *
            </span>
          ) : null}
        </span>
        {hint ? <span className="p6-hint">{hint}</span> : null}
      </div>
      <div className="p6-ctrl">
        {icon ? (
          <span className="p6-ctrl-i" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {children}
      </div>
      {helper ? <div className="p6-helper">{helper}</div> : null}
      {error ? (
        <div role="alert" className="p6-err">
          <Icon name="alert" size={12} strokeWidth={2} />
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  );
}

function ImagePreview({ material, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (closeRef.current) closeRef.current.focus();
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const title = `${material.materialName} sample reference`;
  return (
    <div className="p6-ov p6-fade" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="p6-pv p6-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p6-pv-top">
          <span className="p6-pv-t">{title}</span>
          <button
            type="button"
            ref={closeRef}
            className="p6-close"
            onClick={onClose}
            aria-label="Close image preview"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="p6-pv-imgwrap">
          {material.sampleImageUrl ? (
            <img className="p6-pv-img" src={material.sampleImageUrl} alt={title} />
          ) : (
            <div className="p6-pv-noimg">
              <Icon name="image" size={32} />
              <span>No image available</span>
            </div>
          )}
        </div>

        <div className="p6-pv-body">
          <div className="p6-pv-row">
            <span className="p6-pv-k">Sample</span>
            <span className="p6-pv-v">{material.sampleCode || "Not provided"}</span>
          </div>
          <div className="p6-pv-row">
            <span className="p6-pv-k">Source area</span>
            <span className="p6-pv-v">{material.sampleSourceArea || "Not provided"}</span>
          </div>
          <div className="p6-pv-row">
            <span className="p6-pv-k">Uploaded</span>
            <span className="p6-pv-v">{formatDateTime(material.sampleUploadedAt)}</span>
          </div>
          <div className="p6-pv-row">
            <span className="p6-pv-k">Expires</span>
            <span className="p6-pv-v">
              {material.sampleExpiresAt ? formatDateDisplay(material.sampleExpiresAt) : "Not set"}
            </span>
          </div>
          {material.sampleAdminNote ? (
            <div className="p6-note" style={{ margin: 0 }}>
              <Icon name="info" size={13} color="#c4b5fd" />
              <span style={{ flex: 1 }}>{material.sampleAdminNote}</span>
            </div>
          ) : null}
          <p className="p6-pv-disc">
            This image is a visual material reference. Natural variation, lighting, moisture and
            dust may affect final appearance.
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyDraftState({ onGoBack }) {
  return (
    <div className="p6-empty p6-rise">
      <div className="p6-empty-i" aria-hidden="true">
        <Icon name="layers" size={30} />
      </div>
      <h2 className="p6-empty-t">No materials selected</h2>
      <p className="p6-empty-x">
        Return to Today's Materials and add at least one sample to your request.
      </p>
      <button type="button" className="p6-empty-btn" onClick={onGoBack}>
        <Icon name="arrowRight" size={15} color="#04121b" strokeWidth={2.4} />
        <span>Back to materials</span>
      </button>
    </div>
  );
}

function SuccessPopup({ request, onDone }) {
  const doneRef = useRef(null);

  useEffect(() => {
    if (doneRef.current) doneRef.current.focus();
  }, []);

  return (
    <div className="p6-pop-ov p6-fade">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="p6-success-title"
        aria-describedby="p6-success-text"
        className="p6-pop p6-pop-in"
      >
        <div className="p6-pop-glow" aria-hidden="true" />
        <div className="p6-pop-sym" aria-hidden="true">
          <Icon name="check" size={30} color="#04120b" strokeWidth={3} />
        </div>
        <h2 id="p6-success-title" className="p6-pop-t">
          Rate Request Submitted
        </h2>
        {request && request.publicRequestId ? (
          <div className="p6-pop-id">ID · {request.publicRequestId}</div>
        ) : null}
        <div className="p6-pop-st">
          <span className="p6-pop-dot" aria-hidden="true" />
          <span>Checking sellers</span>
        </div>
        <p id="p6-success-text" className="p6-pop-x">
          StoneRate has started checking material-wise rates and transport availability.
        </p>
        <button type="button" ref={doneRef} className="p6-pop-done" onClick={onDone}>
          Done
        </button>
      </div>
    </div>
  );
}

/* ============================ page ============================ */

export default function OrderConfirmationPage({ orderDraft, goToPage5, goToPage7 }) {
  useInjectedStyles();

  const orderItems = Array.isArray(orderDraft?.materials) ? orderDraft.materials : [];

  const normalizedMaterials = useMemo(() => normalizeMaterials(orderItems), [orderItems]);
  const totals = useMemo(() => computeTotals(normalizedMaterials), [normalizedMaterials]);
  const { totalMaterials, totalVehicles, totalTons } = totals;

  const todayKey = useMemo(() => {
    const t = getIndiaTodayParts();
    return `${t.year}-${pad2(t.month)}-${pad2(t.day)}`;
  }, []);

  const [requestedArrivalDate, setRequestedArrivalDate] = useState(
    () => (orderDraft && orderDraft.requestedArrivalDate) || ""
  );
  const [contactNumber, setContactNumber] = useState(() =>
    normalizeStoredContact(orderDraft && orderDraft.contactNumber)
  );
  const [deliveryAddress, setDeliveryAddress] = useState(
    () => (orderDraft && orderDraft.deliveryAddress) || ""
  );
  const [orderNotes, setOrderNotes] = useState(() => (orderDraft && orderDraft.notes) || "");
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [createdRequest, setCreatedRequest] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const liveErrors = useMemo(
    () => buildValidation(requestedArrivalDate, contactNumber, deliveryAddress),
    [requestedArrivalDate, contactNumber, deliveryAddress]
  );

  const hasExpiredSample = normalizedMaterials.some((m) => m.expired);
  const hasMaterials = normalizedMaterials.length > 0;

  const canSubmit =
    hasMaterials &&
    !hasExpiredSample &&
    !liveErrors.requestedArrivalDate &&
    !liveErrors.contactNumber &&
    !liveErrors.deliveryAddress &&
    confirmed &&
    !isSubmitting &&
    !submitted;

  // Readiness telemetry: 4 gates → date, contact, address, consent.
  const readiness = useMemo(() => {
    const gates = [
      !liveErrors.requestedArrivalDate,
      !liveErrors.contactNumber,
      !liveErrors.deliveryAddress,
      confirmed,
    ];
    const done = gates.filter(Boolean).length;
    return { done, total: gates.length, percent: Math.round((done / gates.length) * 100) };
  }, [liveErrors, confirmed]);

  const handleDateChange = (e) => {
    setRequestedArrivalDate(e.target.value);
    setValidationErrors((prev) => ({ ...prev, requestedArrivalDate: undefined }));
  };
  const handleDateBlur = () => {
    setValidationErrors((prev) => ({
      ...prev,
      requestedArrivalDate: liveErrors.requestedArrivalDate,
    }));
  };
  const handleContactChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setContactNumber(digits);
    setValidationErrors((prev) => ({ ...prev, contactNumber: undefined }));
  };
  const handleContactBlur = () => {
    setValidationErrors((prev) => ({ ...prev, contactNumber: liveErrors.contactNumber }));
  };
  const handleAddressChange = (e) => {
    setDeliveryAddress(e.target.value);
    setValidationErrors((prev) => ({ ...prev, deliveryAddress: undefined }));
  };
  const handleAddressBlur = () => {
    setValidationErrors((prev) => ({ ...prev, deliveryAddress: liveErrors.deliveryAddress }));
  };
  const handleNotesChange = (e) => {
    setOrderNotes(e.target.value.slice(0, 2000));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!canSubmit) return;
    setValidationErrors({});
    setIsSubmitting(true);
    setSubmitError(null);
    const completeOrderDraft = {
      ...orderDraft,
      materials: normalizedMaterials,
      totalMaterials,
      totalVehicles,
      totalTons,
      requestedArrivalDate,
      contactNumber,
      deliveryAddress,
      notes: orderNotes.trim(),
    };
    try {
      const result = await createRateRequest(completeOrderDraft);
      setCreatedRequest(result);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        (error && error.message) ||
          "We could not submit your rate request. Check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p6-root">
      <div className="p6-frame" role="region" aria-label="Rate request confirmation">
        <div className="p6-layer p6-grid" aria-hidden="true" />
        <div className="p6-layer p6-aurora-a" aria-hidden="true" />
        <div className="p6-layer p6-aurora-b" aria-hidden="true" />
        <div className="p6-layer p6-noise" aria-hidden="true" />
        <div className="p6-sweep" aria-hidden="true" />
        <span className="p6-corner tl" aria-hidden="true" />
        <span className="p6-corner tr" aria-hidden="true" />
        <span className="p6-corner bl" aria-hidden="true" />
        <span className="p6-corner br" aria-hidden="true" />

        {/* ---------------- header ---------------- */}
        <header className="p6-header">
          <div className="p6-topbar">
            <button
              type="button"
              className="p6-chip"
              onClick={goToPage5}
              disabled={isSubmitting}
              aria-label="Back to review"
            >
              <Icon name="back" size={14} />
              <span>Back</span>
            </button>
            <span className="p6-link-state">
              <span className="p6-dot" aria-hidden="true" />
              Final review
            </span>
            <button type="button" className="p6-chip" onClick={goToPage5} disabled={isSubmitting}>
              <Icon name="edit" size={13} />
              Edit
            </button>
          </div>

          <div className="p6-eyebrow">
            <Icon name="cpu" size={11} color="#22d3ee" />
            <span>Stage 06 / Rate request</span>
            <span className="rule" />
          </div>

          <h1 className="p6-title">Confirm Your Request</h1>
          <p className="p6-sub">
            Review the selected quality references and lock in your delivery details.
          </p>

          <div className="p6-deck">
            <Tile label="Materials" value={totalMaterials} tone="cy" />
            <Tile label="Vehicles" value={totalVehicles} />
            <Tile label="Tons" value={totalTons} tone="vi" />
          </div>

          {hasMaterials ? (
            <div className="p6-ready">
              <ReadinessRing percent={readiness.percent} />
              <div className="p6-ready-txt">
                <div className="p6-ready-t">Submission readiness</div>
                <div className="p6-ready-v">
                  {readiness.done} of {readiness.total} checks cleared
                  {hasExpiredSample ? " · expired sample blocks submit" : ""}
                </div>
              </div>
            </div>
          ) : null}
        </header>

        {/* ---------------- main ---------------- */}
        <main className="p6-main">
          {!hasMaterials ? (
            <EmptyDraftState onGoBack={goToPage5} />
          ) : (
            <>
              <SectionLabel icon="layers" title="Selected materials" count={pad2(totalMaterials)} />

              {hasExpiredSample ? (
                <div role="alert" className="p6-alert">
                  <Icon name="alert" size={16} color="#ff4d6d" />
                  <div className="p6-alert-b">
                    <div className="p6-alert-t">Expired sample detected</div>
                    <div className="p6-alert-x">
                      This daily sample has expired. Return to the material gallery and select a
                      fresh reference.
                    </div>
                  </div>
                  <button type="button" className="p6-alert-btn" onClick={goToPage5}>
                    Gallery
                  </button>
                </div>
              ) : null}

              {normalizedMaterials.map((material, index) => (
                <SelectedMaterialCard
                  key={material.sampleId || index}
                  material={material}
                  index={index}
                  busy={isSubmitting}
                  onViewImage={setPreviewItem}
                  onEdit={goToPage5}
                />
              ))}

              <form id="rate-request-form" noValidate onSubmit={handleSubmit}>
                <SectionLabel icon="radar" title="Delivery details" />

                <DeliveryField
                  label="Requested arrival date"
                  required
                  error={validationErrors.requestedArrivalDate}
                  icon={<Icon name="calendar" size={16} />}
                >
                  <input
                    type="date"
                    className="p6-input p6-date"
                    min={todayKey}
                    value={requestedArrivalDate}
                    onChange={handleDateChange}
                    onBlur={handleDateBlur}
                    aria-label="Requested arrival date"
                    aria-invalid={!!validationErrors.requestedArrivalDate}
                  />
                </DeliveryField>

                {requestedArrivalDate && isNotPastDate(requestedArrivalDate) ? (
                  <div className="p6-readout">
                    <Icon name="clock" size={12} color="#8ce8fb" />
                    <span>ETA · {formatDateDisplay(requestedArrivalDate)}</span>
                  </div>
                ) : null}

                <DeliveryField
                  label="Contact number"
                  required
                  error={validationErrors.contactNumber}
                >
                  <div className="p6-phone">
                    <span className="p6-prefix" aria-hidden="true">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      value={contactNumber}
                      maxLength={10}
                      onChange={handleContactChange}
                      onBlur={handleContactBlur}
                      placeholder="10-digit mobile number"
                      aria-label="Contact number"
                      aria-invalid={!!validationErrors.contactNumber}
                    />
                  </div>
                </DeliveryField>

                <DeliveryField
                  label="Delivery address"
                  required
                  error={validationErrors.deliveryAddress}
                  helper="Use the exact location where the vehicles should deliver the material."
                >
                  <textarea
                    className="p6-area"
                    value={deliveryAddress}
                    onChange={handleAddressChange}
                    onBlur={handleAddressBlur}
                    placeholder="Flat, street, area, landmark, city, state, PIN code"
                    aria-label="Delivery address"
                    aria-invalid={!!validationErrors.deliveryAddress}
                  />
                </DeliveryField>

                <DeliveryField label="Order notes" hint={`${orderNotes.length}/2000`}>
                  <textarea
                    className="p6-area"
                    value={orderNotes}
                    maxLength={2000}
                    onChange={handleNotesChange}
                    placeholder="Add access instructions, preferred calling time or site directions."
                    aria-label="Order notes"
                  />
                </DeliveryField>

                <div className="p6-consent-wrap">
                  <label className="p6-consent">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                    />
                    <span className="p6-box" aria-hidden="true">
                      {confirmed ? <Icon name="check" size={12} color="#04121b" strokeWidth={3.2} /> : null}
                    </span>
                    <span className="p6-consent-t">
                      I confirm that the selected material references, vehicle quantities,
                      requested delivery date, contact number and delivery address are correct.
                    </span>
                  </label>
                </div>
              </form>

              <div className="p6-notice">
                <div className="p6-notice-h">
                  <Icon name="lock" size={14} color="#c4b5fd" />
                  <span className="p6-notice-t">Rate enquiry only</span>
                </div>
                <p className="p6-notice-x">
                  No payment is required for this rate enquiry. Submitting this request does not
                  confirm delivery — StoneRate will first check material-wise rates and transport
                  availability.
                </p>
              </div>

              <div className="p6-steps">
                <div className="p6-steps-t">What happens next</div>
                {[
                  "Request submitted to StoneRate.",
                  "StoneRate checks material-wise rates and transport availability.",
                  "Buyer reviews and confirms the rates.",
                ].map((step, i) => (
                  <div className="p6-step" key={i}>
                    <span className="p6-stepn">{i + 1}</span>
                    <span className="p6-stept">{step}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>

        {/* ---------------- footer ---------------- */}
        {hasMaterials ? (
          <footer className="p6-footer">
            <div aria-live="polite">
              {submitError ? (
                <div role="alert" className="p6-submit-err">
                  <Icon name="alert" size={15} color="#ff4d6d" />
                  <span className="t">{submitError}</span>
                  <button
                    type="button"
                    className="p6-dismiss"
                    onClick={() => setSubmitError(null)}
                  >
                    Dismiss
                  </button>
                </div>
              ) : null}
            </div>

            <button
              type="submit"
              form="rate-request-form"
              className="p6-submit"
              disabled={!canSubmit}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="p6-spinner" aria-hidden="true" />
                  <span>Submitting…</span>
                  <span className="p6-sr" role="status">
                    Submitting
                  </span>
                </>
              ) : (
                <>
                  <Icon name="send" size={15} color="#04121b" strokeWidth={2.2} />
                  <span>Submit rate request</span>
                </>
              )}
            </button>

            {hasExpiredSample ? (
              <div role="status" className="p6-fwarn">
                <Icon name="alert" size={11} color="#ff8fa3" />
                <span>Submission locked — expired sample present</span>
              </div>
            ) : null}

            <div className="p6-fnote">
              <Icon name="lock" size={10} color="#4a5b78" />
              <span>Details used only for this rate enquiry</span>
            </div>
          </footer>
        ) : null}
      </div>

      {previewItem ? (
        <ImagePreview material={previewItem} onClose={() => setPreviewItem(null)} />
      ) : null}

      {submitted ? <SuccessPopup request={createdRequest} onDone={goToPage7} /> : null}
    </div>
  );
}
