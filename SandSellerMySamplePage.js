import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createSellerSample,
  deleteSellerSample,
  getSellerSamples,
  updateSellerSampleDetails,
  updateSellerSampleQuantity,
  updateSellerSampleRate,
} from "../api/sellerSamplesApi";
import { getActiveMaterials } from "../api/sellerInformationApi";

/* ============================================================
   SANDRATE · SAND SELLER CONSOLE · MY SAMPLES
   Theme: "Obsidian Neon" — dark hi-tech / holographic HUD
   (matches SellerHomePage · same bottom navigation)
   Unit: bucket · Sample validity: 5 days (120 hours)
   ============================================================ */

/* ============================================================
   CONSTANTS
   ============================================================ */

const SAMPLE_VALIDITY_DAYS = 5;
const SAMPLE_VALIDITY_HOURS = SAMPLE_VALIDITY_DAYS * 24;
const EXPIRING_THRESHOLD_HOURS = 24;
const UNIT = "bucket";
const UNIT_PLURAL = "buckets";
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

const BLANK_FORM = {
  image: null,
  imageUrl: "",
  imageName: "",
  imageSize: "",
  material: "",
  rate: "",
  permitCost: "",
  qty: "",
  imageZoom: 1,
  imagePositionX: 50,
  imagePositionY: 50,
};

const NAV_TABS = [
  { id: "samples", label: "Samples", icon: "samples" },
  { id: "orders", label: "Orders", icon: "orders" },
  { id: "home", label: "Home", icon: "home" },
  { id: "mySamples", label: "My Samples", icon: "upload" },
  { id: "profile", label: "Profile", icon: "profile" },
];

/* ============================================================
   ICONS
   ============================================================ */

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    upload: <><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M5 20h14" /></>,
    orders: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /></>,
    samples: <><rect x="4" y="4" width="16" height="16" rx="3" /><circle cx="9" cy="9" r="2" /><path d="m5 17 4-4 3 3 2-2 5 5" /></>,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    arrow: <><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    alert: <><path d="M10.3 3.7 2.4 18a2 2 0 0 0 1.8 3h15.6a2 2 0 0 0 1.8-3L13.7 3.7a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>,
    box: <><path d="m21 8-9 5-9-5 9-5 9 5Z" /><path d="M3 8v9l9 5 9-5V8M12 13v9" /></>,
    bucket: <><path d="M4 7h16l-1.6 12a2 2 0 0 1-2 1.8H7.6a2 2 0 0 1-2-1.8L4 7Z" /><path d="M4 7a8 3 0 0 1 16 0" /><path d="M7 11.5c2 1.2 8 1.2 10 0" /></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    camera: <><path d="M4 7h4l2-3h4l2 3h4v12H4V7Z" /><circle cx="12" cy="13" r="4" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 20" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5l4 4L8 20H4v-4L16.5 3.5Z" /></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14" /></>,
    rupee: <><circle cx="12" cy="12" r="9" /><path d="M9 7h7M9 10h7M10 7c4 0 4 6 0 6h-1l6 5" /></>,
    spark: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><circle cx="12" cy="12" r="3" /></>,
    grains: <><circle cx="7" cy="8" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="6" r="1.4" fill="currentColor" stroke="none" /><circle cx="17" cy="9" r="1.4" fill="currentColor" stroke="none" /><circle cx="9" cy="13" r="1.4" fill="currentColor" stroke="none" /><circle cx="15" cy="14" r="1.4" fill="currentColor" stroke="none" /><path d="M3 20c3-3 15-3 18 0" /></>,
  };

  return <svg {...common}>{paths[name] || paths.box}</svg>;
}

/* ============================================================
   HELPERS
   ============================================================ */

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
    .format(new Date(value))
    .replace(",", " at");
}

function formatQty(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

/** "3d 4h left" style remaining text for a 5-day validity window. */
function formatRemaining(hours) {
  const total = Math.max(0, Math.floor(Number(hours) || 0));
  if (total <= 0) return "Expired";
  const days = Math.floor(total / 24);
  const rest = total % 24;
  if (days > 0) return rest > 0 ? `${days}d ${rest}h remaining` : `${days}d remaining`;
  return `${total}h remaining`;
}

function shortRemaining(hours) {
  const total = Math.max(0, Math.floor(Number(hours) || 0));
  if (total <= 0) return "EXPIRED";
  const days = Math.floor(total / 24);
  const rest = total % 24;
  if (days > 0) return `${days}D ${rest}H LEFT`;
  return `${total}H LEFT`;
}

function readCurrentSeller() {
  try {
    const raw =
      window.localStorage.getItem("stonerate_current_seller") ||
      window.localStorage.getItem("stonerate_current_user");
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.role === "seller" ? parsed : null;
  } catch {
    return null;
  }
}

function hoursFromExpiry(expiresAt) {
  if (!expiresAt) return SAMPLE_VALIDITY_HOURS;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 3600000));
}

function mapApiSample(sample) {
  return {
    id: sample.id,
    sampleCode: sample.sampleCode,
    material: sample.materialName || sample.material || "Sand",
    rate: Number(sample.rate || 0),
    qty: Number(sample.availableQuantity || 0),
    unit: sample.quantityUnit || sample.rateUnit || UNIT,
    permitCost:
      sample.permitCost === null || sample.permitCost === undefined ? null : Number(sample.permitCost),
    uploaded: formatDate(sample.uploadedAt),
    updated: sample.commercialUpdatedAt
      ? formatDate(sample.commercialUpdatedAt)
      : sample.rateUpdatedAt
        ? formatDate(sample.rateUpdatedAt)
        : "Not updated yet",
    remaining:
      sample.hoursRemaining !== undefined && sample.hoursRemaining !== null
        ? Number(sample.hoursRemaining)
        : hoursFromExpiry(sample.expiresAt),
    views: Number(sample.viewCount || 0),
    rateUpdated: Boolean(sample.rateUpdated),
    imageUrl: sample.imageUrl || "",
    expiresAt: sample.expiresAt,
  };
}

function sampleStatus(sample) {
  if (Number(sample.qty) === 0) return "out";
  if (sample.remaining <= EXPIRING_THRESHOLD_HOURS) return "expiring";
  return "active";
}

/* ============================================================
   SMALL PRIMITIVES
   ============================================================ */

/** Reveal-on-scroll wrapper (same behaviour as the home page). */
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? "in" : ""} ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/** Bottom sheet frame used by every modal on this page. */
function Sheet({ title, sub, large = false, children, footer, onClose }) {
  return (
    <div
      className="backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className={`sheet ${large ? "large" : "compact"}`} role="dialog" aria-modal="true">
        <span className="sheet-edge" aria-hidden="true" />
        <header className="sheet-head">
          <i className="sheet-grip" aria-hidden="true" />
          <div>
            <h2>{title}</h2>
            {sub ? <p>{sub}</p> : null}
          </div>
          <button type="button" className="sheet-close" onClick={onClose} aria-label="Close">
            <Icon name="close" size={17} />
          </button>
        </header>
        <div className="sheet-body">{children}</div>
        {footer ? <footer className="sheet-foot">{footer}</footer> : null}
      </section>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint ? <small className="field-hint">{hint}</small> : null}
    </label>
  );
}

function Affix({ prefix, suffix, children }) {
  return (
    <div className="affix">
      {prefix ? <span className="affix-prefix">{prefix}</span> : null}
      {children}
      {suffix ? <span className="affix-suffix">{suffix}</span> : null}
    </div>
  );
}

function MaterialSelect({ value, onChange, materials, loading, error, onRetry, allowExisting = false }) {
  return (
    <>
      <select value={value} disabled={loading} onChange={(event) => onChange(event.target.value)}>
        <option value="">{loading ? "Loading materials..." : "Select sand material"}</option>
        {allowExisting && value && !materials.includes(value) ? (
          <option value={value}>{value} (existing)</option>
        ) : null}
        {materials.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      {error ? (
        <small className="field-error">
          {error}{" "}
          <button type="button" onClick={onRetry}>
            Try again
          </button>
        </small>
      ) : null}
    </>
  );
}

/* ============================================================
   OVERVIEW METRICS
   ============================================================ */

function MetricCard({ icon, value, label, tone, index }) {
  return (
    <Reveal delay={index * 60}>
      <article className={`metric-card ${tone}`}>
        <span className="card-edge" aria-hidden="true" />
        <span className="metric-icon">
          <Icon name={icon} size={16} />
        </span>
        <strong>{value}</strong>
        <small>{label}</small>
      </article>
    </Reveal>
  );
}

/* ============================================================
   SAMPLE CARD
   ============================================================ */

function SampleCard({ sample, onOpen, index }) {
  const st = sampleStatus(sample);
  const badge =
    st === "active" ? "ACTIVE" : st === "expiring" ? shortRemaining(sample.remaining) : "OUT OF STOCK";
  const pct = Math.max(0, Math.min(100, (sample.remaining / SAMPLE_VALIDITY_HOURS) * 100));
  const barTone = sample.remaining > 72 ? "green" : sample.remaining > 24 ? "blue" : "orange";

  return (
    <Reveal delay={index * 70}>
      <article className={`sample-card ${st}`}>
        <span className="card-edge" aria-hidden="true" />

        <button
          type="button"
          className="sample-photo"
          aria-label={`Open image and actions for ${sample.material}`}
          onClick={() => onOpen("image", sample)}
          style={
            sample.imageUrl
              ? { backgroundImage: `url("${sample.imageUrl}")` }
              : undefined
          }
        >
          {!sample.imageUrl ? (
            <span className="photo-empty">
              <Icon name="grains" size={26} />
            </span>
          ) : null}
          <span className="photo-scan" aria-hidden="true" />
          <span className={`status-chip ${st}`}>{badge}</span>
          <span className="photo-code">SR // {sample.sampleCode || sample.id}</span>
          <span className="photo-open">
            <Icon name="image" size={13} /> View
          </span>
        </button>

        <div className="sample-body">
          <div className="sample-title">
            <div>
              <small>SAND MATERIAL</small>
              <h3>{sample.material}</h3>
            </div>
            <i className="verified" title="Verified">
              <Icon name="check" size={13} />
            </i>
          </div>

          <div className="stat-strip">
            <div>
              <span>RATE</span>
              <b>
                {formatMoney(sample.rate)}
                <small>/{UNIT}</small>
              </b>
            </div>
            <div>
              <span>PERMIT</span>
              <b>{sample.permitCost !== null ? formatMoney(sample.permitCost) : "—"}</b>
            </div>
            <div>
              <span>AVAILABLE</span>
              <b className={Number(sample.qty) === 0 ? "zero" : ""}>
                {formatQty(sample.qty)}
                <small> {UNIT_PLURAL}</small>
              </b>
            </div>
          </div>

          <div className="validity">
            <div>
              <span>
                <Icon name="clock" size={13} />
                {formatRemaining(sample.remaining)}
              </span>
              <small>{SAMPLE_VALIDITY_DAYS}-DAY VALIDITY</small>
            </div>
            <p>
              <i className={barTone} style={{ width: `${pct}%` }} />
            </p>
          </div>

          <div className="times">
            <div>
              <span>UPLOADED</span>
              <b>{sample.uploaded ? sample.uploaded.replace(" at ", " • ") : "—"}</b>
            </div>
            <div>
              <span>LAST UPDATED</span>
              <b>
                {sample.updated === "Not updated yet" ? sample.updated : sample.updated.replace(" at ", " • ")}
              </b>
            </div>
          </div>

          <div className="views">
            <Icon name="eye" size={13} />
            {sample.views} sample views
          </div>

          <div className="card-actions">
            <button
              type="button"
              className={`act-rate ${sample.rateUpdated ? "locked" : ""}`}
              disabled={sample.rateUpdated}
              title={
                sample.rateUpdated
                  ? `Rate already updated once during this ${SAMPLE_VALIDITY_DAYS}-day sample`
                  : "One rate update is available"
              }
              onClick={() => onOpen("rate", sample)}
            >
              <Icon name="rupee" size={14} />
              {sample.rateUpdated ? "Rate Updated" : "Update Rate"}
            </button>
            <button type="button" className="act-stock" onClick={() => onOpen("stock", sample)}>
              <Icon name="bucket" size={14} />
              Update Qty
            </button>
            <button
              type="button"
              className="act-more"
              aria-label="More actions"
              onClick={() => onOpen("image", sample)}
            >
              <Icon name="chevron" size={15} />
            </button>
          </div>

          {sample.rateUpdated ? (
            <p className="lock-note">
              <Icon name="check" size={12} />
              Rate update used for this {SAMPLE_VALIDITY_DAYS}-day sample
            </p>
          ) : null}
        </div>
      </article>
    </Reveal>
  );
}

/* ============================================================
   UPLOAD SHEET (3 steps: image → details → review)
   ============================================================ */

function UploadSheet({
  step,
  form,
  setForm,
  uploadMode,
  progress,
  created,
  error,
  valid,
  materials,
  loadingMaterials,
  materialsError,
  onReloadMaterials,
  onChooseFile,
  onNext,
  onBack,
  onPublish,
  onFinish,
  onClose,
}) {
  const cameraRef = useRef(null);
  const fileRef = useRef(null);

  if (uploadMode === "progress") {
    return (
      <Sheet onClose={onClose} large title="Publishing Sample" sub="Secure SandRate upload">
        <div className="state-box">
          <span className="state-orb progress">
            <Icon name="upload" size={30} />
          </span>
          <h3>
            {progress < 25
              ? "Preparing image..."
              : progress < 55
                ? "Uploading sand image..."
                : progress < 80
                  ? "Saving sample details..."
                  : "Publishing sample..."}
          </h3>
          <p>Your current sand inventory is being securely published.</p>
          <div className="bar">
            <i style={{ width: `${progress}%` }} />
          </div>
          <b>{progress}%</b>
        </div>
      </Sheet>
    );
  }

  if (uploadMode === "success" && created) {
    return (
      <Sheet onClose={onClose} large title="Upload Complete">
        <div className="state-box">
          <span className="state-orb success">
            <Icon name="check" size={32} />
          </span>
          <h3>Sample Uploaded Successfully</h3>
          <p>Your sand sample is now visible to buyers and remains active for {SAMPLE_VALIDITY_DAYS} days.</p>
          <div className="summary-grid">
            <label>
              Sample ID<b>{created.sampleCode || created.id}</b>
            </label>
            <label>
              Material<b>{created.material}</b>
            </label>
            <label>
              Uploaded<b>{created.uploadedAt}</b>
            </label>
            <label>
              Expires<b>{created.expiresAt}</b>
            </label>
          </div>
          <div className="state-actions">
            <button type="button" className="btn ghost" onClick={() => onFinish(false)}>
              Upload Another
            </button>
            <button type="button" className="btn primary" onClick={() => onFinish(true)}>
              View in My Samples
            </button>
          </div>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet
      onClose={onClose}
      large
      title="Upload Sand Sample"
      sub={`Step ${step} of 3`}
      footer={
        <>
          <button type="button" className="btn ghost" onClick={onBack}>
            {step === 1 ? "Cancel" : "Back"}
          </button>
          <button
            type="button"
            className="btn primary"
            disabled={step === 3 && !valid}
            onClick={step === 3 ? onPublish : onNext}
          >
            {step === 3 ? "Upload Sample" : "Continue"}
            <Icon name={step === 3 ? "upload" : "arrow"} size={14} />
          </button>
        </>
      }
    >
      <div className="steps" aria-label={`Step ${step} of 3`}>
        {[1, 2, 3].map((n) => (
          <React.Fragment key={n}>
            <span className={n <= step ? "on" : ""}>{n < step ? <Icon name="check" size={12} /> : n}</span>
            {n < 3 ? <i className={n < step ? "on" : ""} /> : null}
          </React.Fragment>
        ))}
      </div>
      <div className="step-labels">
        <small className={step === 1 ? "on" : ""}>Image</small>
        <small className={step === 2 ? "on" : ""}>Details</small>
        <small className={step === 3 ? "on" : ""}>Review</small>
      </div>

      {step === 1 ? (
        <div className="step-pane">
          <h3>Add a sand image</h3>
          <p className="lead">Take or upload a clear photo of the sand currently available.</p>

          {!form.image ? (
            <div className="drop">
              <span className="drop-icon">
                <Icon name="camera" size={28} />
              </span>
              <b>Current sand photo</b>
              <small>JPG, PNG or WEBP • Maximum 15 MB</small>
              <div className="drop-actions">
                <button type="button" className="btn primary" onClick={() => cameraRef.current?.click()}>
                  <Icon name="camera" size={14} /> Take Photo
                </button>
                <button type="button" className="btn ghost" onClick={() => fileRef.current?.click()}>
                  <Icon name="image" size={14} /> Choose Gallery
                </button>
              </div>
              <input
                hidden
                ref={cameraRef}
                type="file"
                capture="environment"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => onChooseFile(event.target.files?.[0])}
              />
              <input
                hidden
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => onChooseFile(event.target.files?.[0])}
              />
            </div>
          ) : (
            <div className="preview">
              <div className="preview-photo" style={{ backgroundImage: `url("${form.imageUrl}")` }}>
                <span className="photo-scan" aria-hidden="true" />
              </div>
              <div className="preview-meta">
                <div>
                  <b>{form.imageName}</b>
                  <small>{form.imageSize}</small>
                </div>
                <button
                  type="button"
                  className="btn ghost small"
                  onClick={() =>
                    setForm((f) => ({ ...f, image: null, imageUrl: "", imageName: "", imageSize: "" }))
                  }
                >
                  <Icon name="trash" size={13} /> Remove
                </button>
              </div>
            </div>
          )}

          <div className="info">
            Use daylight, keep the sand in focus, avoid shadows, and do not overlay text or logos.
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="step-pane">
          <h3>Sample details</h3>
          <p className="lead">Select the sand material, then enter rate, permit rate and available buckets.</p>

          <Field label="Material">
            <MaterialSelect
              value={form.material}
              onChange={(value) => setForm((f) => ({ ...f, material: value }))}
              materials={materials}
              loading={loadingMaterials}
              error={materialsError}
              onRetry={onReloadMaterials}
            />
          </Field>

          <Field label={`Rate per ${UNIT}`}>
            <Affix prefix="₹" suffix={`/ ${UNIT}`}>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="0"
                value={form.rate}
                onChange={(event) => setForm((f) => ({ ...f, rate: event.target.value }))}
              />
            </Affix>
          </Field>

          <Field label="Permit rate" hint="Applicable government / royalty permit cost per bucket.">
            <Affix prefix="₹" suffix={`/ ${UNIT}`}>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="0"
                value={form.permitCost}
                onChange={(event) => setForm((f) => ({ ...f, permitCost: event.target.value }))}
              />
            </Affix>
          </Field>

          <Field label="Available quantity">
            <Affix suffix={UNIT_PLURAL}>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                placeholder="0"
                value={form.qty}
                onChange={(event) => setForm((f) => ({ ...f, qty: event.target.value }))}
              />
            </Affix>
          </Field>

          <div className="info">
            This sample remains active for {SAMPLE_VALIDITY_DAYS} days ({SAMPLE_VALIDITY_HOURS} hours) after upload.
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="step-pane">
          <h3>Review sample</h3>
          <p className="lead">Confirm the information before publishing.</p>

          <div className="review">
            <div className="review-photo" style={{ backgroundImage: `url("${form.imageUrl}")` }}>
              <span className="photo-scan" aria-hidden="true" />
              <span className="review-tag">{form.material || "Sand"}</span>
            </div>
            <div className="review-grid">
              <label>
                Rate
                <b>
                  {formatMoney(form.rate)} / {UNIT}
                </b>
              </label>
              <label>
                Permit rate
                <b>
                  {formatMoney(form.permitCost)} / {UNIT}
                </b>
              </label>
              <label>
                Quantity
                <b>
                  {formatQty(form.qty)} {UNIT_PLURAL}
                </b>
              </label>
              <label>
                Validity<b>{SAMPLE_VALIDITY_DAYS} days</b>
              </label>
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="error">
          <Icon name="alert" size={13} />
          {error}
        </p>
      ) : null}
    </Sheet>
  );
}

/* ============================================================
   EDIT / VIEW SHEETS
   ============================================================ */

function EditSheet({
  sheet,
  selected,
  value,
  setValue,
  material,
  setMaterial,
  error,
  materials,
  loadingMaterials,
  materialsError,
  onReloadMaterials,
  onOpen,
  onSave,
  onRemove,
  onClose,
}) {
  if (!selected) return null;

  if (sheet === "image") {
    return (
      <Sheet onClose={onClose} large title={selected.material} sub={`Sample ID: ${selected.sampleCode || selected.id}`}>
        <div className="viewer">
          <div className="viewer-photo">
            {selected.imageUrl ? (
              <img src={selected.imageUrl} alt={`${selected.material} full uploaded preview`} />
            ) : (
              <span className="viewer-empty">
                <Icon name="grains" size={34} />
              </span>
            )}
          </div>
          <div className="viewer-meta">
            <span>
              <b>{selected.material}</b>
              <small>
                {formatQty(selected.qty)} {UNIT_PLURAL} available · {formatRemaining(selected.remaining)}
              </small>
            </span>
            <strong>
              {formatMoney(selected.rate)}
              <small>/{UNIT}</small>
            </strong>
          </div>
          <div className="viewer-actions">
            <button type="button" onClick={() => onOpen("edit", selected)}>
              <span className="cyan">
                <Icon name="edit" size={16} />
              </span>
              Edit Details
            </button>
            <button type="button" onClick={() => onOpen("permit", selected)}>
              <span className="violet">
                <Icon name="rupee" size={16} />
              </span>
              Permit Rate
            </button>
            <button type="button" className="danger" onClick={() => onOpen("delete", selected)}>
              <span className="red">
                <Icon name="trash" size={16} />
              </span>
              Delete Sample
            </button>
          </div>
        </div>
      </Sheet>
    );
  }

  if (sheet === "delete") {
    return (
      <Sheet
        onClose={onClose}
        title="Delete this sample?"
        sub="This action cannot be undone"
        footer={
          <>
            <button type="button" className="btn ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn danger" onClick={onRemove}>
              <Icon name="trash" size={14} /> Delete Sample
            </button>
          </>
        }
      >
        <div className="delete-box">
          <span>
            <Icon name="trash" size={24} />
          </span>
          <p>The sand sample will be permanently removed. Previous order records will not be affected.</p>
          <b>{selected.material}</b>
        </div>
      </Sheet>
    );
  }

  if (sheet === "edit") {
    return (
      <Sheet
        onClose={onClose}
        title="Edit Material Details"
        sub={selected.sampleCode || selected.id}
        footer={
          <>
            <button type="button" className="btn ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn primary" onClick={onSave}>
              Save Details
            </button>
          </>
        }
      >
        <Field label="Material">
          <MaterialSelect
            value={material}
            onChange={setMaterial}
            materials={materials}
            loading={loadingMaterials}
            error={materialsError}
            onRetry={onReloadMaterials}
            allowExisting
          />
        </Field>
        <Field label={`Permit rate per ${UNIT}`}>
          <Affix prefix="₹" suffix={`/ ${UNIT}`}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </Affix>
        </Field>
        <div className="info">Original upload and expiry time stay unchanged.</div>
        {error ? (
          <p className="error">
            <Icon name="alert" size={13} />
            {error}
          </p>
        ) : null}
      </Sheet>
    );
  }

  let title = "";
  let label = "";
  let current = "";
  if (sheet === "rate") {
    title = "Update Rate";
    label = `New rate per ${UNIT}`;
    current = `${formatMoney(selected.rate)} / ${UNIT}`;
  }
  if (sheet === "stock") {
    title = "Update Quantity";
    label = "Available quantity";
    current = `${formatQty(selected.qty)} ${UNIT_PLURAL}`;
  }
  if (sheet === "permit") {
    title = "Update Permit Rate";
    label = `New permit rate per ${UNIT}`;
    current = selected.permitCost !== null ? `${formatMoney(selected.permitCost)} / ${UNIT}` : "Not entered";
  }

  return (
    <Sheet
      onClose={onClose}
      title={title}
      sub={selected.material}
      footer={
        <>
          <button type="button" className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn primary" onClick={onSave}>
            {title}
          </button>
        </>
      }
    >
      <div className="current">
        <span>CURRENT VALUE</span>
        <b>{current}</b>
      </div>
      <Field label={label}>
        <Affix
          prefix={sheet === "stock" ? null : "₹"}
          suffix={sheet === "stock" ? UNIT_PLURAL : `/ ${UNIT}`}
        >
          <input
            type="number"
            inputMode={sheet === "stock" ? "numeric" : "decimal"}
            min="0"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </Affix>
      </Field>
      <div className="info">
        {sheet === "rate"
          ? `Rate can be updated only once during the ${SAMPLE_VALIDITY_DAYS}-day sample validity. This does not restart the validity.`
          : `Updating this does not restart the ${SAMPLE_VALIDITY_DAYS}-day validity.`}
      </div>
      {error ? (
        <p className="error">
          <Icon name="alert" size={13} />
          {error}
        </p>
      ) : null}
    </Sheet>
  );
}

/* ============================================================
   BOTTOM NAV (identical to SellerHomePage)
   ============================================================ */

function BottomNavigation({ activeTab, onTabChange }) {
  return (
    <nav className="bottom-nav" aria-label="Seller navigation">
      {NAV_TABS.map((tab) => (
        <button
          type="button"
          key={tab.id}
          className={activeTab === tab.id ? "active" : ""}
          onClick={() => onTabChange?.(tab.id)}
        >
          <span>
            <Icon name={tab.icon} size={19} />
          </span>
          <small>{tab.label}</small>
        </button>
      ))}
    </nav>
  );
}

/* ============================================================
   PAGE
   ============================================================ */

export default function SandSellerMySamplePage({
  sellerName = "Venkateshwara Sands",
  openUploadOnLoad = false,
  onUploadOpened = () => {},
  onNavigate = (target) => console.log(target),
}) {
  const [samples, setSamples] = useState([]);
  const [loadingSamples, setLoadingSamples] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [materialsError, setMaterialsError] = useState("");

  const [sheet, setSheet] = useState(null);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [notificationCount] = useState(3);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(BLANK_FORM);
  const [uploadMode, setUploadMode] = useState("form");
  const [progress, setProgress] = useState(0);
  const [created, setCreated] = useState(null);

  const [value, setValue] = useState("");
  const [material, setMaterial] = useState("");
  const [error, setError] = useState("");

  const toastRef = useRef(null);
  const progressRef = useRef(null);

  const currentSeller = useMemo(() => readCurrentSeller(), []);
  const sellerPublicId = currentSeller?.publicId || "";

  /* ---------- notifications ---------- */
  const notify = useCallback((message, type = "success") => {
    clearTimeout(toastRef.current);
    setToast({ message, type });
    toastRef.current = setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => () => {
    clearTimeout(toastRef.current);
    clearInterval(progressRef.current);
  }, []);

  /* ---------- data loading ---------- */
  const loadMaterials = useCallback(async () => {
    try {
      setLoadingMaterials(true);
      setMaterialsError("");
      const result = await getActiveMaterials();
      const names = (Array.isArray(result?.materials) ? result.materials : [])
        .map((item) => String(item.name || "").trim())
        .filter(Boolean);
      setMaterials(names);
    } catch (loadError) {
      const message = loadError.message || "Unable to load materials";
      setMaterialsError(message);
      notify(message, "error");
    } finally {
      setLoadingMaterials(false);
    }
  }, [notify]);

  const loadSamples = useCallback(
    async ({ showLoading = false } = {}) => {
      if (!sellerPublicId) {
        setSamples([]);
        setLoadingSamples(false);
        return;
      }
      try {
        if (showLoading) setLoadingSamples(true);
        const result = await getSellerSamples(sellerPublicId);
        const fresh = (result.samples || []).map(mapApiSample);
        setSamples(fresh);
        setSelected((current) => (current ? fresh.find((item) => item.id === current.id) || current : current));
      } catch (loadError) {
        notify(loadError.message || "Unable to load your sand samples", "error");
      } finally {
        if (showLoading) setLoadingSamples(false);
      }
    },
    [sellerPublicId, notify]
  );

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  useEffect(() => {
    loadSamples({ showLoading: true });
  }, [loadSamples]);

  useEffect(() => {
    if (!sellerPublicId) return undefined;
    const timer = window.setInterval(() => loadSamples({ showLoading: false }), REFRESH_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [sellerPublicId, loadSamples]);

  /* Drop samples locally the minute they expire. */
  useEffect(() => {
    const timer = window.setInterval(() => {
      setSamples((current) =>
        current.filter((item) => !item.expiresAt || new Date(item.expiresAt).getTime() > Date.now())
      );
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  /* ---------- derived ---------- */
  const sorted = useMemo(() => {
    const priority = { expiring: 0, out: 1, active: 2 };
    return [...samples]
      .filter((s) => s.remaining > 0)
      .sort((a, b) => priority[sampleStatus(a)] - priority[sampleStatus(b)]);
  }, [samples]);

  const metric = useMemo(
    () => ({
      total: samples.length,
      active: samples.filter((s) => sampleStatus(s) === "active").length,
      expiring: samples.filter((s) => sampleStatus(s) === "expiring").length,
      out: samples.filter((s) => sampleStatus(s) === "out").length,
    }),
    [samples]
  );

  const valid = !!(
    form.image &&
    form.material &&
    Number(form.rate) > 0 &&
    form.permitCost !== "" &&
    Number(form.permitCost) >= 0 &&
    form.qty !== "" &&
    Number(form.qty) >= 0
  );

  /* ---------- sheet control ---------- */
  const resetUpload = useCallback(() => {
    clearInterval(progressRef.current);
    setForm(BLANK_FORM);
    setStep(1);
    setUploadMode("form");
    setProgress(0);
    setCreated(null);
    setError("");
  }, []);

  const open = useCallback(
    (type, sample = null) => {
      if (type === "rate" && sample?.rateUpdated) {
        notify(`Rate can be updated only once during the ${SAMPLE_VALIDITY_DAYS}-day sample validity.`, "error");
        return;
      }
      setSelected(sample);
      setError("");
      if (type === "rate") setValue(String(sample.rate));
      if (type === "stock") setValue(String(sample.qty));
      if (type === "permit") setValue(sample.permitCost === null ? "" : String(sample.permitCost));
      if (type === "edit") {
        setMaterial(sample.material);
        setValue(sample.permitCost === null ? "" : String(sample.permitCost));
      }
      if (type === "upload") resetUpload();
      setSheet(type);
    },
    [notify, resetUpload]
  );

  const close = useCallback(() => {
    if (sheet === "upload" && uploadMode === "progress") return;
    setSheet(null);
    setSelected(null);
    setError("");
  }, [sheet, uploadMode]);

  useEffect(() => {
    if (!openUploadOnLoad) return;
    resetUpload();
    setSheet("upload");
    onUploadOpened();
  }, [openUploadOnLoad, onUploadOpened, resetUpload]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  /* ---------- upload flow ---------- */
  const chooseFile = useCallback(
    (file) => {
      if (!file) return;
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES) {
        notify("Use JPG, PNG or WEBP up to 15 MB", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setForm((f) => ({
          ...f,
          image: file,
          imageUrl: String(reader.result || ""),
          imageName: file.name,
          imageSize: `${(file.size / 1048576).toFixed(2)} MB`,
        }));
        setError("");
      };
      reader.onerror = () => notify("Unable to read the selected image", "error");
      reader.readAsDataURL(file);
    },
    [notify]
  );

  const next = useCallback(() => {
    if (step === 1 && !form.image) {
      setError("Take or select a clear sand image to continue.");
      return;
    }
    if (step === 2) {
      if (!form.material) return setError("Select the sand material.");
      if (!(Number(form.rate) > 0)) return setError("Rate per bucket must be greater than zero.");
      if (form.permitCost === "" || Number(form.permitCost) < 0) return setError("Enter a valid permit rate (0 or more).");
      if (form.qty === "" || Number(form.qty) < 0) return setError("Enter the available quantity in buckets.");
    }
    setError("");
    setStep((s) => Math.min(3, s + 1));
    return undefined;
  }, [step, form]);

  const back = useCallback(() => {
    setError("");
    if (step === 1) close();
    else setStep((s) => Math.max(1, s - 1));
  }, [step, close]);

  const publishSample = useCallback(async () => {
    if (!valid || uploadMode === "progress") return;
    if (!sellerPublicId) {
      setError("Seller session not found. Please sign in again.");
      return;
    }
    setUploadMode("progress");
    setProgress(12);
    setError("");

    clearInterval(progressRef.current);
    progressRef.current = window.setInterval(() => {
      setProgress((p) => (p < 88 ? p + 4 : p));
    }, 220);

    try {
      const result = await createSellerSample({
        sellerPublicId,
        imageFile: form.image,
        materialName: form.material,
        category: form.material,
        rate: form.rate,
        rateUnit: UNIT,
        permitCost: form.permitCost,
        availableQuantity: form.qty,
        quantityUnit: UNIT,
        validityHours: SAMPLE_VALIDITY_HOURS,
        imageZoom: form.imageZoom,
        imagePositionX: form.imagePositionX,
        imagePositionY: form.imagePositionY,
      });
      clearInterval(progressRef.current);
      setProgress(100);
      const mapped = mapApiSample(result.sample);
      setCreated({
        ...mapped,
        uploadedAt: formatDate(result.sample.uploadedAt),
        expiresAt: formatDate(result.sample.expiresAt),
      });
      setSamples((current) => [mapped, ...current.filter((item) => item.id !== mapped.id)]);
      setUploadMode("success");
      notify("Sand sample uploaded successfully");
    } catch (uploadError) {
      clearInterval(progressRef.current);
      setUploadMode("form");
      setProgress(0);
      const message = uploadError.message || "Unable to upload sample";
      setError(message);
      notify(message, "error");
    }
  }, [valid, uploadMode, sellerPublicId, form, notify]);

  const finish = useCallback(
    (closeAfter) => {
      if (closeAfter) {
        setSheet(null);
        setCreated(null);
      } else {
        resetUpload();
      }
    },
    [resetUpload]
  );

  /* ---------- edit flows ---------- */
  const save = useCallback(async () => {
    if (!selected || !sellerPublicId) return;
    try {
      let result;
      if (sheet === "rate") {
        if (selected.rateUpdated) {
          setError(`Rate has already been updated once for this ${SAMPLE_VALIDITY_DAYS}-day sample.`);
          return;
        }
        if (!(Number(value) > 0)) {
          setError("Rate must be greater than zero.");
          return;
        }
        result = await updateSellerSampleRate(selected.id, sellerPublicId, Number(value));
      } else if (sheet === "stock") {
        if (value === "" || Number(value) < 0) {
          setError("Quantity cannot be negative.");
          return;
        }
        result = await updateSellerSampleQuantity(selected.id, sellerPublicId, Number(value), UNIT);
      } else if (sheet === "permit" || sheet === "edit") {
        const nextMaterial = sheet === "edit" ? material : selected.material;
        if (!nextMaterial) {
          setError("Material is required.");
          return;
        }
        if (value === "" || Number(value) < 0) {
          setError("Permit rate is required and cannot be negative.");
          return;
        }
        result = await updateSellerSampleDetails(selected.id, sellerPublicId, {
          materialName: nextMaterial,
          category: nextMaterial,
          permitCost: Number(value),
          unit: UNIT,
        });
      }
      if (result?.sample) {
        const mapped = mapApiSample(result.sample);
        setSamples((current) => current.map((item) => (item.id === mapped.id ? mapped : item)));
        notify(result.message || "Sample updated successfully");
      }
      setSheet(null);
      setSelected(null);
    } catch (saveError) {
      const message = saveError.message || "Unable to update sample";
      setError(message);
      notify(message, "error");
    }
  }, [selected, sellerPublicId, sheet, value, material, notify]);

  const remove = useCallback(async () => {
    if (!selected || !sellerPublicId) return;
    try {
      await deleteSellerSample(selected.id, sellerPublicId);
      setSamples((current) => current.filter((item) => item.id !== selected.id));
      setSheet(null);
      setSelected(null);
      notify("Sample deleted successfully");
    } catch (deleteError) {
      notify(deleteError.message || "Unable to delete sample", "error");
    }
  }, [selected, sellerPublicId, notify]);

  /* ---------- misc ---------- */
  const handleScroll = (event) => {
    const nextScrolled = event.currentTarget.scrollTop > 8;
    setScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled));
  };

  const navigate = (target) => {
    onNavigate?.(target);
  };

  /* ---------- render ---------- */
  return (
    <div className="seller-app">
      <style>{CSS}</style>
      <main className="seller-phone">
        <div className="aurora" aria-hidden="true">
          <i className="aurora-one" />
          <i className="aurora-two" />
          <i className="aurora-three" />
        </div>
        <div className="grid-floor" aria-hidden="true" />
        <div className="noise" aria-hidden="true" />

        <header className={`seller-header ${scrolled ? "condensed" : ""}`}>
          <button type="button" className="header-icon" aria-label="Open menu">
            <Icon name="menu" size={20} />
          </button>

          <div className="seller-identity">
            <span>SAND SELLER INVENTORY</span>
            <b>My Samples</b>
            <small>Upload sand, set rate per bucket, permit rate &amp; buckets available</small>
          </div>

          <button type="button" className="header-icon notification" aria-label="Notifications">
            <Icon name="bell" size={19} />
            {notificationCount > 0 ? <b>{notificationCount}</b> : null}
          </button>
        </header>

        <div className="seller-scroll" onScroll={handleScroll}>
          <div className="seller-content">
            {/* ---- overview ---- */}
            <section className="section-block">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">SAMPLE OVERVIEW</span>
                  <h2>Inventory pulse</h2>
                </div>
                <span className="live-pill">
                  <i /> Live
                </span>
              </div>
              <div className="metric-grid">
                <MetricCard icon="box" value={metric.total} label="Total Samples" tone="violet" index={0} />
                <MetricCard icon="check" value={metric.active} label="Active" tone="green" index={1} />
                <MetricCard icon="clock" value={metric.expiring} label="Expiring Soon" tone="orange" index={2} />
                <MetricCard icon="alert" value={metric.out} label="Out of Stock" tone="red" index={3} />
              </div>
            </section>

            {/* ---- upload CTA ---- */}
            <Reveal>
              <button type="button" className="upload-cta" onClick={() => open("upload")}>
                <span className="card-edge" aria-hidden="true" />
                <span className="cta-mesh" aria-hidden="true" />
                <span className="scan-line" aria-hidden="true" />
                <span className="cta-icon">
                  <Icon name="upload" size={22} />
                </span>
                <span className="cta-copy">
                  <small>FAST PUBLISH</small>
                  <b>Upload New Sand Sample</b>
                  <em>Photo → material → rate / bucket → permit rate → buckets available</em>
                  <strong>
                    UPLOAD SAMPLE <Icon name="arrow" size={13} />
                  </strong>
                </span>
              </button>
            </Reveal>

            {/* ---- list ---- */}
            <section className="section-block last-section">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">UPLOADED SAMPLES</span>
                  <h2>Your sand inventory</h2>
                </div>
                <span className="chip-3d">
                  <Icon name="grains" size={12} /> {samples.length} {samples.length === 1 ? "sample" : "samples"}
                </span>
              </div>

              {loadingSamples ? (
                <div className="empty">
                  <span className="empty-icon">
                    <Icon name="clock" size={30} />
                  </span>
                  <h3>Loading samples</h3>
                  <p>Fetching your active {SAMPLE_VALIDITY_DAYS}-day sand inventory...</p>
                </div>
              ) : sorted.length ? (
                <div className="sample-stack">
                  {sorted.map((sample, index) => (
                    <SampleCard key={sample.id} sample={sample} onOpen={open} index={index} />
                  ))}
                </div>
              ) : (
                <div className="empty">
                  <span className="empty-icon">
                    <Icon name="samples" size={30} />
                  </span>
                  <h3>No samples uploaded</h3>
                  <p>
                    Take a photo of your sand, choose the material, enter rate per bucket, permit rate and available
                    buckets. Each sample stays active for {SAMPLE_VALIDITY_DAYS} days.
                  </p>
                  <button type="button" className="btn primary" onClick={() => open("upload")}>
                    <Icon name="upload" size={14} /> Upload First Sample
                  </button>
                </div>
              )}
            </section>

            <div className="signature">
              {sellerName}
              <small>SANDRATE SELLER NETWORK</small>
            </div>
          </div>
        </div>

        {toast ? (
          <div className={`toast ${toast.type}`} role="status">
            <Icon name={toast.type === "error" ? "alert" : "check"} size={15} />
            {toast.message}
          </div>
        ) : null}

        <BottomNavigation activeTab="mySamples" onTabChange={navigate} />

        {sheet === "upload" ? (
          <UploadSheet
            step={step}
            form={form}
            setForm={setForm}
            uploadMode={uploadMode}
            progress={progress}
            created={created}
            error={error}
            valid={valid}
            materials={materials}
            loadingMaterials={loadingMaterials}
            materialsError={materialsError}
            onReloadMaterials={loadMaterials}
            onChooseFile={chooseFile}
            onNext={next}
            onBack={back}
            onPublish={publishSample}
            onFinish={finish}
            onClose={close}
          />
        ) : null}

        {sheet && sheet !== "upload" ? (
          <EditSheet
            sheet={sheet}
            selected={selected}
            value={value}
            setValue={setValue}
            material={material}
            setMaterial={setMaterial}
            error={error}
            materials={materials}
            loadingMaterials={loadingMaterials}
            materialsError={materialsError}
            onReloadMaterials={loadMaterials}
            onOpen={open}
            onSave={save}
            onRemove={remove}
            onClose={close}
          />
        ) : null}
      </main>
    </div>
  );
}

/* ============================================================
   STYLES — OBSIDIAN NEON (shell shared with SellerHomePage)
   ============================================================ */

const CSS_CORE = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body,#root{margin:0;width:100%;min-height:100%;
  font-family:"Space Grotesk",Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}

.seller-app{
  --bg-0:#05070f;--bg-1:#080b17;--bg-2:#0c1120;
  --ink:#eaf1ff;--muted:#8b9ac0;--dim:#63719a;
  --line:rgba(140,170,255,.14);--line-hi:rgba(140,170,255,.28);
  --cyan:#22d3ee;--violet:#8b5cf6;--orange:#fb923c;--amber:#fbbf24;
  --green:#34d399;--blue:#60a5fa;--purple:#a78bfa;--red:#fb7185;--sand:#f5c26b;
  --card:rgba(16,22,40,.72);--glass:rgba(20,27,48,.6);
  --shadow-sm:0 2px 10px rgba(0,0,0,.45);
  --shadow-md:0 14px 34px rgba(0,0,0,.55);
  --shadow-lg:0 30px 70px rgba(0,0,0,.65);
  --glow-cyan:0 0 26px rgba(34,211,238,.35);
  --glow-violet:0 0 26px rgba(139,92,246,.35);
  width:100%;height:100dvh;display:flex;align-items:center;justify-content:center;
  overflow:hidden;color:var(--ink);
  background:
    radial-gradient(900px 520px at 50% -12%,rgba(34,211,238,.12),transparent 70%),
    radial-gradient(700px 480px at 90% 110%,rgba(139,92,246,.14),transparent 70%),
    #03050c}
.seller-app button,.seller-app input,.seller-app select{font:inherit}
.seller-app ::selection{background:rgba(34,211,238,.3);color:#fff}

.seller-phone{position:relative;width:min(100%,430px);height:100dvh;overflow:hidden;
  color:var(--ink);isolation:isolate;
  background:
    radial-gradient(620px 320px at 12% 0%,rgba(34,211,238,.14),transparent 66%),
    radial-gradient(560px 340px at 100% 32%,rgba(139,92,246,.16),transparent 68%),
    linear-gradient(180deg,#070a14,#05070f 55%,#04060d)}

/* ---------- ambient layers ---------- */
.aurora{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.aurora i{position:absolute;display:block;border-radius:50%;filter:blur(56px);opacity:.55}
.aurora-one{width:300px;height:300px;top:-100px;left:-80px;
  background:radial-gradient(circle,rgba(34,211,238,.42),transparent 68%);
  animation:auroraA 18s ease-in-out infinite}
.aurora-two{width:340px;height:340px;top:32%;right:-130px;
  background:radial-gradient(circle,rgba(139,92,246,.38),transparent 68%);
  animation:auroraB 22s ease-in-out infinite}
.aurora-three{width:280px;height:280px;bottom:-90px;left:-70px;
  background:radial-gradient(circle,rgba(251,146,60,.28),transparent 68%);
  animation:auroraA 26s ease-in-out infinite reverse}
.grid-floor{position:absolute;inset:0;z-index:0;pointer-events:none;opacity:.5;
  background-image:linear-gradient(rgba(120,170,255,.09) 1px,transparent 1px),
    linear-gradient(90deg,rgba(120,170,255,.09) 1px,transparent 1px);
  background-size:34px 34px;
  -webkit-mask-image:radial-gradient(circle at 50% 22%,#000,transparent 78%);
  mask-image:radial-gradient(circle at 50% 22%,#000,transparent 78%)}
.noise{position:absolute;inset:0;z-index:1;pointer-events:none;opacity:.05;mix-blend-mode:overlay;
  background-image:radial-gradient(rgba(255,255,255,.6) .5px,transparent .5px);
  background-size:3px 3px}

/* ---------- header ---------- */
.seller-header{position:absolute;z-index:40;top:0;left:0;right:0;height:90px;
  display:grid;grid-template-columns:40px minmax(0,1fr) 40px;align-items:start;gap:10px;
  padding:14px 15px 10px;border-bottom:1px solid var(--line);
  background:linear-gradient(180deg,rgba(8,12,24,.88),rgba(8,12,24,.55));
  backdrop-filter:blur(22px) saturate(160%);
  -webkit-backdrop-filter:blur(22px) saturate(160%);
  transition:box-shadow .3s,background .3s}
.seller-header.condensed{background:linear-gradient(180deg,rgba(6,9,19,.96),rgba(6,9,19,.82));
  box-shadow:0 14px 34px rgba(0,0,0,.55)}
.seller-header::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:1px;
  background:linear-gradient(90deg,transparent,rgba(34,211,238,.85),rgba(139,92,246,.75),transparent);
  opacity:.9;animation:lineSlide 6s ease-in-out infinite}
.header-icon{position:relative;width:38px;height:38px;display:grid;place-items:center;
  border:1px solid var(--line-hi);border-radius:13px;color:#cfe0ff;cursor:pointer;
  background:linear-gradient(160deg,rgba(30,41,70,.9),rgba(14,20,38,.9));
  box-shadow:var(--shadow-sm),inset 0 1px 0 rgba(255,255,255,.06);
  transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s,border-color .22s}
.header-icon:hover{transform:translateY(-2px) scale(1.04);border-color:rgba(34,211,238,.55);
  box-shadow:var(--shadow-md),var(--glow-cyan)}
.header-icon:active{transform:scale(.94)}
.header-icon.notification b{position:absolute;top:-5px;right:-5px;min-width:17px;height:17px;
  display:grid;place-items:center;padding:0 4px;border-radius:999px;border:2px solid #070a14;
  background:linear-gradient(135deg,#fb7185,#f43f5e);color:#fff;font-size:9px;font-weight:800;
  box-shadow:0 3px 12px rgba(244,63,94,.6);animation:badgePop 2.6s ease-in-out infinite}
.seller-identity{min-width:0;padding-top:1px}
.seller-identity>span{display:block;color:#5f7099;font-size:8px;font-weight:900;letter-spacing:.16em}
.seller-identity>b{display:block;margin-top:3px;overflow:hidden;font-size:17px;color:#f2f7ff;
  font-weight:850;text-overflow:ellipsis;white-space:nowrap;letter-spacing:-.02em}
.seller-identity>small{display:block;margin-top:4px;overflow:hidden;color:var(--muted);
  font-size:9.5px;text-overflow:ellipsis;white-space:nowrap}

/* ---------- scroll shell ---------- */
.seller-scroll{position:absolute;z-index:10;top:90px;bottom:66px;left:0;right:0;
  overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;scroll-behavior:smooth}
.seller-scroll::-webkit-scrollbar{width:0}
.seller-content{display:flex;flex-direction:column;gap:18px;padding:14px 15px 26px}

/* ---------- reveal ---------- */
.reveal{opacity:0;transform:translateY(14px) scale(.985);
  transition:opacity .5s cubic-bezier(.22,1,.36,1),transform .5s cubic-bezier(.22,1,.36,1)}
.reveal.in{opacity:1;transform:none}

.card-edge{position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;z-index:3;
  background:linear-gradient(150deg,rgba(34,211,238,.55),transparent 42%,transparent 62%,rgba(139,92,246,.5));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;opacity:.55;transition:opacity .35s}

/* ---------- section shell ---------- */
.section-block{display:flex;flex-direction:column;gap:12px}
.section-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:10px}
.section-heading h2{margin:0;font-size:15.5px;font-weight:850;letter-spacing:-.03em;color:#eef4ff}
.section-kicker{display:block;margin-bottom:3px;color:#5f7099;font-size:8px;font-weight:900;
  letter-spacing:.16em}
.chip-3d{display:inline-flex;align-items:center;gap:4px;padding:4px 9px;border-radius:999px;
  border:1px solid rgba(139,92,246,.45);background:rgba(139,92,246,.13);color:#c4b5fd;
  font-size:9px;font-weight:900;letter-spacing:.06em;box-shadow:0 0 16px rgba(139,92,246,.22)}
.live-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;
  border:1px solid rgba(52,211,153,.4);background:rgba(52,211,153,.12);color:#6ee7b7;
  font-size:9px;font-weight:850}
.live-pill i{width:6px;height:6px;border-radius:50%;background:#34d399;
  box-shadow:0 0 10px #34d399;animation:livePulse 1.9s ease-in-out infinite}
.last-section{padding-bottom:4px}

/* ---------- buttons ---------- */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:40px;padding:0 15px;
  border-radius:13px;font-size:11.5px;font-weight:850;cursor:pointer;
  transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s,filter .22s,opacity .2s}
.btn:active{transform:scale(.97)}
.btn:disabled{opacity:.45;cursor:not-allowed;transform:none;filter:none}
.btn.small{height:32px;padding:0 11px;font-size:10px;border-radius:10px}
.btn.primary{position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.16);
  background:linear-gradient(120deg,#22d3ee,#3b82f6 52%,#8b5cf6);color:#04121c;
  box-shadow:0 12px 26px rgba(34,211,238,.24),0 0 20px rgba(139,92,246,.2)}
.btn.primary::after{content:"";position:absolute;top:0;left:-140%;width:60%;height:100%;
  transform:skewX(-22deg);
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);
  animation:shimmer 3.4s ease-in-out infinite}
.btn.primary:hover:not(:disabled){transform:translateY(-1px);
  box-shadow:0 16px 34px rgba(34,211,238,.32),0 0 28px rgba(139,92,246,.28)}
.btn.ghost{border:1px solid var(--line-hi);background:rgba(18,25,45,.85);color:#c6d4f5;
  box-shadow:var(--shadow-sm)}
.btn.ghost:hover{border-color:rgba(34,211,238,.5);color:#67e8f9;box-shadow:var(--glow-cyan)}
.btn.danger{border:1px solid rgba(251,113,133,.5);background:linear-gradient(135deg,#fb7185,#f43f5e);
  color:#fff;box-shadow:0 10px 24px rgba(244,63,94,.35)}
.btn.danger:hover{filter:brightness(1.08)}
`;

const CSS_SECTIONS = `
/* ---------- overview metrics ---------- */
.metric-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.metric-grid>.reveal{height:100%}
.metric-card{position:relative;overflow:hidden;height:100%;padding:11px 8px 10px;
  display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;
  border:1px solid var(--line);border-radius:16px;
  background:linear-gradient(160deg,rgba(22,30,53,.92),rgba(11,16,31,.92));
  box-shadow:var(--shadow-sm),inset 0 1px 0 rgba(255,255,255,.05);
  transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .25s,border-color .25s}
.metric-card:hover{transform:translateY(-3px);border-color:var(--mt);box-shadow:var(--shadow-md),0 0 22px var(--mt-soft)}
.metric-card.violet{--mt:#a78bfa;--mt-soft:rgba(167,139,250,.22)}
.metric-card.green{--mt:#34d399;--mt-soft:rgba(52,211,153,.22)}
.metric-card.orange{--mt:#fb923c;--mt-soft:rgba(251,146,60,.22)}
.metric-card.red{--mt:#fb7185;--mt-soft:rgba(251,113,133,.22)}
.metric-card::after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;
  background:linear-gradient(90deg,var(--mt),transparent);opacity:.8}
.metric-icon{width:30px;height:30px;display:grid;place-items:center;border-radius:10px;
  color:var(--mt);background:var(--mt-soft);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 0 16px var(--mt-soft)}
.metric-card strong{font-size:18px;font-weight:850;letter-spacing:-.04em;color:#fff;
  font-variant-numeric:tabular-nums;text-shadow:0 0 18px var(--mt-soft)}
.metric-card small{color:var(--muted);font-size:8px;font-weight:750;line-height:1.2}

/* ---------- upload CTA ---------- */
.upload-cta{position:relative;overflow:hidden;width:100%;display:grid;
  grid-template-columns:auto minmax(0,1fr);align-items:center;gap:14px;padding:16px 15px;
  border:1px solid var(--line-hi);border-radius:22px;color:var(--ink);text-align:left;cursor:pointer;
  background:
    radial-gradient(360px 200px at 90% 10%,rgba(139,92,246,.22),transparent 70%),
    linear-gradient(150deg,rgba(19,27,49,.96),rgba(9,13,26,.96));
  box-shadow:var(--shadow-md),inset 0 1px 0 rgba(255,255,255,.07);
  transition:transform .28s cubic-bezier(.34,1.56,.64,1),box-shadow .28s}
.upload-cta:hover{transform:translateY(-3px);box-shadow:var(--shadow-lg),0 0 36px rgba(34,211,238,.16)}
.upload-cta:active{transform:scale(.985)}
.cta-mesh{position:absolute;inset:-40%;pointer-events:none;opacity:.55;filter:blur(46px);
  background:conic-gradient(from 0deg at 70% 50%,rgba(34,211,238,.24),rgba(139,92,246,.22),
    rgba(251,146,60,.18),rgba(34,211,238,.24));animation:meshSpin 26s linear infinite}
.scan-line{position:absolute;left:0;right:0;height:60px;pointer-events:none;
  background:linear-gradient(180deg,transparent,rgba(34,211,238,.14),transparent);
  animation:scanMove 7s linear infinite}
.cta-icon{position:relative;z-index:2;width:50px;height:50px;display:grid;place-items:center;
  border-radius:16px;color:#04121c;flex:0 0 auto;
  background:linear-gradient(140deg,#22d3ee,#3b82f6 55%,#8b5cf6);
  box-shadow:0 12px 28px rgba(34,211,238,.3),0 0 24px rgba(139,92,246,.26);
  animation:orbFloat 6s ease-in-out infinite}
.cta-copy{position:relative;z-index:2;display:flex;flex-direction:column;min-width:0}
.cta-copy small{color:#67e8f9;font-size:8px;font-weight:900;letter-spacing:.14em}
.cta-copy b{margin-top:3px;font-size:14.5px;font-weight:850;letter-spacing:-.02em;color:#f2f7ff}
.cta-copy em{margin-top:4px;color:var(--muted);font-size:9.5px;font-style:normal;line-height:1.45}
.cta-copy strong{display:inline-flex;align-items:center;gap:5px;margin-top:9px;color:#c4b5fd;
  font-size:9px;font-weight:900;letter-spacing:.1em}

/* ---------- sample cards ---------- */
.sample-stack{display:flex;flex-direction:column;gap:12px}
.sample-card{position:relative;overflow:hidden;border:1px solid var(--line);border-radius:20px;
  background:linear-gradient(160deg,rgba(21,29,52,.95),rgba(10,15,29,.95));
  box-shadow:var(--shadow-md);transition:transform .25s,box-shadow .25s,border-color .25s}
.sample-card:hover{transform:translateY(-2px);border-color:rgba(34,211,238,.35);
  box-shadow:var(--shadow-lg),0 0 26px rgba(34,211,238,.12)}
.sample-card.expiring{border-color:rgba(251,146,60,.35)}
.sample-card.out{border-color:rgba(251,113,133,.3)}
.sample-photo{position:relative;display:block;width:100%;height:150px;padding:0;border:0;cursor:pointer;
  color:inherit;background-color:#0b1020;background-size:cover;background-position:center;
  background-image:linear-gradient(150deg,rgba(245,194,107,.14),rgba(12,17,33,.9) 60%)}
.sample-photo::after{content:"";position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(180deg,rgba(5,7,15,.1),transparent 40%,rgba(5,7,15,.75))}
.photo-empty{position:absolute;inset:0;display:grid;place-items:center;color:rgba(245,194,107,.55)}
.photo-scan{position:absolute;left:0;right:0;height:38px;pointer-events:none;
  background:linear-gradient(180deg,transparent,rgba(34,211,238,.18),transparent);
  animation:scanMove 6s linear infinite}
.status-chip{position:absolute;z-index:2;top:10px;left:10px;padding:4px 9px;border-radius:999px;
  border:1px solid currentColor;font-size:8px;font-weight:900;letter-spacing:.1em;
  backdrop-filter:blur(8px)}
.status-chip.active{color:#6ee7b7;background:rgba(52,211,153,.16);box-shadow:0 0 14px rgba(52,211,153,.3)}
.status-chip.expiring{color:#fdba74;background:rgba(251,146,60,.18);box-shadow:0 0 14px rgba(251,146,60,.3)}
.status-chip.out{color:#fda4af;background:rgba(251,113,133,.18);box-shadow:0 0 14px rgba(251,113,133,.3)}
.photo-code{position:absolute;z-index:2;right:10px;top:10px;padding:3px 7px;border-radius:7px;
  border:1px solid var(--line-hi);background:rgba(8,12,24,.7);color:#9fb3dd;
  font-size:7.5px;font-weight:800;letter-spacing:.08em;font-variant-numeric:tabular-nums}
.photo-open{position:absolute;z-index:2;right:10px;bottom:10px;display:inline-flex;align-items:center;
  gap:4px;padding:4px 8px;border-radius:999px;border:1px solid rgba(34,211,238,.4);
  background:rgba(8,12,24,.75);color:#67e8f9;font-size:8.5px;font-weight:800}
.sample-body{position:relative;z-index:2;padding:12px 13px 13px;display:flex;flex-direction:column;gap:10px}
.sample-title{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.sample-title small{display:block;color:#5f7099;font-size:7.5px;font-weight:900;letter-spacing:.14em}
.sample-title h3{margin:2px 0 0;font-size:14.5px;font-weight:850;letter-spacing:-.02em;color:#f2f7ff}
.verified{width:24px;height:24px;display:grid;place-items:center;border-radius:8px;flex:0 0 auto;
  color:#34d399;background:rgba(52,211,153,.14);box-shadow:0 0 14px rgba(52,211,153,.24)}
.stat-strip{display:grid;grid-template-columns:1.1fr 1fr 1.1fr;gap:6px}
.stat-strip>div{padding:8px 9px;border-radius:12px;border:1px solid var(--line);
  background:rgba(10,15,29,.7)}
.stat-strip span{display:block;color:#5f7099;font-size:7.5px;font-weight:900;letter-spacing:.12em}
.stat-strip b{display:block;margin-top:3px;font-size:12.5px;font-weight:850;letter-spacing:-.02em;
  color:#fff;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.stat-strip b small{color:var(--muted);font-size:8px;font-weight:650}
.stat-strip b.zero{color:#fb7185}
.stat-strip>div:nth-child(1) b{color:#67e8f9;text-shadow:0 0 14px rgba(34,211,238,.35)}
.stat-strip>div:nth-child(2) b{color:#c4b5fd}
.stat-strip>div:nth-child(3) b:not(.zero){color:#f5c26b}
.validity>div{display:flex;align-items:center;justify-content:space-between;gap:8px}
.validity span{display:inline-flex;align-items:center;gap:5px;color:#c6d4f5;font-size:10px;font-weight:750}
.validity small{color:#5f7099;font-size:7.5px;font-weight:900;letter-spacing:.12em}
.validity p{margin:6px 0 0;height:5px;border-radius:999px;background:rgba(140,170,255,.12);overflow:hidden}
.validity p i{display:block;height:100%;border-radius:999px;transition:width .6s ease}
.validity p i.green{background:linear-gradient(90deg,#34d399,#a7f3d0);box-shadow:0 0 10px #34d399}
.validity p i.blue{background:linear-gradient(90deg,#60a5fa,#c7d2fe);box-shadow:0 0 10px #60a5fa}
.validity p i.orange{background:linear-gradient(90deg,#fb923c,#fdba74);box-shadow:0 0 10px #fb923c}
.times{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.times span{display:block;color:#5f7099;font-size:7.5px;font-weight:900;letter-spacing:.12em}
.times b{display:block;margin-top:2px;color:#b9caf0;font-size:9px;font-weight:650}
.views{display:inline-flex;align-items:center;gap:5px;color:var(--dim);font-size:9px;font-weight:700}
.card-actions{display:grid;grid-template-columns:1fr 1fr auto;gap:7px}
.card-actions button{display:inline-flex;align-items:center;justify-content:center;gap:5px;height:36px;
  padding:0 10px;border-radius:11px;font-size:10px;font-weight:850;cursor:pointer;
  transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s,filter .22s}
.card-actions button:active:not(:disabled){transform:scale(.97)}
.act-rate{border:1px solid rgba(34,211,238,.45);color:#d7f6ff;
  background:linear-gradient(120deg,rgba(34,211,238,.2),rgba(139,92,246,.18));
  box-shadow:0 0 18px rgba(34,211,238,.16)}
.act-rate:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 0 26px rgba(34,211,238,.3)}
.act-rate.locked,.act-rate:disabled{opacity:.5;cursor:not-allowed;border-color:var(--line);
  background:rgba(18,25,45,.85);color:#8b9ac0;box-shadow:none}
.act-stock{border:1px solid rgba(245,194,107,.4);color:#fde4b1;background:rgba(245,194,107,.12);
  box-shadow:0 0 18px rgba(245,194,107,.12)}
.act-stock:hover{transform:translateY(-1px);box-shadow:0 0 24px rgba(245,194,107,.26)}
.act-more{width:36px;padding:0;border:1px solid var(--line-hi);background:rgba(18,25,45,.85);color:#9fb3dd}
.act-more:hover{color:#67e8f9;border-color:rgba(34,211,238,.5)}
.lock-note{display:inline-flex;align-items:center;gap:5px;margin:-2px 0 0;color:#6ee7b7;font-size:8.5px;font-weight:750}

/* ---------- empty / loading ---------- */
.empty{position:relative;padding:28px 18px;text-align:center;border:1px dashed var(--line-hi);
  border-radius:20px;background:rgba(12,18,34,.6)}
.empty-icon{width:58px;height:58px;margin:0 auto;display:grid;place-items:center;border-radius:18px;
  color:#67e8f9;background:rgba(34,211,238,.12);box-shadow:0 0 26px rgba(34,211,238,.2)}
.empty h3{margin:14px 0 5px;font-size:14px;font-weight:850;color:#f2f7ff}
.empty p{margin:0 auto 14px;max-width:290px;color:var(--muted);font-size:10.5px;line-height:1.55}

.signature{padding:6px 0 2px;text-align:center;color:#b9caf0;font-size:11px;font-weight:800}
.signature small{display:block;margin-top:3px;color:#5f7099;font-size:7.5px;font-weight:900;letter-spacing:.16em}

/* ---------- toast ---------- */
.toast{position:absolute;z-index:80;left:15px;right:15px;bottom:78px;display:flex;align-items:center;gap:8px;
  padding:11px 13px;border-radius:14px;border:1px solid var(--line-hi);font-size:11px;font-weight:750;
  background:rgba(12,18,34,.96);backdrop-filter:blur(16px);box-shadow:var(--shadow-lg);
  animation:menuIn .25s ease both}
.toast.success{color:#6ee7b7;border-color:rgba(52,211,153,.45)}
.toast.error{color:#fda4af;border-color:rgba(251,113,133,.45)}

/* ---------- bottom nav (identical to home) ---------- */
.bottom-nav{position:absolute;z-index:40;bottom:0;left:0;right:0;height:66px;
  display:grid;grid-template-columns:repeat(5,1fr);align-items:center;padding:0 6px 4px;
  border-top:1px solid var(--line);
  background:linear-gradient(0deg,rgba(6,9,19,.96),rgba(9,13,26,.7));
  backdrop-filter:blur(22px) saturate(160%);-webkit-backdrop-filter:blur(22px) saturate(160%);
  box-shadow:0 -10px 30px rgba(0,0,0,.5)}
.bottom-nav::before{content:"";position:absolute;left:0;right:0;top:-1px;height:1px;
  background:linear-gradient(90deg,transparent,rgba(34,211,238,.6),rgba(139,92,246,.5),transparent)}
.bottom-nav button{position:relative;display:flex;flex-direction:column;align-items:center;
  gap:3px;padding:6px 2px;border:0;background:transparent;color:#5f7099;cursor:pointer;
  transition:color .22s}
.bottom-nav button span{width:34px;height:30px;display:grid;place-items:center;border-radius:11px;
  transition:transform .3s cubic-bezier(.34,1.56,.64,1),background .3s,box-shadow .3s}
.bottom-nav button small{font-size:8px;font-weight:750}
.bottom-nav button:hover{color:#9fb3dd}
.bottom-nav button.active{color:#67e8f9}
.bottom-nav button.active span{transform:translateY(-3px) scale(1.06);
  background:linear-gradient(150deg,rgba(34,211,238,.2),rgba(139,92,246,.16));
  box-shadow:0 0 22px rgba(34,211,238,.35)}
.bottom-nav button.active::after{content:"";position:absolute;top:0;width:18px;height:2.5px;
  border-radius:999px;background:linear-gradient(90deg,#22d3ee,#8b5cf6);
  box-shadow:0 0 12px rgba(34,211,238,.8)}
`;

const CSS_SHEETS = `
/* ---------- bottom sheets ---------- */
.backdrop{position:absolute;inset:0;z-index:90;display:flex;align-items:flex-end;justify-content:center;
  background:rgba(3,5,12,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  animation:fadeIn .22s ease both}
.sheet{position:relative;width:100%;display:flex;flex-direction:column;overflow:hidden;
  border:1px solid var(--line-hi);border-bottom:0;border-radius:26px 26px 0 0;
  background:linear-gradient(180deg,rgba(17,24,44,.98),rgba(8,12,24,.99));
  box-shadow:0 -30px 70px rgba(0,0,0,.7);animation:sheetUp .32s cubic-bezier(.22,1,.36,1) both}
.sheet.compact{max-height:78%}
.sheet.large{height:92%}
.sheet-edge{position:absolute;left:0;right:0;top:0;height:1px;z-index:5;
  background:linear-gradient(90deg,transparent,rgba(34,211,238,.85),rgba(139,92,246,.75),transparent)}
.sheet-head{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 36px;align-items:start;gap:10px;
  padding:22px 16px 12px;border-bottom:1px solid var(--line)}
.sheet-grip{position:absolute;top:8px;left:50%;width:42px;height:4px;border-radius:999px;
  transform:translateX(-50%);background:rgba(140,170,255,.28)}
.sheet-head h2{margin:0;font-size:16px;font-weight:850;letter-spacing:-.03em;color:#f2f7ff}
.sheet-head p{margin:3px 0 0;color:var(--muted);font-size:10px}
.sheet-close{width:36px;height:36px;display:grid;place-items:center;border:1px solid var(--line-hi);
  border-radius:12px;color:#cfe0ff;cursor:pointer;
  background:linear-gradient(160deg,rgba(30,41,70,.9),rgba(14,20,38,.9));transition:transform .2s,border-color .2s}
.sheet-close:hover{border-color:rgba(34,211,238,.55);transform:translateY(-1px)}
.sheet-body{flex:1;min-height:0;overflow-y:auto;padding:14px 16px 18px;display:flex;flex-direction:column;gap:12px}
.sheet-body::-webkit-scrollbar{width:0}
.sheet-foot{display:grid;grid-template-columns:1fr 1.4fr;gap:9px;padding:12px 16px 16px;
  border-top:1px solid var(--line);background:rgba(6,9,19,.85)}

/* ---------- steps ---------- */
.steps{display:flex;align-items:center;gap:6px}
.steps span{width:26px;height:26px;display:grid;place-items:center;border-radius:50%;flex:0 0 auto;
  border:1px solid var(--line-hi);background:rgba(18,25,45,.85);color:#8b9ac0;font-size:10px;font-weight:850;
  transition:background .3s,color .3s,box-shadow .3s}
.steps span.on{border-color:transparent;color:#04121c;
  background:linear-gradient(120deg,#22d3ee,#8b5cf6);box-shadow:0 0 16px rgba(34,211,238,.4)}
.steps i{flex:1;height:2px;border-radius:999px;background:rgba(140,170,255,.16);transition:background .3s}
.steps i.on{background:linear-gradient(90deg,#22d3ee,#8b5cf6)}
.step-labels{display:flex;justify-content:space-between;margin-top:-6px}
.step-labels small{color:#5f7099;font-size:8px;font-weight:900;letter-spacing:.1em}
.step-labels small.on{color:#67e8f9}
.step-pane{display:flex;flex-direction:column;gap:12px}
.step-pane h3{margin:2px 0 0;font-size:14.5px;font-weight:850;letter-spacing:-.02em;color:#f2f7ff}
.step-pane .lead{margin:-6px 0 0;color:var(--muted);font-size:10.5px;line-height:1.5}

/* ---------- drop zone / preview ---------- */
.drop{display:flex;flex-direction:column;align-items:center;gap:6px;padding:24px 16px 18px;text-align:center;
  border:1px dashed rgba(34,211,238,.45);border-radius:20px;
  background:radial-gradient(260px 160px at 50% 0%,rgba(34,211,238,.12),transparent 70%),rgba(12,18,34,.6)}
.drop-icon{width:60px;height:60px;display:grid;place-items:center;border-radius:20px;color:#67e8f9;
  background:rgba(34,211,238,.12);box-shadow:0 0 26px rgba(34,211,238,.24);animation:orbFloat 5s ease-in-out infinite}
.drop b{margin-top:6px;font-size:12.5px;font-weight:850;color:#f2f7ff}
.drop small{color:var(--dim);font-size:9px}
.drop-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;margin-top:10px}
.preview{overflow:hidden;border:1px solid var(--line-hi);border-radius:18px;background:rgba(12,18,34,.8)}
.preview-photo{position:relative;aspect-ratio:1.6/1;background-size:cover;background-position:center;overflow:hidden}
.preview-meta{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px}
.preview-meta b{display:block;overflow:hidden;font-size:11px;font-weight:800;color:#eaf1ff;
  text-overflow:ellipsis;white-space:nowrap;max-width:190px}
.preview-meta small{display:block;margin-top:2px;color:var(--dim);font-size:9px}
.info{padding:9px 11px;border-radius:12px;border:1px solid rgba(96,165,250,.3);
  background:rgba(96,165,250,.1);color:#bfdbfe;font-size:9.5px;line-height:1.5}

/* ---------- fields ---------- */
.field{display:flex;flex-direction:column;gap:6px}
.field-label{color:#9fb3dd;font-size:9.5px;font-weight:850;letter-spacing:.04em}
.field-hint{color:var(--dim);font-size:8.5px;line-height:1.4}
.field-error{color:#fda4af;font-size:9px}
.field-error button{margin-left:4px;padding:2px 8px;border:1px solid rgba(251,113,133,.5);border-radius:999px;
  background:transparent;color:#fda4af;font-size:8.5px;font-weight:800;cursor:pointer}
.field input,.field select{width:100%;height:44px;padding:0 12px;border:1px solid var(--line-hi);
  border-radius:13px;background:rgba(10,15,29,.85);color:#f2f7ff;outline:none;font-size:16px;font-weight:650;
  -webkit-appearance:none;appearance:none;transition:border-color .2s,box-shadow .2s}
.field select{background-image:linear-gradient(45deg,transparent 50%,#8b9ac0 50%),
    linear-gradient(135deg,#8b9ac0 50%,transparent 50%);
  background-position:calc(100% - 18px) 50%,calc(100% - 13px) 50%;background-size:5px 5px,5px 5px;
  background-repeat:no-repeat;padding-right:34px}
.field select option{background:#0c1120;color:#eaf1ff}
.field input:focus,.field select:focus{border-color:rgba(34,211,238,.7);box-shadow:0 0 0 3px rgba(34,211,238,.15)}
.field input::placeholder{color:#4d5c82}
.field input[type=number]::-webkit-inner-spin-button,.field input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
.affix{display:flex;align-items:stretch;overflow:hidden;border:1px solid var(--line-hi);border-radius:13px;
  background:rgba(10,15,29,.85);transition:border-color .2s,box-shadow .2s}
.affix:focus-within{border-color:rgba(34,211,238,.7);box-shadow:0 0 0 3px rgba(34,211,238,.15)}
.affix input{flex:1;min-width:0;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}
.affix-prefix,.affix-suffix{display:grid;place-items:center;padding:0 12px;color:#9fb3dd;font-size:11px;font-weight:850;
  background:rgba(30,41,70,.6)}
.affix-prefix{border-right:1px solid var(--line)}
.affix-suffix{border-left:1px solid var(--line);font-size:9.5px;letter-spacing:.04em}

/* ---------- review ---------- */
.review{overflow:hidden;border:1px solid var(--line-hi);border-radius:20px;background:rgba(12,18,34,.8)}
.review-photo{position:relative;aspect-ratio:1.7/1;background-size:cover;background-position:center;overflow:hidden}
.review-tag{position:absolute;left:12px;bottom:12px;z-index:2;padding:5px 11px;border-radius:999px;
  border:1px solid rgba(245,194,107,.5);background:rgba(8,12,24,.8);color:#fde4b1;font-size:11px;font-weight:850}
.review-grid,.summary-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px}
.review-grid label,.summary-grid label{display:block;padding:9px 10px;border-radius:12px;border:1px solid var(--line);
  background:rgba(10,15,29,.7);color:#5f7099;font-size:8px;font-weight:900;letter-spacing:.1em;text-align:left}
.review-grid b,.summary-grid b{display:block;margin-top:4px;color:#f2f7ff;font-size:11.5px;font-weight:850;
  letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis}
.summary-grid{padding:0;margin-top:16px;width:100%}

/* ---------- state boxes ---------- */
.state-box{display:flex;flex-direction:column;align-items:center;text-align:center;padding:36px 8px 10px}
.state-orb{width:82px;height:82px;display:grid;place-items:center;border-radius:50%;color:#04121c;
  background:linear-gradient(140deg,#22d3ee,#3b82f6 55%,#8b5cf6);
  box-shadow:0 0 0 12px rgba(34,211,238,.08),0 0 40px rgba(34,211,238,.4)}
.state-orb.progress{animation:pulseOrb 1.4s ease-in-out infinite}
.state-orb.success{background:linear-gradient(140deg,#34d399,#22d3ee);
  box-shadow:0 0 0 12px rgba(52,211,153,.1),0 0 40px rgba(52,211,153,.45)}
.state-box h3{margin:18px 0 6px;font-size:15px;font-weight:850;letter-spacing:-.02em;color:#f2f7ff}
.state-box p{margin:0;max-width:280px;color:var(--muted);font-size:10.5px;line-height:1.55}
.state-box .bar{width:100%;height:6px;margin-top:22px;border-radius:999px;background:rgba(140,170,255,.14);overflow:hidden}
.state-box .bar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#22d3ee,#8b5cf6);
  box-shadow:0 0 12px rgba(34,211,238,.6);transition:width .3s ease}
.state-box>b{margin-top:8px;color:#67e8f9;font-size:12px;font-weight:850;font-variant-numeric:tabular-nums}
.state-actions{display:grid;grid-template-columns:1fr 1.3fr;gap:9px;width:100%;margin-top:18px}

/* ---------- viewer / edit / delete ---------- */
.viewer{display:flex;flex-direction:column;gap:12px}
.viewer-photo{position:relative;overflow:hidden;border:1px solid var(--line-hi);border-radius:20px;
  background:rgba(10,15,29,.85);aspect-ratio:1.25/1;display:grid;place-items:center}
.viewer-photo img{width:100%;height:100%;object-fit:contain;display:block}
.viewer-empty{color:rgba(245,194,107,.55)}
.viewer-meta{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 12px;
  border:1px solid var(--line);border-radius:15px;background:rgba(12,18,34,.8)}
.viewer-meta b{display:block;font-size:13px;font-weight:850;color:#f2f7ff}
.viewer-meta small{display:block;margin-top:2px;color:var(--muted);font-size:9.5px}
.viewer-meta strong{font-size:16px;font-weight:850;color:#67e8f9;letter-spacing:-.03em;white-space:nowrap}
.viewer-meta strong small{display:inline;margin:0 0 0 2px;color:var(--muted);font-size:9px;font-weight:650}
.viewer-actions{display:flex;flex-direction:column;gap:8px}
.viewer-actions button{display:flex;align-items:center;gap:11px;width:100%;padding:10px 12px;
  border:1px solid var(--line);border-radius:14px;color:#eaf1ff;text-align:left;cursor:pointer;
  font-size:11.5px;font-weight:800;background:linear-gradient(160deg,rgba(20,28,50,.92),rgba(10,15,29,.92));
  transition:transform .22s,border-color .22s,box-shadow .22s}
.viewer-actions button:hover{transform:translateX(3px);border-color:rgba(34,211,238,.4);box-shadow:var(--shadow-sm)}
.viewer-actions button span{width:34px;height:34px;display:grid;place-items:center;border-radius:11px;flex:0 0 auto}
.viewer-actions span.cyan{color:#22d3ee;background:rgba(34,211,238,.14)}
.viewer-actions span.violet{color:#a78bfa;background:rgba(167,139,250,.14)}
.viewer-actions span.red{color:#fb7185;background:rgba(251,113,133,.14)}
.viewer-actions button.danger{color:#fda4af;border-color:rgba(251,113,133,.3)}
.current{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 12px;
  border:1px solid var(--line);border-radius:14px;background:rgba(12,18,34,.8)}
.current span{color:#5f7099;font-size:8px;font-weight:900;letter-spacing:.12em}
.current b{font-size:13px;font-weight:850;color:#67e8f9;letter-spacing:-.02em}
.delete-box{display:flex;flex-direction:column;align-items:center;gap:10px;padding:14px 8px 4px;text-align:center}
.delete-box span{width:60px;height:60px;display:grid;place-items:center;border-radius:20px;color:#fb7185;
  background:rgba(251,113,133,.14);box-shadow:0 0 26px rgba(251,113,133,.25)}
.delete-box p{margin:0;max-width:280px;color:var(--muted);font-size:10.5px;line-height:1.55}
.delete-box b{padding:6px 12px;border-radius:999px;border:1px solid rgba(251,113,133,.4);
  background:rgba(251,113,133,.12);color:#fda4af;font-size:11px;font-weight:850}
.error{display:flex;align-items:center;gap:6px;margin:0;padding:9px 11px;border-radius:12px;
  border:1px solid rgba(251,113,133,.4);background:rgba(251,113,133,.12);color:#fda4af;font-size:10px;font-weight:700}
`;

const CSS_MOTION = `
/* ---------- keyframes ---------- */
@keyframes auroraA{0%,100%{transform:translate3d(0,0,0) scale(1)}
  50%{transform:translate3d(18px,26px,0) scale(1.12)}}
@keyframes auroraB{0%,100%{transform:translate3d(0,0,0) scale(1)}
  50%{transform:translate3d(-24px,-18px,0) scale(1.08)}}
@keyframes meshSpin{to{transform:rotate(360deg)}}
@keyframes scanMove{0%{top:-60px;opacity:0}12%{opacity:1}88%{opacity:1}100%{top:100%;opacity:0}}
@keyframes shimmer{0%{left:-140%}55%,100%{left:140%}}
@keyframes lineSlide{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes badgePop{0%,100%{transform:scale(1)}50%{transform:scale(1.14)}}
@keyframes menuIn{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes sheetUp{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}
@keyframes orbFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes pulseOrb{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
@keyframes livePulse{0%,100%{opacity:.6}50%{opacity:1;box-shadow:0 0 0 6px rgba(52,211,153,.1)}}

/* ---------- responsive ---------- */
@media(min-width:700px){
  .seller-phone{height:min(900px,calc(100dvh - 24px));border:1px solid rgba(140,170,255,.18);
    border-radius:30px;box-shadow:0 40px 100px rgba(0,0,0,.75),0 0 70px rgba(34,211,238,.12)}
  .backdrop{border-radius:30px}
}
@media(max-width:370px){
  .metric-grid{grid-template-columns:repeat(2,1fr)}
  .stat-strip{grid-template-columns:1fr 1fr}
  .stat-strip>div:nth-child(3){grid-column:1/-1}
  .card-actions{grid-template-columns:1fr 1fr}
  .act-more{display:none}
  .seller-identity>small{display:none}
}
@media(prefers-reduced-motion:reduce){
  .seller-app *{animation:none!important;transition:none!important}
  .reveal{opacity:1!important;transform:none!important}
}
`;

const CSS = CSS_CORE + CSS_SECTIONS + CSS_SHEETS + CSS_MOTION;
