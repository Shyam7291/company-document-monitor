import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Menu, X, Home, ListOrdered, ImageUp, Boxes, UserRound, Sparkles,
  SquarePen, Mountain, Phone, MapPin, ShieldCheck, Clock3,
  CheckCircle2, ChevronRight, RefreshCw, Camera, LockKeyhole,
  Fingerprint, Building2, ArrowRight, LogOut, AlertCircle,
} from "lucide-react";
import {
  getCurrentSeller,
  getSellerProfile,
  updateSellerProfile,
  uploadSellerProfilePhoto,
} from "../api/profileApi";

/**
 * SandSellerProfilePage
 * Place alongside SellerProfilePage.js so the existing profileApi import resolves.
 * Requires the same React / lucide-react dependencies as the supplied home page.
 *
 * Existing profileApi handles loading, ordinary edits and original photo uploads.
 * Seller data accepts name / ownerName, plantName / yardName, phone / primaryPhone.
 * Verification flags from the server: aadhaarVerified:boolean, adminVerified:boolean.
 * Both start false until the profile is fetched; overall Verified requires both.
 * Admin verification is display-only and is NEVER sent in an edit payload.
 *
 * Secure primary-phone changes need backend adapters (not present in the inputs):
 *
 * onRequestPhoneChange({ sellerId, currentPhone, newPhone, challengeId? })
 *   -> Promise<{ challengeId:string, retryAfterSeconds?:number }>
 *   Send OTPs to BOTH numbers server-side. Reuse this callback for resend;
 *   invalidate the previous challenge if rotating challengeId.
 *
 * onConfirmPhoneChange({ sellerId, challengeId, currentPhone, newPhone,
 *                        currentOtp, newOtp, profile:editableFields })
 *   -> Promise<{ seller:updatedSellerRecord }> (or { user:updatedSellerRecord })
 *   The backend must verify both OTPs, bind the challenge to this authenticated
 *   seller and both numbers, rate-limit attempts, and atomically save the edits.
 *   Reject failed/expired OTPs. This component never accepts arbitrary OTPs or
 *   writes a new phone number locally as proof of verification.
 *
 * onVerifyAadhaar({ sellerId })
 *   -> Open your existing secure Aadhaar flow; may return { seller } / { user }.
 *   If omitted, onNavigate("aadhaarVerification") opens the parent app's flow.
 *   Missing both handlers produces an honest setup message, not fake success.
 *   No Aadhaar number or identity document is collected/stored on this page.
 *
 * Navigation matches StoneRateSandSellerHome's callback names and tab order.
 * onNavigate is an optional fallback: samples, queue, home, mySamples, profile.
 */

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

function Brand() {
  return <div className="ssp-brand"><i><Sparkles size={14}/></i><span>Stone</span><b>Rate</b></div>;
}

function Badge({ verified, children, light = false }) {
  const Icon = verified ? CheckCircle2 : Clock3;
  return <span className={`ssp-badge ${verified ? "is-verified" : "is-pending"} ${light ? "is-light" : ""}`}>
    <Icon size={13}/>{children}
  </span>;
}

function Detail({ icon: Icon, label, value, hint, full = false }) {
  return <div className={`ssp-detail ${full ? "ssp-full" : ""}`}>
    <i><Icon size={20}/></i><div><dt>{label}</dt><dd>{value || "Not provided"}</dd>{hint && <small>{hint}</small>}</div>
  </div>;
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

function OtpField({ id, title, phone, value, onChange, disabled }) {
  return <div className="ssp-otp-card"><div className="ssp-otp-label"><i><Phone size={18}/></i>
    <label htmlFor={id}><span>{title}</span><b>{maskPhone(phone)}</b></label></div>
    <input id={id} className="ssp-otp-input" type="text" inputMode="numeric" autoComplete="one-time-code"
      maxLength={6} placeholder="6-digit OTP" value={value} disabled={disabled}
      onChange={event => onChange(digits(event.target.value).slice(0, 6))}/>
  </div>;
}

export default function SandSellerProfilePage({
  seller, sellerName = "", onProfileUpdated, onNavigate, onSignOut,
  onOpenHome, onOpenQueue, onOpenSampleUpload, onOpenMySamples, onOpenProfile,
  onRequestPhoneChange, onConfirmPhoneChange, onVerifyAadhaar,
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

  return <div className="sand-seller-profile">
    <style>{CSS}</style>
    <div className="ssp-orb ssp-orb-one" aria-hidden="true"/>
    <div className="ssp-orb ssp-orb-two" aria-hidden="true"/>
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
      {loading && <div className="ssp-loading" role="status"><RefreshCw size={15} className="ssp-spin"/>Loading your profile and verification status…</div>}

      <section className="ssp-hero" aria-labelledby="ssp-profile-title">
        <div className="ssp-hero-art" aria-hidden="true"><Mountain/><div className="ssp-art-ring"/></div>
        <div className="ssp-hero-top"><span className="ssp-eyebrow">YOUR SELLER ACCOUNT</span>
          <Badge verified={verified} light>{verified ? "Verified" : "Unverified"}</Badge></div>
        <div className="ssp-identity">
          <div className="ssp-avatar-wrap"><div className="ssp-avatar">
            {profile.photoUrl ? <img src={profile.photoUrl} alt="Seller profile" style={{
              objectPosition: `${profile.photoX}% ${profile.photoY}%`, transform: `scale(${profile.photoZoom})`,
              transformOrigin: `${profile.photoX}% ${profile.photoY}%`,
            }}/> : initials(profile.name) ? <span>{initials(profile.name)}</span> : <UserRound size={32}/>}
          </div><button type="button" className="ssp-camera" onClick={() => photoInput.current?.click()} disabled={!ready} aria-label="Change profile photo"><Camera size={14}/></button></div>
          <div className="ssp-hero-name"><span>Plant name</span><h1 id="ssp-profile-title">{profile.plantName || "Your sand plant"}</h1>
            <p><UserRound size={14}/>{profile.name || "Add your name"}</p>
            {profile.sellerId && <small>Seller ID <b>{profile.sellerId}</b></small>}
          </div>
        </div>
        <div className="ssp-hero-bottom"><p><ShieldCheck size={16}/>{verified ? "Your seller account is verified." : "Complete verification to verify your account."}</p>
          <button type="button" className="ssp-hero-edit" disabled={!ready} onClick={openEdit}><SquarePen size={15}/>Edit profile</button></div>
      </section>
      <input ref={photoInput} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={choosePhoto}/>

      <div className="ssp-layout">
        <section className="ssp-card ssp-details" aria-labelledby="ssp-details-title">
          <div className="ssp-section-head"><div><span className="ssp-kicker">THE DETAILS</span><h2 id="ssp-details-title">Plant & personal details</h2><p>Your business, all in one place.</p></div>
            <button type="button" className="ssp-edit-link" onClick={openEdit} disabled={!ready} aria-label="Edit plant and personal details"><SquarePen size={16}/><span>Edit</span></button></div>
          <dl className="ssp-detail-grid">
            <Detail icon={Building2} label="Plant name" value={profile.plantName} full/>
            <Detail icon={UserRound} label="Name" value={profile.name} full/>
            <Detail icon={Phone} label="Mobile number" value={profile.primaryPhone ? `+91 ${profile.primaryPhone}` : ""} hint="Primary contact"/>
            <Detail icon={Phone} label="Alternate mobile number" value={profile.alternatePhone ? `+91 ${profile.alternatePhone}` : ""} hint="Additional contact"/>
            <Detail icon={MapPin} label="Plant address" value={profile.address} hint={location} full/>
          </dl>
          <div className="ssp-secure-note"><LockKeyhole size={16}/><span>Changing your primary mobile requires an OTP on both your current and new numbers.</span></div>
        </section>

        <section className="ssp-card ssp-verification" aria-labelledby="ssp-verification-title">
          <div className="ssp-section-head"><div><span className="ssp-kicker">BUILD TRUST</span><h2 id="ssp-verification-title">Verification</h2><p>A clear status, every step of the way.</p></div><i className="ssp-section-icon"><ShieldCheck size={23}/></i></div>
          <div className="ssp-verification-progress"><div><b>{verified ? "You're all verified" : "Your verification journey"}</b><span>{completed}/2 completed</span></div>
            <div className="ssp-progress-track" role="progressbar" aria-label="Verification steps completed" aria-valuemin={0} aria-valuemax={2} aria-valuenow={completed}>
              <i style={{ width: `${completed * 50}%` }}/></div></div>
          <div className="ssp-verification-list">
            <article className={`ssp-verification-step ${profile.aadhaarVerified ? "is-complete" : ""}`}>
              <div className="ssp-step-icon"><Fingerprint size={25}/><small>01</small></div>
              <div className="ssp-step-copy"><h3>Aadhaar verification</h3><p>{profile.aadhaarVerified ? "Your identity has been verified." : "Verify your identity securely."}</p>
                {profile.aadhaarVerified ? <Badge verified>Verified</Badge> : <button type="button" className="ssp-verify-button" disabled={!ready}
                  onClick={() => { setError(""); setSheet("aadhaar"); }}>Verify now<ArrowRight size={15}/></button>}
              </div>
            </article>
            <article className={`ssp-verification-step ${profile.adminVerified ? "is-complete" : ""}`}>
              <div className="ssp-step-icon ssp-admin-icon"><ShieldCheck size={25}/><small>02</small></div>
              <div className="ssp-step-copy"><h3>Admin verification</h3><p>{profile.adminVerified ? "Your plant has been approved by admin." : "Your plant will be reviewed by admin."}</p>
                <Badge verified={profile.adminVerified}>{profile.adminVerified ? "Verified" : "Yet to verify"}</Badge>
              </div>
            </article>
          </div>
          <div className="ssp-admin-note"><LockKeyhole size={14}/><span>Admin verification is updated by the StoneRate team. No action is needed here.</span></div>
        </section>
      </div>
      {onSignOut && <button type="button" className="ssp-signout" onClick={() => { setError(""); setSheet("signout"); }}><LogOut size={17}/>Sign out of your account<ChevronRight size={16}/></button>}
      <footer className="ssp-footer"><Brand/><span>SAND SELLER CONSOLE</span></footer>
    </main>

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
        onClick={() => { closeSheet(); navigate(id, action); }}><Icon size={20}/><span>{label}</span><ChevronRight size={16}/></button>)}</nav>
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
        {phoneChanged && <div className="ssp-phone-warning ssp-full"><LockKeyhole size={19}/><div><b>Both numbers need to be verified</b><p>We'll send separate OTPs to {maskPhone(profile.primaryPhone)} and your new mobile. Your existing number stays unchanged until both OTPs are verified.</p></div></div>}
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
      <div className="ssp-otp-intro"><LockKeyhole size={25}/><div><b>Verify both mobile numbers</b><p>Separate codes have been sent to your current and new mobile numbers.</p></div></div>
      <form id="ssp-otp-form" onSubmit={confirmPhone} noValidate>
        <OtpField id="ssp-current-otp" title="Current mobile OTP" phone={pendingChange.currentPhone} value={currentOtp} disabled={busy} onChange={value => { setCurrentOtp(value); setError(""); }}/>
        <OtpField id="ssp-new-otp" title="New mobile OTP" phone={pendingChange.newPhone} value={newOtp} disabled={busy} onChange={value => { setNewOtp(value); setError(""); }}/>
        {sheetError}
      </form>
      <button type="button" className="ssp-resend" disabled={busy || seconds > 0} onClick={resendOtps}><RefreshCw size={14}/>{seconds > 0 ? `Resend both OTPs in ${seconds}s` : "Resend both OTPs"}</button>
      <p className="ssp-otp-help">Never share your OTPs. Your primary mobile changes only after the server verifies both codes.</p>
    </Sheet>}

    {sheet === "aadhaar" && <Sheet title="Aadhaar verification" subtitle="Verify your identity with the secure verification flow." busy={busy} onClose={closeSheet}
      footer={<><button type="button" className="ssp-secondary" disabled={busy} onClick={closeSheet}>Not now</button><button type="button" className="ssp-primary" disabled={busy} onClick={startAadhaarVerification}>
        {busy ? <RefreshCw size={16} className="ssp-spin"/> : <ArrowRight size={16}/>}{busy ? "Opening…" : "Continue"}</button></>}>
      <div className="ssp-verification-intro"><i><Fingerprint size={40}/></i><h3>Your identity. Securely verified.</h3><p>Continue to the connected Aadhaar verification service. This profile page does not collect or store your Aadhaar number.</p></div>
      <div className="ssp-secure-note"><LockKeyhole size={17}/><span>Only a successful verification response updates your status. Admin approval is a separate step.</span></div>{sheetError}
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
      ].map(control => <label key={control.key}><span>{control.label}</span><input type="range" min={control.min} max={control.max} step={control.step}
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
      <p className="ssp-signout-copy">You will need to sign in again to access your seller account.</p>{sheetError}
    </Sheet>}
  </div>;
}

const CSS = `
.sand-seller-profile {
  --ssp-ink:#1b2340; --ssp-muted:#6b7590; --ssp-line:rgba(120,135,180,.16);
  --ssp-indigo:#5b6cff; --ssp-violet:#8b5cf6; --ssp-cyan:#22c1ee;
  --ssp-grad:linear-gradient(135deg,#5b6cff 0%,#8b5cf6 55%,#22c1ee 100%);
  --ssp-shadow:0 12px 34px rgba(64,84,150,.10),0 2px 6px rgba(64,84,150,.05);
  position:relative; isolation:isolate; min-height:100vh; min-height:100dvh;
  padding-bottom:calc(96px + env(safe-area-inset-bottom,0px));
  background:linear-gradient(180deg,#eef0ff 0%,#e9edfb 40%,#e6f0fa 100%);
  color:var(--ssp-ink); font-family:"Plus Jakarta Sans",Inter,"Segoe UI",system-ui,sans-serif;
  font-size:14px; line-height:1.5; -webkit-font-smoothing:antialiased; color-scheme:light;
}
.sand-seller-profile *, .sand-seller-profile *::before, .sand-seller-profile *::after { box-sizing:border-box; }
.sand-seller-profile button,.sand-seller-profile input,.sand-seller-profile textarea { font:inherit; }
.sand-seller-profile button { cursor:pointer; -webkit-tap-highlight-color:transparent; }
.sand-seller-profile button:disabled { cursor:not-allowed; opacity:.55; }
.sand-seller-profile button:focus-visible,.sand-seller-profile input:focus-visible,.sand-seller-profile textarea:focus-visible { outline:3px solid rgba(91,108,255,.4); outline-offset:3px; }
.sand-seller-profile svg { flex-shrink:0; }
.sand-seller-profile button { transition:transform .2s,box-shadow .2s,background .2s; }
.sand-seller-profile button:active:not(:disabled) { transform:scale(.97); }
.ssp-orb { position:fixed; z-index:-1; border-radius:50%; filter:blur(70px); pointer-events:none; opacity:.7; }
.ssp-orb-one { width:340px; height:340px; left:-120px; top:-80px; background:radial-gradient(circle,#c3caff,transparent 70%); }
.ssp-orb-two { width:280px; height:380px; right:0; top:200px; background:radial-gradient(circle,#b9ecfb,transparent 70%); }
.ssp-top { position:sticky; top:0; z-index:40; max-width:1180px; margin:auto; min-height:68px; padding:12px 16px; display:flex; align-items:center; gap:14px; background:rgba(255,255,255,.76); backdrop-filter:blur(22px) saturate(160%); -webkit-backdrop-filter:blur(22px) saturate(160%); border-bottom:1px solid var(--ssp-line); }
.ssp-top-left { display:flex; align-items:center; gap:10px; margin-right:auto; min-width:0; }
.ssp-top-copy span,.ssp-top-copy b { display:block; }
.ssp-top-copy span { font-size:8px; letter-spacing:1.3px; color:var(--ssp-muted); font-weight:800; }
.ssp-top-copy b { font-size:14px; letter-spacing:-.3px; }
.ssp-icon { display:grid; place-items:center; width:39px; height:39px; flex:none; border:1px solid var(--ssp-line); border-radius:13px; background:rgba(255,255,255,.92); color:#3b4468; box-shadow:0 6px 16px rgba(64,84,150,.08); }
.ssp-icon:hover:not(:disabled) { box-shadow:0 10px 22px rgba(64,84,150,.14); transform:translateY(-1px); }
.ssp-brand { display:flex; align-items:center; white-space:nowrap; font-size:18px; font-weight:900; letter-spacing:-.7px; line-height:1; }
.ssp-brand i { width:24px; height:24px; margin-right:5px; display:grid; place-items:center; border-radius:8px; background:var(--ssp-grad); color:#fff; box-shadow:0 6px 14px rgba(91,108,255,.25); }
.ssp-brand span { color:var(--ssp-ink); }
.ssp-brand b { background:var(--ssp-grad); -webkit-background-clip:text; background-clip:text; color:transparent; }
.ssp-content { position:relative; max-width:1060px; margin:0 auto; padding:20px 16px 0; }
.ssp-loading { display:flex; align-items:center; gap:8px; margin-bottom:14px; color:#4958bf; font-size:12px; }
.ssp-hero { position:relative; overflow:hidden; padding:23px; border-radius:28px; background:var(--ssp-grad); color:#fff; box-shadow:0 18px 42px rgba(91,108,255,.28); }
.ssp-hero::after { content:""; position:absolute; inset:0; pointer-events:none; border-radius:inherit; border:1px solid rgba(255,255,255,.28); background:radial-gradient(ellipse at 4% 0%,rgba(255,255,255,.2),transparent 60%); }
.ssp-hero-art { position:absolute; right:-25px; bottom:-35px; width:270px; height:240px; pointer-events:none; opacity:.19; }
.ssp-hero-art>svg { position:absolute; width:220px; height:220px; stroke-width:.7; right:0; bottom:0; }
.ssp-art-ring { position:absolute; width:240px; height:240px; border:1px solid rgba(255,255,255,.7); border-radius:50%; right:-70px; top:-60px; box-shadow:0 0 0 28px rgba(255,255,255,.12),0 0 0 56px rgba(255,255,255,.08); }
.ssp-hero-top,.ssp-identity,.ssp-hero-bottom { position:relative; z-index:1; }
.ssp-hero-top { display:flex; justify-content:space-between; align-items:center; gap:10px; }
.ssp-eyebrow { font-size:9px; font-weight:800; letter-spacing:1.8px; color:rgba(255,255,255,.86); }
.ssp-badge { display:inline-flex; width:max-content; max-width:100%; align-items:center; gap:5px; padding:5px 10px; border:1px solid transparent; border-radius:99px; font-size:10px; font-weight:800; line-height:1.35; white-space:nowrap; }
.ssp-badge.is-pending { color:#936000; background:#fff5dc; border-color:rgba(245,165,36,.23); }
.ssp-badge.is-verified { color:#087b56; background:#e9f9f1; border-color:rgba(34,197,143,.2); }
.ssp-badge.is-light.is-pending { color:#ffefc8; background:rgba(64,38,88,.3); border-color:rgba(255,233,182,.4); }
.ssp-badge.is-light.is-verified { color:#e0fff1; background:rgba(5,80,69,.28); border-color:rgba(199,255,229,.4); }
.ssp-identity { display:flex; align-items:center; gap:17px; margin:27px 0 23px; }
.ssp-avatar-wrap { position:relative; flex:none; }
.ssp-avatar { width:82px; height:82px; display:grid; place-items:center; overflow:hidden; border:3px solid rgba(255,255,255,.75); border-radius:26px; background:rgba(255,255,255,.18); box-shadow:0 10px 24px rgba(33,33,100,.15); color:#fff; font-size:26px; font-weight:800; }
.ssp-avatar img { width:100%; height:100%; object-fit:cover; }
.ssp-camera { position:absolute; right:-5px; bottom:-6px; width:29px; height:29px; display:grid; place-items:center; padding:0; border:3px solid #8172f4; border-radius:11px; background:#fff; color:#675ae1; box-shadow:0 4px 12px rgba(27,35,64,.15); }
.ssp-hero-name { min-width:0; }
.ssp-hero-name>span { display:block; color:rgba(255,255,255,.78); font-size:10px; font-weight:600; }
.ssp-hero-name h1 { margin:3px 0 6px; font-size:24px; letter-spacing:-.9px; line-height:1.2; font-weight:800; overflow-wrap:anywhere; }
.ssp-hero-name p { display:flex; align-items:center; gap:6px; margin:0; font-size:13px; overflow-wrap:anywhere; }
.ssp-hero-name>small { display:block; margin-top:7px; font-size:9px; color:rgba(255,255,255,.76); }
.ssp-hero-name>small b { margin-left:4px; color:#fff; font-weight:700; letter-spacing:.5px; }
.ssp-hero-bottom { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; padding-top:16px; border-top:1px solid rgba(255,255,255,.22); }
.ssp-hero-bottom p { display:flex; align-items:center; gap:7px; margin:0; font-size:10.5px; color:rgba(255,255,255,.92); }
.ssp-hero-edit { display:flex; align-items:center; justify-content:center; gap:7px; min-height:38px; padding:9px 13px; border:1px solid rgba(255,255,255,.7); border-radius:12px; background:#fff; color:#6256d7; font-size:11px!important; font-weight:800!important; box-shadow:0 6px 16px rgba(38,34,102,.12); }
.ssp-layout { display:grid; gap:18px; margin-top:20px; align-items:start; }
.ssp-card { min-width:0; overflow:hidden; padding:21px; border:1px solid rgba(255,255,255,.95); border-radius:26px; background:rgba(255,255,255,.84); box-shadow:var(--ssp-shadow); backdrop-filter:blur(14px); }
.ssp-section-head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:18px; }
.ssp-kicker { display:block; margin-bottom:5px; color:#6371db; font-size:8px; font-weight:800; letter-spacing:1.6px; }
.ssp-section-head h2 { margin:0; font-size:18px; font-weight:800; letter-spacing:-.5px; line-height:1.25; }
.ssp-section-head p { margin:5px 0 0; color:var(--ssp-muted); font-size:11px; }
.ssp-edit-link { display:flex; flex:none; align-items:center; gap:5px; padding:8px 10px; border:1px solid rgba(91,108,255,.18); border-radius:11px; background:#f1f3ff; color:#5666d4; font-size:11px!important; font-weight:700!important; }
.ssp-detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:0; }
.ssp-full { grid-column:1/-1; }
.ssp-detail { display:flex; align-items:flex-start; gap:11px; min-width:0; padding:14px 12px; border:1px solid var(--ssp-line); border-radius:16px; background:rgba(249,250,255,.68); }
.ssp-detail>i { flex:none; width:36px; height:36px; display:grid; place-items:center; border-radius:12px; color:#6873df; background:linear-gradient(135deg,#eaedff,#f0eaff); }
.ssp-detail>div { min-width:0; }
.ssp-detail dt { margin:0 0 4px; font-size:10px; color:var(--ssp-muted); }
.ssp-detail dd { margin:0; font-size:13px; font-weight:750; line-height:1.5; overflow-wrap:anywhere; white-space:pre-line; }
.ssp-detail small { display:block; margin-top:4px; font-size:10px; color:var(--ssp-muted); overflow-wrap:anywhere; }
.ssp-detail:last-child { background:linear-gradient(130deg,#eff9fe,#f6f6ff); border-color:rgba(34,193,238,.17); }
.ssp-detail:last-child>i { color:#2592b8; background:#e1f3fa; }
.ssp-detail:not(.ssp-full) { flex-direction:column; gap:9px; }
.ssp-secure-note { display:flex; align-items:flex-start; gap:8px; padding:12px; margin-top:14px; border-radius:13px; background:rgba(91,108,255,.055); color:#647195; font-size:10px; line-height:1.6; }
.ssp-secure-note>svg { margin-top:1px; color:#7280cc; }
.ssp-section-icon { width:42px; height:42px; flex:none; display:grid; place-items:center; border-radius:14px; color:#6973e5; background:linear-gradient(135deg,#e9edff,#efe7ff); }
.ssp-verification-progress { padding:14px; border:1px solid rgba(91,108,255,.11); border-radius:16px; background:linear-gradient(135deg,#f1f3ff,#f6f1ff); }
.ssp-verification-progress>div:first-child { display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:11px; }
.ssp-verification-progress b { font-size:11px; font-weight:750; }
.ssp-verification-progress span { flex:none; font-size:10px; color:#6973c7; }
.ssp-progress-track { height:5px; border-radius:20px; background:#e0e5f6; overflow:hidden; }
.ssp-progress-track i { display:block; height:100%; border-radius:inherit; background:var(--ssp-grad); transition:width .35s; }
.ssp-verification-list { display:grid; gap:14px; margin:20px 0 16px; }
.ssp-verification-step { position:relative; display:flex; align-items:flex-start; gap:14px; padding:4px 0 17px; }
.ssp-verification-step:first-child { border-bottom:1px dashed #dce1f1; }
.ssp-verification-step:last-child { padding-bottom:0; }
.ssp-step-icon { position:relative; flex:none; width:49px; height:49px; display:grid; place-items:center; border:1px solid #e0e4ff; border-radius:17px; background:linear-gradient(140deg,#eef0ff,#f5edff); color:#7a64df; }
.ssp-step-icon small { position:absolute; right:-5px; bottom:-5px; width:20px; height:20px; display:grid; place-items:center; border:2px solid #fff; border-radius:50%; background:#8083dd; color:#fff; font-size:8px; font-weight:800; }
.ssp-admin-icon { border-color:#dcecf5; background:linear-gradient(140deg,#eef8ff,#e7f7f7); color:#3597ac; }
.ssp-admin-icon small { background:#62a5b7; }
.ssp-step-copy { min-width:0; padding-top:1px; }
.ssp-step-copy h3 { margin:0; font-size:13px; font-weight:800; letter-spacing:-.2px; }
.ssp-step-copy p { margin:4px 0 10px; color:var(--ssp-muted); font-size:10.5px; line-height:1.6; }
.ssp-verification-step.is-complete .ssp-step-icon { color:#139c75; border-color:#ceeedd; background:#ecfaf3; }
.ssp-verification-step.is-complete .ssp-step-icon small { background:#22b487; }
.ssp-verify-button { display:inline-flex; align-items:center; gap:12px; min-height:35px; padding:8px 13px; border:0; border-radius:11px; background:var(--ssp-grad); color:#fff; font-size:10.5px!important; font-weight:750!important; box-shadow:0 7px 16px rgba(91,108,255,.23); }
.ssp-admin-note { display:flex; align-items:flex-start; gap:7px; padding-top:13px; border-top:1px solid var(--ssp-line); color:#7c859d; font-size:10px; line-height:1.6; }
.ssp-admin-note svg { margin-top:2px; }
.ssp-signout { width:100%; display:flex; align-items:center; gap:9px; margin:18px 0 0; padding:14px 17px; border:1px solid rgba(219,99,120,.15); border-radius:17px; background:rgba(255,255,255,.64); color:#b5546e; font-size:12px!important; font-weight:650!important; }
.ssp-signout>svg:last-child { margin-left:auto; }
.ssp-footer { display:grid; justify-items:center; gap:10px; padding:27px 12px 7px; opacity:.65; }
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
.ssp-overlay { position:fixed; inset:0; z-index:80; display:flex; align-items:flex-end; justify-content:center; background:rgba(27,35,64,.4); backdrop-filter:blur(7px); -webkit-backdrop-filter:blur(7px); animation:ssp-fade .2s ease; }
.ssp-sheet { display:flex; flex-direction:column; width:100%; max-width:600px; max-height:94vh; max-height:94dvh; padding:10px 20px 0; border-radius:28px 28px 0 0; background:linear-gradient(180deg,#fff,#f7f9ff); box-shadow:0 -20px 60px rgba(27,35,64,.22); outline:none; animation:ssp-rise .28s cubic-bezier(.2,.8,.2,1); }
.ssp-handle { width:40px; height:4px; border-radius:9px; flex:none; margin:0 auto 15px; background:#dce1f0; }
.ssp-sheet-head { display:flex; flex:none; align-items:flex-start; justify-content:space-between; gap:12px; padding-bottom:16px; border-bottom:1px solid var(--ssp-line); }
.ssp-sheet-head h2 { margin:0; font-size:19px; font-weight:800; letter-spacing:-.5px; }
.ssp-sheet-head p { margin:5px 0 0; font-size:11px; color:var(--ssp-muted); }
.ssp-sheet-body { min-height:0; overflow-y:auto; overscroll-behavior:contain; padding:18px 0 22px; }
.ssp-sheet-foot { display:flex; flex:none; gap:10px; padding:14px 0 calc(16px + env(safe-area-inset-bottom,0px)); border-top:1px solid var(--ssp-line); }
.ssp-primary,.ssp-secondary,.ssp-danger { display:flex; justify-content:center; align-items:center; gap:7px; min-height:44px; padding:11px 16px; border:0; border-radius:14px; font-size:12px!important; font-weight:750!important; }
.ssp-primary { flex:1.5; color:#fff; background:var(--ssp-grad); box-shadow:0 10px 22px rgba(91,108,255,.23); }
.ssp-secondary { flex:1; background:#edf0fa; color:#65708b; }
.ssp-danger { flex:1.5; background:#c84062; color:#fff; }
.ssp-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px 12px; min-width:0; margin:0; padding:0; border:0; }
.ssp-field { min-width:0; }
.ssp-field>label { display:block; margin-bottom:7px; font-size:11px; color:#46516e; font-weight:750; }
.ssp-field input,.ssp-field textarea { display:block; width:100%; min-width:0; padding:12px; border:1px solid #dfe4f1; border-radius:12px; color:var(--ssp-ink); background:#fff; font-size:14px; transition:border-color .2s,box-shadow .2s; }
.ssp-field textarea { resize:vertical; min-height:90px; }
.ssp-field input:focus,.ssp-field textarea:focus { border-color:#919df3; box-shadow:0 0 0 3px rgba(91,108,255,.08); }
.ssp-phone-input { display:flex; align-items:center; overflow:hidden; border:1px solid #dfe4f1; border-radius:12px; background:#fff; }
.ssp-phone-input>span { flex:none; padding-left:11px; color:#78829b; font-size:12px; }
.ssp-phone-input input { border:0; padding-left:7px; border-radius:0; }
.ssp-phone-input:focus-within { border-color:#919df3; box-shadow:0 0 0 3px rgba(91,108,255,.1); }
.ssp-field.has-error>input,.ssp-field.has-error>textarea,.ssp-field.has-error .ssp-phone-input { border-color:#da6881; }
.ssp-field-error { display:flex; align-items:flex-start; gap:4px; margin-top:6px; font-size:10px; color:#b33252; }
.ssp-field-error svg { margin-top:2px; }
.ssp-field-note { display:block; margin-top:6px; color:var(--ssp-muted); font-size:10px; }
.ssp-phone-warning { display:flex; align-items:flex-start; gap:10px; padding:13px; border:1px solid rgba(245,165,36,.23); border-radius:14px; background:#fff8e8; color:#9a6a23; }
.ssp-phone-warning b { font-size:11px; }
.ssp-phone-warning p { margin:3px 0 0; font-size:10px; line-height:1.6; }
.ssp-form-note { display:flex; align-items:center; gap:7px; margin:17px 0 0; color:var(--ssp-muted); font-size:10px; }
.ssp-alert { display:flex; align-items:flex-start; gap:9px; padding:12px 14px; border:1px solid rgba(212,79,113,.23); border-radius:14px; background:#fff0f4; color:#a43351; font-size:12px; line-height:1.6; overflow-wrap:anywhere; }
.ssp-content>.ssp-alert { margin-bottom:15px; }
.ssp-sheet .ssp-alert { margin-top:15px; }
.ssp-alert>svg { margin-top:2px; }
.ssp-alert>span { flex:1; min-width:0; }
.ssp-alert button { flex:none; border:0; border-radius:8px; background:#fff; color:#a43351; padding:4px 9px; font-size:11px; font-weight:700; }
.ssp-otp-intro { display:flex; align-items:center; gap:12px; padding:15px; margin-bottom:18px; border:1px solid #e3e7fa; border-radius:17px; background:linear-gradient(135deg,#eef1ff,#f6eeff); color:#6c63ce; }
.ssp-otp-intro b { color:#424b7a; font-size:12px; }
.ssp-otp-intro p { margin:4px 0 0; color:#727b99; font-size:11px; }
.ssp-otp-card { padding:15px; margin-top:12px; border:1px solid var(--ssp-line); border-radius:18px; background:#fff; }
.ssp-otp-label { display:flex; align-items:center; gap:10px; }
.ssp-otp-label i { width:37px; height:37px; display:grid; place-items:center; border-radius:12px; color:#7880d9; background:#f0f2ff; }
.ssp-otp-label label span,.ssp-otp-label label b { display:block; }
.ssp-otp-label label span { font-size:10px; color:var(--ssp-muted); }
.ssp-otp-label label b { margin-top:2px; font-size:13px; letter-spacing:.6px; }
.ssp-otp-input { width:100%; min-height:52px; padding:10px 12px; margin-top:13px; border:1px solid #dfe5f5; border-radius:12px; background:#f9faff; color:#4651a1; text-align:center; font-size:24px!important; font-weight:750; letter-spacing:.35em; }
.ssp-otp-input::placeholder { color:#a0a8c0; font-size:13px; font-weight:500; letter-spacing:2px; }
.ssp-resend { display:flex; justify-content:center; align-items:center; gap:7px; width:100%; padding:12px; margin-top:12px; border:0; background:transparent; color:#6875d8; font-size:11px!important; font-weight:700!important; }
.ssp-otp-help { margin:10px 5px 0; color:var(--ssp-muted); text-align:center; font-size:10px; line-height:1.8; }
.ssp-verification-intro { padding:8px 8px 12px; text-align:center; }
.ssp-verification-intro>i { display:grid; place-items:center; width:90px; height:90px; margin:0 auto 20px; border:1px solid #e1e5ff; border-radius:29px; background:linear-gradient(135deg,#eef0ff,#eee6ff); color:#7864e0; box-shadow:0 10px 28px rgba(91,108,255,.11); }
.ssp-verification-intro h3 { margin:0; font-size:19px; letter-spacing:-.5px; }
.ssp-verification-intro p { max-width:340px; margin:12px auto 0; font-size:12px; line-height:1.8; color:var(--ssp-muted); }
.ssp-photo-stage { display:grid; place-items:center; padding:10px 0 22px; }
.ssp-photo-stage>div { width:190px; height:190px; overflow:hidden; border:5px solid #fff; border-radius:50%; background:#eef0ff; box-shadow:0 0 0 1px #dfe4ff,0 15px 35px rgba(91,108,255,.22); }
.ssp-photo-stage img { width:100%; height:100%; object-fit:cover; }
.ssp-photo-controls { display:grid; gap:12px; }
.ssp-photo-controls label { display:grid; gap:8px; padding:11px 13px; border:1px solid var(--ssp-line); border-radius:12px; background:#fff; }
.ssp-photo-controls label>span { font-size:11px; font-weight:650; color:#636f90; }
.ssp-photo-controls input { width:100%; accent-color:#7c6bf1; }
.ssp-signout-copy { font-size:13px; color:var(--ssp-muted); }
.ssp-drawer-overlay { justify-content:flex-start; align-items:stretch; }
.ssp-sheet.ssp-drawer { width:min(86vw,340px); max-height:100%; padding:22px 18px; border-radius:0 25px 25px 0; animation:ssp-slide .25s ease; }
.ssp-drawer .ssp-sheet-body { display:flex; flex:1; flex-direction:column; }
.ssp-menu-seller { display:flex; align-items:center; gap:11px; padding:16px; border-radius:19px; background:var(--ssp-grad); color:#fff; }
.ssp-menu-seller>i { flex:none; display:grid; place-items:center; width:44px; height:44px; background:rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.2); border-radius:14px; }
.ssp-menu-seller>div { min-width:0; }
.ssp-menu-seller b { display:block; font-size:13px; overflow-wrap:anywhere; }
.ssp-menu-seller span { display:block; margin-top:4px; font-size:11px; opacity:.85; }
.ssp-menu-links { display:grid; gap:7px; margin-top:22px; }
.ssp-menu-links button { display:flex; align-items:center; gap:12px; padding:13px; border:1px solid transparent; border-radius:14px; color:#687493; background:transparent; font-size:13px; text-align:left; }
.ssp-menu-links button>span { flex:1; }
.ssp-menu-links button.active { background:#edf0ff; border-color:#dce3ff; color:#5b6cff; font-weight:750; }
.ssp-menu-brand { display:grid; gap:10px; justify-items:center; margin-top:auto; padding-top:28px; }
.ssp-menu-brand>small { color:var(--ssp-muted); font-size:10px; }
.ssp-toast { position:fixed; left:50%; bottom:calc(90px + env(safe-area-inset-bottom,0px)); z-index:100; width:max-content; max-width:calc(100vw - 32px); padding:12px 18px; border:1px solid rgba(255,255,255,.2); border-radius:15px; background:#303858; color:#fff; font-size:12px; line-height:1.5; text-align:center; box-shadow:0 12px 30px rgba(27,35,64,.24); opacity:0; pointer-events:none; transform:translate(-50%,8px); transition:opacity .2s,transform .2s; }
.ssp-toast.is-visible { opacity:1; transform:translate(-50%,0); }
.ssp-spin { animation:ssp-spin 1s linear infinite; }
@media(min-width:760px) {
  .ssp-top { min-height:78px; padding:14px 28px; }
  .ssp-top>.ssp-brand { margin-right:auto; }
  .ssp-top-left { flex:1; }
  .ssp-top>.ssp-icon { margin-left:100px; }
  .ssp-content { padding-top:28px; }
  .ssp-layout { grid-template-columns:minmax(0,1.18fr) minmax(0,1fr); gap:22px; margin-top:24px; }
  .ssp-hero { padding:29px 32px; border-radius:30px; }
  .ssp-identity { margin:23px 0; gap:21px; }
  .ssp-avatar { width:92px; height:92px; border-radius:29px; }
  .ssp-hero-name h1 { font-size:32px; }
  .ssp-hero-name p { font-size:15px; }
  .ssp-eyebrow { font-size:10px; }
  .ssp-hero-bottom p { font-size:12px; }
  .ssp-hero-art { width:360px; height:300px; right:25px; bottom:-10px; }
  .ssp-hero-art>svg { width:290px; height:290px; }
  .ssp-card { padding:24px; }
  .ssp-sheet:not(.ssp-drawer) { max-height:88dvh; margin-bottom:24px; border-radius:27px; }
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
  .ssp-hero { padding:19px; border-radius:23px; }
  .ssp-hero-name h1 { font-size:21px; }
  .ssp-avatar { width:65px; height:65px; border-radius:22px; font-size:23px; }
  .ssp-identity { gap:13px; }
  .ssp-eyebrow { font-size:8px; letter-spacing:1px; }
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
`;
