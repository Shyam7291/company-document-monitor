import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Menu, X, Home, ListOrdered, ImageUp, Boxes, UserRound, Sparkles,
  SquarePen, Mountain, Phone, MapPin, ShieldCheck, Clock3,
  CheckCircle2, ChevronRight, RefreshCw, Camera, LockKeyhole,
  Fingerprint, Building2, ArrowRight, LogOut, AlertCircle,
  Mail, BadgeCheck, Hash, Star, FlaskConical,
} from "lucide-react";

/**
 * SandSellerProfilePage — redesigned edition (FRONTEND-ONLY / MOCK MODE).
 *
 * The backend import (../api/profileApi) has been removed for UI testing.
 * The MOCK API block below simulates every server call with a short delay so
 * the full page — loading, editing, photo upload, double-OTP mobile change and
 * Aadhaar verification — can be exercised without a server.
 *
 * To reconnect the real backend later:
 *   1. Delete the MOCK API block.
 *   2. Restore: import { getCurrentSeller, getSellerProfile, updateSellerProfile,
 *                        uploadSellerProfilePhoto } from "../api/profileApi";
 *   3. Pass real onRequestPhoneChange / onConfirmPhoneChange / onVerifyAadhaar
 *      props — the mocks are only used when those props are omitted.
 *
 * Double-OTP mobile change (built in):
 *   Saving a different primary mobile → OTPs are sent to BOTH the current and
 *   the new number → the seller enters both 6-digit codes → the number changes
 *   only after both codes are verified. In mock mode the demo OTP is 123456.
 *
 * Navigation matches StoneRateSandSellerHome's callback names and tab order.
 * onNavigate is an optional fallback: samples, queue, home, mySamples, profile.
 */

/* ───────────────────────── MOCK API (frontend testing only) ───────────────────────── */
const DEMO_OTP = "123456";
const wait = (ms = 650) => new Promise(resolve => setTimeout(resolve, ms));
let MOCK_SELLER = {
  publicId: "SR-SS-1042",
  role: "seller",
  name: "Ravi Kumar",
  plantName: "Kaveri Sands & Aggregates",
  phone: "9876543210",
  alternatePhone: "",
  email: "ravi@kaverisands.in",
  address: "Plot 14, Riverside Industrial Area, Hosur Road",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560068",
  aadhaarVerified: false,
  adminVerified: false,
  profilePhotoUrl: "",
  profilePhotoZoom: 1,
  profilePhotoPositionX: 50,
  profilePhotoPositionY: 50,
};
const getCurrentSeller = () => MOCK_SELLER;
const getSellerProfile = async () => { await wait(); return { seller: MOCK_SELLER }; };
const updateSellerProfile = async (sellerId, fields) => {
  await wait();
  MOCK_SELLER = { ...MOCK_SELLER, ...fields, phone: fields.primaryPhone ?? MOCK_SELLER.phone };
  return { seller: MOCK_SELLER };
};
const uploadSellerProfilePhoto = async (sellerId, file, settings) => {
  await wait(900);
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });
  MOCK_SELLER = { ...MOCK_SELLER, profilePhotoUrl: dataUrl, profilePhotoZoom: settings.zoom,
    profilePhotoPositionX: settings.x, profilePhotoPositionY: settings.y };
  return { seller: MOCK_SELLER };
};
const mockRequestPhoneChange = async () => {
  await wait(800);
  return { challengeId: `mock-${Date.now()}`, retryAfterSeconds: 30 };
};
const mockConfirmPhoneChange = async ({ currentOtp, newOtp, newPhone, profile }) => {
  await wait(900);
  if (currentOtp !== DEMO_OTP || newOtp !== DEMO_OTP) {
    throw new Error(`Incorrect OTP. In demo mode both codes are ${DEMO_OTP}.`);
  }
  MOCK_SELLER = { ...MOCK_SELLER, ...profile, phone: newPhone };
  return { seller: MOCK_SELLER };
};
const mockVerifyAadhaar = async () => {
  await wait(1200);
  MOCK_SELLER = { ...MOCK_SELLER, aadhaarVerified: true };
  return { seller: MOCK_SELLER };
};
/* ──────────────────────────────── END MOCK API ──────────────────────────────── */

const EMPTY_PROFILE = {
  name: "", email: "", plantName: "", sellerId: "", primaryPhone: "",
  alternatePhone: "", address: "", pincode: "", city: "", state: "",
  aadhaarVerified: false, adminVerified: false, photoUrl: "",
  photoZoom: 1, photoX: 50, photoY: 50,
};
const digits = value => String(value ?? "").replace(/\D/g, "");
const cleanPhone = value => digits(value).slice(0, 10);
const phoneValue = value => {
  const phone = digits(value);
  return phone.length === 12 && phone.startsWith("91") ? phone.slice(2) : phone;
};
const maskPhone = value => {
  const phone = phoneValue(value);
  return phone ? `+91 ••••••${phone.slice(-4)}` : "Not provided";
};
const initials = name => String(name || "").trim().split(/\s+/).filter(Boolean)
  .slice(0, 2).map(part => part[0]).join("").toUpperCase();
const numberInRange = (value, fallback, min, max) => {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
};
const sellerFromResult = result => result?.seller || result?.user || null;

function mapProfile(record = {}, fallback = EMPTY_PROFILE) {
  const s = record || {};
  return {
    ...EMPTY_PROFILE,
    ...fallback,
    name: String(s.name ?? s.ownerName ?? fallback.name ?? ""),
    email: String(s.email ?? fallback.email ?? ""),
    plantName: String(s.plantName ?? s.yardName ?? fallback.plantName ?? ""),
    sellerId: String(s.publicId ?? s.sellerId ?? fallback.sellerId ?? ""),
    primaryPhone: phoneValue(s.phone ?? s.primaryPhone ?? fallback.primaryPhone),
    alternatePhone: phoneValue(s.alternatePhone ?? fallback.alternatePhone),
    address: String(s.address ?? fallback.address ?? ""),
    pincode: String(s.pincode ?? fallback.pincode ?? ""),
    city: String(s.city ?? fallback.city ?? ""),
    state: String(s.state ?? fallback.state ?? ""),
    aadhaarVerified: s.aadhaarVerified === true,
    adminVerified: s.adminVerified === true,
    photoUrl: String(s.profilePhotoUrl ?? s.photoUrl ?? fallback.photoUrl ?? ""),
    photoZoom: numberInRange(s.profilePhotoZoom ?? s.photoZoom ?? fallback.photoZoom, 1, 1, 2.2),
    photoX: numberInRange(s.profilePhotoPositionX ?? s.photoX ?? fallback.photoX, 50, 0, 100),
    photoY: numberInRange(s.profilePhotoPositionY ?? s.photoY ?? fallback.photoY, 50, 0, 100),
  };
}

function initialProfile(seller, sellerName) {
  let record = seller;
  if (!record && typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem("stonerate_current_seller") ||
        window.localStorage.getItem("stonerate_current_user");
      const parsed = stored ? JSON.parse(stored) : null;
      if (parsed?.role === "seller") record = parsed;
    } catch {
      // Storage may be disabled. The authenticated API remains authoritative.
    }
  }
  return {
    ...mapProfile(record, { ...EMPTY_PROFILE, name: sellerName || "" }),
    aadhaarVerified: false,
    adminVerified: false,
  };
}

function editableFields(profile) {
  return {
    name: profile.name.trim(),
    email: profile.email.trim(),
    plantName: profile.plantName.trim(),
    primaryPhone: phoneValue(profile.primaryPhone),
    alternatePhone: phoneValue(profile.alternatePhone),
    address: profile.address.trim(),
    pincode: profile.pincode.trim(),
    city: profile.city.trim(),
    state: profile.state.trim(),
  };
}

function validateProfile(profile) {
  const errors = {};
  if (!profile.plantName.trim()) errors.plantName = "Enter your plant name.";
  if (!profile.name.trim()) errors.name = "Enter your name.";
  if (!/^\d{10}$/.test(phoneValue(profile.primaryPhone))) {
    errors.primaryPhone = "Enter a valid 10-digit mobile number.";
  }
  if (profile.alternatePhone && !/^\d{10}$/.test(phoneValue(profile.alternatePhone))) {
    errors.alternatePhone = "Enter a valid 10-digit alternate number.";
  } else if (profile.alternatePhone && phoneValue(profile.alternatePhone) === phoneValue(profile.primaryPhone)) {
    errors.alternatePhone = "Use a number different from your primary mobile.";
  }
  if (!profile.address.trim()) errors.address = "Enter your plant's complete address.";
  if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (profile.pincode && !/^\d{6}$/.test(profile.pincode)) errors.pincode = "Enter a 6-digit PIN code.";
  return errors;
}

/** Profile completeness is derived purely from fields that already exist on the record. */
function completeness(profile) {
  const checks = [
    profile.plantName, profile.name, profile.primaryPhone, profile.address,
    profile.alternatePhone, profile.email, profile.photoUrl,
    profile.city || profile.state || profile.pincode,
  ];
  const filled = checks.filter(value => String(value || "").trim()).length;
  return Math.round((filled / checks.length) * 100);
}

function Brand() {
  return <div className="ssp-brand"><i><Sparkles size={14}/></i><span>Stone</span><b>Rate</b></div>;
}

function Badge({ verified, children, light = false }) {
  const Icon = verified ? CheckCircle2 : Clock3;
  return <span className={`ssp-badge ${verified ? "is-verified" : "is-pending"} ${light ? "is-light" : ""}`}>
    <Icon size={13}/>{children}
  </span>;
}

function Ring({ value, size = 104, stroke = 4, light = false, children }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, Number(value) || 0));
  const offset = circumference * (1 - clamped / 100);
  const center = size / 2;
  return <div className={`ssp-ring ${light ? "is-light" : ""}`} style={{ width: size, height: size }}>
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle className="ssp-ring-track" cx={center} cy={center} r={radius} strokeWidth={stroke}/>
      <circle className="ssp-ring-fill" cx={center} cy={center} r={radius} strokeWidth={stroke} style={{ "--circ": circumference }}
        strokeDasharray={circumference} strokeDashoffset={offset} transform={`rotate(-90 ${center} ${center})`}/>
    </svg>
    <div className="ssp-ring-inner">{children}</div>
  </div>;
}

function Detail({ icon: Icon, label, value, hint, tone = "indigo", full = false }) {
  return <div className={`ssp-detail is-${tone} ${full ? "ssp-full" : ""} ${value ? "" : "is-empty"}`}>
    <i><Icon size={19}/></i>
    <div><dt>{label}</dt><dd>{value || "Not provided"}</dd>{hint && <small>{hint}</small>}</div>
  </div>;
}

function Stat({ icon: Icon, value, label }) {
  return <div className="ssp-stat"><i><Icon size={15}/></i><div><b>{value}</b><span>{label}</span></div></div>;
}

function Field({ name, label, error, note, full = false, children }) {
  return <div className={`ssp-field ${full ? "ssp-full" : ""} ${error ? "has-error" : ""}`}>
    <label htmlFor={`ssp-${name}`}>{label}</label>{children}
    {error ? <small id={`ssp-${name}-error`} className="ssp-field-error"><AlertCircle size={12}/>{error}</small>
      : note ? <small id={`ssp-${name}-note`} className="ssp-field-note">{note}</small> : null}
  </div>;
}

function Sheet({ title, subtitle, onClose, busy = false, children, footer, drawer = false }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus?.();
    };
  }, []);
  const handleKeyDown = event => {
    if (event.key === "Escape" && !busy) {
      event.preventDefault();
      closeRef.current();
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(ref.current.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex="0"]'
    )).filter(element => element.getClientRects().length > 0);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === ref.current)) {
      event.preventDefault(); first.focus();
    }
  };
  return <div className={`ssp-overlay ${drawer ? "ssp-drawer-overlay" : ""}`}
    onMouseDown={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <section ref={ref} className={`ssp-sheet ${drawer ? "ssp-drawer" : ""}`} role="dialog"
      aria-modal="true" aria-label={title} aria-busy={busy} tabIndex={-1} onKeyDown={handleKeyDown}>
      {!drawer && <i className="ssp-handle"/>}
      <header className="ssp-sheet-head"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
        <button type="button" className="ssp-icon" disabled={busy} onClick={onClose} aria-label="Close dialog"><X size={20}/></button>
      </header>
      <div className="ssp-sheet-body">{children}</div>
      {footer && <footer className="ssp-sheet-foot">{footer}</footer>}
    </section>
  </div>;
}

/** Segmented 6-box OTP input: auto-advance, backspace-to-previous, paste support. */
function OtpField({ id, title, phone, value, onChange, disabled, tone = "current", index = 1 }) {
  const boxes = useRef([]);
  const code = digits(value).slice(0, 6);
  const complete = code.length === 6;
  const focusBox = position => boxes.current[Math.min(5, Math.max(0, position))]?.focus();
  const handleChange = (position, event) => {
    const typed = digits(event.target.value);
    if (!typed) return;
    const next = (code.slice(0, position) + typed + code.slice(position + typed.length)).slice(0, 6);
    onChange(next);
    focusBox(position + typed.length);
  };
  const handleKeyDown = (position, event) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (code[position]) onChange(code.slice(0, position) + code.slice(position + 1));
      else if (position > 0) { onChange(code.slice(0, position - 1) + code.slice(position)); focusBox(position - 1); }
    } else if (event.key === "ArrowLeft") { event.preventDefault(); focusBox(position - 1); }
    else if (event.key === "ArrowRight") { event.preventDefault(); focusBox(position + 1); }
  };
  const handlePaste = event => {
    event.preventDefault();
    const pasted = digits(event.clipboardData.getData("text")).slice(0, 6);
    if (pasted) { onChange(pasted); focusBox(pasted.length); }
  };
  return <div className={`ssp-otp-card is-${tone} ${complete ? "is-complete" : ""}`}>
    <div className="ssp-otp-label">
      <i>{complete ? <CheckCircle2 size={18}/> : <Phone size={18}/>}<small>{index}</small></i>
      <div><span>{title}</span><b>{maskPhone(phone)}</b></div>
      <em className="ssp-otp-status">{complete ? "Ready" : `${code.length}/6`}</em>
    </div>
    <div className="ssp-otp-boxes" role="group" aria-label={title}>
      {Array.from({ length: 6 }, (_, position) => <input key={position} ref={element => { boxes.current[position] = element; }}
        id={position === 0 ? id : undefined} className={code[position] ? "is-filled" : ""} type="text" inputMode="numeric"
        autoComplete={position === 0 ? "one-time-code" : "off"} maxLength={6} value={code[position] || ""} disabled={disabled}
        aria-label={`${title} digit ${position + 1}`} onChange={event => handleChange(position, event)}
        onKeyDown={event => handleKeyDown(position, event)} onPaste={handlePaste} onFocus={event => event.target.select()}/>)}
    </div>
  </div>;
}

export default function SandSellerProfilePage({
  seller, sellerName = "", onProfileUpdated, onNavigate, onSignOut,
  onOpenHome, onOpenQueue, onOpenSampleUpload, onOpenMySamples, onOpenProfile,
  onRequestPhoneChange = mockRequestPhoneChange,
  onConfirmPhoneChange = mockConfirmPhoneChange,
  onVerifyAadhaar = mockVerifyAadhaar,
}) {
  const [profile, setProfile] = useState(() => initialProfile(seller, sellerName));
  const [draft, setDraft] = useState(profile);
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [pendingChange, setPendingChange] = useState(null);
  const [currentOtp, setCurrentOtp] = useState("");
  const [newOtp, setNewOtp] = useState("");
  const [resendAt, setResendAt] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoSettings, setPhotoSettings] = useState({ zoom: 1, x: 50, y: 50 });
  const profileRef = useRef(profile);
  const callbackRef = useRef(onProfileUpdated);
  const sellerRef = useRef(seller);
  const mountedRef = useRef(true);
  const operationRef = useRef(false);
  const toastTimer = useRef(null);
  const photoInput = useRef(null);
  const loadVersion = useRef(0);
  callbackRef.current = onProfileUpdated;
  sellerRef.current = seller;

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; clearTimeout(toastTimer.current); };
  }, []);
  useEffect(() => {
    if (!photoFile) { setPhotoPreview(""); return undefined; }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);
  useEffect(() => {
    if (sheet !== "otp") return undefined;
    const tick = () => setSeconds(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [sheet, resendAt]);

  const notify = useCallback(message => {
    if (!mountedRef.current) return;
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => { if (mountedRef.current) setToast(""); }, 4000);
  }, []);
  const applyRecord = useCallback((record, fallback) => {
    const mapped = mapProfile(record, fallback || profileRef.current);
    profileRef.current = mapped;
    setProfile(mapped);
    setDraft(mapped);
    // Notify the parent only with the server's record; never forge verified flags.
    try { callbackRef.current?.(record); } catch {
      notify("Profile saved. The parent screen could not refresh.");
    }
    return mapped;
  }, [notify]);

  const loadProfile = useCallback(async () => {
    const version = ++loadVersion.current;
    setLoading(true);
    setLoadError("");
    try {
      const current = sellerRef.current || getCurrentSeller();
      const publicId = current?.publicId || current?.sellerId || profileRef.current.sellerId;
      if (!publicId) throw new Error("Your seller account could not be found. Please sign in again.");
      const result = await getSellerProfile(publicId);
      const record = sellerFromResult(result);
      if (!record) throw new Error("The server did not return a seller profile.");
      if (mountedRef.current && version === loadVersion.current) applyRecord(record);
    } catch (loadFailure) {
      if (mountedRef.current && version === loadVersion.current) {
        setLoadError(loadFailure.message || "Unable to load your profile. Please try again.");
      }
    } finally {
      if (mountedRef.current && version === loadVersion.current) setLoading(false);
    }
  }, [applyRecord]);
  const externalSellerId = seller?.publicId || seller?.sellerId || "";
  useEffect(() => {
    const next = initialProfile(sellerRef.current, sellerName);
    profileRef.current = next;
    setProfile(next);
    setDraft(next);
    setSheet(null);
    setPendingChange(null);
    loadProfile();
    return () => { loadVersion.current += 1; };
  }, [externalSellerId, sellerName, loadProfile]);

  const beginOperation = () => {
    if (operationRef.current) return false;
    operationRef.current = true;
    setBusy(true);
    setError("");
    return true;
  };
  const endOperation = () => {
    operationRef.current = false;
    if (mountedRef.current) setBusy(false);
  };
  const closeSheet = () => {
    if (operationRef.current) return;
    setSheet(null); setError(""); setPendingChange(null);
    setCurrentOtp(""); setNewOtp(""); setPhotoFile(null);
  };
  const openEdit = () => {
    setDraft(profile); setFieldErrors({}); setError(""); setSheet("edit");
  };
  const updateDraft = (key, value) => {
    setDraft(previous => ({ ...previous, [key]: value }));
    setFieldErrors(previous => ({ ...previous, [key]: "" }));
    setError("");
  };
  const setResendCooldown = value => {
    const wait = numberInRange(value, 30, 0, 3600);
    setSeconds(Math.ceil(wait));
    setResendAt(Date.now() + wait * 1000);
  };

  const saveProfile = async event => {
    event?.preventDefault();
    const errors = validateProfile(draft);
    setFieldErrors(errors);
    if (Object.keys(errors).length || !beginOperation()) return;
    const cleaned = editableFields(draft);
    const snapshot = profileRef.current;
    try {
      if (!snapshot.sellerId) throw new Error("A seller account is required to save changes.");
      if (cleaned.primaryPhone !== snapshot.primaryPhone) {
        if (!onRequestPhoneChange || !onConfirmPhoneChange) {
          throw new Error("Secure phone changes are not connected yet. Connect both phone-verification callbacks to send and verify OTPs on your current and new numbers.");
        }
        if (!/^\d{10}$/.test(snapshot.primaryPhone)) {
          throw new Error("Your current mobile number is unavailable. Contact support before changing it.");
        }
        const result = await onRequestPhoneChange({
          sellerId: snapshot.sellerId, currentPhone: snapshot.primaryPhone, newPhone: cleaned.primaryPhone,
        });
        if (!result?.challengeId || typeof result.challengeId !== "string") {
          throw new Error("The OTP service did not return a valid verification request.");
        }
        if (!mountedRef.current || profileRef.current.sellerId !== snapshot.sellerId) return;
        setPendingChange({ sellerId: snapshot.sellerId, currentPhone: snapshot.primaryPhone,
          newPhone: cleaned.primaryPhone, profile: cleaned, challengeId: result.challengeId });
        setCurrentOtp(""); setNewOtp(""); setResendCooldown(result.retryAfterSeconds);
        setSheet("otp");
      } else {
        const result = await updateSellerProfile(snapshot.sellerId, cleaned);
        const record = sellerFromResult(result);
        if (!record) throw new Error("The server did not return the saved profile. Refresh before retrying.");
        if (!mountedRef.current || profileRef.current.sellerId !== snapshot.sellerId) return;
        applyRecord(record, { ...snapshot, ...cleaned });
        setSheet(null); notify("Your profile has been updated.");
      }
    } catch (saveFailure) {
      if (mountedRef.current) setError(saveFailure.message || "Unable to save your profile.");
    } finally { endOperation(); }
  };

  const confirmPhone = async event => {
    event.preventDefault();
    if (!/^\d{6}$/.test(currentOtp) || !/^\d{6}$/.test(newOtp)) {
      setError("Enter both complete 6-digit OTPs to continue."); return;
    }
    if (!pendingChange || !beginOperation()) return;
    try {
      if (!onConfirmPhoneChange) throw new Error("The secure phone verification service is unavailable.");
      const result = await onConfirmPhoneChange({ ...pendingChange, currentOtp, newOtp });
      const record = sellerFromResult(result);
      if (!record || phoneValue(record.phone ?? record.primaryPhone) !== pendingChange.newPhone) {
        throw new Error("The server has not confirmed the new number. Refresh your profile before retrying.");
      }
      if (!mountedRef.current || profileRef.current.sellerId !== pendingChange.sellerId) return;
      applyRecord(record, { ...profileRef.current, ...pendingChange.profile });
      setPendingChange(null); setCurrentOtp(""); setNewOtp(""); setSheet(null);
      notify("Both numbers verified. Your profile has been updated.");
    } catch (otpFailure) {
      if (mountedRef.current) setError(otpFailure.message || "Unable to verify these OTPs. Please try again.");
    } finally { endOperation(); }
  };

  const resendOtps = async () => {
    if (Date.now() < resendAt || !pendingChange || !beginOperation()) return;
    try {
      if (!onRequestPhoneChange) throw new Error("The OTP service is unavailable.");
      const result = await onRequestPhoneChange({
        sellerId: pendingChange.sellerId, currentPhone: pendingChange.currentPhone,
        newPhone: pendingChange.newPhone, challengeId: pendingChange.challengeId,
      });
      if (!result?.challengeId || typeof result.challengeId !== "string") throw new Error("Unable to resend OTPs. Please try again.");
      if (!mountedRef.current) return;
      setPendingChange(previous => previous ? { ...previous, challengeId: result.challengeId } : null);
      setCurrentOtp(""); setNewOtp(""); setResendCooldown(result.retryAfterSeconds);
      notify("New OTPs have been sent to both numbers.");
    } catch (resendFailure) {
      if (mountedRef.current) setError(resendFailure.message || "Unable to resend OTPs.");
    } finally { endOperation(); }
  };

  const startAadhaarVerification = async () => {
    if (profile.aadhaarVerified || !beginOperation()) return;
    try {
      if (!profile.sellerId) throw new Error("Sign in to your seller account before verifying Aadhaar.");
      if (onVerifyAadhaar) {
        const result = await onVerifyAadhaar({ sellerId: profile.sellerId });
        if (!mountedRef.current) return;
        const record = sellerFromResult(result);
        if (record) {
          applyRecord(record);
          setSheet(null);
          notify(record.aadhaarVerified === true ? "Aadhaar verification completed." : "Verification status updated.");
        } else {
          setSheet(null);
          await loadProfile();
        }
      } else if (onNavigate) {
        setSheet(null);
        await onNavigate("aadhaarVerification");
      } else {
        throw new Error("Aadhaar verification is not connected yet. Add onVerifyAadhaar or an Aadhaar route to continue.");
      }
    } catch (verificationFailure) {
      if (mountedRef.current) setError(verificationFailure.message || "Unable to open Aadhaar verification.");
    } finally { endOperation(); }
  };

  const choosePhoto = event => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 15 * 1024 * 1024) {
      notify("Choose a JPG, PNG or WEBP image up to 15 MB."); return;
    }
    setPhotoFile(file); setPhotoSettings({ zoom: 1, x: 50, y: 50 }); setError(""); setSheet("photo");
  };
  const savePhoto = async () => {
    if (!photoFile || !beginOperation()) return;
    try {
      const snapshot = profileRef.current;
      const result = await uploadSellerProfilePhoto(snapshot.sellerId, photoFile, photoSettings);
      const record = sellerFromResult(result);
      if (!record) throw new Error("The server did not return the updated profile photo.");
      if (!mountedRef.current || profileRef.current.sellerId !== snapshot.sellerId) return;
      applyRecord(record); setPhotoFile(null); setSheet(null); notify("Profile photo updated.");
    } catch (photoFailure) {
      if (mountedRef.current) setError(photoFailure.message || "Unable to upload your photo.");
    } finally { endOperation(); }
  };

  const navigate = (target, handler) => {
    if (target === "profile" && !handler) return;
    if (handler) handler();
    else if (onNavigate) onNavigate(target);
    else notify("Connect this navigation action in your app.");
  };
  const tabs = [
    { id: "samples", label: "Sample", icon: ImageUp, action: onOpenSampleUpload },
    { id: "queue", label: "Queue", icon: ListOrdered, action: onOpenQueue },
    { id: "home", label: "Home", icon: Home, action: onOpenHome },
    { id: "mySamples", label: "My Sample", icon: Boxes, action: onOpenMySamples },
    { id: "profile", label: "Profile", icon: UserRound, action: onOpenProfile },
  ];
  const verified = profile.aadhaarVerified && profile.adminVerified;
  const completed = Number(profile.aadhaarVerified) + Number(profile.adminVerified);
  const percent = completeness(profile);
  const contacts = Number(Boolean(profile.primaryPhone)) + Number(Boolean(profile.alternatePhone)) + Number(Boolean(profile.email));
  const phoneChanged = phoneValue(draft.primaryPhone) !== profile.primaryPhone;
  const ready = !loading && !loadError && Boolean(profile.sellerId);
  const location = [profile.city, profile.state, profile.pincode].filter(Boolean).join(" · ");
  const describedBy = name => fieldErrors[name] ? `ssp-${name}-error` : undefined;
  const inputProps = name => ({
    id: `ssp-${name}`, name, value: draft[name], disabled: busy,
    onChange: event => updateDraft(name, event.target.value),
    "aria-invalid": Boolean(fieldErrors[name]), "aria-describedby": describedBy(name),
  });
  const sheetError = error ? <div className="ssp-alert" role="alert"><AlertCircle size={17}/><span>{error}</span></div> : null;
  const photoStyle = {
    objectPosition: `${profile.photoX}% ${profile.photoY}%`, transform: `scale(${profile.photoZoom})`,
    transformOrigin: `${profile.photoX}% ${profile.photoY}%`,
  };

  return <div className="sand-seller-profile">
    <style>{CSS}</style>
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
      <defs><linearGradient id="ssp-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#5b6cff"/><stop offset="55%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#22c1ee"/>
      </linearGradient></defs>
    </svg>
    <div className="ssp-orb ssp-orb-one" aria-hidden="true"/>
    <div className="ssp-orb ssp-orb-two" aria-hidden="true"/>
    <div className="ssp-orb ssp-orb-three" aria-hidden="true"/>

    <header className="ssp-top">
      <div className="ssp-top-left"><button type="button" className="ssp-icon" onClick={() => setSheet("menu")} aria-label="Open navigation"><Menu size={19}/></button>
        <div className="ssp-top-copy"><span>SAND SELLER</span><b>My profile</b></div></div>
      <Brand/>
      <button type="button" className="ssp-icon" onClick={loadProfile} disabled={loading || busy} aria-label="Refresh profile">
        <RefreshCw size={18} className={loading ? "ssp-spin" : ""}/>
      </button>
    </header>

    <main className="ssp-content" aria-busy={loading}>
      {loadError && <div className="ssp-alert" role="alert"><AlertCircle size={18}/><span>{loadError}</span>
        <button type="button" onClick={loadProfile}>Retry</button></div>}
      {loading && <div className="ssp-loading" role="status"><i><RefreshCw size={14} className="ssp-spin"/></i>Syncing your profile and verification status…</div>}

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="ssp-hero ssp-reveal" aria-labelledby="ssp-profile-title">
        <div className="ssp-hero-mesh" aria-hidden="true"/>
        <div className="ssp-hero-glow ssp-glow-a" aria-hidden="true"/>
        <div className="ssp-hero-glow ssp-glow-b" aria-hidden="true"/>
        <div className="ssp-hero-sheen" aria-hidden="true"/>
        <div className="ssp-hero-particles" aria-hidden="true">
          {Array.from({ length: 9 }, (_, index) => <i key={index} style={{ "--i": index }}/>)}
        </div>
        <div className="ssp-hero-art" aria-hidden="true"><Mountain/><div className="ssp-art-ring"/><div className="ssp-art-ring ssp-art-ring-two"/></div>

        <div className="ssp-hero-top ssp-hero-in" style={{ "--d": "120ms" }}>
          <span className="ssp-eyebrow"><Star size={10} className="ssp-twinkle"/>YOUR SELLER ACCOUNT</span>
          <Badge verified={verified} light>{verified ? "Verified seller" : "Unverified"}</Badge>
        </div>

        <div className="ssp-identity ssp-hero-in" style={{ "--d": "220ms" }}>
          <div className="ssp-avatar-wrap">
            <span className="ssp-avatar-halo" aria-hidden="true"/>
            <Ring value={percent} size={108} stroke={3.5} light>
              <div className="ssp-avatar">
                {profile.photoUrl ? <img src={profile.photoUrl} alt="Seller profile" style={photoStyle}/>
                  : initials(profile.name) ? <span>{initials(profile.name)}</span> : <UserRound size={32}/>}
              </div>
            </Ring>
            <button type="button" className="ssp-camera" onClick={() => photoInput.current?.click()} disabled={!ready} aria-label="Change profile photo"><Camera size={14}/></button>
            {verified && <i className="ssp-avatar-check" aria-hidden="true"><BadgeCheck size={16}/></i>}
          </div>
          <div className="ssp-hero-name">
            <span>Plant name</span>
            <h1 id="ssp-profile-title">{profile.plantName || "Your sand plant"}</h1>
            <p><UserRound size={14}/>{profile.name || "Add your name"}</p>
            {profile.sellerId && <small><Hash size={10}/>Seller ID <b>{profile.sellerId}</b></small>}
          </div>
        </div>

        <div className="ssp-stats ssp-hero-in" style={{ "--d": "340ms" }}>
          <Stat icon={ShieldCheck} value={`${completed}/2`} label="Verification"/>
          <Stat icon={Sparkles} value={`${percent}%`} label="Profile complete"/>
          <Stat icon={Phone} value={contacts} label={contacts === 1 ? "Contact" : "Contacts"}/>
        </div>

        <div className="ssp-hero-bottom ssp-hero-in" style={{ "--d": "440ms" }}>
          <p><ShieldCheck size={16}/>{verified ? "Your seller account is fully verified." : "Complete verification to unlock a verified badge."}</p>
          <button type="button" className="ssp-hero-edit" disabled={!ready} onClick={openEdit}><SquarePen size={15}/>Edit profile</button>
        </div>
      </section>
      <input ref={photoInput} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={choosePhoto}/>

      <div className="ssp-layout">
        {/* ─── Details ──────────────────────────────────────── */}
        <section className="ssp-card ssp-details ssp-reveal" style={{ "--delay": "140ms" }} aria-labelledby="ssp-details-title">
          <div className="ssp-section-head">
            <div><span className="ssp-kicker">THE DETAILS</span><h2 id="ssp-details-title">Plant & personal details</h2><p>Your business, all in one place.</p></div>
            <button type="button" className="ssp-edit-link" onClick={openEdit} disabled={!ready} aria-label="Edit plant and personal details"><SquarePen size={15}/><span>Edit</span></button>
          </div>
          <dl className="ssp-detail-grid">
            <Detail icon={Building2} label="Plant name" value={profile.plantName} tone="indigo" full/>
            <Detail icon={UserRound} label="Owner name" value={profile.name} tone="violet" full/>
            <Detail icon={Phone} label="Mobile number" value={profile.primaryPhone ? `+91 ${profile.primaryPhone}` : ""} hint="Primary contact" tone="indigo"/>
            <Detail icon={Phone} label="Alternate mobile" value={profile.alternatePhone ? `+91 ${profile.alternatePhone}` : ""} hint="Additional contact" tone="violet"/>
            <Detail icon={Mail} label="Email" value={profile.email} tone="cyan" full/>
            <Detail icon={MapPin} label="Plant address" value={profile.address} hint={location} tone="map" full/>
          </dl>
          <div className="ssp-secure-note"><i><LockKeyhole size={15}/></i><span>Changing your primary mobile requires an OTP on both your current and new numbers.</span></div>
        </section>

        {/* ─── Verification ─────────────────────────────────── */}
        <section className="ssp-card ssp-verification ssp-reveal" style={{ "--delay": "200ms" }} aria-labelledby="ssp-verification-title">
          <div className="ssp-section-head">
            <div><span className="ssp-kicker">BUILD TRUST</span><h2 id="ssp-verification-title">Verification</h2><p>A clear status, every step of the way.</p></div>
            <i className="ssp-section-icon"><ShieldCheck size={22}/></i>
          </div>

          <div className={`ssp-verification-progress ${verified ? "is-complete" : ""}`}>
            <Ring value={completed * 50} size={72} stroke={5}>
              <b>{completed}<small>/2</small></b>
            </Ring>
            <div className="ssp-progress-copy">
              <b>{verified ? "You're all verified" : "Your verification journey"}</b>
              <span>{verified ? "Both checks are complete. Buyers can trust your plant." : `${2 - completed} step${completed === 1 ? "" : "s"} remaining to earn the verified badge.`}</span>
              <div className="ssp-progress-track" role="progressbar" aria-label="Verification steps completed" aria-valuemin={0} aria-valuemax={2} aria-valuenow={completed}>
                <i style={{ width: `${completed * 50}%` }}/></div>
            </div>
          </div>

          <ol className="ssp-timeline">
            <li className={`ssp-step ${profile.aadhaarVerified ? "is-complete" : "is-active"}`}>
              <div className="ssp-step-icon"><Fingerprint size={23}/><small>{profile.aadhaarVerified ? <CheckCircle2 size={11}/> : "01"}</small></div>
              <div className="ssp-step-copy">
                <div className="ssp-step-title"><h3>Aadhaar verification</h3><Badge verified={profile.aadhaarVerified}>{profile.aadhaarVerified ? "Verified" : "Pending"}</Badge></div>
                <p>{profile.aadhaarVerified ? "Your identity has been verified securely." : "Verify your identity through the secure Aadhaar flow."}</p>
                {!profile.aadhaarVerified && <button type="button" className="ssp-verify-button" disabled={!ready}
                  onClick={() => { setError(""); setSheet("aadhaar"); }}>Verify now<ArrowRight size={15}/></button>}
              </div>
            </li>
            <li className={`ssp-step ssp-step-admin ${profile.adminVerified ? "is-complete" : ""}`}>
              <div className="ssp-step-icon"><ShieldCheck size={23}/><small>{profile.adminVerified ? <CheckCircle2 size={11}/> : "02"}</small></div>
              <div className="ssp-step-copy">
                <div className="ssp-step-title"><h3>Admin verification</h3><Badge verified={profile.adminVerified}>{profile.adminVerified ? "Verified" : "Yet to verify"}</Badge></div>
                <p>{profile.adminVerified ? "Your plant has been approved by the StoneRate admin team." : "Your plant will be reviewed by the StoneRate admin team."}</p>
              </div>
            </li>
          </ol>
          <div className="ssp-admin-note"><i><LockKeyhole size={14}/></i><span>Admin verification is updated by the StoneRate team. No action is needed here.</span></div>
        </section>
      </div>

      {onSignOut && <button type="button" className="ssp-signout ssp-reveal" style={{ "--delay": "260ms" }} onClick={() => { setError(""); setSheet("signout"); }}>
        <i><LogOut size={17}/></i><div><b>Sign out</b><span>End this seller session securely</span></div><ChevronRight size={17}/>
      </button>}
      <footer className="ssp-footer"><Brand/><span>SAND SELLER CONSOLE</span></footer>
    </main>

    {/* ─── Bottom navigation (unchanged treatment) ──────────── */}
    <nav className="ssp-bottom-nav" aria-label="Primary"><div className="ssp-nav-pill">
      {tabs.map(({ id, label, icon: Icon, action }) => <button type="button" key={id}
        className={id === "profile" ? "active" : ""} aria-current={id === "profile" ? "page" : undefined}
        onClick={() => navigate(id, action)}><span><Icon/></span><small>{label}</small></button>)}
    </div></nav>
    <div className={`ssp-toast ${toast ? "is-visible" : ""}`} role="status" aria-live="polite">{toast}</div>

    {sheet === "menu" && <Sheet title="Seller navigation" subtitle="Your StoneRate workspace" drawer onClose={closeSheet}>
      <div className="ssp-menu-seller"><i><Mountain size={25}/></i><div><b>{profile.plantName || "Your sand plant"}</b><span>{profile.name || "Sand seller"}</span></div></div>
      <nav className="ssp-menu-links" aria-label="Seller navigation">{tabs.map(({ id, label, icon: Icon, action }) => <button type="button" key={id}
        className={id === "profile" ? "active" : ""} aria-current={id === "profile" ? "page" : undefined}
        onClick={() => { closeSheet(); navigate(id, action); }}><i><Icon size={18}/></i><span>{label}</span><ChevronRight size={16}/></button>)}</nav>
      <div className="ssp-menu-brand"><Brand/><small>Sand seller console</small></div>
    </Sheet>}

    {sheet === "edit" && <Sheet title="Edit your profile" subtitle="Keep your plant and contact details up to date." busy={busy} onClose={closeSheet}
      footer={<><button type="button" className="ssp-secondary" disabled={busy} onClick={closeSheet}>Cancel</button>
        <button type="submit" form="ssp-edit-form" className="ssp-primary" disabled={busy}>{busy ? <RefreshCw size={16} className="ssp-spin"/> : phoneChanged ? <LockKeyhole size={16}/> : <CheckCircle2 size={16}/>}
          {busy ? "Please wait…" : phoneChanged ? "Send both OTPs" : "Save changes"}</button></>}>
      <form id="ssp-edit-form" onSubmit={saveProfile} noValidate><fieldset className="ssp-form-grid" disabled={busy}>
        <Field name="plantName" label="Plant name" error={fieldErrors.plantName} full><input {...inputProps("plantName")} autoComplete="organization" required/></Field>
        <Field name="name" label="Your name" error={fieldErrors.name} full><input {...inputProps("name")} autoComplete="name" required/></Field>
        <Field name="primaryPhone" label="Mobile number" error={fieldErrors.primaryPhone}>
          <div className="ssp-phone-input"><span>+91</span><input {...inputProps("primaryPhone")} type="tel" inputMode="numeric" maxLength={10} autoComplete="tel-national" required
            onChange={event => updateDraft("primaryPhone", cleanPhone(event.target.value))}/></div></Field>
        <Field name="alternatePhone" label="Alternate mobile number" error={fieldErrors.alternatePhone}>
          <div className="ssp-phone-input"><span>+91</span><input {...inputProps("alternatePhone")} type="tel" inputMode="numeric" maxLength={10}
            onChange={event => updateDraft("alternatePhone", cleanPhone(event.target.value))}/></div></Field>
        {phoneChanged && <div className="ssp-phone-warning ssp-full"><i><LockKeyhole size={18}/></i><div><b>Double OTP verification required</b><p>We'll send one OTP to <strong>{maskPhone(profile.primaryPhone)}</strong> and another to your new mobile <strong>{maskPhone(draft.primaryPhone) === "Not provided" ? "number" : maskPhone(draft.primaryPhone)}</strong>. Your existing number stays active until both codes are verified.</p></div></div>}
        <Field name="address" label="Plant address" error={fieldErrors.address} full><textarea {...inputProps("address")} rows={3} autoComplete="street-address" required placeholder="Plot / building, road and locality"/></Field>
        <Field name="city" label="City (optional)"><input {...inputProps("city")} autoComplete="address-level2"/></Field>
        <Field name="state" label="State (optional)"><input {...inputProps("state")} autoComplete="address-level1"/></Field>
        <Field name="pincode" label="PIN code (optional)" error={fieldErrors.pincode}><input {...inputProps("pincode")} inputMode="numeric" maxLength={6} autoComplete="postal-code"
          onChange={event => updateDraft("pincode", digits(event.target.value).slice(0, 6))}/></Field>
        <Field name="email" label="Email (optional)" error={fieldErrors.email}><input {...inputProps("email")} type="email" autoComplete="email"/></Field>
      </fieldset>{sheetError}<div className="ssp-form-note"><ShieldCheck size={15}/>Your verification status cannot be changed from this form.</div></form>
    </Sheet>}

    {sheet === "otp" && pendingChange && <Sheet title="Secure mobile change" subtitle="One OTP for each number. One safer account." busy={busy}
      onClose={() => { if (!busy) { setSheet("edit"); setError(""); setCurrentOtp(""); setNewOtp(""); } }}
      footer={<><button type="button" className="ssp-secondary" disabled={busy} onClick={() => { setSheet("edit"); setError(""); setCurrentOtp(""); setNewOtp(""); }}>Back</button>
        <button type="submit" form="ssp-otp-form" className="ssp-primary" disabled={busy}>{busy ? <RefreshCw size={16} className="ssp-spin"/> : <ShieldCheck size={16}/>}{busy ? "Verifying…" : "Verify & update"}</button></>}>
      <div className="ssp-otp-hero">
        <div className="ssp-otp-hero-glow" aria-hidden="true"/>
        <i className="ssp-otp-shield"><LockKeyhole size={24}/><span className="ssp-otp-pulse" aria-hidden="true"/></i>
        <b>Two numbers. Two codes. One secure change.</b>
        <p>We sent separate OTPs to your current and new mobile. Enter both to finish.</p>
        <div className="ssp-otp-route" aria-hidden="true">
          <span className={currentOtp.length === 6 ? "is-done" : ""}><Phone size={12}/>{maskPhone(pendingChange.currentPhone)}</span>
          <em className="ssp-otp-route-line"><i/></em>
          <span className={newOtp.length === 6 ? "is-done" : ""}><Phone size={12}/>{maskPhone(pendingChange.newPhone)}</span>
        </div>
      </div>
      <form id="ssp-otp-form" onSubmit={confirmPhone} noValidate>
        <OtpField id="ssp-current-otp" index={1} tone="current" title="Current mobile OTP" phone={pendingChange.currentPhone} value={currentOtp} disabled={busy} onChange={value => { setCurrentOtp(value); setError(""); }}/>
        <OtpField id="ssp-new-otp" index={2} tone="new" title="New mobile OTP" phone={pendingChange.newPhone} value={newOtp} disabled={busy} onChange={value => { setNewOtp(value); setError(""); }}/>
        {sheetError}
      </form>
      <button type="button" className="ssp-resend" disabled={busy || seconds > 0} onClick={resendOtps}>
        <RefreshCw size={14} className={seconds > 0 ? "" : "ssp-resend-ready"}/>{seconds > 0 ? `Resend both OTPs in ${seconds}s` : "Resend both OTPs"}
      </button>
      {onConfirmPhoneChange === mockConfirmPhoneChange && <div className="ssp-demo-chip"><FlaskConical size={13}/>Frontend demo — use <b>{DEMO_OTP}</b> for both codes</div>}
      <p className="ssp-otp-help">Never share your OTPs. Your primary mobile changes only after both codes are verified.</p>
    </Sheet>}

    {sheet === "aadhaar" && <Sheet title="Aadhaar verification" subtitle="Verify your identity with the secure verification flow." busy={busy} onClose={closeSheet}
      footer={<><button type="button" className="ssp-secondary" disabled={busy} onClick={closeSheet}>Not now</button><button type="button" className="ssp-primary" disabled={busy} onClick={startAadhaarVerification}>
        {busy ? <RefreshCw size={16} className="ssp-spin"/> : <ArrowRight size={16}/>}{busy ? "Opening…" : "Continue"}</button></>}>
      <div className="ssp-verification-intro"><i><Fingerprint size={40}/></i><h3>Your identity. Securely verified.</h3><p>Continue to the connected Aadhaar verification service. This profile page does not collect or store your Aadhaar number.</p></div>
      <div className="ssp-secure-note"><i><LockKeyhole size={15}/></i><span>Only a successful verification response updates your status. Admin approval is a separate step.</span></div>{sheetError}
    </Sheet>}

    {sheet === "photo" && <Sheet title="Your profile photo" subtitle="Adjust the circular preview before uploading." busy={busy} onClose={closeSheet}
      footer={<><button type="button" className="ssp-secondary" disabled={busy} onClick={closeSheet}>Cancel</button><button type="button" className="ssp-primary" disabled={busy || !photoFile} onClick={savePhoto}>
        {busy ? <RefreshCw size={16} className="ssp-spin"/> : <Camera size={16}/>}{busy ? "Uploading…" : "Save photo"}</button></>}>
      <div className="ssp-photo-stage"><div>{photoPreview && <img src={photoPreview} alt="Profile photo preview" style={{
        objectPosition: `${photoSettings.x}% ${photoSettings.y}%`, transform: `scale(${photoSettings.zoom})`,
        transformOrigin: `${photoSettings.x}% ${photoSettings.y}%`,
      }}/>}</div></div>
      <div className="ssp-photo-controls">{[
        { key: "zoom", label: "Zoom", min: 1, max: 2.2, step: 0.05 },
        { key: "x", label: "Horizontal position", min: 0, max: 100, step: 1 },
        { key: "y", label: "Vertical position", min: 0, max: 100, step: 1 },
      ].map(control => <label key={control.key}><span>{control.label}<b>{control.key === "zoom" ? `${photoSettings.zoom.toFixed(2)}×` : `${photoSettings[control.key]}%`}</b></span><input type="range" min={control.min} max={control.max} step={control.step}
        value={photoSettings[control.key]} disabled={busy} onChange={event => setPhotoSettings(previous => ({ ...previous, [control.key]: Number(event.target.value) }))}/></label>)}</div>
      <p className="ssp-otp-help">The original image is uploaded unchanged. These adjustments control its circular display.</p>{sheetError}
    </Sheet>}

    {sheet === "signout" && <Sheet title="Sign out?" subtitle="End this seller session securely." busy={busy} onClose={closeSheet}
      footer={<><button type="button" className="ssp-secondary" disabled={busy} onClick={closeSheet}>Cancel</button><button type="button" className="ssp-danger" disabled={busy} onClick={async () => {
        if (!beginOperation()) return;
        try { await onSignOut?.(); if (mountedRef.current) setSheet(null); }
        catch (signoutFailure) { if (mountedRef.current) setError(signoutFailure.message || "Unable to sign out."); }
        finally { endOperation(); }
      }}>{busy ? "Signing out…" : "Sign out"}</button></>}>
      <div className="ssp-signout-intro"><i><LogOut size={30}/></i><p className="ssp-signout-copy">You will need to sign in again to access your seller account.</p></div>{sheetError}
    </Sheet>}
  </div>;
}

const CSS = `
.sand-seller-profile {
  --ssp-ink:#1b2340; --ssp-muted:#6b7590; --ssp-line:rgba(120,135,180,.16);
  --ssp-indigo:#5b6cff; --ssp-violet:#8b5cf6; --ssp-cyan:#22c1ee; --ssp-green:#16b981;
  --ssp-grad:linear-gradient(135deg,#5b6cff 0%,#8b5cf6 55%,#22c1ee 100%);
  --ssp-grad-soft:linear-gradient(135deg,rgba(91,108,255,.12),rgba(139,92,246,.10) 55%,rgba(34,193,238,.12));
  --ssp-glass:rgba(255,255,255,.80);
  --ssp-shadow:0 14px 40px rgba(64,84,150,.11),0 2px 6px rgba(64,84,150,.05);
  --ssp-shadow-hover:0 22px 52px rgba(64,84,150,.17),0 4px 10px rgba(64,84,150,.06);
  position:relative; isolation:isolate; min-height:100vh; min-height:100dvh;
  padding-bottom:calc(96px + env(safe-area-inset-bottom,0px));
  background:
    radial-gradient(1200px 500px at 50% -180px,rgba(139,92,246,.10),transparent 60%),
    linear-gradient(180deg,#eef0ff 0%,#e9edfb 40%,#e6f0fa 100%);
  color:var(--ssp-ink); font-family:"Plus Jakarta Sans",Inter,"Segoe UI",system-ui,sans-serif;
  font-size:14px; line-height:1.5; -webkit-font-smoothing:antialiased; color-scheme:light;
}
.sand-seller-profile *, .sand-seller-profile *::before, .sand-seller-profile *::after { box-sizing:border-box; }
.sand-seller-profile button,.sand-seller-profile input,.sand-seller-profile textarea { font:inherit; }
.sand-seller-profile button { cursor:pointer; -webkit-tap-highlight-color:transparent; }
.sand-seller-profile button:disabled { cursor:not-allowed; opacity:.55; }
.sand-seller-profile button:focus-visible,.sand-seller-profile input:focus-visible,.sand-seller-profile textarea:focus-visible { outline:3px solid rgba(91,108,255,.4); outline-offset:3px; }
.sand-seller-profile svg { flex-shrink:0; }
.sand-seller-profile button { transition:transform .22s cubic-bezier(.2,.8,.2,1),box-shadow .22s,background .22s,color .22s,border-color .22s; }
.sand-seller-profile button:active:not(:disabled) { transform:scale(.97); }

/* Ambient orbs */
.ssp-orb { position:fixed; z-index:-1; border-radius:50%; filter:blur(70px); pointer-events:none; opacity:.75; animation:ssp-float 14s ease-in-out infinite; }
.ssp-orb-one { width:360px; height:360px; left:-130px; top:-90px; background:radial-gradient(circle,#c3caff,transparent 70%); }
.ssp-orb-two { width:300px; height:400px; right:-40px; top:220px; background:radial-gradient(circle,#b9ecfb,transparent 70%); animation-delay:-5s; }
.ssp-orb-three { width:280px; height:280px; left:30%; bottom:-80px; background:radial-gradient(circle,#e3d4ff,transparent 70%); animation-delay:-9s; }

/* Reveal animation */
.ssp-reveal { animation:ssp-up .55s cubic-bezier(.2,.8,.2,1) both; animation-delay:var(--delay,0ms); }

/* Top bar */
.ssp-top { position:sticky; top:0; z-index:40; max-width:1180px; margin:auto; min-height:68px; padding:12px 16px; display:flex; align-items:center; gap:14px; background:rgba(255,255,255,.72); backdrop-filter:blur(22px) saturate(160%); -webkit-backdrop-filter:blur(22px) saturate(160%); border-bottom:1px solid var(--ssp-line); }
.ssp-top::after { content:""; position:absolute; left:0; right:0; bottom:-1px; height:2px; background:var(--ssp-grad); opacity:.55; mask:linear-gradient(90deg,transparent,#000 20%,#000 80%,transparent); -webkit-mask:linear-gradient(90deg,transparent,#000 20%,#000 80%,transparent); }
.ssp-top-left { display:flex; align-items:center; gap:10px; margin-right:auto; min-width:0; }
.ssp-top-copy span,.ssp-top-copy b { display:block; }
.ssp-top-copy span { font-size:8px; letter-spacing:1.3px; color:var(--ssp-muted); font-weight:800; }
.ssp-top-copy b { font-size:14px; letter-spacing:-.3px; }
.ssp-icon { display:grid; place-items:center; width:39px; height:39px; flex:none; border:1px solid var(--ssp-line); border-radius:13px; background:rgba(255,255,255,.92); color:#3b4468; box-shadow:0 6px 16px rgba(64,84,150,.08); }
.ssp-icon:hover:not(:disabled) { box-shadow:0 10px 22px rgba(64,84,150,.14); transform:translateY(-1px); color:var(--ssp-indigo); border-color:rgba(91,108,255,.3); }
.ssp-brand { display:flex; align-items:center; white-space:nowrap; font-size:18px; font-weight:900; letter-spacing:-.7px; line-height:1; }
.ssp-brand i { width:24px; height:24px; margin-right:5px; display:grid; place-items:center; border-radius:8px; background:var(--ssp-grad); color:#fff; box-shadow:0 6px 14px rgba(91,108,255,.25); }
.ssp-brand span { color:var(--ssp-ink); }
.ssp-brand b { background:var(--ssp-grad); -webkit-background-clip:text; background-clip:text; color:transparent; }
.ssp-content { position:relative; max-width:1060px; margin:0 auto; padding:20px 16px 0; }
.ssp-loading { display:inline-flex; align-items:center; gap:9px; margin-bottom:14px; padding:8px 14px 8px 8px; border-radius:99px; border:1px solid rgba(91,108,255,.14); background:rgba(255,255,255,.7); color:#4958bf; font-size:11.5px; font-weight:600; box-shadow:0 6px 18px rgba(64,84,150,.08); }
.ssp-loading i { display:grid; place-items:center; width:26px; height:26px; border-radius:50%; background:var(--ssp-grad-soft); color:var(--ssp-indigo); }

/* Hero */
.ssp-hero { position:relative; overflow:hidden; padding:23px; border-radius:30px; background:var(--ssp-grad); color:#fff; box-shadow:0 24px 54px rgba(91,108,255,.32),0 1px 0 rgba(255,255,255,.35) inset; }
.ssp-hero::after { content:""; position:absolute; inset:0; pointer-events:none; border-radius:inherit; border:1px solid rgba(255,255,255,.3); background:radial-gradient(ellipse at 4% 0%,rgba(255,255,255,.22),transparent 60%); }
.ssp-hero-mesh { position:absolute; inset:0; pointer-events:none; opacity:.14; background-image:linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px); background-size:34px 34px; mask:radial-gradient(ellipse at 70% 40%,#000 20%,transparent 75%); -webkit-mask:radial-gradient(ellipse at 70% 40%,#000 20%,transparent 75%); }
.ssp-hero-glow { position:absolute; border-radius:50%; filter:blur(40px); pointer-events:none; }
.ssp-glow-a { width:260px; height:260px; right:-60px; top:-100px; background:rgba(255,255,255,.28); animation:ssp-float 12s ease-in-out infinite; }
.ssp-glow-b { width:220px; height:220px; left:-80px; bottom:-120px; background:rgba(34,193,238,.45); animation:ssp-float 16s ease-in-out infinite reverse; }
/* Hero motion layer */
.ssp-hero { background-size:220% 220%; animation:ssp-up .55s cubic-bezier(.2,.8,.2,1) both,ssp-hue 14s ease-in-out infinite; }
.ssp-hero-sheen { position:absolute; inset:-40% -60%; pointer-events:none; background:linear-gradient(115deg,transparent 42%,rgba(255,255,255,.22) 50%,transparent 58%); animation:ssp-sheen 6.5s cubic-bezier(.4,0,.2,1) infinite; animation-delay:1.2s; }
.ssp-hero-particles { position:absolute; inset:0; pointer-events:none; overflow:hidden; }
.ssp-hero-particles i { position:absolute; bottom:-10px; left:calc(8% + var(--i) * 10.5%); width:5px; height:5px; border-radius:50%; background:rgba(255,255,255,.85); box-shadow:0 0 10px rgba(255,255,255,.9); opacity:0; animation:ssp-rise-dot calc(7s + var(--i) * .7s) linear infinite; animation-delay:calc(var(--i) * -1.3s); }
.ssp-hero-particles i:nth-child(even) { width:3px; height:3px; }
.ssp-hero-particles i:nth-child(3n) { background:rgba(200,240,255,.9); }
.ssp-hero-in { animation:ssp-hero-in .7s cubic-bezier(.2,.8,.2,1) both; animation-delay:var(--d,0ms); }
.ssp-twinkle { animation:ssp-twinkle 2.4s ease-in-out infinite; }
.ssp-avatar-halo { position:absolute; inset:-10px; border-radius:50%; pointer-events:none; background:conic-gradient(from 0deg,rgba(255,255,255,0),rgba(255,255,255,.55),rgba(255,255,255,0) 60%); filter:blur(6px); animation:ssp-spin 5s linear infinite; opacity:.8; }
.ssp-avatar-wrap .ssp-ring-fill { animation:ssp-draw 1.4s cubic-bezier(.2,.8,.2,1) both; animation-delay:.5s; }
.ssp-avatar { animation:ssp-breathe 4.5s ease-in-out infinite; }
.ssp-hero-art>svg { animation:ssp-drift 9s ease-in-out infinite; }
.ssp-stat { animation:ssp-stat-in .6s cubic-bezier(.2,.8,.2,1) both; }
.ssp-stat:nth-child(1) { animation-delay:.45s; } .ssp-stat:nth-child(2) { animation-delay:.55s; } .ssp-stat:nth-child(3) { animation-delay:.65s; }
.ssp-hero-edit { position:relative; overflow:hidden; }
.ssp-hero-edit::after { content:""; position:absolute; inset:0; background:linear-gradient(115deg,transparent 40%,rgba(98,86,215,.14) 50%,transparent 60%); transform:translateX(-120%); animation:ssp-btn-sheen 4s ease-in-out infinite; animation-delay:2s; }
.ssp-hero-art { position:absolute; right:-25px; bottom:-35px; width:270px; height:240px; pointer-events:none; opacity:.2; }
.ssp-hero-art>svg { position:absolute; width:220px; height:220px; stroke-width:.7; right:0; bottom:0; }
.ssp-art-ring { position:absolute; width:240px; height:240px; border:1px solid rgba(255,255,255,.7); border-radius:50%; right:-70px; top:-60px; box-shadow:0 0 0 28px rgba(255,255,255,.12),0 0 0 56px rgba(255,255,255,.08); animation:ssp-spin 60s linear infinite; }
.ssp-art-ring-two { width:160px; height:160px; right:-10px; top:20px; border-style:dashed; box-shadow:none; animation-direction:reverse; animation-duration:45s; }
.ssp-hero-top,.ssp-identity,.ssp-hero-bottom,.ssp-stats { position:relative; z-index:1; }
.ssp-hero-top { display:flex; justify-content:space-between; align-items:center; gap:10px; }
.ssp-eyebrow { display:inline-flex; align-items:center; gap:5px; font-size:9px; font-weight:800; letter-spacing:1.8px; color:rgba(255,255,255,.88); }
.ssp-badge { display:inline-flex; width:max-content; max-width:100%; align-items:center; gap:5px; padding:5px 10px; border:1px solid transparent; border-radius:99px; font-size:10px; font-weight:800; line-height:1.35; white-space:nowrap; }
.ssp-badge.is-pending { color:#936000; background:#fff5dc; border-color:rgba(245,165,36,.23); }
.ssp-badge.is-verified { color:#087b56; background:#e9f9f1; border-color:rgba(34,197,143,.2); }
.ssp-badge.is-light.is-pending { color:#ffefc8; background:rgba(64,38,88,.3); border-color:rgba(255,233,182,.4); backdrop-filter:blur(8px); }
.ssp-badge.is-light.is-verified { color:#e0fff1; background:rgba(5,80,69,.28); border-color:rgba(199,255,229,.4); backdrop-filter:blur(8px); }
.ssp-identity { display:flex; align-items:center; gap:18px; margin:24px 0 20px; }
.ssp-avatar-wrap { position:relative; flex:none; }
.ssp-ring { position:relative; display:grid; place-items:center; }
.ssp-ring svg { position:absolute; inset:0; overflow:visible; }
.ssp-ring-track { fill:none; stroke:#e0e5f6; }
.ssp-ring-fill { fill:none; stroke:url(#ssp-ring-grad); stroke-linecap:round; transition:stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1); }
.ssp-ring.is-light .ssp-ring-track { stroke:rgba(255,255,255,.28); }
.ssp-ring.is-light .ssp-ring-fill { stroke:#fff; filter:drop-shadow(0 0 6px rgba(255,255,255,.7)); }
.ssp-ring-inner { position:relative; z-index:1; display:grid; place-items:center; }
.ssp-avatar { width:88px; height:88px; display:grid; place-items:center; overflow:hidden; border:3px solid rgba(255,255,255,.85); border-radius:50%; background:rgba(255,255,255,.18); box-shadow:0 10px 26px rgba(33,33,100,.2); color:#fff; font-size:28px; font-weight:800; }
.ssp-avatar img { width:100%; height:100%; object-fit:cover; }
.ssp-camera { position:absolute; right:-2px; bottom:-2px; z-index:2; width:31px; height:31px; display:grid; place-items:center; padding:0; border:3px solid #8172f4; border-radius:50%; background:#fff; color:#675ae1; box-shadow:0 4px 14px rgba(27,35,64,.2); }
.ssp-camera:hover:not(:disabled) { transform:translateY(-1px) scale(1.05); }
.ssp-avatar-check { position:absolute; left:-2px; top:-2px; z-index:2; display:grid; place-items:center; width:28px; height:28px; border-radius:50%; background:#fff; color:#12a874; box-shadow:0 4px 14px rgba(27,35,64,.18); }
.ssp-hero-name { min-width:0; }
.ssp-hero-name>span { display:block; color:rgba(255,255,255,.78); font-size:10px; font-weight:600; letter-spacing:.3px; }
.ssp-hero-name h1 { margin:3px 0 6px; font-size:25px; letter-spacing:-.9px; line-height:1.15; font-weight:800; overflow-wrap:anywhere; text-shadow:0 2px 12px rgba(27,35,64,.15); }
.ssp-hero-name p { display:flex; align-items:center; gap:6px; margin:0; font-size:13px; overflow-wrap:anywhere; color:rgba(255,255,255,.95); }
.ssp-hero-name>small { display:inline-flex; align-items:center; gap:4px; margin-top:9px; padding:4px 9px; border-radius:99px; background:rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.22); font-size:9px; color:rgba(255,255,255,.85); }
.ssp-hero-name>small b { margin-left:2px; color:#fff; font-weight:700; letter-spacing:.5px; }
.ssp-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:18px; }
.ssp-stat { display:flex; align-items:center; gap:9px; min-width:0; padding:10px 11px; border-radius:16px; background:rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.26); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); transition:background .2s; }
.ssp-stat:hover { background:rgba(255,255,255,.24); }
.ssp-stat i { flex:none; display:grid; place-items:center; width:30px; height:30px; border-radius:10px; background:rgba(255,255,255,.22); color:#fff; }
.ssp-stat>div { min-width:0; }
.ssp-stat b { display:block; font-size:15px; font-weight:800; letter-spacing:-.4px; line-height:1.1; }
.ssp-stat span { display:block; margin-top:2px; font-size:9px; color:rgba(255,255,255,.8); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ssp-hero-bottom { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; padding-top:16px; border-top:1px solid rgba(255,255,255,.22); }
.ssp-hero-bottom p { display:flex; align-items:center; gap:7px; margin:0; font-size:10.5px; color:rgba(255,255,255,.92); }
.ssp-hero-edit { display:flex; align-items:center; justify-content:center; gap:7px; min-height:38px; padding:9px 14px; border:1px solid rgba(255,255,255,.7); border-radius:12px; background:#fff; color:#6256d7; font-size:11px!important; font-weight:800!important; box-shadow:0 8px 20px rgba(38,34,102,.16); }
.ssp-hero-edit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 26px rgba(38,34,102,.22); }

/* Cards */
.ssp-layout { display:grid; gap:18px; margin-top:18px; align-items:start; }
.ssp-card { position:relative; min-width:0; overflow:hidden; padding:21px; border:1px solid rgba(255,255,255,.95); border-radius:26px; background:var(--ssp-glass); box-shadow:var(--ssp-shadow); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); transition:box-shadow .3s,transform .3s; }
.ssp-card::before { content:""; position:absolute; left:0; right:0; top:0; height:3px; background:var(--ssp-grad); opacity:.9; }
.ssp-card:hover { box-shadow:var(--ssp-shadow-hover); }
.ssp-section-head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:18px; }
.ssp-kicker { display:block; margin-bottom:5px; color:#6371db; font-size:8px; font-weight:800; letter-spacing:1.6px; }
.ssp-section-head h2 { margin:0; font-size:18px; font-weight:800; letter-spacing:-.5px; line-height:1.25; }
.ssp-section-head p { margin:5px 0 0; color:var(--ssp-muted); font-size:11px; }
.ssp-edit-link { display:flex; flex:none; align-items:center; gap:5px; padding:8px 11px; border:1px solid rgba(91,108,255,.18); border-radius:11px; background:#f1f3ff; color:#5666d4; font-size:11px!important; font-weight:700!important; }
.ssp-edit-link:hover:not(:disabled) { background:var(--ssp-grad); color:#fff; border-color:transparent; box-shadow:0 8px 18px rgba(91,108,255,.25); }
.ssp-detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:0; }
.ssp-full { grid-column:1/-1; }
.ssp-detail { position:relative; display:flex; align-items:flex-start; gap:11px; min-width:0; padding:13px 12px; border:1px solid var(--ssp-line); border-radius:17px; background:rgba(249,250,255,.72); transition:transform .22s,box-shadow .22s,border-color .22s; }
.ssp-detail:hover { transform:translateY(-2px); box-shadow:0 10px 24px rgba(64,84,150,.10); border-color:rgba(91,108,255,.22); }
.ssp-detail>i { flex:none; width:38px; height:38px; display:grid; place-items:center; border-radius:12px; color:#6873df; background:linear-gradient(135deg,#eaedff,#f0eaff); box-shadow:0 4px 10px rgba(91,108,255,.10) inset; }
.ssp-detail.is-violet>i { color:#7c5cf0; background:linear-gradient(135deg,#efe8ff,#f6efff); }
.ssp-detail.is-cyan>i { color:#1f9ec4; background:linear-gradient(135deg,#e3f6fc,#eefaff); }
.ssp-detail>div { min-width:0; flex:1; }
.ssp-detail dt { margin:0 0 4px; font-size:10px; color:var(--ssp-muted); font-weight:600; letter-spacing:.2px; }
.ssp-detail dd { margin:0; font-size:13px; font-weight:750; line-height:1.5; overflow-wrap:anywhere; white-space:pre-line; }
.ssp-detail.is-empty dd { color:#a4acc6; font-weight:600; font-style:italic; }
.ssp-detail small { display:block; margin-top:4px; font-size:10px; color:var(--ssp-muted); overflow-wrap:anywhere; }
.ssp-detail.is-map { background:linear-gradient(130deg,#eef9fe,#f6f6ff); border-color:rgba(34,193,238,.2); }
.ssp-detail.is-map>i { color:#fff; background:linear-gradient(135deg,#22c1ee,#5b6cff); box-shadow:0 8px 16px rgba(34,193,238,.3); }
.ssp-detail:not(.ssp-full) { flex-direction:column; gap:9px; }
.ssp-secure-note,.ssp-admin-note { display:flex; align-items:flex-start; gap:9px; padding:11px 12px; margin-top:14px; border-radius:14px; background:rgba(91,108,255,.055); color:#647195; font-size:10px; line-height:1.6; }
.ssp-secure-note>i,.ssp-admin-note>i { flex:none; display:grid; place-items:center; width:26px; height:26px; border-radius:9px; background:#fff; color:#7280cc; box-shadow:0 3px 8px rgba(64,84,150,.08); }
.ssp-admin-note { margin-top:16px; background:rgba(120,135,180,.06); }
.ssp-section-icon { width:42px; height:42px; flex:none; display:grid; place-items:center; border-radius:14px; color:#fff; background:var(--ssp-grad); box-shadow:0 10px 22px rgba(91,108,255,.28); }

/* Verification */
.ssp-verification-progress { display:flex; align-items:center; gap:14px; padding:14px; border:1px solid rgba(91,108,255,.12); border-radius:20px; background:linear-gradient(135deg,#f1f3ff,#f6f1ff); }
.ssp-verification-progress.is-complete { background:linear-gradient(135deg,#eafaf3,#f0fbf6); border-color:rgba(22,185,129,.2); }
.ssp-verification-progress .ssp-ring-inner b { display:flex; align-items:baseline; font-size:19px; font-weight:800; letter-spacing:-.6px; color:var(--ssp-ink); }
.ssp-verification-progress .ssp-ring-inner small { font-size:10px; color:var(--ssp-muted); font-weight:700; margin-left:1px; }
.ssp-progress-copy { flex:1; min-width:0; }
.ssp-progress-copy b { display:block; font-size:12.5px; font-weight:800; letter-spacing:-.2px; }
.ssp-progress-copy>span { display:block; margin-top:3px; font-size:10px; color:#6973c7; line-height:1.5; }
.ssp-progress-track { height:6px; margin-top:10px; border-radius:20px; background:#e0e5f6; overflow:hidden; }
.ssp-progress-track i { position:relative; display:block; height:100%; border-radius:inherit; background:var(--ssp-grad); transition:width .6s cubic-bezier(.2,.8,.2,1); overflow:hidden; }
.ssp-progress-track i::after { content:""; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent); animation:ssp-shimmer 2.2s linear infinite; }
.ssp-timeline { position:relative; display:grid; gap:0; margin:18px 0 0; padding:0; list-style:none; }
.ssp-step { position:relative; display:flex; align-items:flex-start; gap:14px; padding:0 0 20px; }
.ssp-step:last-child { padding-bottom:0; }
.ssp-step::before { content:""; position:absolute; left:24px; top:52px; bottom:2px; width:2px; border-radius:2px; background:linear-gradient(180deg,#d9def2,#e8ebf7); }
.ssp-step.is-complete::before { background:linear-gradient(180deg,#22b487,#a6e9d1); }
.ssp-step:last-child::before { display:none; }
.ssp-step-icon { position:relative; flex:none; width:50px; height:50px; display:grid; place-items:center; border:1px solid #e0e4ff; border-radius:17px; background:linear-gradient(140deg,#eef0ff,#f5edff); color:#7a64df; transition:transform .25s,box-shadow .25s; }
.ssp-step:hover .ssp-step-icon { transform:translateY(-2px); box-shadow:0 10px 22px rgba(91,108,255,.14); }
.ssp-step-icon small { position:absolute; right:-5px; bottom:-5px; width:21px; height:21px; display:grid; place-items:center; border:2px solid #fff; border-radius:50%; background:#8083dd; color:#fff; font-size:8px; font-weight:800; }
.ssp-step.is-active .ssp-step-icon { box-shadow:0 0 0 4px rgba(91,108,255,.12); animation:ssp-pulse 2.4s ease-in-out infinite; }
.ssp-step-admin .ssp-step-icon { border-color:#dcecf5; background:linear-gradient(140deg,#eef8ff,#e7f7f7); color:#3597ac; }
.ssp-step-admin .ssp-step-icon small { background:#62a5b7; }
.ssp-step.is-complete .ssp-step-icon { color:#139c75; border-color:#ceeedd; background:linear-gradient(140deg,#ecfaf3,#e2f7ef); animation:none; box-shadow:none; }
.ssp-step.is-complete .ssp-step-icon small { background:#22b487; }
.ssp-step-copy { min-width:0; flex:1; padding-top:2px; }
.ssp-step-title { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px 10px; }
.ssp-step-copy h3 { margin:0; font-size:13px; font-weight:800; letter-spacing:-.2px; }
.ssp-step-copy p { margin:5px 0 0; color:var(--ssp-muted); font-size:10.5px; line-height:1.6; }
.ssp-verify-button { display:inline-flex; align-items:center; gap:10px; min-height:36px; margin-top:11px; padding:8px 14px; border:0; border-radius:12px; background:var(--ssp-grad); color:#fff; font-size:10.5px!important; font-weight:750!important; box-shadow:0 8px 18px rgba(91,108,255,.26); }
.ssp-verify-button:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 24px rgba(91,108,255,.34); }
.ssp-verify-button svg { transition:transform .25s; }
.ssp-verify-button:hover:not(:disabled) svg { transform:translateX(3px); }

/* Sign out & footer */
.ssp-signout { width:100%; display:flex; align-items:center; gap:12px; margin:18px 0 0; padding:13px 15px; border:1px solid rgba(219,99,120,.16); border-radius:20px; background:rgba(255,255,255,.7); color:#b5546e; text-align:left; backdrop-filter:blur(10px); box-shadow:0 8px 22px rgba(181,84,110,.07); }
.ssp-signout:hover { border-color:rgba(219,99,120,.32); box-shadow:0 12px 28px rgba(181,84,110,.14); transform:translateY(-2px); }
.ssp-signout>i { flex:none; display:grid; place-items:center; width:40px; height:40px; border-radius:13px; background:linear-gradient(135deg,#fff0f4,#ffe6ec); color:#c84062; }
.ssp-signout>div { flex:1; min-width:0; }
.ssp-signout b { display:block; font-size:12.5px; font-weight:750; }
.ssp-signout span { display:block; margin-top:2px; font-size:10px; color:#a0728a; }
.ssp-footer { display:grid; justify-items:center; gap:10px; padding:28px 12px 7px; opacity:.65; }
.ssp-footer .ssp-brand { font-size:15px; }
.ssp-footer .ssp-brand i { width:19px; height:19px; border-radius:6px; }
.ssp-footer>span { font-size:8px; color:var(--ssp-muted); font-weight:700; letter-spacing:2.2px; }

/* Same floating five-tab navigation treatment as StoneRateSandSellerHome. */
.ssp-bottom-nav { position:fixed; left:0; right:0; bottom:0; z-index:45; padding:0 14px calc(8px + env(safe-area-inset-bottom,0px)); pointer-events:none; }
.ssp-nav-pill { pointer-events:auto; position:relative; max-width:520px; margin:auto; display:grid; grid-template-columns:repeat(5,1fr); align-items:end; padding:4px 6px 3px; border-radius:22px; background:rgba(255,255,255,.78); backdrop-filter:blur(24px) saturate(170%); -webkit-backdrop-filter:blur(24px) saturate(170%); border:1px solid rgba(255,255,255,.95); box-shadow:0 18px 44px rgba(64,84,150,.20),0 1px 0 rgba(255,255,255,.9) inset; }
.ssp-nav-pill button { position:relative; display:grid; justify-items:center; gap:1px; padding:3px 2px; border:0; background:transparent; color:#7a83a3; border-radius:16px; }
.ssp-nav-pill button span { width:30px; height:30px; display:grid; place-items:center; border-radius:11px; }
.ssp-nav-pill button svg { width:18px; height:18px; }
.ssp-nav-pill button small { font-size:9px; font-weight:700; letter-spacing:.2px; line-height:1.1; }
.ssp-nav-pill button:hover { color:var(--ssp-indigo); }
.ssp-nav-pill button:hover span { background:rgba(91,108,255,.10); }
.ssp-nav-pill button.active { color:var(--ssp-indigo); }
.ssp-nav-pill button.active span { width:44px; height:44px; margin-top:-22px; border-radius:16px; background:var(--ssp-grad); color:#fff; border:3px solid #eceffd; box-shadow:0 12px 24px rgba(91,108,255,.45); }
.ssp-nav-pill button.active svg { width:20px; height:20px; }
.ssp-nav-pill button.active small { font-weight:800; }
.ssp-nav-pill button.active::after { content:""; position:absolute; bottom:-1px; width:16px; height:3px; border-radius:99px; background:var(--ssp-grad); }

/* Sheets & forms */
.ssp-overlay { position:fixed; inset:0; z-index:80; display:flex; align-items:flex-end; justify-content:center; background:rgba(27,35,64,.42); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); animation:ssp-fade .2s ease; }
.ssp-sheet { position:relative; display:flex; flex-direction:column; width:100%; max-width:600px; max-height:94vh; max-height:94dvh; padding:10px 20px 0; border-radius:30px 30px 0 0; background:linear-gradient(180deg,#fff,#f7f9ff); box-shadow:0 -20px 60px rgba(27,35,64,.24); outline:none; animation:ssp-rise .3s cubic-bezier(.2,.8,.2,1); }
.ssp-sheet::before { content:""; position:absolute; left:0; right:0; top:0; height:3px; border-radius:30px 30px 0 0; background:var(--ssp-grad); opacity:.8; }
.ssp-handle { width:40px; height:4px; border-radius:9px; flex:none; margin:6px auto 15px; background:#dce1f0; }
.ssp-sheet-head { display:flex; flex:none; align-items:flex-start; justify-content:space-between; gap:12px; padding-bottom:16px; border-bottom:1px solid var(--ssp-line); }
.ssp-sheet-head h2 { margin:0; font-size:19px; font-weight:800; letter-spacing:-.5px; }
.ssp-sheet-head p { margin:5px 0 0; font-size:11px; color:var(--ssp-muted); }
.ssp-sheet-body { min-height:0; overflow-y:auto; overscroll-behavior:contain; padding:18px 0 22px; }
.ssp-sheet-foot { display:flex; flex:none; gap:10px; padding:14px 0 calc(16px + env(safe-area-inset-bottom,0px)); border-top:1px solid var(--ssp-line); }
.ssp-primary,.ssp-secondary,.ssp-danger { display:flex; justify-content:center; align-items:center; gap:7px; min-height:46px; padding:11px 16px; border:0; border-radius:15px; font-size:12px!important; font-weight:750!important; }
.ssp-primary { flex:1.5; color:#fff; background:var(--ssp-grad); box-shadow:0 10px 24px rgba(91,108,255,.26); }
.ssp-primary:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 14px 30px rgba(91,108,255,.34); }
.ssp-secondary { flex:1; background:#edf0fa; color:#65708b; }
.ssp-secondary:hover:not(:disabled) { background:#e3e8f7; }
.ssp-danger { flex:1.5; background:linear-gradient(135deg,#c84062,#e0567a); color:#fff; box-shadow:0 10px 24px rgba(200,64,98,.26); }
.ssp-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px 12px; min-width:0; margin:0; padding:0; border:0; }
.ssp-field { min-width:0; }
.ssp-field>label { display:block; margin-bottom:7px; font-size:11px; color:#46516e; font-weight:750; }
.ssp-field input,.ssp-field textarea { display:block; width:100%; min-width:0; padding:12px 13px; border:1px solid #dfe4f1; border-radius:13px; color:var(--ssp-ink); background:#fff; font-size:14px; transition:border-color .2s,box-shadow .2s; }
.ssp-field textarea { resize:vertical; min-height:90px; }
.ssp-field input:focus,.ssp-field textarea:focus { border-color:#919df3; box-shadow:0 0 0 4px rgba(91,108,255,.10); }
.ssp-phone-input { display:flex; align-items:center; overflow:hidden; border:1px solid #dfe4f1; border-radius:13px; background:#fff; transition:border-color .2s,box-shadow .2s; }
.ssp-phone-input>span { flex:none; padding-left:12px; color:#78829b; font-size:12px; font-weight:700; }
.ssp-phone-input input { border:0; padding-left:7px; border-radius:0; }
.ssp-phone-input input:focus { box-shadow:none; }
.ssp-phone-input:focus-within { border-color:#919df3; box-shadow:0 0 0 4px rgba(91,108,255,.10); }
.ssp-field.has-error>input,.ssp-field.has-error>textarea,.ssp-field.has-error .ssp-phone-input { border-color:#da6881; }
.ssp-field-error { display:flex; align-items:flex-start; gap:4px; margin-top:6px; font-size:10px; color:#b33252; }
.ssp-field-error svg { margin-top:2px; }
.ssp-field-note { display:block; margin-top:6px; color:var(--ssp-muted); font-size:10px; }
.ssp-phone-warning { position:relative; overflow:hidden; display:flex; align-items:flex-start; gap:12px; padding:14px; border:1px solid rgba(139,92,246,.22); border-radius:16px; background:linear-gradient(135deg,#f3efff,#eef3ff 60%,#eafaff); color:#4a4a8a; animation:ssp-up .4s cubic-bezier(.2,.8,.2,1) both; }
.ssp-phone-warning::after { content:""; position:absolute; right:-30px; top:-30px; width:90px; height:90px; border-radius:50%; background:rgba(139,92,246,.10); }
.ssp-phone-warning>i { flex:none; display:grid; place-items:center; width:38px; height:38px; border-radius:12px; background:var(--ssp-grad); color:#fff; box-shadow:0 8px 18px rgba(91,108,255,.28); animation:ssp-breathe 3s ease-in-out infinite; }
.ssp-phone-warning b { display:block; font-size:11.5px; color:#2f3470; }
.ssp-phone-warning p { margin:4px 0 0; font-size:10px; line-height:1.65; color:#5c648f; }
.ssp-phone-warning strong { color:var(--ssp-indigo); font-weight:800; }
.ssp-form-note { display:flex; align-items:center; gap:7px; margin:17px 0 0; color:var(--ssp-muted); font-size:10px; }
.ssp-alert { display:flex; align-items:flex-start; gap:9px; padding:12px 14px; border:1px solid rgba(212,79,113,.23); border-radius:15px; background:#fff0f4; color:#a43351; font-size:12px; line-height:1.6; overflow-wrap:anywhere; }
.ssp-content>.ssp-alert { margin-bottom:15px; }
.ssp-sheet .ssp-alert { margin-top:15px; }
.ssp-alert>svg { margin-top:2px; }
.ssp-alert>span { flex:1; min-width:0; }
.ssp-alert button { flex:none; border:0; border-radius:8px; background:#fff; color:#a43351; padding:4px 9px; font-size:11px; font-weight:700; }

/* OTP — double verification */
.ssp-otp-hero { position:relative; overflow:hidden; padding:20px 16px 16px; margin-bottom:16px; border-radius:22px; background:var(--ssp-grad); background-size:220% 220%; color:#fff; text-align:center; box-shadow:0 16px 36px rgba(91,108,255,.28); animation:ssp-hue 12s ease-in-out infinite; }
.ssp-otp-hero::before { content:""; position:absolute; inset:0; background:linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px); background-size:26px 26px; opacity:.1; mask:radial-gradient(ellipse at 50% 0%,#000,transparent 80%); -webkit-mask:radial-gradient(ellipse at 50% 0%,#000,transparent 80%); }
.ssp-otp-hero-glow { position:absolute; width:220px; height:220px; right:-80px; top:-110px; border-radius:50%; background:rgba(255,255,255,.22); filter:blur(30px); animation:ssp-float 10s ease-in-out infinite; }
.ssp-otp-hero>* { position:relative; z-index:1; }
.ssp-otp-shield { position:relative; display:grid; place-items:center; width:56px; height:56px; margin:0 auto 12px; border-radius:18px; background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.35); backdrop-filter:blur(8px); }
.ssp-otp-pulse { position:absolute; inset:-6px; border-radius:22px; border:2px solid rgba(255,255,255,.5); animation:ssp-ring-pulse 2.2s ease-out infinite; }
.ssp-otp-hero b { display:block; font-size:15px; font-weight:800; letter-spacing:-.4px; }
.ssp-otp-hero p { margin:6px auto 0; max-width:300px; font-size:11px; line-height:1.6; color:rgba(255,255,255,.88); }
.ssp-otp-route { display:flex; align-items:center; justify-content:center; gap:8px; margin-top:16px; }
.ssp-otp-route span { display:inline-flex; align-items:center; gap:5px; padding:6px 10px; border-radius:99px; background:rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.3); font-size:10px; font-weight:700; letter-spacing:.4px; transition:background .3s,border-color .3s; }
.ssp-otp-route span.is-done { background:rgba(22,185,129,.85); border-color:rgba(255,255,255,.6); }
.ssp-otp-route-line { position:relative; flex:1; max-width:60px; height:2px; border-radius:2px; background:rgba(255,255,255,.3); overflow:hidden; }
.ssp-otp-route-line i { position:absolute; inset:0; width:40%; background:#fff; border-radius:2px; animation:ssp-travel 1.6s ease-in-out infinite; }
.ssp-otp-card { position:relative; padding:15px; margin-top:12px; border:1px solid var(--ssp-line); border-radius:20px; background:#fff; box-shadow:0 6px 18px rgba(64,84,150,.05); transition:border-color .3s,box-shadow .3s,transform .3s; animation:ssp-up .45s cubic-bezier(.2,.8,.2,1) both; }
.ssp-otp-card.is-new { animation-delay:.1s; }
.ssp-otp-card::before { content:""; position:absolute; left:0; top:16px; bottom:16px; width:3px; border-radius:3px; background:var(--ssp-grad); opacity:.7; }
.ssp-otp-card.is-new::before { background:linear-gradient(180deg,#22c1ee,#5b6cff); }
.ssp-otp-card.is-complete { border-color:rgba(22,185,129,.35); box-shadow:0 10px 26px rgba(22,185,129,.12); }
.ssp-otp-card.is-complete::before { background:var(--ssp-green); }
.ssp-otp-label { display:flex; align-items:center; gap:10px; }
.ssp-otp-label>i { position:relative; flex:none; width:40px; height:40px; display:grid; place-items:center; border-radius:13px; color:#7880d9; background:linear-gradient(135deg,#eef0ff,#f4efff); transition:background .3s,color .3s; }
.ssp-otp-card.is-new .ssp-otp-label>i { color:#1f9ec4; background:linear-gradient(135deg,#e3f6fc,#eef6ff); }
.ssp-otp-card.is-complete .ssp-otp-label>i { color:#fff; background:linear-gradient(135deg,#16b981,#3dd39d); box-shadow:0 8px 18px rgba(22,185,129,.3); }
.ssp-otp-label>i small { position:absolute; right:-5px; top:-5px; width:17px; height:17px; display:grid; place-items:center; border-radius:50%; border:2px solid #fff; background:#8083dd; color:#fff; font-size:8px; font-weight:800; }
.ssp-otp-card.is-new .ssp-otp-label>i small { background:#3aaccc; }
.ssp-otp-card.is-complete .ssp-otp-label>i small { background:#16b981; }
.ssp-otp-label>div { flex:1; min-width:0; }
.ssp-otp-label span,.ssp-otp-label b { display:block; }
.ssp-otp-label span { font-size:10px; color:var(--ssp-muted); font-weight:600; }
.ssp-otp-label b { margin-top:2px; font-size:13px; letter-spacing:.6px; }
.ssp-otp-status { flex:none; padding:4px 9px; border-radius:99px; background:#f1f3ff; color:#6873df; font-size:9.5px; font-weight:800; font-style:normal; letter-spacing:.3px; transition:background .3s,color .3s; }
.ssp-otp-card.is-complete .ssp-otp-status { background:#e9f9f1; color:#087b56; }
.ssp-otp-boxes { display:grid; grid-template-columns:repeat(6,1fr); gap:8px; margin-top:14px; }
.ssp-otp-boxes input { width:100%; aspect-ratio:.86; min-height:48px; padding:0; border:1.5px solid #dfe5f5; border-radius:13px; background:#f9faff; color:#3b44a0; text-align:center; font-size:22px!important; font-weight:800; caret-color:var(--ssp-indigo); transition:border-color .2s,box-shadow .2s,background .2s,transform .2s; }
.ssp-otp-boxes input:focus { outline:none; border-color:var(--ssp-indigo); background:#fff; box-shadow:0 0 0 4px rgba(91,108,255,.14),0 6px 16px rgba(91,108,255,.12); transform:translateY(-2px); }
.ssp-otp-boxes input.is-filled { border-color:#b9c1f5; background:linear-gradient(180deg,#fff,#f3f5ff); animation:ssp-pop .25s cubic-bezier(.2,.8,.2,1); }
.ssp-otp-card.is-new .ssp-otp-boxes input:focus { border-color:var(--ssp-cyan); box-shadow:0 0 0 4px rgba(34,193,238,.16),0 6px 16px rgba(34,193,238,.12); }
.ssp-otp-card.is-complete .ssp-otp-boxes input.is-filled { border-color:rgba(22,185,129,.45); background:linear-gradient(180deg,#fff,#effbf5); color:#0d8a62; }
.ssp-resend { display:flex; justify-content:center; align-items:center; gap:7px; width:100%; padding:12px; margin-top:12px; border:0; background:transparent; color:#6875d8; font-size:11px!important; font-weight:700!important; }
.ssp-resend-ready { animation:ssp-wiggle 2.5s ease-in-out infinite; }
.ssp-demo-chip { display:flex; align-items:center; justify-content:center; gap:6px; width:max-content; max-width:100%; margin:6px auto 0; padding:6px 12px; border-radius:99px; border:1px dashed rgba(139,92,246,.4); background:#f6f1ff; color:#6b4fc9; font-size:10px; font-weight:600; }
.ssp-demo-chip b { font-weight:900; letter-spacing:1.5px; color:#4b32a8; }
.ssp-otp-help { margin:10px 5px 0; color:var(--ssp-muted); text-align:center; font-size:10px; line-height:1.8; }
.ssp-verification-intro { padding:8px 8px 12px; text-align:center; }
.ssp-verification-intro>i { display:grid; place-items:center; width:92px; height:92px; margin:0 auto 20px; border:1px solid #e1e5ff; border-radius:30px; background:linear-gradient(135deg,#eef0ff,#eee6ff); color:#7864e0; box-shadow:0 14px 32px rgba(91,108,255,.14); animation:ssp-pulse 2.8s ease-in-out infinite; }
.ssp-verification-intro h3 { margin:0; font-size:19px; letter-spacing:-.5px; }
.ssp-verification-intro p { max-width:340px; margin:12px auto 0; font-size:12px; line-height:1.8; color:var(--ssp-muted); }

/* Photo */
.ssp-photo-stage { display:grid; place-items:center; padding:10px 0 22px; }
.ssp-photo-stage>div { width:190px; height:190px; overflow:hidden; border:5px solid #fff; border-radius:50%; background:#eef0ff; box-shadow:0 0 0 2px #dfe4ff,0 0 0 8px rgba(91,108,255,.08),0 18px 40px rgba(91,108,255,.24); }
.ssp-photo-stage img { width:100%; height:100%; object-fit:cover; }
.ssp-photo-controls { display:grid; gap:12px; }
.ssp-photo-controls label { display:grid; gap:8px; padding:11px 13px; border:1px solid var(--ssp-line); border-radius:13px; background:#fff; }
.ssp-photo-controls label>span { display:flex; justify-content:space-between; font-size:11px; font-weight:650; color:#636f90; }
.ssp-photo-controls label>span b { color:var(--ssp-indigo); font-weight:800; }
.ssp-photo-controls input { width:100%; accent-color:#7c6bf1; }
.ssp-signout-intro { display:grid; justify-items:center; gap:14px; text-align:center; padding:6px 0; }
.ssp-signout-intro>i { display:grid; place-items:center; width:70px; height:70px; border-radius:24px; background:linear-gradient(135deg,#fff0f4,#ffe6ec); color:#c84062; }
.ssp-signout-copy { margin:0; font-size:13px; color:var(--ssp-muted); }

/* Drawer */
.ssp-drawer-overlay { justify-content:flex-start; align-items:stretch; }
.ssp-sheet.ssp-drawer { width:min(86vw,340px); max-height:100%; padding:22px 18px; border-radius:0 28px 28px 0; animation:ssp-slide .25s ease; }
.ssp-sheet.ssp-drawer::before { display:none; }
.ssp-drawer .ssp-sheet-body { display:flex; flex:1; flex-direction:column; }
.ssp-menu-seller { position:relative; overflow:hidden; display:flex; align-items:center; gap:11px; padding:16px; border-radius:20px; background:var(--ssp-grad); color:#fff; box-shadow:0 14px 30px rgba(91,108,255,.28); }
.ssp-menu-seller::after { content:""; position:absolute; right:-30px; top:-30px; width:110px; height:110px; border-radius:50%; background:rgba(255,255,255,.14); }
.ssp-menu-seller>i { flex:none; display:grid; place-items:center; width:44px; height:44px; background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.22); border-radius:14px; }
.ssp-menu-seller>div { min-width:0; position:relative; z-index:1; }
.ssp-menu-seller b { display:block; font-size:13px; overflow-wrap:anywhere; }
.ssp-menu-seller span { display:block; margin-top:4px; font-size:11px; opacity:.85; }
.ssp-menu-links { display:grid; gap:7px; margin-top:22px; }
.ssp-menu-links button { display:flex; align-items:center; gap:12px; padding:11px 12px; border:1px solid transparent; border-radius:15px; color:#687493; background:transparent; font-size:13px; text-align:left; }
.ssp-menu-links button>i { display:grid; place-items:center; width:34px; height:34px; border-radius:11px; background:#f1f3ff; color:#6873df; transition:background .2s,color .2s; }
.ssp-menu-links button:hover { background:#f5f6ff; }
.ssp-menu-links button>span { flex:1; }
.ssp-menu-links button.active { background:#edf0ff; border-color:#dce3ff; color:#5b6cff; font-weight:750; }
.ssp-menu-links button.active>i { background:var(--ssp-grad); color:#fff; box-shadow:0 6px 14px rgba(91,108,255,.28); }
.ssp-menu-brand { display:grid; gap:10px; justify-items:center; margin-top:auto; padding-top:28px; }
.ssp-menu-brand>small { color:var(--ssp-muted); font-size:10px; }

/* Toast */
.ssp-toast { position:fixed; left:50%; bottom:calc(90px + env(safe-area-inset-bottom,0px)); z-index:100; width:max-content; max-width:calc(100vw - 32px); padding:12px 18px; border:1px solid rgba(255,255,255,.2); border-radius:16px; background:#303858; color:#fff; font-size:12px; line-height:1.5; text-align:center; box-shadow:0 12px 30px rgba(27,35,64,.28); opacity:0; pointer-events:none; transform:translate(-50%,8px); transition:opacity .25s,transform .25s; }
.ssp-toast.is-visible { opacity:1; transform:translate(-50%,0); }
.ssp-spin { animation:ssp-spin 1s linear infinite; }

@media(min-width:760px) {
  .ssp-top { min-height:78px; padding:14px 28px; }
  .ssp-top>.ssp-brand { margin-right:auto; }
  .ssp-top-left { flex:1; }
  .ssp-top>.ssp-icon { margin-left:100px; }
  .ssp-content { padding-top:28px; }
  .ssp-layout { grid-template-columns:minmax(0,1.18fr) minmax(0,1fr); gap:22px; margin-top:22px; }
  .ssp-hero { padding:30px 32px; border-radius:32px; }
  .ssp-identity { margin:24px 0 22px; gap:24px; }
  .ssp-avatar { width:100px; height:100px; font-size:32px; }
  .ssp-hero-name h1 { font-size:34px; }
  .ssp-hero-name p { font-size:15px; }
  .ssp-eyebrow { font-size:10px; }
  .ssp-hero-bottom p { font-size:12px; }
  .ssp-hero-art { width:360px; height:300px; right:25px; bottom:-10px; }
  .ssp-hero-art>svg { width:290px; height:290px; }
  .ssp-stats { max-width:520px; gap:10px; }
  .ssp-stat { padding:12px 14px; }
  .ssp-stat b { font-size:17px; }
  .ssp-stat span { font-size:10px; }
  .ssp-card { padding:24px; }
  .ssp-sheet:not(.ssp-drawer) { max-height:88dvh; margin-bottom:24px; border-radius:28px; }
  .ssp-sheet::before { border-radius:28px 28px 0 0; }
  .ssp-sheet-foot { padding-bottom:18px; }
}
@media(max-width:390px) {
  .ssp-top { gap:10px; padding:11px 12px; }
  .ssp-top-left { gap:8px; }
  .ssp-top-copy b { font-size:12px; }
  .ssp-brand { font-size:15px; }
  .ssp-brand i { width:21px; height:21px; }
  .ssp-icon { width:35px; height:35px; }
  .ssp-content { padding:15px 12px 0; }
  .ssp-hero { padding:19px; border-radius:24px; }
  .ssp-hero-name h1 { font-size:21px; }
  .ssp-avatar { width:72px; height:72px; font-size:23px; }
  .ssp-identity { gap:13px; }
  .ssp-eyebrow { font-size:8px; letter-spacing:1px; }
  .ssp-stat { padding:9px; gap:7px; }
  .ssp-stat i { width:26px; height:26px; }
  .ssp-stat b { font-size:13px; }
  .ssp-card { padding:17px; border-radius:22px; }
  .ssp-section-head h2 { font-size:16px; }
  .ssp-detail { padding:12px 10px; }
  .ssp-detail dd { font-size:12px; }
  .ssp-sheet { padding-left:16px; padding-right:16px; }
  .ssp-form-grid { grid-template-columns:1fr; }
  .ssp-hero-bottom p { font-size:10px; }
}
@media(prefers-reduced-motion:reduce) {
  .sand-seller-profile *, .sand-seller-profile *::before, .sand-seller-profile *::after { animation:none!important; transition:none!important; scroll-behavior:auto!important; }
}
@keyframes ssp-spin { to { transform:rotate(360deg); } }
@keyframes ssp-rise { from { transform:translateY(100%); } }
@keyframes ssp-slide { from { transform:translateX(-100%); } }
@keyframes ssp-fade { from { opacity:0; } }
@keyframes ssp-up { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes ssp-float { 0%,100% { transform:translate(0,0); } 50% { transform:translate(14px,-18px); } }
@keyframes ssp-shimmer { from { transform:translateX(-100%); } to { transform:translateX(100%); } }
@keyframes ssp-pulse { 0%,100% { box-shadow:0 0 0 4px rgba(91,108,255,.12); } 50% { box-shadow:0 0 0 9px rgba(91,108,255,.05); } }
@keyframes ssp-hue { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
@keyframes ssp-sheen { 0% { transform:translateX(-70%) rotate(0.001deg); } 45%,100% { transform:translateX(70%) rotate(0.001deg); } }
@keyframes ssp-rise-dot { 0% { transform:translateY(0) scale(.6); opacity:0; } 12% { opacity:.9; } 85% { opacity:.5; } 100% { transform:translateY(-260px) translateX(18px) scale(1.1); opacity:0; } }
@keyframes ssp-hero-in { from { opacity:0; transform:translateY(14px) scale(.98); filter:blur(4px); } to { opacity:1; transform:none; filter:blur(0); } }
@keyframes ssp-twinkle { 0%,100% { opacity:1; transform:scale(1) rotate(0deg); } 50% { opacity:.5; transform:scale(1.35) rotate(25deg); } }
@keyframes ssp-draw { from { stroke-dashoffset:var(--circ,999); } }
@keyframes ssp-breathe { 0%,100% { transform:scale(1); } 50% { transform:scale(1.03); } }
@keyframes ssp-drift { 0%,100% { transform:translate(0,0) rotate(0deg); } 50% { transform:translate(-8px,-10px) rotate(-1.5deg); } }
@keyframes ssp-stat-in { from { opacity:0; transform:translateY(12px) scale(.94); } to { opacity:1; transform:none; } }
@keyframes ssp-btn-sheen { 0%,60% { transform:translateX(-120%); } 100% { transform:translateX(120%); } }
@keyframes ssp-ring-pulse { 0% { transform:scale(.9); opacity:.9; } 100% { transform:scale(1.35); opacity:0; } }
@keyframes ssp-travel { 0% { left:-40%; } 100% { left:100%; } }
@keyframes ssp-pop { 0% { transform:scale(.85); } 60% { transform:scale(1.08); } 100% { transform:scale(1); } }
@keyframes ssp-wiggle { 0%,80%,100% { transform:rotate(0); } 85% { transform:rotate(-20deg); } 90% { transform:rotate(20deg); } 95% { transform:rotate(-10deg); } }
`;
