import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getActiveSamples, recordSampleView } from "../api/sellerSamplesApi";
import { getBuyerFeetOptions } from "../api/sellerInformationApi";

/* ------------------------------------------------------------------ */
/*  StoneRate — Page 5 : Catalogue-first material selection            */
/*                                                                      */
/*  NOTE:                                                               */
/*  MATERIAL_SAMPLES below is temporary frontend demo data. In         */
/*  production this array will be REPLACED by a backend API call that  */
/*  returns the daily material gallery. Each record represents a       */
/*  daily material listing that expires 24 hours after upload.         */
/* ------------------------------------------------------------------ */

const CATEGORIES = ["All", "20mm", "40mm", "GSB", "M-Sand", "Stone Dust"];
const DEFAULT_FEET_OPTIONS = [1000,1100,1200,1300].map((feet,index)=>({id:`feet-${feet}`,name:`${feet} feet`,capacity:feet,displayOrder:index+1}));

const MAX_PER_VEHICLE = 100;

function canonicalBuyerMaterial(value) {
  const name = String(value || "").trim();
  if (name.startsWith("20mm")) return "20mm Crushed Stone";
  if (name.startsWith("40mm")) return "40mm Crushed Stone";
  if (name === "GSB" || name.startsWith("GSB ")) return "GSB";
  if (name === "M-Sand" || name.startsWith("M-Sand ")) return "M-Sand";
  if (name === "Stone Dust") return "Stone Dust";
  return "";
}

function buyerCategory(value) {
  const material = canonicalBuyerMaterial(value);
  if (material === "20mm Crushed Stone") return "20mm";
  if (material === "40mm Crushed Stone") return "40mm";
  return material;
}

function mapApiSample(sample) {
  const materialName = canonicalBuyerMaterial(
    sample.materialName || sample.material
  );
  return {
    id: sample.id,
    sampleCode: sample.sampleCode || "",
    materialName,
    category: buyerCategory(materialName),
    imageUrl: sample.imageUrl || "",
    sourceArea: sample.sourceArea || "Source protected",
    sellerCity: String(sample.sellerCity || "").trim(),
    rateUnit: String(sample.rateUnit || "ton").toLowerCase(),
    materialRatePerFeet:
      sample.materialRatePerFeet === null ||
      sample.materialRatePerFeet === undefined
        ? null
        : Number(sample.materialRatePerFeet),
    conversionSource: sample.conversionSource || null,
    uploadedAt: sample.uploadedAt || sample.createdAt,
    expiresAt: sample.expiresAt,
    availability: sample.availability || "available",
    adminNote: sample.adminNote || "",
  };
}
const DISCLAIMER =
  "This image is a visual material reference. Natural variation, lighting, moisture and dust may affect final appearance.";

/* ------------------------------------------------------------------ */
/*  Small utilities                                                     */
/* ------------------------------------------------------------------ */

function isExpired(sample) {
  return new Date(sample.expiresAt).getTime() < Date.now();
}

function formatUploadLabel(uploadedAt) {
  const d = new Date(uploadedAt);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return sameDay ? `Uploaded today · ${time}` : `Uploaded ${d.toLocaleDateString()}`;
}

function availabilityText(sample) {
  if (isExpired(sample)) return "Expired";
  if (sample.availability === "limited") return "Limited";
  return "Available";
}

/* Convert a cart item's vehicles array back to a { vehicleId: qty } map */
function vehiclesToQtyMap(vehicleList, options = DEFAULT_FEET_OPTIONS) {
  const map = {};
  options.forEach((v) => (map[v.id] = 0));
  (vehicleList || []).forEach((v) => {
    map[v.optionId || v.vehicleId] = v.quantity;
  });
  return map;
}

/* ------------------------------------------------------------------ */
/*  Viewport hook                                                       */
/* ------------------------------------------------------------------ */

function useViewport() {
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 390,
    height: typeof window !== "undefined" ? window.innerHeight : 844,
  }));

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    let frame = null;
    const onResize = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        setViewport({ width: window.innerWidth, height: window.innerHeight })
      );
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return { ...viewport, isDesktop: viewport.width >= 700 };
}

/* ------------------------------------------------------------------ */
/*  Global CSS (animations, reduced-motion, scrollbars, safe areas)     */
/* ------------------------------------------------------------------ */

const globalCss = `
:root { color-scheme: light; }
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
.sr-hide-scroll::-webkit-scrollbar { display: none; }
.sr-hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
.sr-scroll::-webkit-scrollbar { width: 6px; }
.sr-scroll::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.35); border-radius: 8px; }

@keyframes sr-pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .35; transform: scale(.82); } }
@keyframes sr-rise { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes sr-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes sr-shimmer { 0% { background-position: -420px 0; } 100% { background-position: 420px 0; } }
@keyframes sr-spin { to { transform: rotate(360deg); } }

/* Selected-state high-tech animations */
@keyframes sr-glow {
  0%,100% { box-shadow: 0 0 0 1px rgba(245,158,11,0.55), 0 6px 20px rgba(245,158,11,0.35); }
  50% { box-shadow: 0 0 0 1px rgba(245,158,11,0.9), 0 10px 30px rgba(245,158,11,0.65); }
}
@keyframes sr-sweep {
  0% { transform: translateX(-160%) skewX(-18deg); }
  55%,100% { transform: translateX(320%) skewX(-18deg); }
}
@keyframes sr-tick-pop {
  0% { transform: scale(0) rotate(-30deg); opacity: 0; }
  60% { transform: scale(1.25) rotate(8deg); opacity: 1; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}
.sr-glow { animation: sr-glow 2.2s infinite ease-in-out; }
.sr-shine { position: relative; overflow: hidden; }
.sr-shine::after {
  content: "";
  position: absolute;
  top: 0; left: 0; height: 100%; width: 45%;
  background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%);
  transform: translateX(-160%) skewX(-18deg);
  animation: sr-sweep 2.6s infinite;
  pointer-events: none;
}
.sr-tick-pop { animation: sr-tick-pop .45s cubic-bezier(.22,1.4,.4,1); }

.sr-sheet { animation: sr-rise .28s cubic-bezier(.22,1,.36,1); }
.sr-fade { animation: sr-fade .2s ease; }
.sr-skel {
  background: linear-gradient(90deg, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.09) 37%, rgba(0,0,0,0.05) 63%);
  background-size: 840px 100%;
  animation: sr-shimmer 1.3s infinite linear;
}
.sr-spinner {
  width: 34px; height: 34px; border-radius: 50%;
  border: 3px solid rgba(245,158,11,0.2);
  border-top-color: #f59e0b;
  animation: sr-spin .8s linear infinite;
}
.sr-press { transition: transform .12s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease; }
.sr-press:active { transform: scale(.97); }
.sr-focusable:focus-visible { outline: 2px solid #f59e0b; outline-offset: 2px; border-radius: 12px; }

@media (prefers-reduced-motion: reduce) {
  *, .sr-sheet, .sr-fade, .sr-skel, .sr-spinner, .sr-press, .sr-glow, .sr-shine::after, .sr-tick-pop {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
}
`;

/* ------------------------------------------------------------------ */
/*  Styles                                                              */
/* ------------------------------------------------------------------ */

function createStyles(viewport) {
  const { isDesktop } = viewport;

  /* ---- Light theme palette (matches Page 4 / Page 9) ---- */
  const amber = "#f59e0b";
  const amberDeep = "#ea580c";
  const amberText = "#b45309";
  const amberTint = "#fffbeb";
  const amberChip = "#fef3c7";
  const amberChipText = "#92400e";
  const amberBorder = "#fde68a";

  const pageBg = "#f4f1ea";
  const surface = "#ffffff";
  const surfaceAlt = "#fafaf9";
  const surfaceSoft = "#f5f5f4";
  const scrollBg = "#f6f4ef";
  const border = "#e7e5e4";
  const borderSoft = "#eeeae6";

  const inkStrong = "#111827";
  const ink = "#292524";
  const inkDim = "#78716c";
  const inkFaint = "#a8a29e";

  /* Dark charcoal → amber header + dark totals cards (as in your pages) */
  const headerGradient =
    "radial-gradient(circle at 88% 8%, rgba(245,158,11,0.38), transparent 32%), linear-gradient(135deg, #080706, #1c1917 52%, #78350f)";
  const darkCard = "linear-gradient(135deg, #020617, #292524)";

  const FONT = "Arial, Helvetica, sans-serif";

  return {
    amber,
    inkDim,
    appViewport: {
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      alignItems: isDesktop ? "center" : "stretch",
      justifyContent: "center",
      background: isDesktop ? pageBg : surface,
      padding: isDesktop ? "24px" : 0,
      fontFamily: FONT,
    },
    phoneFrame: {
      position: "relative",
      overflow: "hidden",
      width: isDesktop ? 390 : "100%",
      height: isDesktop ? 844 : "100dvh",
      maxWidth: "100%",
      background: scrollBg,
      color: inkStrong,
      borderRadius: isDesktop ? 40 : 0,
      border: isDesktop ? "1px solid rgba(0,0,0,0.06)" : "none",
      boxShadow: isDesktop ? "0 25px 70px rgba(0,0,0,0.22)" : "none",
    },
    appRoot: {
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    },

    /* Header (dark charcoal → amber, white text) */
    header: {
      position: "relative",
      zIndex: 5,
      flex: "0 0 auto",
      padding: "calc(env(safe-area-inset-top) + 12px) 16px 13px",
      background: headerGradient,
      color: "#ffffff",
      borderBottom: "1px solid rgba(245,158,11,0.25)",
      boxShadow: "0 12px 28px rgba(28,25,23,0.22)",
    },
    headerRow: { display: "flex", alignItems: "center", gap: 12 },
    iconBtn: {
      flex: "0 0 auto",
      width: 40,
      height: 40,
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.18)",
      background:
        "linear-gradient(145deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))",
      color: "#ffffff",
      fontSize: 18,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    },
    logoMark: {
      width: 40,
      height: 40,
      borderRadius: 12,
      flex: "0 0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 900,
      fontSize: 15,
      letterSpacing: 0.5,
      color: "#ffffff",
      background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
      boxShadow: "0 6px 18px rgba(234,88,12,0.4)",
    },
    headerTitleWrap: { flex: "1 1 auto", minWidth: 0 },
    headerTitle: {
      fontSize: 16,
      fontWeight: 900,
      margin: 0,
      lineHeight: 1.1,
      color: "#ffffff",
    },
    headerSub: {
      fontSize: 11.5,
      color: "#fde68a",
      margin: "2px 0 0",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    cartIconBtn: {
      position: "relative",
      flex: "0 0 auto",
      width: 40,
      height: 40,
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.18)",
      background:
        "linear-gradient(145deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))",
      color: "#ffffff",
      fontSize: 18,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    },
    cartBadge: {
      position: "absolute",
      top: -6,
      right: -6,
      minWidth: 18,
      height: 18,
      padding: "0 5px",
      borderRadius: 9,
      background: "linear-gradient(135deg, #f59e0b, #ea580c)",
      color: "#ffffff",
      fontSize: 11,
      fontWeight: 900,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "2px solid #1c1917",
    },
    liveRow: { display: "flex", alignItems: "center", gap: 6, marginTop: 10 },
    liveDot: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: "#22c55e",
      boxShadow: "0 0 10px rgba(34,197,94,0.9)",
      animation: "sr-pulse 1.6s infinite ease-in-out",
    },
    liveText: { fontSize: 11, color: "#e7e5e4", letterSpacing: 0.3 },

    /* Category strip */
    catStrip: {
      flex: "0 0 auto",
      display: "flex",
      gap: 8,
      padding: "12px 16px",
      overflowX: "auto",
      overflowY: "hidden",
      whiteSpace: "nowrap",
      background: surface,
      borderBottom: `1px solid ${border}`,
    },
    catChip: {
      flex: "0 0 auto",
      padding: "8px 15px",
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer",
      border: `1px solid ${border}`,
      background: surface,
      color: inkDim,
    },
    catChipActive: {
      border: "1px solid transparent",
      background: "linear-gradient(135deg, #f59e0b, #ea580c)",
      color: "#ffffff",
      boxShadow: "0 8px 18px rgba(245,158,11,0.28)",
    },

    /* Scroll area */
    scrollArea: {
      flex: "1 1 auto",
      overflowY: "auto",
      overflowX: "hidden",
      padding: "14px 14px 140px",
      background: scrollBg,
      WebkitOverflowScrolling: "touch",
    },
    list: { display: "flex", flexDirection: "column", gap: 14 },

    /* Full-width sample card: 60% image on top, 40% details below */
    card: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      borderRadius: 24,
      overflow: "hidden",
      background: "linear-gradient(145deg, #ffffff, #fbfcff)",
      border: "1px solid rgba(148,163,184,.24)",
      boxShadow: "0 16px 38px rgba(15,23,42,.10), inset 0 1px 0 #ffffff",
    },
    cardSelected: {
      border: `1px solid ${amberText}`,
      background: "linear-gradient(135deg, #fffbeb, #f5f5f4)",
      boxShadow:
        "0 0 0 1px rgba(245,158,11,.55), 0 14px 32px rgba(245,158,11,.28)",
    },
    /* 60% — image area (10:9 keeps image ≈60% of total card height) */
    cardImgBtn: {
      position: "relative",
      display: "block",
      width: "100%",
      aspectRatio: "10 / 9",
      flex: "0 0 auto",
      padding: 0,
      border: "none",
      borderBottom: `1px solid ${border}`,
      background: surfaceSoft,
      cursor: "pointer",
      overflow: "hidden",
    },
    cardImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
    imgFallback: {
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      color: inkDim,
      fontSize: 12,
      background: "linear-gradient(135deg, #f5f5f4, #e7e5e4)",
    },
    badge: {
      position: "absolute",
      top: 12,
      left: 12,
      padding: "5px 11px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 800,
      letterSpacing: 0.3,
      boxShadow: "0 4px 12px rgba(0,0,0,0.16)",
    },
    /* Sample code overlay — bottom-left on the image */
    codeOverlay: {
      position: "absolute",
      left: 12,
      bottom: 12,
      maxWidth: "calc(100% - 24px)",
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      padding: "6px 12px",
      borderRadius: 10,
      background: "rgba(12,10,9,.62)",
      border: "1px solid rgba(255,255,255,.18)",
      color: "#ffffff",
      fontSize: 12,
      fontWeight: 800,
      letterSpacing: 0.2,
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      textShadow: "0 1px 3px rgba(0,0,0,.4)",
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
    },
    codeOverlayMark: { color: "#fcd34d", flex: "0 0 auto" },
    selectedTick: {
      position: "absolute",
      top: 12,
      right: 12,
      width: 32,
      height: 32,
      borderRadius: "50%",
      background: "linear-gradient(135deg, #f59e0b, #ea580c)",
      color: "#ffffff",
      fontSize: 17,
      fontWeight: 900,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 6px 16px rgba(234,88,12,0.42)",
    },
    /* 40% — details area */
    cardBody: {
      minWidth: 0,
      padding: "14px 14px 15px",
      flex: "1 1 auto",
      display: "flex",
      flexDirection: "column",
    },
    cardTopRow: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 10,
    },
    cardName: {
      fontSize: 17,
      fontWeight: 950,
      lineHeight: 1.15,
      color: inkStrong,
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    cardWhen: {
      flex: "0 0 auto",
      fontSize: 12,
      fontWeight: 800,
      color: inkFaint,
      whiteSpace: "nowrap",
    },
    identityRow: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginTop: 9 },
    codePill: { display: "inline-flex", alignItems: "center", minHeight: 22, padding: "0 8px", borderRadius: 7, background: "#f1f5f9", color: "#475569", fontSize: 9.5, fontWeight: 850, letterSpacing: .2 },
    locationPill: {
      display: "inline-flex",
      alignSelf: "flex-start",
      alignItems: "center",
      gap: 5,
      marginTop: 9,
      minHeight: 26,
      padding: "0 11px",
      border: "1px solid rgba(14,165,233,.20)",
      borderRadius: 8,
      background: "#f0f9ff",
      color: "#0369a1",
      fontSize: 12,
      fontWeight: 800,
    },
    locationValue: { fontWeight: 900, color: "#075985" },
    cityPill: { display: "inline-flex", alignItems: "center", gap: 4, minHeight: 22, padding: "0 8px", border: "1px solid rgba(14,165,233,.18)", borderRadius: 7, background: "#f0f9ff", color: "#0369a1", fontSize: 9.5, fontWeight: 850 },
    cardMeta: { fontSize: 10, color: inkFaint, lineHeight: 1.3, marginTop: 7, fontWeight: 700 },
    /* Rate block — label on top, rate + transport on one line */
    ratePanel: {
      marginTop: 12,
      padding: "10px 13px 12px",
      border: "1px solid rgba(245,158,11,.24)",
      borderRadius: 16,
      background: "linear-gradient(135deg,rgba(255,251,235,.96),rgba(255,247,237,.93))",
      boxShadow: "inset 0 1px 0 #fff, 0 6px 16px rgba(245,158,11,.10)",
    },
    rateLabel: {
      display: "block",
      fontSize: 13,
      fontWeight: 850,
      color: amberChipText,
      letterSpacing: 0.1,
      marginBottom: 5,
    },
    rateLine: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
    rateMain: { display: "flex", alignItems: "baseline", gap: 4, minWidth: 0 },
    rateValue: { color: "#111827", fontSize: 23, lineHeight: 1, fontWeight: 950, letterSpacing: -.4 },
    rateUnit: { color: "#64748b", fontSize: 12, fontWeight: 850 },
    rateDivider: {
      width: 1,
      height: 23,
      flex: "0 0 auto",
      background:
        "linear-gradient(180deg, rgba(245,158,11,0), rgba(245,158,11,.55), rgba(245,158,11,0))",
    },
    chargeGroup: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 },
    chargeText: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 12px 4px 5px",
      border: "1px solid rgba(249,115,22,.30)",
      borderRadius: 999,
      background: "linear-gradient(135deg,#ffffff,#fff7ed)",
      color: "#c2410c",
      fontSize: 12,
      lineHeight: 1,
      fontWeight: 900,
      whiteSpace: "nowrap",
      boxShadow: "0 3px 9px rgba(234,88,12,.13)",
    },
    chargePlus: {
      flex: "0 0 auto",
      width: 20,
      height: 20,
      borderRadius: "50%",
      background: "linear-gradient(135deg, #f59e0b, #ea580c)",
      color: "#ffffff",
      fontSize: 14,
      lineHeight: 1,
      fontWeight: 900,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 2px 6px rgba(234,88,12,.32)",
    },
    rateUnavailable: { marginTop: 10, color: "#b91c1c", fontSize: 12, fontWeight: 800 },
    /* Select / Selected control — full width CTA */
    selectBtn: {
      marginTop: 13,
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: "13px 0",
      borderRadius: 15,
      border: `1px solid ${amber}`,
      background: amberTint,
      color: amberText,
      fontSize: 15,
      fontWeight: 900,
      letterSpacing: 0.2,
      cursor: "pointer",
    },
    selectBtnActive: {
      border: "1px solid transparent",
      background: "linear-gradient(135deg, #f59e0b, #ea580c)",
      color: "#ffffff",
      boxShadow: "0 10px 26px rgba(234,88,12,0.28)",
    },
    selectBtnDisabled: {
      background: surfaceSoft,
      color: inkFaint,
      border: `1px solid ${border}`,
      cursor: "not-allowed",
      boxShadow: "none",
    },
    selectIconIdle: {
      width: 20,
      height: 20,
      borderRadius: "50%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 14,
      fontWeight: 900,
      background: amberChip,
      color: amberText,
      border: `1px solid ${amberBorder}`,
    },
    selectIconActive: {
      width: 20,
      height: 20,
      borderRadius: "50%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 13,
      fontWeight: 900,
      background: "rgba(255,255,255,0.25)",
      color: "#ffffff",
    },

    /* States */
    stateWrap: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: 10,
      padding: "56px 24px",
      color: inkDim,
    },
    stateEmoji: { fontSize: 34, opacity: 0.85 },
    stateTitle: { fontSize: 15, fontWeight: 900, color: inkStrong },
    stateText: { fontSize: 12.5, maxWidth: 260, lineHeight: 1.5 },

    /* Floating cart button */
    floatWrap: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      padding: "10px 14px calc(env(safe-area-inset-bottom) + 14px)",
      background:
        "linear-gradient(180deg, rgba(246,244,239,0) 0%, rgba(246,244,239,0.95) 45%)",
      zIndex: 6,
      pointerEvents: "none",
    },
    floatBtn: {
      pointerEvents: "auto",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "14px 18px",
      borderRadius: 18,
      border: "1px solid transparent",
      background: "linear-gradient(135deg, #f59e0b, #ea580c)",
      color: "#ffffff",
      cursor: "pointer",
      boxShadow: "0 14px 30px rgba(234,88,12,0.35)",
    },
    floatBtnLabel: { fontSize: 14.5, fontWeight: 900 },
    floatBtnMeta: { fontSize: 11.5, fontWeight: 800, opacity: 0.92 },

    /* Overlays */
    overlay: {
      position: "absolute",
      inset: 0,
      zIndex: 20,
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      background: "rgba(28,25,23,0.45)",
      backdropFilter: "blur(3px)",
      WebkitBackdropFilter: "blur(3px)",
    },
    sheet: {
      position: "relative",
      background: surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderTop: "1px solid rgba(245,158,11,0.3)",
      borderLeft: `1px solid ${border}`,
      borderRight: `1px solid ${border}`,
      borderBottom: "none",
      maxHeight: "90%",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      boxShadow: "0 -18px 50px rgba(28,25,23,0.22)",
    },
    sheetHandle: {
      width: 44,
      height: 5,
      borderRadius: 3,
      background: "linear-gradient(90deg, #f59e0b, #fde68a)",
      margin: "10px auto 4px",
      flex: "0 0 auto",
    },
    sheetScroll: {
      overflowY: "auto",
      padding: "8px 18px calc(env(safe-area-inset-bottom) + 16px)",
      color: inkStrong,
    },
    sheetTitle: { fontSize: 16.5, fontWeight: 900, margin: "4px 0 2px", color: inkStrong, letterSpacing: 0.2 },
    sheetHeaderRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 12,
    },
    sheetHeaderLeft: { display: "flex", alignItems: "center", gap: 10, minWidth: 0 },
    sheetHeaderIcon: {
      width: 34,
      height: 34,
      borderRadius: 11,
      flex: "0 0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 16,
      background: "linear-gradient(135deg, #f59e0b, #ea580c)",
      color: "#ffffff",
      boxShadow: "0 6px 16px rgba(234,88,12,0.35)",
    },

    /* Quantity sheet */
    thumbRow: { display: "flex", gap: 12, alignItems: "center", margin: "8px 0 4px" },
    thumb: {
      width: 66,
      height: 66,
      borderRadius: 16,
      objectFit: "cover",
      border: `1px solid ${amberBorder}`,
      boxShadow: "0 6px 16px rgba(245,158,11,0.18)",
      flex: "0 0 auto",
      background: surfaceSoft,
    },
    disclaimer: {
      fontSize: 11,
      lineHeight: 1.45,
      color: amberChipText,
      background: amberTint,
      border: `1px solid ${amberBorder}`,
      borderRadius: 12,
      padding: "9px 11px",
      margin: "12px 0",
    },
    vRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      padding: "12px 13px",
      borderRadius: 16,
      background: surfaceAlt,
      border: `1px solid ${border}`,
      marginBottom: 10,
      transition: "border-color .2s ease, box-shadow .2s ease, background .2s ease",
    },
    vRowActive: {
      border: `1px solid ${amberText}`,
      background: "linear-gradient(135deg, #fffbeb, #f5f5f4)",
      boxShadow: "0 8px 20px rgba(245,158,11,0.14)",
    },
    vName: { fontSize: 13.5, fontWeight: 800, color: inkStrong },
    vCap: { fontSize: 11, color: inkDim, marginTop: 2 },
    stepper: { display: "flex", alignItems: "center", gap: 8 },
    stepBtn: {
      width: 36,
      height: 36,
      borderRadius: 11,
      border: `1px solid ${border}`,
      background: surfaceSoft,
      color: ink,
      fontSize: 19,
      fontWeight: 800,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    stepBtnPlus: {
      border: "1px solid transparent",
      background: "linear-gradient(135deg, #f59e0b, #ea580c)",
      color: "#ffffff",
      boxShadow: "0 4px 12px rgba(234,88,12,0.3)",
    },
    stepBtnDisabled: { opacity: 0.4, cursor: "not-allowed", boxShadow: "none" },
    stepVal: { minWidth: 28, textAlign: "center", fontSize: 16, fontWeight: 900, color: amberText },
    totalsBox: { display: "flex", gap: 10, margin: "8px 0 14px" },
    totalCard: {
      flex: 1,
      textAlign: "center",
      padding: "13px 8px",
      borderRadius: 16,
      background: darkCard,
      border: "1px solid rgba(0,0,0,0.15)",
      boxShadow: "0 10px 24px rgba(28,25,23,0.18)",
    },
    totalNum: { fontSize: 22, fontWeight: 900, color: "#fbbf24" },
    totalLbl: { fontSize: 10.5, color: "#d6d3d1", marginTop: 3, letterSpacing: 0.4, fontWeight: 700 },
    sheetActions: { display: "flex", gap: 10, marginTop: 4 },
    ghostBtn: {
      flex: 1,
      padding: "13px 0",
      borderRadius: 14,
      border: `1px solid ${border}`,
      background: surfaceSoft,
      color: ink,
      fontSize: 14,
      fontWeight: 800,
      cursor: "pointer",
    },
    primaryBtn: {
      flex: 1.4,
      padding: "13px 0",
      borderRadius: 14,
      border: "1px solid transparent",
      background: "linear-gradient(135deg, #f59e0b, #ea580c)",
      color: "#ffffff",
      fontSize: 14,
      fontWeight: 900,
      cursor: "pointer",
      boxShadow: "0 10px 24px rgba(234,88,12,0.28)",
    },
    primaryBtnDisabled: {
      background: border,
      color: inkFaint,
      cursor: "not-allowed",
      boxShadow: "none",
    },

    /* Replacement confirm */
    replaceBox: {
      borderRadius: 16,
      border: `1px solid ${amberBorder}`,
      background: amberTint,
      padding: 16,
      margin: "10px 0",
      textAlign: "center",
    },
    replaceTitle: { fontSize: 14.5, fontWeight: 900, marginBottom: 6, color: inkStrong },
    replaceText: { fontSize: 12.5, color: inkDim, lineHeight: 1.5, marginBottom: 14 },

    /* Image preview (dark backdrop for image focus) */
    previewOverlay: {
      position: "absolute",
      inset: 0,
      zIndex: 30,
      background: "rgba(12,10,9,0.94)",
      display: "flex",
      flexDirection: "column",
    },
    previewTop: {
      display: "flex",
      justifyContent: "flex-end",
      padding: "calc(env(safe-area-inset-top) + 12px) 14px 8px",
    },
    previewImgWrap: {
      flex: "1 1 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 16px",
      minHeight: 0,
    },
    previewImg: {
      maxWidth: "100%",
      maxHeight: "100%",
      borderRadius: 18,
      objectFit: "contain",
      border: "1px solid rgba(255,255,255,0.12)",
    },
    previewInfo: {
      flex: "0 0 auto",
      padding: "14px 18px calc(env(safe-area-inset-bottom) + 16px)",
    },

    /* Cart */
    cartItem: {
      display: "flex",
      gap: 12,
      padding: 12,
      borderRadius: 18,
      background: surfaceAlt,
      border: `1px solid ${border}`,
      boxShadow: "0 8px 20px rgba(28,25,23,0.05)",
      marginBottom: 11,
    },
    cartThumb: {
      width: 66,
      height: 66,
      borderRadius: 14,
      objectFit: "cover",
      flex: "0 0 auto",
      background: surfaceSoft,
      border: `1px solid ${amberBorder}`,
      boxShadow: "0 5px 14px rgba(245,158,11,0.16)",
    },
    cartItemBody: { flex: "1 1 auto", minWidth: 0 },
    cartMetaPill: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      marginTop: 6,
      padding: "4px 10px",
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 800,
      color: amberChipText,
      background: amberChip,
      border: `1px solid ${amberBorder}`,
    },
    cartActions: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 9 },
    miniBtn: {
      padding: "7px 11px",
      borderRadius: 10,
      border: `1px solid ${border}`,
      background: surface,
      color: ink,
      fontSize: 11.5,
      fontWeight: 700,
      cursor: "pointer",
    },
    miniBtnDanger: {
      border: "1px solid #fecaca",
      background: "#fee2e2",
      color: "#b91c1c",
    },
    expiredTag: {
      display: "inline-block",
      marginTop: 6,
      padding: "3px 8px",
      borderRadius: 8,
      fontSize: 10.5,
      fontWeight: 800,
      background: "#fee2e2",
      color: "#b91c1c",
      border: "1px solid #fecaca",
    },
    warnBanner: {
      fontSize: 12,
      lineHeight: 1.45,
      color: "#b91c1c",
      background: "#fee2e2",
      border: "1px solid #fecaca",
      borderRadius: 12,
      padding: "10px 12px",
      margin: "4px 0 12px",
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Helper components                                                   */
/* ------------------------------------------------------------------ */

function CategoryFilter({ categories, active, onChange, styles }) {
  return (
    <div className="sr-hide-scroll" style={styles.catStrip} role="tablist" aria-label="Material categories">
      {categories.map((cat) => {
        const isActive = cat === active;
        return (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Filter by ${cat}`}
            className="sr-press sr-focusable"
            style={{ ...styles.catChip, ...(isActive ? styles.catChipActive : null) }}
            onClick={() => onChange(cat)}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}

function AvailabilityBadge({ sample, styles }) {
  const expired = isExpired(sample);
  const text = availabilityText(sample);
  let bg = "rgba(34,197,94,0.85)";
  let color = "#052e16";
  if (expired) {
    bg = "rgba(239,68,68,0.9)";
    color = "#fff";
  } else if (sample.availability === "limited") {
    bg = "rgba(245,158,11,0.9)";
    color = "#1c1200";
  }
  return <span style={{ ...styles.badge, background: bg, color }}>{text}</span>;
}

function MaterialSampleCard({
  sample,
  isSelected,
  imgFailed,
  onImageError,
  onOpenPreview,
  onSelect,
  styles,
}) {
  const expired = isExpired(sample);

  let btnStyle = styles.selectBtn;
  let btnClass = "sr-press sr-focusable";
  let btnContent = (
    <>
      <span style={styles.selectIconIdle} aria-hidden="true">
        +
      </span>
      Select this sample
    </>
  );

  if (expired) {
    btnStyle = { ...styles.selectBtn, ...styles.selectBtnDisabled };
    btnContent = <>Expired</>;
  } else if (isSelected) {
    btnStyle = { ...styles.selectBtn, ...styles.selectBtnActive };
    btnClass = "sr-press sr-focusable sr-shine sr-glow";
    btnContent = (
      <>
        <span style={styles.selectIconActive} className="sr-tick-pop" aria-hidden="true">
          ✓
        </span>
        Selected
      </>
    );
  }

  return (
    <div style={{ ...styles.card, ...(isSelected ? styles.cardSelected : null) }} className="sr-fade">
      <button
        type="button"
        className="sr-press sr-focusable"
        style={styles.cardImgBtn}
        onClick={() => onOpenPreview(sample)}
        aria-label={`Open full-screen preview of ${sample.materialName}, sample ${sample.sampleCode}`}
      >
        {imgFailed ? (
          <span style={styles.imgFallback}>
            <span style={{ fontSize: 22 }}>🪨</span>
            <span>Image unavailable</span>
          </span>
        ) : (
          <img
            src={sample.imageUrl}
            alt={`${sample.materialName} visual reference — sample ${sample.sampleCode} from ${sample.sourceArea}`}
            style={styles.cardImg}
            loading="lazy"
            width={360}
            height={225}
            onError={() => onImageError(sample.id)}
          />
        )}
        <AvailabilityBadge sample={sample} styles={styles} />
        {sample.sampleCode ? (
          <span style={styles.codeOverlay}>
            <span style={styles.codeOverlayMark} aria-hidden="true">
              ⬗
            </span>
            {sample.sampleCode}
          </span>
        ) : null}
        {isSelected ? (
          <span style={styles.selectedTick} aria-hidden="true">
            ✓
          </span>
        ) : null}
      </button>

      <div style={styles.cardBody}>
        <div>
          <div style={styles.cardTopRow}>
            <div style={styles.cardName}>{sample.materialName}</div>
            <div style={styles.cardWhen}>{formatUploadLabel(sample.uploadedAt)}</div>
          </div>
          {sample.sellerCity ? (
            <div style={styles.locationPill}>
              <span aria-hidden="true">⌖</span>
              Location : <span style={styles.locationValue}>{sample.sellerCity}</span>
            </div>
          ) : null}
          {Number.isFinite(sample.materialRatePerFeet) && sample.materialRatePerFeet > 0 ? (
            <div style={styles.ratePanel} aria-label="Material rate and applicable charges">
              <span style={styles.rateLabel}>Material rate</span>
              <div style={styles.rateLine}>
                <div style={styles.rateMain}>
                  <span style={styles.rateValue}>₹{sample.materialRatePerFeet.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span style={styles.rateUnit}>/ feet</span>
                </div>
                <span style={styles.rateDivider} aria-hidden="true" />
                <div style={styles.chargeGroup}>
                  <span style={styles.chargeText}>
                    <span style={styles.chargePlus} aria-hidden="true">
                      +
                    </span>
                    Transportation
                  </span>
                  {sample.rateUnit === "feet" ? (
                    <span style={styles.chargeText}>
                      <span style={styles.chargePlus} aria-hidden="true">
                        +
                      </span>
                      Permit
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ) : <div style={styles.rateUnavailable}>Feet rate is being configured</div>}
        </div>
        <button
          type="button"
          className={btnClass}
          style={btnStyle}
          disabled={expired}
          aria-label={
            expired
              ? `${sample.materialName} sample expired`
              : isSelected
              ? `${sample.materialName} already added — change quantity`
              : `Select ${sample.materialName} sample ${sample.sampleCode}`
          }
          onClick={() => onSelect(sample)}
        >
          {btnContent}
        </button>
      </div>
    </div>
  );
}

function ImagePreview({ sample, imgFailed, onImageError, onClose, onSelect, styles }) {
  const expired = isExpired(sample);
  return (
    <div style={styles.previewOverlay} className="sr-fade" role="dialog" aria-modal="true" aria-label={`Preview of ${sample.materialName}`}>
      <div style={styles.previewTop}>
        <button
          type="button"
          className="sr-press sr-focusable"
          style={styles.iconBtn}
          onClick={onClose}
          aria-label="Close image preview"
        >
          ✕
        </button>
      </div>
      <div style={styles.previewImgWrap}>
        {imgFailed ? (
          <div style={{ ...styles.imgFallback, position: "static", padding: 40 }}>
            <span style={{ fontSize: 30 }}>🪨</span>
            <span>Image unavailable</span>
          </div>
        ) : (
          <img
            src={sample.imageUrl}
            alt={`${sample.materialName} full-size visual reference — sample ${sample.sampleCode}`}
            style={styles.previewImg}
            onError={() => onImageError(sample.id)}
          />
        )}
      </div>
      <div style={styles.previewInfo}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#ffffff" }}>{sample.materialName}</div>
        <div style={{ fontSize: 12.5, color: "#d6d3d1", marginTop: 4 }}>
          {sample.sampleCode}
          {sample.sellerCity ? ` · ${sample.sellerCity}` : ""}
        </div>
        {Number.isFinite(sample.materialRatePerFeet) &&
        sample.materialRatePerFeet > 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 10,
            }}
          >
            <span style={{ ...styles.rateValue, color: "#ffffff" }}>
              ₹{sample.materialRatePerFeet.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span style={{ ...styles.rateUnit, color: "#d6d3d1" }}>/ feet</span>
            <span style={styles.chargeText}>
              <span style={styles.chargePlus} aria-hidden="true">
                +
              </span>
              Transportation
            </span>
            {sample.rateUnit === "feet" ? (
              <span style={styles.chargeText}>
                <span style={styles.chargePlus} aria-hidden="true">
                  +
                </span>
                Permit
              </span>
            ) : null}
          </div>
        ) : null}
        <div style={{ fontSize: 12.5, color: "#d6d3d1", marginTop: 7 }}>
          {formatUploadLabel(sample.uploadedAt)}
        </div>
        {sample.adminNote ? (
          <div style={{ fontSize: 12.5, color: "#fcd34d", marginTop: 8 }}>
            Admin note: {sample.adminNote}
          </div>
        ) : null}
        <div style={styles.disclaimer}>{DISCLAIMER}</div>
        <button
          type="button"
          className="sr-press sr-focusable"
          style={{
            ...styles.primaryBtn,
            width: "100%",
            flex: "none",
            ...(expired ? styles.primaryBtnDisabled : null),
          }}
          disabled={expired}
          onClick={() => onSelect(sample)}
          aria-label={expired ? "Sample expired" : `Select this sample ${sample.sampleCode}`}
        >
          {expired ? "Expired sample" : "Select this sample"}
        </button>
      </div>
    </div>
  );
}

function VehicleQuantityRow({ vehicle, quantity, onDec, onInc, styles }) {
  const atMin = quantity <= 0;
  const atMax = quantity >= MAX_PER_VEHICLE;
  const isActive = quantity > 0;
  return (
    <div style={{ ...styles.vRow, ...(isActive ? styles.vRowActive : null) }}>
      <div>
        <div style={styles.vName}>{vehicle.name}</div>
        <div style={styles.vCap}>{vehicle.capacity} feet</div>
      </div>
      <div style={styles.stepper}>
        <button
          type="button"
          className="sr-press sr-focusable"
          style={{ ...styles.stepBtn, ...(atMin ? styles.stepBtnDisabled : null) }}
          onClick={onDec}
          disabled={atMin}
          aria-label={`Decrease ${vehicle.name} quantity`}
        >
          −
        </button>
        <span style={styles.stepVal} aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          className="sr-press sr-focusable"
          style={{
            ...styles.stepBtn,
            ...styles.stepBtnPlus,
            ...(atMax ? styles.stepBtnDisabled : null),
          }}
          onClick={onInc}
          disabled={atMax}
          aria-label={`Increase ${vehicle.name} quantity`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function QuantitySheet({
  sample,
  imgFailed,
  onImageError,
  initialQuantities,
  needsReplaceConfirm,
  onCancel,
  onAdd,
  feetOptions = DEFAULT_FEET_OPTIONS,
  styles,
}) {
  const [confirmedReplace, setConfirmedReplace] = useState(!needsReplaceConfirm);
  const [quantities, setQuantities] = useState(
    () => ({...vehiclesToQtyMap([], feetOptions), ...(initialQuantities || {})})
  );

  const dec = (id) =>
    setQuantities((q) => ({ ...q, [id]: Math.max(0, (q[id] || 0) - 1) }));
  const inc = (id) =>
    setQuantities((q) => ({ ...q, [id]: Math.min(MAX_PER_VEHICLE, (q[id] || 0) + 1) }));

  const totalLoads = feetOptions.reduce((s, v) => s + (quantities[v.id] || 0), 0);
  const totalFeet = feetOptions.reduce(
    (s, v) => s + (quantities[v.id] || 0) * v.capacity,
    0
  );

  return (
    <div style={styles.overlay} className="sr-fade" role="dialog" aria-modal="true" aria-label="Select vehicle quantities">
      <div style={styles.sheet} className="sr-sheet">
        <div style={styles.sheetHandle} />
        <div className="sr-scroll" style={styles.sheetScroll}>
          <div style={styles.thumbRow}>
            {imgFailed ? (
              <div style={{ ...styles.thumb, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                🪨
              </div>
            ) : (
              <img
                src={sample.imageUrl}
                alt={`${sample.materialName} thumbnail`}
                style={styles.thumb}
                onError={() => onImageError(sample.id)}
              />
            )}
            <div style={{ minWidth: 0 }}>
              <div style={styles.sheetTitle}>{sample.materialName}</div>
              <div style={{ fontSize: 12, color: styles.inkDim }}>
                {sample.sampleCode} · {sample.sourceArea}
              </div>
            </div>
          </div>

          {!confirmedReplace ? (
            <div style={styles.replaceBox}>
              <div style={styles.replaceTitle}>You already selected a sample for this material.</div>
              <div style={styles.replaceText}>
                Only one sample per material category can be in your request. Keep your current
                sample, or replace it with this one?
              </div>
              <div style={styles.sheetActions}>
                <button
                  type="button"
                  className="sr-press sr-focusable"
                  style={styles.ghostBtn}
                  onClick={onCancel}
                  aria-label="Keep current sample"
                >
                  Keep current
                </button>
                <button
                  type="button"
                  className="sr-press sr-focusable"
                  style={styles.primaryBtn}
                  onClick={() => setConfirmedReplace(true)}
                  aria-label="Replace with this sample"
                >
                  Replace with this
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={styles.disclaimer}>{DISCLAIMER}</div>

              {feetOptions.map((v) => (
                <VehicleQuantityRow
                  key={v.id}
                  vehicle={v}
                  quantity={quantities[v.id] || 0}
                  onDec={() => dec(v.id)}
                  onInc={() => inc(v.id)}
                  styles={styles}
                />
              ))}

              <div style={styles.totalsBox}>
                <div style={styles.totalCard}>
                  <div style={styles.totalNum}>{totalLoads}</div>
                  <div style={styles.totalLbl}>TOTAL LOADS</div>
                </div>
                <div style={styles.totalCard}>
                  <div style={styles.totalNum}>{totalFeet}</div>
                  <div style={styles.totalLbl}>TOTAL FEET</div>
                </div>
              </div>

              <div style={styles.sheetActions}>
                <button
                  type="button"
                  className="sr-press sr-focusable"
                  style={styles.ghostBtn}
                  onClick={onCancel}
                  aria-label="Cancel selection"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="sr-press sr-focusable"
                  style={{
                    ...styles.primaryBtn,
                    ...(totalLoads === 0 ? styles.primaryBtnDisabled : null),
                  }}
                  disabled={totalLoads === 0}
                  onClick={() => onAdd(sample, quantities, feetOptions)}
                  aria-label="Add to request"
                >
                  Add to Request
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RequestCartSheet({
  cart,
  totals,
  hasExpired,
  onClose,
  onContinueBrowsing,
  onContinue,
  onChangeQty,
  onChangeSample,
  onRemove,
  styles,
}) {
  return (
    <div style={styles.overlay} className="sr-fade" role="dialog" aria-modal="true" aria-label="Request cart">
      <div style={styles.sheet} className="sr-sheet">
        <div style={styles.sheetHandle} />
        <div className="sr-scroll" style={styles.sheetScroll}>
          <div style={styles.sheetHeaderRow}>
            <div style={styles.sheetHeaderLeft}>
              <span style={styles.sheetHeaderIcon} aria-hidden="true">
                🧾
              </span>
              <div style={styles.sheetTitle}>Your Request</div>
            </div>
            <button
              type="button"
              className="sr-press sr-focusable"
              style={styles.iconBtn}
              onClick={onClose}
              aria-label="Close request cart"
            >
              ✕
            </button>
          </div>

          {cart.length === 0 ? (
            <div style={styles.stateWrap}>
              <div style={styles.stateEmoji}>🛒</div>
              <div style={styles.stateTitle}>Your request is empty</div>
              <div style={styles.stateText}>
                Browse today’s materials and add a sample to start building your request.
              </div>
              <button
                type="button"
                className="sr-press sr-focusable"
                style={{ ...styles.primaryBtn, flex: "none", width: "100%", marginTop: 8 }}
                onClick={onContinueBrowsing}
                aria-label="Continue browsing materials"
              >
                Browse Materials
              </button>
            </div>
          ) : (
            <>
              {hasExpired ? (
                <div style={styles.warnBanner}>
                  One or more selected samples have expired. Please replace them before continuing to
                  confirmation.
                </div>
              ) : null}

              {cart.map((item) => {
                const expired = new Date(item.sampleExpiresAt).getTime() < Date.now();
                return (
                  <div key={item.category} style={styles.cartItem}>
                    <img
                      src={item.sampleImageUrl}
                      alt={`${item.materialName} selected sample ${item.sampleCode}`}
                      style={styles.cartThumb}
                    />
                    <div style={styles.cartItemBody}>
                      <div style={{ fontSize: 13.5, fontWeight: 700 }}>{item.materialName}</div>
                      <div style={{ fontSize: 11.5, color: styles.inkDim, marginTop: 1 }}>
                        {item.sampleCode}
                      </div>
                      <span style={styles.cartMetaPill}>
                        📦 {item.totalLoads} loads · {item.totalFeet} feet
                      </span>
                      {expired ? <span style={styles.expiredTag}>Expired sample — replace to continue</span> : null}
                      <div style={styles.cartActions}>
                        <button
                          type="button"
                          className="sr-press sr-focusable"
                          style={styles.miniBtn}
                          onClick={() => onChangeQty(item)}
                          aria-label={`Change quantity for ${item.materialName}`}
                        >
                          Change qty
                        </button>
                        <button
                          type="button"
                          className="sr-press sr-focusable"
                          style={styles.miniBtn}
                          onClick={() => onChangeSample(item)}
                          aria-label={`Change sample for ${item.materialName}`}
                        >
                          Change sample
                        </button>
                        <button
                          type="button"
                          className="sr-press sr-focusable"
                          style={{ ...styles.miniBtn, ...styles.miniBtnDanger }}
                          onClick={() => onRemove(item)}
                          aria-label={`Remove ${item.materialName}`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div style={{ ...styles.totalsBox, marginTop: 12 }}>
                <div style={styles.totalCard}>
                  <div style={styles.totalNum}>{totals.totalMaterials}</div>
                  <div style={styles.totalLbl}>MATERIALS</div>
                </div>
                <div style={styles.totalCard}>
                  <div style={styles.totalNum}>{totals.totalLoads}</div>
                  <div style={styles.totalLbl}>LOADS</div>
                </div>
                <div style={styles.totalCard}>
                  <div style={styles.totalNum}>{totals.totalFeet}</div>
                  <div style={styles.totalLbl}>FEET</div>
                </div>
              </div>

              <div style={styles.sheetActions}>
                <button
                  type="button"
                  className="sr-press sr-focusable"
                  style={styles.ghostBtn}
                  onClick={onContinueBrowsing}
                  aria-label="Continue browsing materials"
                >
                  Continue Browsing
                </button>
                <button
                  type="button"
                  className="sr-press sr-focusable"
                  style={{
                    ...styles.primaryBtn,
                    ...(hasExpired ? styles.primaryBtnDisabled : null),
                  }}
                  disabled={hasExpired}
                  onClick={onContinue}
                  aria-label="Continue to confirmation"
                >
                  Continue to Confirmation
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                           */
/* ------------------------------------------------------------------ */

export default function PlaceOrderPage({
  existingOrderDraft,
  openCartOnLoad = false,
  onCartOpened,
  goToPage4,
  goToPage6,
}) {
  const viewport = useViewport();
  const styles = useMemo(() => createStyles(viewport), [viewport]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [samples, setSamples] = useState([]);
  const [feetOptions,setFeetOptions]=useState(DEFAULT_FEET_OPTIONS);
  useEffect(()=>{getBuyerFeetOptions().then(result=>{const rows=(result.options||[]).map(x=>({id:x.id,name:`${x.feetValue} feet`,capacity:Number(x.feetValue),displayOrder:x.displayOrder}));if(rows.length)setFeetOptions(rows)}).catch(error=>console.error("Unable to load Buyer feet options:",error))},[]);

  /* ---- Restore cart from an incoming draft (React state only) ---- */
  const buildInitialCart = useCallback(() => {
    if (!existingOrderDraft || !Array.isArray(existingOrderDraft.materials)) return [];
    return existingOrderDraft.materials.map((m) => {
      const source = samples.find((sample) => sample.id === m.sampleId);
      const category = source
        ? source.category
        : buyerCategory(m.materialName) || m.materialName;
      return {
        materialName: m.materialName,
        category,
        sampleId: m.sampleId,
        sampleCode: m.sampleCode,
        sampleImageUrl: m.sampleImageUrl,
        sampleSourceArea: m.sampleSourceArea,
        sampleUploadedAt: m.sampleUploadedAt,
        sampleExpiresAt: m.sampleExpiresAt,
        sampleAdminNote: m.sampleAdminNote,
        feetOptions: m.feetOptions || [],
        vehicles: [],
        totalLoads: m.totalLoads || 0,
        totalFeet: m.totalFeet || 0,
        totalVehicles: 0,
        totalTons: 0,
      };
    });
  }, [existingOrderDraft, samples]);

  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState(buildInitialCart);
  const [imgErrors, setImgErrors] = useState({});

  const [previewSample, setPreviewSample] = useState(null);
  const [quantityState, setQuantityState] = useState(null); // { sample, initialQuantities, needsReplaceConfirm }
  const [cartOpen, setCartOpen] = useState(false);
  useEffect(() => {
    if (
      !openCartOnLoad ||
      cart.length === 0
    ) {
      return;
    }
  
    setCartOpen(true);
  
    if (
      typeof onCartOpened === "function"
    ) {
      onCartOpened();
    }
  }, [
    openCartOnLoad,
    onCartOpened,
    cart.length,
  ]);
  const loadActiveSamples = useCallback(async ({ showLoading = false } = {}) => {
    try {
      if (showLoading) setLoading(true);
      setLoadError("");
      const result = await getActiveSamples();
      const activeSamples = (result.samples || [])
        .map(mapApiSample)
        .filter((sample) =>
          sample.materialName && sample.category && sample.imageUrl &&
          sample.expiresAt && new Date(sample.expiresAt).getTime() > Date.now()
        );
      setSamples(activeSamples);
    } catch (error) {
      setLoadError(error.message || "Unable to load today's material samples.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);
  useEffect(() => { loadActiveSamples({ showLoading: true }); }, [loadActiveSamples]);
  useEffect(() => {
    const refreshTimer = window.setInterval(
      () => loadActiveSamples({ showLoading: false }),
      5 * 60 * 1000
    );
    return () => window.clearInterval(refreshTimer);
  }, [loadActiveSamples]);
  useEffect(() => {
    const expiryTimer = window.setInterval(() => {
      setSamples((current) => current.filter(
        (sample) => new Date(sample.expiresAt).getTime() > Date.now()
      ));
    }, 60000);
    return () => window.clearInterval(expiryTimer);
  }, []);

  const onImageError = useCallback((id) => {
    setImgErrors((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  }, []);

  /* ---- Memoized filtered samples ---- */
  const filteredSamples = useMemo(() => {
    if (activeCategory === "All") return samples;
    return samples.filter((sample) => sample.category === activeCategory);
  }, [activeCategory, samples]);

  /* ---- Memoized cart totals ---- */
  const cartTotals = useMemo(() => {
    return cart.reduce(
      (acc, item) => {
        acc.totalMaterials += 1;
        acc.totalLoads += item.totalLoads || 0;
        acc.totalFeet += item.totalFeet || 0;
        return acc;
      },
      { totalMaterials: 0, totalLoads: 0, totalFeet: 0 }
    );
  }, [cart]);

  const hasExpiredInCart = useMemo(
    () => cart.some((item) => new Date(item.sampleExpiresAt).getTime() < Date.now()),
    [cart]
  );

  const findCartByCategory = useCallback(
    (category) => cart.find((item) => item.category === category),
    [cart]
  );

  const openSamplePreview = useCallback((sample) => {
    setPreviewSample(sample);
    recordSampleView(sample.id).catch((error) => {
      console.error("Unable to record Buyer sample view:", error);
    });
  }, []);

  /* ---- Open the quantity sheet for a sample ---- */
  const openQuantityForSample = useCallback(
    (sample) => {
      if (isExpired(sample)) return;
      setPreviewSample(null);
      const existing = findCartByCategory(sample.category);
      if (existing && existing.sampleId !== sample.id) {
        // Different sample, same category → require replacement confirmation.
        setQuantityState({
          sample,
          initialQuantities: vehiclesToQtyMap(existing.feetOptions, feetOptions),
          needsReplaceConfirm: true,
        });
      } else if (existing && existing.sampleId === sample.id) {
        // Same sample already in cart → edit its quantities.
        setQuantityState({
          sample,
          initialQuantities: vehiclesToQtyMap(existing.feetOptions, feetOptions),
          needsReplaceConfirm: false,
        });
      } else {
        setQuantityState({
          sample,
          initialQuantities: vehiclesToQtyMap([], feetOptions),
          needsReplaceConfirm: false,
        });
      }
    },
    [findCartByCategory]
  );

  /* ---- Add / replace a material in the cart ---- */
  const addToRequest = useCallback((sample, quantities, activeOptions = feetOptions) => {
    const vlist = activeOptions
      .map((v) => ({
        optionId: v.id,
        optionLabel: v.name,
        feetPerLoad: v.capacity,
        quantity: quantities[v.id] || 0,
        totalFeet: (quantities[v.id] || 0) * v.capacity,
      }))
      .filter((v) => v.quantity > 0);

    const totalLoads = vlist.reduce((s, v) => s + v.quantity, 0);
    const totalFeet = vlist.reduce((s, v) => s + v.totalFeet, 0);

    const item = {
      materialName: sample.materialName,
      category: sample.category,
      sampleId: sample.id,
      sampleCode: sample.sampleCode,
      sampleImageUrl: sample.imageUrl,
      sampleSourceArea: sample.sourceArea,
      sampleUploadedAt: sample.uploadedAt,
      sampleExpiresAt: sample.expiresAt,
      sampleAdminNote: sample.adminNote,
      feetOptions: vlist,
      vehicles: [],
      totalLoads,
      totalFeet,
      totalVehicles: 0,
      totalTons: 0,
    };

    setCart((prev) => {
      const next = prev.filter((x) => x.category !== sample.category);
      next.push(item);
      return next;
    });
    setQuantityState(null);
  }, [feetOptions]);

  const removeFromCart = useCallback((item) => {
    setCart((prev) => prev.filter((x) => x.category !== item.category));
  }, []);

  const changeQty = useCallback((item) => {
    const source = samples.find((sample) => sample.id === item.sampleId) || {
      id: item.sampleId,
      sampleCode: item.sampleCode,
      materialName: item.materialName,
      category: item.category,
      imageUrl: item.sampleImageUrl,
      sourceArea: item.sampleSourceArea,
      uploadedAt: item.sampleUploadedAt,
      expiresAt: item.sampleExpiresAt,
      availability: "available",
      adminNote: item.sampleAdminNote,
    };
    setCartOpen(false);
    setQuantityState({
      sample: source,
      initialQuantities: vehiclesToQtyMap(item.feetOptions, feetOptions),
      needsReplaceConfirm: false,
    });
  }, []);

  const changeSample = useCallback((item) => {
    setCartOpen(false);
    setActiveCategory(item.category);
  }, []);

  /* ---- Build the draft for Page 6 ---- */
  const buildDraft = useCallback(() => {
    const materials = cart.map((item) => ({
      materialName: item.materialName,
      sampleId: item.sampleId,
      sampleCode: item.sampleCode,
      sampleImageUrl: item.sampleImageUrl,
      sampleSourceArea: item.sampleSourceArea,
      sampleUploadedAt: item.sampleUploadedAt,
      sampleExpiresAt: item.sampleExpiresAt,
      sampleAdminNote: item.sampleAdminNote,
      feetOptions: (item.feetOptions || []).map(v => ({optionId:v.optionId,optionLabel:v.optionLabel,feetPerLoad:v.feetPerLoad,quantity:v.quantity,totalFeet:v.totalFeet})),
      vehicles: [],
      totalLoads: item.totalLoads,
      totalFeet: item.totalFeet,
      totalVehicles: 0,
      totalTons: 0,
    }));

    return {
      materials,
      totalMaterials: cartTotals.totalMaterials,
      totalLoads: cartTotals.totalLoads,
      totalFeet: cartTotals.totalFeet,
      totalVehicles: 0,
      totalTons: 0,
      createdAt: new Date().toISOString(),
    };
  }, [cart, cartTotals]);

  const continueToConfirmation = useCallback(() => {
    if (hasExpiredInCart || cart.length === 0) return;
    const draft = buildDraft();
    if (typeof goToPage6 === "function") goToPage6(draft);
  }, [hasExpiredInCart, cart.length, buildDraft, goToPage6]);

  const selectedCount = cart.length;

  /* ---------------------------- Render ---------------------------- */
  return (
    <>
      <style>{globalCss}</style>
      <div style={styles.appViewport}>
        <div style={styles.phoneFrame}>
          <div style={styles.appRoot}>
            {/* Sticky header */}
            <header style={styles.header}>
              <div style={styles.headerRow}>
                <button
                  type="button"
                  className="sr-press sr-focusable"
                  style={styles.iconBtn}
                  onClick={() => typeof goToPage4 === "function" && goToPage4()}
                  aria-label="Go back to previous page"
                >
                  ‹
                </button>
                <div style={styles.logoMark} aria-hidden="true">
                  SR
                </div>
                <div style={styles.headerTitleWrap}>
                  <h1 style={styles.headerTitle}>Today’s Materials</h1>
                  <p style={styles.headerSub}>Choose a visual quality reference</p>
                </div>
                <button
                  type="button"
                  className="sr-press sr-focusable"
                  style={styles.cartIconBtn}
                  onClick={() => setCartOpen(true)}
                  aria-label={`Open request cart, ${selectedCount} materials selected`}
                >
                  🛒
                  {selectedCount > 0 ? (
                    <span style={styles.cartBadge}>{selectedCount}</span>
                  ) : null}
                </button>
              </div>
              <div style={styles.liveRow}>
                <span style={styles.liveDot} aria-hidden="true" />
                <span style={styles.liveText}>Live · Samples refresh daily</span>
              </div>
            </header>

            {/* Category filters */}
            <CategoryFilter
              categories={CATEGORIES}
              active={activeCategory}
              onChange={setActiveCategory}
              styles={styles}
            />

            {/* Gallery / states */}
            <main className="sr-scroll" style={styles.scrollArea}>
              {loading ? (
                <div style={styles.list} aria-busy="true" aria-label="Loading materials">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={styles.card}>
                      <div
                        className="sr-skel"
                        style={{ width: "100%", aspectRatio: "10 / 9" }}
                      />
                      <div style={styles.cardBody}>
                        <div className="sr-skel" style={{ height: 18, borderRadius: 6, width: "70%" }} />
                        <div
                          className="sr-skel"
                          style={{ height: 26, borderRadius: 8, width: "55%", marginTop: 9 }}
                        />
                        <div
                          className="sr-skel"
                          style={{ height: 62, borderRadius: 16, width: "100%", marginTop: 12 }}
                        />
                        <div
                          className="sr-skel"
                          style={{ height: 46, borderRadius: 15, width: "100%", marginTop: 13 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : loadError ? (
                <div style={styles.stateWrap}>
                  <div style={styles.stateEmoji}>⚠️</div>
                  <div style={styles.stateTitle}>Unable to load samples</div>
                  <div style={styles.stateText}>{loadError}</div>
                  <button
                    type="button"
                    className="sr-press sr-focusable"
                    style={{ ...styles.selectBtn, marginTop: 4 }}
                    onClick={() => loadActiveSamples({ showLoading: true })}
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredSamples.length === 0 ? (
                <div style={styles.stateWrap}>
                  <div style={styles.stateEmoji}>🔍</div>
                  <div style={styles.stateTitle}>No matching samples</div>
                  <div style={styles.stateText}>
                    There are no {activeCategory} samples in today’s gallery. Try another category.
                  </div>
                  <button
                    type="button"
                    className="sr-press sr-focusable"
                    style={{ ...styles.selectBtn, marginTop: 4 }}
                    onClick={() => setActiveCategory("All")}
                    aria-label="Show all materials"
                  >
                    Show all materials
                  </button>
                </div>
              ) : (
                <div style={styles.list}>
                  {filteredSamples.map((sample) => {
                    const inCart = findCartByCategory(sample.category);
                    const isSelected = !!inCart && inCart.sampleId === sample.id;
                    return (
                      <MaterialSampleCard
                        key={sample.id}
                        sample={sample}
                        isSelected={isSelected}
                        imgFailed={!!imgErrors[sample.id]}
                        onImageError={onImageError}
                        onOpenPreview={openSamplePreview}
                        onSelect={openQuantityForSample}
                        styles={styles}
                      />
                    );
                  })}
                </div>
              )}
            </main>
          </div>

          {/* Floating request-cart button */}
          {selectedCount > 0 ? (
            <div style={styles.floatWrap}>
              <button
                type="button"
                className="sr-press sr-focusable"
                style={styles.floatBtn}
                onClick={() => setCartOpen(true)}
                aria-label={`View request: ${cartTotals.totalMaterials} materials, ${cartTotals.totalLoads} loads, ${cartTotals.totalFeet} feet`}
              >
                <span style={styles.floatBtnLabel}>View Request</span>
                <span style={styles.floatBtnMeta}>
                  {cartTotals.totalMaterials} mat · {cartTotals.totalLoads} loads ·{" "}
                  {cartTotals.totalFeet} feet
                </span>
              </button>
            </div>
          ) : null}

          {/* Full-screen image preview */}
          {previewSample ? (
            <ImagePreview
              sample={previewSample}
              imgFailed={!!imgErrors[previewSample.id]}
              onImageError={onImageError}
              onClose={() => setPreviewSample(null)}
              onSelect={openQuantityForSample}
              styles={styles}
            />
          ) : null}

          {/* Quantity / vehicle bottom sheet */}
          {quantityState ? (
            <QuantitySheet
              sample={quantityState.sample}
              imgFailed={!!imgErrors[quantityState.sample.id]}
              onImageError={onImageError}
              initialQuantities={quantityState.initialQuantities}
              needsReplaceConfirm={quantityState.needsReplaceConfirm}
              onCancel={() => setQuantityState(null)}
              onAdd={addToRequest}
              feetOptions={feetOptions}
              styles={styles}
            />
          ) : null}

          {/* Request cart bottom sheet */}
          {cartOpen ? (
            <RequestCartSheet
              cart={cart}
              totals={cartTotals}
              hasExpired={hasExpiredInCart}
              onClose={() => setCartOpen(false)}
              onContinueBrowsing={() => setCartOpen(false)}
              onContinue={continueToConfirmation}
              onChangeQty={changeQty}
              onChangeSample={changeSample}
              onRemove={removeFromCart}
              styles={styles}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
