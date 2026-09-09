import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { registerBuyer, registerSeller } from "../api/authApi";
import GlobalLoader from "../api/components/GlobalLoader";

/* -------------------------------------------------------------------------- */
/*  Theme tokens (kept from the current StoneRate visual language)            */
/* -------------------------------------------------------------------------- */

const THEME = {
  ink: "#020617",
  stone: "#1c1917",
  stoneMid: "#44403c",
  amber: "#f59e0b",
  amberDeep: "#92400e",
  amberSoft: "#fde68a",
  amberTint: "#fffbeb",
  sky: "#38bdf8",
  green: "#22c55e",
  text: "#1c1917",
  muted: "#78716c",
  faint: "#a8a29e",
  line: "#e7e5e4",
  lineSoft: "#eee7df",
  surface: "#fafaf9",
  white: "#ffffff",
};

const FONT_STACK =
  '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';

/*
 * Inline styles cannot express pseudo-classes or keyframes,
 * so a tiny stylesheet is injected once for animations, focus and
 * press feedback. Everything else stays inline like the original page.
 */
const GLOBAL_CSS_ID = "stonerate-create-account-css";

const GLOBAL_CSS = `
@keyframes srFadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes srFloat {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(0, -14px, 0); }
}
@keyframes srShimmer {
  0% { transform: translateX(-140%) skewX(-18deg); }
  100% { transform: translateX(260%) skewX(-18deg); }
}
@keyframes srPop {
  0% { transform: scale(0.6); opacity: 0; }
  70% { transform: scale(1.12); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
.sr-fade-up { animation: srFadeUp 420ms cubic-bezier(.22, 1, .36, 1) both; }
.sr-delay-1 { animation-delay: 60ms; }
.sr-delay-2 { animation-delay: 120ms; }
.sr-delay-3 { animation-delay: 180ms; }
.sr-float-slow { animation: srFloat 10s ease-in-out infinite; }
.sr-float-fast { animation: srFloat 7s ease-in-out infinite reverse; }
.sr-pop { animation: srPop 260ms cubic-bezier(.22, 1, .36, 1) both; }
.sr-field::placeholder { color: #a8a29e; font-weight: 500; }
.sr-field:focus { outline: none; }
.sr-press {
  transition: transform 160ms ease, box-shadow 220ms ease,
    background 220ms ease, border-color 220ms ease, color 220ms ease,
    opacity 220ms ease;
}
.sr-press:active { transform: scale(0.97) !important; }
.sr-scroll::-webkit-scrollbar { width: 0; height: 0; }
.sr-scroll { scrollbar-width: none; }
.sr-submit:not(:disabled):hover { filter: brightness(1.06); }
.sr-shimmer {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 34%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent);
  animation: srShimmer 2.8s ease-in-out infinite;
  pointer-events: none;
}
`;

function useGlobalStyles() {
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    if (document.getElementById(GLOBAL_CSS_ID)) return undefined;

    const tag = document.createElement("style");
    tag.id = GLOBAL_CSS_ID;
    tag.textContent = GLOBAL_CSS;
    document.head.appendChild(tag);

    return () => {
      tag.remove();
    };
  }, []);
}

/* -------------------------------------------------------------------------- */
/*  Styles context                                                            */
/* -------------------------------------------------------------------------- */

const StylesContext = createContext(null);

function useAppStyles() {
  return useContext(StylesContext);
}

/* -------------------------------------------------------------------------- */
/*  Form model + validators                                                   */
/* -------------------------------------------------------------------------- */

const EMPTY_FORM = {
  name: "",
  email: "",
  shopName: "",
  contactNumber: "",
  alternateContactNumber: "",
  aadhaarNumber: "",
  address: "",
  transporterAgencyName: "",
  plantName: "",
  plantAddress: "",
  plantPincode: "",
  plantCity: "",
  plantState: "",
  sellerProductType: "",
  gstin: "",
  sandMaterial: "",
  otherSandMaterial: "",
};

const hasText = (value) => Boolean(value && value.trim());
const isTenDigits = (value) => /^\d{10}$/.test(value || "");
const isAadhaar = (value) => (value || "").trim().length === 12;
const isPincode = (value) => /^\d{6}$/.test(value || "");
const isGstin = (value) =>
  /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(
    (value || "").trim().toUpperCase()
  );
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");

const onlyDigits = (value, max) => value.replace(/\D/g, "").slice(0, max);

const ROLE_CONFIG = {
  buyer: {
    title: "Buyer Registration",
    kicker: "BUYER DETAILS",
    icon: "🛒",
    color: "#f59e0b",
    colorDeep: "#b45309",
    label: "Buyer",
    description: "I want to order crushed stone",
    heroTitle: "Set up your buyer account",
    heroSubtitle:
      "Tell us about your shop so sellers and transporters can reach you quickly.",
  },
  transporter: {
    title: "Transporter Registration",
    kicker: "TRANSPORTER DETAILS",
    icon: "🚚",
    color: "#38bdf8",
    colorDeep: "#0369a1",
    label: "Transporter",
    description: "I manage trucks and transport",
    heroTitle: "Set up your transporter account",
    heroSubtitle:
      "Share your agency details and fleet capacity to start receiving trips.",
  },
  seller: {
    title: "Seller Registration",
    kicker: "SELLER DETAILS",
    icon: "🏭",
    color: "#22c55e",
    colorDeep: "#15803d",
    label: "Seller",
    description: "I produce and sell materials",
    heroTitle: "Set up your seller account",
    heroSubtitle:
      "Add your plant, products and daily output to get discovered by buyers.",
  },
};

const PRODUCT_CATEGORIES = [
  "20mm Crushed Stone",
  "40mm Crushed Stone",
  "GSB",
  "M-Sand",
  "Stone Dust",
];

const STONE_SELLER_CATEGORIES = [
  "20mm Crushed Stone",
  "40mm Crushed Stone",
  "GSB",
  "Stone Dust",
];

const TRUCK_FREQUENCY_OPTIONS = ["1-5", "5-10", "10-20", "More than 20"];

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function CreateAccountPage({ goToPage1, goToPage3, goToPage4 }) {
  useGlobalStyles();

  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [selectedProduction, setSelectedProduction] = useState("");
  const [productionUnit, setProductionUnit] = useState("metric ton");

  const [hoveredRole, setHoveredRole] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredFrequency, setHoveredFrequency] = useState(null);
  const [hoveredProduction, setHoveredProduction] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGlobalLoader, setShowGlobalLoader] = useState(false);
  const [existingAccountPopup, setExistingAccountPopup] = useState({
    visible: false,
    phone: "",
  });

  const viewport = useViewport();

  const styles = useMemo(
    () => createStyles(viewport, selectedRole),
    [viewport.width, viewport.height, selectedRole]
  );

  const productionOptions = useMemo(() => {
    const unitLabel = productionUnit === "metric ton" ? "metric ton" : "feet";
    return [
      `10-20 ${unitLabel}`,
      `20-40 ${unitLabel}`,
      `40-60 ${unitLabel}`,
      `More than 60 ${unitLabel}`,
    ];
  }, [productionUnit]);

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetFormByRole = (role) => {
    setSelectedRole(role);
    setSelectedCategories([]);
    setSelectedFrequency("");
    setSelectedProduction("");
    setProductionUnit("metric ton");
    setFormData({ ...EMPTY_FORM });
  };

  const toggleCategory = (category) => {
    setSelectedCategories((previous) =>
      previous.includes(category)
        ? previous.filter((item) => item !== category)
        : [...previous, category]
    );
  };

  const closeExistingAccountPopup = () => {
    setExistingAccountPopup({ visible: false, phone: "" });

    window.setTimeout(() => {
      const phoneInput = document.getElementById(
        selectedRole === "seller"
          ? "seller-contact-number"
          : "buyer-contact-number"
      );

      if (phoneInput) {
        phoneInput.scrollIntoView({ behavior: "smooth", block: "center" });
        phoneInput.focus();
      }
    }, 150);
  };

  const continueToSignIn = () => {
    const existingPhone = existingAccountPopup.phone;

    setExistingAccountPopup({ visible: false, phone: "" });

    /*
      Temporarily store the number so Page 3 can
      prefill it in a later step.
    */
    if (existingPhone) {
      window.localStorage.setItem("stonerate_signin_phone", existingPhone);
    }

    goToPage3?.();
  };

  const activeRole = selectedRole ? ROLE_CONFIG[selectedRole] : null;

  const isFormComplete = useMemo(() => {
    if (!selectedRole) return false;
    if (selectedCategories.length === 0) return false;

    const aadhaarValid = formData.aadhaarNumber.trim().length === 12;

    if (selectedRole === "buyer") {
      return Boolean(
        formData.name.trim() &&
          formData.shopName.trim() &&
          formData.contactNumber.trim() &&
          formData.alternateContactNumber.trim() &&
          aadhaarValid &&
          formData.address.trim()
      );
    }

    if (selectedRole === "transporter") {
      return Boolean(
        formData.name.trim() &&
          formData.transporterAgencyName.trim() &&
          aadhaarValid &&
          selectedFrequency &&
          formData.address.trim()
      );
    }

    if (selectedRole === "seller") {
      const commonSellerDetails = Boolean(
        formData.sellerProductType &&
          formData.name.trim() &&
          formData.plantName.trim() &&
          /^\d{10}$/.test(formData.contactNumber) &&
          aadhaarValid &&
          formData.plantAddress.trim() &&
          /^\d{6}$/.test(formData.plantPincode) &&
          formData.plantCity.trim() &&
          formData.plantState.trim()
      );
      if (!commonSellerDetails) return false;
      if (formData.sellerProductType === "sand") {
        const gstinValid = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(
          formData.gstin.trim().toUpperCase()
        );
        const materialValid =
          formData.sandMaterial === "Morang" ||
          (formData.sandMaterial === "Other" &&
            formData.otherSandMaterial.trim());
        return Boolean(gstinValid && materialValid);
      }
      return Boolean(selectedCategories.length > 0 && selectedProduction);
    }

    return false;
  }, [
    selectedRole,
    selectedCategories,
    selectedFrequency,
    selectedProduction,
    formData,
  ]);

  /*
   * Visual progress only (does not affect submit rules).
   * Counts how many required inputs are already satisfied.
   */
  const completion = useMemo(() => {
    if (!selectedRole) return { done: 0, total: 0, percent: 0 };

    let checks = [];

    if (selectedRole === "buyer") {
      checks = [
        hasText(formData.name),
        hasText(formData.shopName),
        isTenDigits(formData.contactNumber),
        isTenDigits(formData.alternateContactNumber),
        isAadhaar(formData.aadhaarNumber),
        selectedCategories.length > 0,
        hasText(formData.address),
      ];
    } else if (selectedRole === "transporter") {
      checks = [
        hasText(formData.name),
        hasText(formData.transporterAgencyName),
        isAadhaar(formData.aadhaarNumber),
        selectedCategories.length > 0,
        Boolean(selectedFrequency),
        hasText(formData.address),
      ];
    } else {
      checks = [
        Boolean(formData.sellerProductType),
        hasText(formData.name),
        hasText(formData.plantName),
        isTenDigits(formData.contactNumber),
        isAadhaar(formData.aadhaarNumber),
        hasText(formData.plantAddress),
        isPincode(formData.plantPincode),
        hasText(formData.plantCity),
        hasText(formData.plantState),
      ];
      if (formData.sellerProductType === "sand") {
        checks.push(isGstin(formData.gstin));
        checks.push(
          formData.sandMaterial === "Morang" ||
            (formData.sandMaterial === "Other" &&
              hasText(formData.otherSandMaterial))
        );
      } else {
        checks.push(selectedCategories.length > 0);
        checks.push(Boolean(selectedProduction));
      }
    }

    const done = checks.filter(Boolean).length;
    const total = checks.length;
    return {
      done,
      total,
      percent: total ? Math.round((done / total) * 100) : 0,
    };
  }, [
    selectedRole,
    selectedCategories,
    selectedFrequency,
    selectedProduction,
    formData,
  ]);

  const handleSubmit = async () => {
    if (!isFormComplete || isSubmitting) {
      return;
    }

    if (selectedRole === "transporter") {
      window.alert("Transporter registration will be connected later.");
      return;
    }

    setIsSubmitting(true);

    const loaderTimer = window.setTimeout(() => {
      setShowGlobalLoader(true);
    }, 500);

    try {
      const result =
        selectedRole === "seller"
          ? await registerSeller({
              sellerProductType: formData.sellerProductType,
              name: formData.name,
              plantName: formData.plantName,
              email: formData.email,
              contactNumber: formData.contactNumber,
              alternateContactNumber: formData.alternateContactNumber,
              aadhaarNumber: formData.aadhaarNumber,
              gstin: formData.gstin.trim().toUpperCase(),
              sandMaterial:
                formData.sellerProductType === "sand"
                  ? formData.sandMaterial === "Other"
                    ? formData.otherSandMaterial.trim()
                    : formData.sandMaterial
                  : "",
              plantAddress: formData.plantAddress,
              pincode: formData.plantPincode,
              city: formData.plantCity,
              state: formData.plantState,
              categories:
                formData.sellerProductType === "sand"
                  ? [
                      formData.sandMaterial === "Other"
                        ? formData.otherSandMaterial.trim()
                        : formData.sandMaterial,
                    ]
                  : selectedCategories,
              dailyProduction:
                formData.sellerProductType === "sand" ? "" : selectedProduction,
            })
          : await registerBuyer({
              name: formData.name,
              shopName: formData.shopName,
              contactNumber: formData.contactNumber,
              alternateContactNumber: formData.alternateContactNumber,
              aadhaarNumber: formData.aadhaarNumber,
              address: formData.address,
              categories: selectedCategories,
            });

      if (
        result.success === false &&
        ["ACCOUNT_EXISTS", "SELLER_ACCOUNT_EXISTS"].includes(result.code)
      ) {
        setExistingAccountPopup({
          visible: true,
          phone: result.phone || formData.contactNumber,
        });
        return;
      }

      if (result.success === false) {
        window.alert(
          result.message || "Unable to create the account. Please try again."
        );
        return;
      }

      goToPage3?.();
    } catch (error) {
      console.error("Account registration failed:", error);
      window.alert("Unable to create the account. Please try again.");
    } finally {
      window.clearTimeout(loaderTimer);
      setShowGlobalLoader(false);
      setIsSubmitting(false);
    }
  };

  return (
    <StylesContext.Provider value={styles}>
      <div style={styles.page}>
        <GlobalLoader
          visible={showGlobalLoader}
          title="Creating your account"
          message={
            selectedRole === "seller"
              ? "Validating your details and securing your seller profile..."
              : "Validating your details and securing your buyer profile..."
          }
        />

        <div style={styles.phone}>
          {/* ------------------------------------------------------------ */}
          {/*  Hero                                                        */}
          {/* ------------------------------------------------------------ */}
          <section style={styles.hero}>
            <div className="sr-float-slow" style={styles.bgOrbOne} />
            <div className="sr-float-fast" style={styles.bgOrbTwo} />
            <div style={styles.bgOrbThree} />
            <div style={styles.gridOverlay} />
            <div style={styles.heroNoise} />

            <nav style={styles.nav}>
              <div style={styles.brandWrap}>
                <div style={styles.logo3d}>
                  <span style={styles.logoGlyph}>🪨</span>
                  <span style={styles.logoRing} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <p style={styles.brandName}>StoneRate</p>
                  <p style={styles.brandSub}>Create your account</p>
                </div>
              </div>

              <button
                type="button"
                className="sr-press"
                style={styles.backBtn}
                onClick={goToPage1}
              >
                <span style={styles.backArrow}>‹</span> Back
              </button>
            </nav>

            <StepIndicator
              step={selectedRole ? 2 : 1}
              accent={activeRole ? activeRole.color : THEME.amber}
            />

            <div className="sr-fade-up" style={styles.headerText}>
              <div style={styles.heroBadge}>
                <span style={styles.heroBadgeDot} />
                SIGN UP
              </div>

              <h1 style={styles.title}>
                {activeRole ? activeRole.heroTitle : "Who are you?"}
              </h1>

              <p style={styles.subtitle}>
                {activeRole
                  ? activeRole.heroSubtitle
                  : "Choose your account type. The form will change based on your role."}
              </p>
            </div>

            <div
              style={selectedRole ? styles.roleCardsRow : styles.roleCardsStack}
            >
              {Object.entries(ROLE_CONFIG).map(([role, config], index) => (
                <RoleCard
                  key={role}
                  index={index}
                  compact={Boolean(selectedRole)}
                  label={config.label}
                  description={config.description}
                  icon={config.icon}
                  active={selectedRole === role}
                  hovered={hoveredRole === role}
                  color={config.color}
                  colorDeep={config.colorDeep}
                  onClick={() => resetFormByRole(role)}
                  onMouseEnter={() => setHoveredRole(role)}
                  onMouseLeave={() => setHoveredRole(null)}
                />
              ))}
            </div>
          </section>

          {/* ------------------------------------------------------------ */}
          {/*  Form                                                        */}
          {/* ------------------------------------------------------------ */}
          <section style={styles.formSection}>
            <div style={styles.sheetHandle} />

            <div className="sr-scroll" style={styles.formScrollArea}>
              {!selectedRole && (
                <div className="sr-fade-up" style={styles.emptyState}>
                  <div style={styles.emptyIconRow}>
                    {Object.values(ROLE_CONFIG).map((config) => (
                      <span
                        key={config.label}
                        style={{
                          ...styles.emptyIcon,
                          background: `${config.color}22`,
                          borderColor: `${config.color}55`,
                        }}
                      >
                        {config.icon}
                      </span>
                    ))}
                  </div>
                  <p style={styles.emptyTitle}>Pick a role to get started</p>
                  <p style={styles.emptyText}>
                    Buyers order material, transporters move it and sellers
                    produce it. Your form appears here once you choose.
                  </p>
                </div>
              )}

              {selectedRole && activeRole && (
                <div key={selectedRole} className="sr-fade-up" style={styles.formCard}>
                  <div
                    style={{
                      ...styles.formCardAccent,
                      background: `linear-gradient(90deg, ${activeRole.color}, ${activeRole.colorDeep})`,
                    }}
                  />

                  <div style={styles.formHeader}>
                    <div
                      style={{
                        ...styles.roleIconBadge,
                        background: `linear-gradient(145deg, ${activeRole.color}, ${activeRole.colorDeep})`,
                        boxShadow: `0 14px 26px ${activeRole.color}55`,
                      }}
                    >
                      {activeRole.icon}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p
                        style={{
                          ...styles.formKicker,
                          color: activeRole.colorDeep,
                        }}
                      >
                        {activeRole.kicker}
                      </p>

                      <h2 style={styles.formTitle}>{activeRole.title}</h2>
                    </div>

                    <ProgressRing
                      percent={completion.percent}
                      color={activeRole.color}
                      label={`${completion.done}/${completion.total}`}
                    />
                  </div>

                  <div style={styles.progressTrack}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${completion.percent}%`,
                        background: `linear-gradient(90deg, ${activeRole.color}, ${activeRole.colorDeep})`,
                      }}
                    />
                  </div>

                  {selectedRole === "buyer" && (
                    <BuyerForm
                      formData={formData}
                      updateField={updateField}
                      productCategories={PRODUCT_CATEGORIES}
                      selectedCategories={selectedCategories}
                      toggleCategory={toggleCategory}
                      hoveredCategory={hoveredCategory}
                      setHoveredCategory={setHoveredCategory}
                    />
                  )}

                  {selectedRole === "transporter" && (
                    <TransporterForm
                      formData={formData}
                      updateField={updateField}
                      productCategories={PRODUCT_CATEGORIES}
                      selectedCategories={selectedCategories}
                      toggleCategory={toggleCategory}
                      truckFrequencyOptions={TRUCK_FREQUENCY_OPTIONS}
                      selectedFrequency={selectedFrequency}
                      setSelectedFrequency={setSelectedFrequency}
                      hoveredCategory={hoveredCategory}
                      setHoveredCategory={setHoveredCategory}
                      hoveredFrequency={hoveredFrequency}
                      setHoveredFrequency={setHoveredFrequency}
                    />
                  )}

                  {selectedRole === "seller" && (
                    <SellerForm
                      formData={formData}
                      updateField={updateField}
                      productCategories={PRODUCT_CATEGORIES}
                      selectedCategories={selectedCategories}
                      setSelectedCategories={setSelectedCategories}
                      toggleCategory={toggleCategory}
                      productionOptions={productionOptions}
                      selectedProduction={selectedProduction}
                      setSelectedProduction={setSelectedProduction}
                      productionUnit={productionUnit}
                      setProductionUnit={setProductionUnit}
                      hoveredCategory={hoveredCategory}
                      setHoveredCategory={setHoveredCategory}
                      hoveredProduction={hoveredProduction}
                      setHoveredProduction={setHoveredProduction}
                    />
                  )}
                </div>
              )}
            </div>

            <div style={styles.bottomPanel}>
              <div style={styles.privacyNote}>
                <span style={styles.lockIcon}>🔒</span>

                <div style={{ minWidth: 0 }}>
                  <p style={styles.privacyTitle}>Your data stays protected</p>
                  <p style={styles.privacyText}>
                    Sensitive details should be verified and stored securely.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="sr-press sr-submit"
                disabled={!isFormComplete || isSubmitting}
                onClick={handleSubmit}
                style={{
                  ...styles.submitBtn,
                  ...(isFormComplete && !isSubmitting
                    ? styles.submitBtnBright
                    : styles.submitBtnDisabled),
                }}
              >
                {isFormComplete && !isSubmitting && (
                  <span className="sr-shimmer" />
                )}
                <span style={styles.submitLabel}>
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </span>
                {!isSubmitting && (
                  <span
                    style={{
                      ...styles.submitArrow,
                      opacity: isFormComplete ? 1 : 0.5,
                    }}
                  >
                    →
                  </span>
                )}
              </button>

              <div style={styles.signInRow}>
                <span style={styles.signInText}>Already have an account?</span>

                <button
                  type="button"
                  className="sr-press"
                  style={styles.signInLink}
                  onClick={goToPage3}
                >
                  Sign In
                </button>
              </div>
            </div>
          </section>

          {/* ------------------------------------------------------------ */}
          {/*  Existing account popup                                      */}
          {/* ------------------------------------------------------------ */}
          {existingAccountPopup.visible && (
            <div style={styles.popupOverlay}>
              <div className="sr-pop" style={styles.existingAccountPopup}>
                <div style={styles.popupGlow} />

                <div style={styles.accountWarningIcon}>!</div>

                <p style={styles.popupKicker}>EXISTING ACCOUNT</p>

                <h2 style={styles.popupTitle}>Account Already Exists</h2>

                <p style={styles.popupMessage}>
                  This mobile number is already registered. Please sign in to
                  continue.
                </p>

                {existingAccountPopup.phone && (
                  <div style={styles.registeredPhone}>
                    <span style={styles.phoneIcon}>☎</span>

                    <div style={styles.phoneDetails}>
                      <span>REGISTERED MOBILE NUMBER</span>
                      <b style={styles.phoneValue}>
                        +91 {existingAccountPopup.phone}
                      </b>
                    </div>

                    <span style={styles.registeredCheck}>✓</span>
                  </div>
                )}

                <div style={styles.popupActions}>
                  <button
                    type="button"
                    className="sr-press"
                    style={styles.changeNumberButton}
                    onClick={closeExistingAccountPopup}
                  >
                    Change Number
                  </button>

                  <button
                    type="button"
                    className="sr-press"
                    style={styles.popupSignInButton}
                    onClick={continueToSignIn}
                  >
                    Sign In
                    <span>›</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </StylesContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero helpers                                                              */
/* -------------------------------------------------------------------------- */

function StepIndicator({ step, accent }) {
  const styles = useAppStyles();
  const steps = ["Role", "Details", "Done"];

  return (
    <div style={styles.stepRow}>
      {steps.map((label, index) => {
        const number = index + 1;
        const done = number < step;
        const current = number === step;

        return (
          <React.Fragment key={label}>
            <div style={styles.stepItem}>
              <span
                style={{
                  ...styles.stepDot,
                  ...(done || current
                    ? {
                        background: accent,
                        color: THEME.ink,
                        boxShadow: `0 0 0 4px ${accent}33`,
                      }
                    : {}),
                }}
              >
                {done ? "✓" : number}
              </span>
              <span
                style={{
                  ...styles.stepLabel,
                  color: done || current ? "#ffffff" : "#a8a29e",
                }}
              >
                {label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <span
                style={{
                  ...styles.stepLine,
                  background: done ? accent : "rgba(255,255,255,0.16)",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function ProgressRing({ percent, color, label }) {
  const styles = useAppStyles();
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div
      style={{
        ...styles.progressRing,
        background: `conic-gradient(${color} ${clamped * 3.6}deg, #ece9e4 0deg)`,
      }}
      aria-label={`Form ${clamped}% complete`}
    >
      <div style={styles.progressRingInner}>
        <span style={{ ...styles.progressRingValue, color }}>{label}</span>
      </div>
    </div>
  );
}

function RoleCard({
  label,
  description,
  icon,
  active,
  hovered,
  color,
  colorDeep,
  onClick,
  onMouseEnter,
  onMouseLeave,
  compact,
  index,
}) {
  const styles = useAppStyles();

  const lift = hovered
    ? compact
      ? "translateY(-4px) scale(1.04)"
      : "translateY(-7px) scale(1.025)"
    : active
    ? compact
      ? "translateY(-2px) scale(1.02)"
      : "translateY(-2px) scale(1.01)"
    : "translateY(0) scale(1)";

  return (
    <button
      type="button"
      className={`sr-press sr-fade-up sr-delay-${Math.min(index + 1, 3)}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-pressed={active}
      style={{
        ...(compact ? styles.roleCardCompact : styles.roleCard),
        ...(active ? styles.roleCardActive : {}),
        borderColor: active ? color : "rgba(255,255,255,0.18)",
        transform: lift,
        boxShadow: hovered
          ? `0 20px 42px ${color}44`
          : active
          ? `0 16px 34px ${color}33, inset 0 1px 0 rgba(255,255,255,0.28)`
          : "0 12px 28px rgba(0,0,0,0.18)",
      }}
    >
      {active && (
        <span
          style={{
            ...styles.roleCardGlow,
            background: `radial-gradient(circle at 20% 20%, ${color}55, transparent 60%)`,
          }}
        />
      )}

      <div
        style={{
          ...(compact ? styles.roleIconCompact : styles.roleIcon),
          background: active
            ? `linear-gradient(145deg, ${color}, ${colorDeep})`
            : "rgba(255,255,255,0.16)",
        }}
      >
        {icon}
      </div>

      {compact ? (
        <span style={styles.roleLabelCompact}>{label}</span>
      ) : (
        <>
          <div style={styles.roleTextBlock}>
            <span style={styles.roleLabel}>{label}</span>
            <span style={styles.roleDescription}>{description}</span>
          </div>

          <div
            style={{
              ...styles.roleStatus,
              background: active ? color : "rgba(255,255,255,0.14)",
              color: active ? THEME.ink : "#ffffff",
            }}
          >
            {active ? "✓" : "+"}
          </div>
        </>
      )}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Form building blocks                                                      */
/* -------------------------------------------------------------------------- */

function FormSection({ step, title, subtitle, accent, children }) {
  const styles = useAppStyles();

  return (
    <div style={styles.sectionBlock}>
      <div style={styles.sectionHeader}>
        <span
          style={{
            ...styles.sectionStep,
            background: `${accent}1f`,
            color: accent,
            borderColor: `${accent}55`,
          }}
        >
          {step}
        </span>
        <div style={{ minWidth: 0 }}>
          <p style={styles.sectionTitle}>{title}</p>
          {subtitle && <p style={styles.sectionSubtitle}>{subtitle}</p>}
        </div>
      </div>
      <div style={styles.sectionBody}>{children}</div>
    </div>
  );
}

function BuyerForm({
  formData,
  updateField,
  productCategories,
  selectedCategories,
  toggleCategory,
  hoveredCategory,
  setHoveredCategory,
}) {
  const styles = useAppStyles();
  const accent = ROLE_CONFIG.buyer.colorDeep;

  return (
    <div style={styles.formFields}>
      <FormSection
        step="1"
        title="Personal details"
        subtitle="Who should we contact for orders?"
        accent={accent}
      >
        <Input
          id="buyer-name"
          label="Name"
          icon="👤"
          value={formData.name}
          onChange={(value) => updateField("name", value)}
          placeholder="Enter full name"
          autoComplete="name"
          valid={hasText(formData.name)}
        />

        <Input
          id="buyer-contact-number"
          label="Contact Number"
          icon="📱"
          prefix="+91"
          value={formData.contactNumber}
          onChange={(value) =>
            updateField("contactNumber", onlyDigits(value, 10))
          }
          placeholder="Enter mobile number"
          inputMode="numeric"
          maxLength={10}
          autoComplete="tel"
          valid={isTenDigits(formData.contactNumber)}
          counter
        />

        <Input
          id="buyer-alternate-contact"
          label="Alternate Contact Number"
          icon="☎"
          prefix="+91"
          value={formData.alternateContactNumber}
          onChange={(value) =>
            updateField("alternateContactNumber", onlyDigits(value, 10))
          }
          placeholder="Enter alternate mobile number"
          inputMode="numeric"
          maxLength={10}
          autoComplete="tel"
          valid={isTenDigits(formData.alternateContactNumber)}
          counter
        />

        <Input
          id="buyer-aadhaar-number"
          label="Aadhaar Number"
          icon="🪪"
          value={formData.aadhaarNumber}
          onChange={(value) =>
            updateField("aadhaarNumber", onlyDigits(value, 12))
          }
          placeholder="Enter 12 digit Aadhaar number"
          inputMode="numeric"
          maxLength={12}
          autoComplete="off"
          valid={isAadhaar(formData.aadhaarNumber)}
          hint="12 digits, numbers only"
          counter
        />
      </FormSection>

      <FormSection
        step="2"
        title="Business"
        subtitle="Your shop and the material you buy"
        accent={accent}
      >
        <Input
          id="buyer-shop-name"
          label="Shop Name"
          icon="🏪"
          value={formData.shopName}
          onChange={(value) => updateField("shopName", value)}
          placeholder="Enter shop/company name"
          autoComplete="organization"
          valid={hasText(formData.shopName)}
        />

        <CategorySelect
          title="Which category are you looking for?"
          hint="Select one or more"
          productCategories={productCategories}
          selectedCategories={selectedCategories}
          toggleCategory={toggleCategory}
          hoveredCategory={hoveredCategory}
          setHoveredCategory={setHoveredCategory}
          activeColor={ROLE_CONFIG.buyer.color}
        />
      </FormSection>

      <FormSection
        step="3"
        title="Address"
        subtitle="Where should material be delivered?"
        accent={accent}
      >
        <TextArea
          id="buyer-address"
          label="Address"
          value={formData.address}
          onChange={(value) => updateField("address", value)}
          placeholder="Enter complete address"
          autoComplete="street-address"
          valid={hasText(formData.address)}
        />
      </FormSection>
    </div>
  );
}

function TransporterForm({
  formData,
  updateField,
  productCategories,
  selectedCategories,
  toggleCategory,
  truckFrequencyOptions,
  selectedFrequency,
  setSelectedFrequency,
  hoveredCategory,
  setHoveredCategory,
  hoveredFrequency,
  setHoveredFrequency,
}) {
  const styles = useAppStyles();
  const accent = ROLE_CONFIG.transporter.colorDeep;

  return (
    <div style={styles.formFields}>
      <FormSection
        step="1"
        title="Personal details"
        subtitle="Owner or manager of the agency"
        accent={accent}
      >
        <Input
          id="transporter-name"
          label="Name"
          icon="👤"
          value={formData.name}
          onChange={(value) => updateField("name", value)}
          placeholder="Enter full name"
          autoComplete="name"
          valid={hasText(formData.name)}
        />

        <Input
          id="transporter-aadhaar-number"
          label="Aadhaar Number"
          icon="🪪"
          value={formData.aadhaarNumber}
          onChange={(value) =>
            updateField("aadhaarNumber", onlyDigits(value, 12))
          }
          placeholder="Enter 12 digit Aadhaar number"
          inputMode="numeric"
          maxLength={12}
          autoComplete="off"
          valid={isAadhaar(formData.aadhaarNumber)}
          hint="12 digits, numbers only"
          counter
        />
      </FormSection>

      <FormSection
        step="2"
        title="Agency & fleet"
        subtitle="What you carry and how often"
        accent={accent}
      >
        <Input
          id="transporter-agency-name"
          label="Transporter Agency Name"
          icon="🚚"
          value={formData.transporterAgencyName}
          onChange={(value) => updateField("transporterAgencyName", value)}
          placeholder="Enter agency name"
          autoComplete="organization"
          valid={hasText(formData.transporterAgencyName)}
        />

        <CategorySelect
          title="Which category do you deal with?"
          hint="Select one or more"
          productCategories={productCategories}
          selectedCategories={selectedCategories}
          toggleCategory={toggleCategory}
          hoveredCategory={hoveredCategory}
          setHoveredCategory={setHoveredCategory}
          activeColor={ROLE_CONFIG.transporter.color}
        />

        <OptionSelect
          title="How many trucks do you frequently need in a week?"
          options={truckFrequencyOptions}
          selectedOption={selectedFrequency}
          setSelectedOption={setSelectedFrequency}
          hoveredOption={hoveredFrequency}
          setHoveredOption={setHoveredFrequency}
          activeColor="#38bdf8"
        />
      </FormSection>

      <FormSection
        step="3"
        title="Address"
        subtitle="Where is your agency based?"
        accent={accent}
      >
        <TextArea
          id="transporter-address"
          label="Address"
          value={formData.address}
          onChange={(value) => updateField("address", value)}
          placeholder="Enter complete address"
          autoComplete="street-address"
          valid={hasText(formData.address)}
        />
      </FormSection>
    </div>
  );
}

function SellerForm({
  formData,
  updateField,
  productCategories,
  selectedCategories,
  setSelectedCategories,
  toggleCategory,
  productionOptions,
  selectedProduction,
  setSelectedProduction,
  productionUnit,
  setProductionUnit,
  hoveredCategory,
  setHoveredCategory,
  hoveredProduction,
  setHoveredProduction,
}) {
  const styles = useAppStyles();
  const accent = ROLE_CONFIG.seller.colorDeep;
  const isSand = formData.sellerProductType === "sand";
  const isStones = formData.sellerProductType === "stones";

  return (
    <div style={styles.formFields}>
      <FormSection
        step="1"
        title="What do you sell?"
        subtitle="Choose only one primary product type"
        accent={accent}
      >
        <div style={styles.sellerProductOptions}>
          {[
            {
              value: "stones",
              label: "I sell Stones",
              caption: "Crushed stone, GSB, dust",
              icon: "🪨",
            },
            {
              value: "sand",
              label: "I sell Sand",
              caption: "Morang & other sand",
              icon: "🏖️",
            },
          ].map((option) => {
            const active = formData.sellerProductType === option.value;
            return (
              <button
                type="button"
                className="sr-press"
                key={option.value}
                aria-pressed={active}
                onClick={() => {
                  updateField("sellerProductType", option.value);
                  setSelectedCategories([]);
                  updateField("sandMaterial", "");
                  updateField("otherSandMaterial", "");
                  updateField("gstin", "");
                }}
                style={{
                  ...styles.sellerProductOption,
                  ...(active ? styles.sellerProductOptionActive : {}),
                }}
              >
                <span
                  style={{
                    ...styles.sellerProductIcon,
                    ...(active ? styles.sellerProductIconActive : {}),
                  }}
                >
                  {option.icon}
                </span>
                <span style={styles.sellerProductText}>
                  <b style={styles.sellerProductLabel}>{option.label}</b>
                  <span style={styles.sellerProductCaption}>
                    {option.caption}
                  </span>
                </span>
                <span
                  style={{
                    ...styles.sellerProductCheck,
                    ...(active ? styles.sellerProductCheckActive : {}),
                  }}
                >
                  {active ? "✓" : ""}
                </span>
              </button>
            );
          })}
        </div>
      </FormSection>

      <FormSection
        step="2"
        title="Owner & plant"
        subtitle="Who runs the plant and how to reach them"
        accent={accent}
      >
        <Input
          id="seller-name"
          label="Name"
          icon="👤"
          value={formData.name}
          onChange={(value) => updateField("name", value)}
          placeholder="Enter full name"
          autoComplete="name"
          valid={hasText(formData.name)}
        />

        <Input
          id="seller-plant-name"
          label="Plant Name"
          icon="🏭"
          value={formData.plantName}
          onChange={(value) => updateField("plantName", value)}
          placeholder="Enter sand plant or yard name"
          autoComplete="organization"
          valid={hasText(formData.plantName)}
        />

        <Input
          id="seller-contact-number"
          label="Mobile Number"
          icon="📱"
          prefix="+91"
          value={formData.contactNumber}
          onChange={(value) =>
            updateField("contactNumber", onlyDigits(value, 10))
          }
          placeholder="Enter 10-digit mobile number"
          inputMode="numeric"
          maxLength={10}
          autoComplete="tel"
          valid={isTenDigits(formData.contactNumber)}
          counter
        />

        {isSand ? (
          <>
            <Input
              id="seller-gstin"
              label="GSTIN Number"
              icon="🧾"
              value={formData.gstin}
              onChange={(value) =>
                updateField(
                  "gstin",
                  value.replace(/[^0-9a-z]/gi, "").toUpperCase().slice(0, 15)
                )
              }
              placeholder="Example: 29ABCDE1234F1Z5"
              maxLength={15}
              autoComplete="off"
              valid={isGstin(formData.gstin)}
              hint="15-character GST identification number"
              counter
              mono
            />

            <Input
              id="seller-aadhaar-number"
              label="Aadhaar Card Number"
              icon="🪪"
              value={formData.aadhaarNumber}
              onChange={(value) =>
                updateField("aadhaarNumber", onlyDigits(value, 12))
              }
              placeholder="Enter 12-digit Aadhaar number"
              inputMode="numeric"
              maxLength={12}
              autoComplete="off"
              valid={isAadhaar(formData.aadhaarNumber)}
              counter
            />
          </>
        ) : (
          <>
            <Input
              id="seller-email"
              label="Email Address"
              optional
              icon="✉️"
              value={formData.email}
              onChange={(value) => updateField("email", value.trimStart())}
              placeholder="Enter email address"
              inputMode="email"
              autoComplete="email"
              valid={isEmail(formData.email)}
            />

            <Input
              id="seller-aadhaar-number"
              label="Aadhaar Number"
              icon="🪪"
              value={formData.aadhaarNumber}
              onChange={(value) =>
                updateField("aadhaarNumber", onlyDigits(value, 12))
              }
              placeholder="Enter 12 digit Aadhaar number"
              inputMode="numeric"
              maxLength={12}
              autoComplete="off"
              valid={isAadhaar(formData.aadhaarNumber)}
              counter
            />
          </>
        )}
      </FormSection>

      {formData.sellerProductType && (
        <FormSection
          step="3"
          title={isSand ? "Material" : "Products & output"}
          subtitle={
            isSand
              ? "Tell buyers which sand you supply"
              : "What you produce and how much per day"
          }
          accent={accent}
        >
          {isSand ? (
            <>
              <div style={styles.fieldWrapper}>
                <p style={styles.label}>Material you have?</p>
                <div style={styles.sandMaterialOptions}>
                  {["Morang", "Other"].map((option) => {
                    const active = formData.sandMaterial === option;
                    return (
                      <button
                        type="button"
                        className="sr-press"
                        key={option}
                        aria-pressed={active}
                        onClick={() => {
                          updateField("sandMaterial", option);
                          if (option !== "Other")
                            updateField("otherSandMaterial", "");
                        }}
                        style={{
                          ...styles.sandMaterialOption,
                          ...(active ? styles.sandMaterialOptionActive : {}),
                        }}
                      >
                        <span
                          style={{
                            ...styles.chipMark,
                            ...(active ? styles.chipMarkActiveGreen : {}),
                          }}
                        >
                          {active ? "✓" : "+"}
                        </span>
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              {formData.sandMaterial === "Other" && (
                <div className="sr-fade-up">
                  <TextArea
                    id="seller-other-sand-material"
                    label="Other Material Name"
                    value={formData.otherSandMaterial}
                    onChange={(value) =>
                      updateField("otherSandMaterial", value)
                    }
                    placeholder="Enter the sand or material name"
                    autoComplete="off"
                    valid={hasText(formData.otherSandMaterial)}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              {isStones && (
                <CategorySelect
                  title="Which stone material do you produce?"
                  hint="Select one or more"
                  productCategories={productCategories.filter((category) =>
                    STONE_SELLER_CATEGORIES.includes(category)
                  )}
                  selectedCategories={selectedCategories}
                  toggleCategory={toggleCategory}
                  hoveredCategory={hoveredCategory}
                  setHoveredCategory={setHoveredCategory}
                  activeColor={ROLE_CONFIG.seller.color}
                />
              )}

              <div style={styles.fieldWrapper}>
                <div style={styles.productionTitleRow}>
                  <p style={{ ...styles.label, marginBottom: 0 }}>
                    {productionUnit === "metric ton"
                      ? "How many metric tons do you produce daily?"
                      : "How many feet do you produce daily?"}
                  </p>
                  <div style={styles.productionUnitToggle}>
                    {["metric ton", "feet"].map((option) => (
                      <button
                        type="button"
                        className="sr-press"
                        key={option}
                        onClick={() => {
                          setProductionUnit(option);
                          setSelectedProduction("");
                        }}
                        style={{
                          ...styles.productionUnitButton,
                          ...(productionUnit === option
                            ? styles.productionUnitButtonActive
                            : {}),
                        }}
                      >
                        {option === "metric ton" ? "Metric Ton" : "Feet"}
                      </button>
                    ))}
                  </div>
                </div>
                <OptionSelect
                  title=""
                  options={productionOptions}
                  selectedOption={selectedProduction}
                  setSelectedOption={setSelectedProduction}
                  hoveredOption={hoveredProduction}
                  setHoveredOption={setHoveredProduction}
                  activeColor="#22c55e"
                />
              </div>
            </>
          )}
        </FormSection>
      )}

      <FormSection
        step={formData.sellerProductType ? "4" : "3"}
        title="Plant address"
        subtitle="Where buyers and trucks should come"
        accent={accent}
      >
        <TextArea
          id="seller-plant-address"
          label="Full Address"
          value={formData.plantAddress}
          onChange={(value) => updateField("plantAddress", value)}
          placeholder="House/plot, road, area and landmark"
          autoComplete="street-address"
          valid={hasText(formData.plantAddress)}
        />
        <div style={styles.addressGrid}>
          <Input
            id="seller-plant-pincode"
            label="PIN Code"
            icon="📍"
            value={formData.plantPincode}
            onChange={(value) =>
              updateField("plantPincode", onlyDigits(value, 6))
            }
            placeholder="6-digit PIN"
            inputMode="numeric"
            maxLength={6}
            autoComplete="postal-code"
            valid={isPincode(formData.plantPincode)}
          />
          <Input
            id="seller-plant-city"
            label="City"
            icon="🏙️"
            value={formData.plantCity}
            onChange={(value) => updateField("plantCity", value)}
            placeholder="Enter city"
            autoComplete="address-level2"
            valid={hasText(formData.plantCity)}
          />
        </div>
        <Input
          id="seller-plant-state"
          label="State"
          icon="🗺️"
          value={formData.plantState}
          onChange={(value) => updateField("plantState", value)}
          placeholder="Enter state"
          autoComplete="address-level1"
          valid={hasText(formData.plantState)}
        />
      </FormSection>
    </div>
  );
}

function CategorySelect({
  title,
  hint,
  productCategories,
  selectedCategories,
  toggleCategory,
  hoveredCategory,
  setHoveredCategory,
  activeColor,
}) {
  const styles = useAppStyles();

  return (
    <div style={styles.fieldWrapper}>
      <div style={styles.labelRow}>
        <p style={styles.label}>{title}</p>
        {selectedCategories.length > 0 && (
          <span
            className="sr-pop"
            key={selectedCategories.length}
            style={{
              ...styles.countPill,
              background: activeColor || THEME.amber,
            }}
          >
            {selectedCategories.length} selected
          </span>
        )}
      </div>
      {hint && selectedCategories.length === 0 && (
        <p style={styles.fieldHint}>{hint}</p>
      )}

      <div style={styles.categoryGrid}>
        {productCategories.map((category) => {
          const active = selectedCategories.includes(category);
          const hovered = hoveredCategory === category;

          return (
            <button
              type="button"
              className="sr-press"
              key={category}
              aria-pressed={active}
              onClick={() => toggleCategory(category)}
              onMouseEnter={() => setHoveredCategory(category)}
              onMouseLeave={() => setHoveredCategory(null)}
              style={{
                ...styles.categoryChip,
                ...(active ? styles.categoryChipActive : {}),
                ...(hovered && !active ? styles.categoryChipHover : {}),
                transform: hovered
                  ? "scale(1.03) translateY(-2px)"
                  : active
                  ? "scale(1.01)"
                  : "scale(1)",
              }}
            >
              <span
                style={{
                  ...styles.chipMark,
                  ...(active ? styles.chipMarkActiveDark : {}),
                }}
              >
                {active ? "✓" : "+"}
              </span>
              <span style={styles.chipText}>
                {category.replace(" Crushed Stone", "")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OptionSelect({
  title,
  options,
  selectedOption,
  setSelectedOption,
  hoveredOption,
  setHoveredOption,
  activeColor,
}) {
  const styles = useAppStyles();

  return (
    <div style={styles.fieldWrapper}>
      {title && <p style={styles.label}>{title}</p>}

      <div style={styles.frequencyGrid}>
        {options.map((option) => {
          const active = selectedOption === option;
          const hovered = hoveredOption === option;

          return (
            <button
              type="button"
              className="sr-press"
              key={option}
              aria-pressed={active}
              onClick={() => setSelectedOption(option)}
              onMouseEnter={() => setHoveredOption(option)}
              onMouseLeave={() => setHoveredOption(null)}
              style={{
                ...styles.frequencyChip,
                ...(active
                  ? {
                      ...styles.frequencyChipActive,
                      background: `linear-gradient(135deg, ${activeColor}, ${activeColor}cc)`,
                      borderColor: activeColor,
                      boxShadow: `0 12px 22px ${activeColor}44`,
                    }
                  : {}),
                ...(hovered && !active
                  ? { borderColor: activeColor, color: THEME.text }
                  : {}),
                transform: hovered
                  ? "scale(1.03) translateY(-2px)"
                  : active
                  ? "scale(1.01)"
                  : "scale(1)",
              }}
            >
              {active && <span style={styles.frequencyDot} />}
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Input({
  id,
  label,
  placeholder,
  inputMode,
  maxLength,
  value,
  onChange,
  autoComplete = "off",
  icon,
  prefix,
  hint,
  valid,
  optional,
  counter,
  mono,
}) {
  const styles = useAppStyles();
  const [focused, setFocused] = useState(false);

  const safeValue = value ?? "";
  const hasValue = safeValue.length > 0;
  const showValid = Boolean(valid) && hasValue;
  const showCounter = counter && maxLength && hasValue && !valid;

  return (
    <div style={styles.fieldWrapper}>
      <div style={styles.labelRow}>
        <label htmlFor={id} style={styles.label}>
          {label}
          {optional && <span style={styles.optionalTag}>Optional</span>}
        </label>
        {showCounter && (
          <span style={styles.counter}>
            {safeValue.length}/{maxLength}
          </span>
        )}
      </div>

      <div
        style={{
          ...styles.inputShell,
          ...(focused ? styles.inputShellFocused : {}),
          ...(showValid && !focused ? styles.inputShellValid : {}),
        }}
      >
        {icon && (
          <span
            style={{
              ...styles.inputIcon,
              ...(focused || hasValue ? styles.inputIconActive : {}),
            }}
          >
            {icon}
          </span>
        )}

        {prefix && <span style={styles.inputPrefix}>{prefix}</span>}

        <input
          id={id}
          name={id}
          type="text"
          className="sr-field"
          style={{
            ...styles.input,
            ...(mono ? styles.inputMono : {}),
          }}
          value={safeValue}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {showValid && (
          <span className="sr-pop" style={styles.validMark}>
            ✓
          </span>
        )}
      </div>

      {hint && !showValid && <p style={styles.fieldHint}>{hint}</p>}
    </div>
  );
}

function TextArea({
  id,
  label,
  placeholder,
  value,
  onChange,
  autoComplete = "off",
  valid,
}) {
  const styles = useAppStyles();
  const [focused, setFocused] = useState(false);

  const safeValue = value ?? "";
  const showValid = Boolean(valid) && safeValue.length > 0;

  return (
    <div style={styles.fieldWrapper}>
      <label htmlFor={id} style={styles.label}>
        {label}
      </label>

      <div
        style={{
          ...styles.textareaShell,
          ...(focused ? styles.inputShellFocused : {}),
          ...(showValid && !focused ? styles.inputShellValid : {}),
        }}
      >
        <textarea
          id={id}
          name={id}
          className="sr-field"
          style={styles.textarea}
          value={safeValue}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {showValid && (
          <span className="sr-pop" style={styles.validMarkTextarea}>
            ✓
          </span>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Viewport                                                                  */
/* -------------------------------------------------------------------------- */

function useViewport() {
  const [viewport, setViewport] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 390,
    height: typeof window !== "undefined" ? window.innerHeight : 844,
  });

  useEffect(() => {
    const update = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    update();

    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
    };
  }, []);

  return viewport;
}

/* -------------------------------------------------------------------------- */
/*  Styles                                                                    */
/* -------------------------------------------------------------------------- */

function createStyles(viewport, selectedRole) {
  const vw = viewport.width || 390;
  const vh = viewport.height || 844;

  const isDesktop = vw >= 700;
  const phoneW = isDesktop ? 390 : vw;
  const phoneH = isDesktop ? 844 : vh;

  const scale = Math.max(
    0.72,
    Math.min(1, Math.min(phoneW / 390, phoneH / 844))
  );

  const narrow = phoneW < 360;
  const veryNarrow = phoneW < 300;
  const short = phoneH < 700;
  const veryShort = phoneH < 570;

  const px = (value) => Math.round(value * scale);

  const horizontalPadding = px(narrow ? 14 : 18);

  const role = selectedRole ? ROLE_CONFIG[selectedRole] : null;
  const accent = role ? role.color : THEME.amber;
  const accentDeep = role ? role.colorDeep : THEME.amberDeep;

  return {
    /* ------------------------------------------------------------------ */
    /*  Shell                                                              */
    /* ------------------------------------------------------------------ */
    page: {
      width: "100vw",
      height: "100dvh",
      minHeight: "100dvh",
      background: isDesktop
        ? "radial-gradient(circle at 15% 20%, #fdf1dc 0%, transparent 45%), radial-gradient(circle at 85% 80%, #e7e5e4 0%, transparent 40%), #f4f1ea"
        : "#ffffff",
      display: "flex",
      justifyContent: "center",
      alignItems: isDesktop ? "center" : "stretch",
      padding: isDesktop ? 16 : 0,
      fontFamily: FONT_STACK,
      overflow: "hidden",
      boxSizing: "border-box",
    },

    phone: {
      position: "relative",
      width: isDesktop ? 390 : "100vw",
      height: isDesktop ? 844 : "100dvh",
      maxWidth: isDesktop ? 430 : "none",
      minHeight: 0,
      background: THEME.white,
      borderRadius: isDesktop ? 40 : 0,
      overflow: "hidden",
      boxShadow: isDesktop
        ? "0 40px 100px rgba(2,6,23,0.32), 0 0 0 1px rgba(255,255,255,0.6) inset"
        : "none",
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
      isolation: "isolate",
    },

    /* ------------------------------------------------------------------ */
    /*  Hero                                                               */
    /* ------------------------------------------------------------------ */
    hero: {
      position: "relative",
      minHeight: selectedRole
        ? px(veryShort ? 262 : short ? 300 : 346)
        : px(veryShort ? 470 : short ? 515 : 580),
      padding: `${px(short ? 18 : 22)}px ${px(
        narrow ? 16 : 20
      )}px ${px(selectedRole ? 26 : 34)}px`,
      color: "white",
      background: `radial-gradient(circle at 20% 8%, ${accent}66, transparent 30%), radial-gradient(circle at 90% 90%, ${accentDeep}80, transparent 42%), linear-gradient(145deg, #020617 0%, #1c1917 52%, #92400e 100%)`,
      overflow: "hidden",
      transition: "min-height 420ms cubic-bezier(.22,1,.36,1), background 600ms ease",
      flexShrink: 0,
      boxSizing: "border-box",
    },

    bgOrbOne: {
      position: "absolute",
      top: px(-75),
      right: px(-80),
      width: px(230),
      height: px(230),
      borderRadius: "50%",
      background: `${accent}44`,
      filter: `blur(${px(38)}px)`,
      pointerEvents: "none",
      transition: "background 600ms ease",
    },

    bgOrbTwo: {
      position: "absolute",
      bottom: px(70),
      left: px(-95),
      width: px(210),
      height: px(210),
      borderRadius: "50%",
      background: "rgba(255,255,255,0.11)",
      filter: `blur(${px(46)}px)`,
      pointerEvents: "none",
    },

    bgOrbThree: {
      position: "absolute",
      bottom: px(-70),
      right: px(-50),
      width: px(180),
      height: px(180),
      borderRadius: "50%",
      background: "rgba(34,197,94,0.16)",
      filter: `blur(${px(42)}px)`,
      pointerEvents: "none",
    },

    gridOverlay: {
      position: "absolute",
      inset: 0,
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
      backgroundSize: `${px(34)}px ${px(34)}px`,
      maskImage: "linear-gradient(to bottom, black, transparent 82%)",
      WebkitMaskImage: "linear-gradient(to bottom, black, transparent 82%)",
      pointerEvents: "none",
    },

    heroNoise: {
      position: "absolute",
      inset: 0,
      background:
        "repeating-linear-gradient(135deg, rgba(255,255,255,0.012) 0 2px, transparent 2px 6px)",
      pointerEvents: "none",
      mixBlendMode: "overlay",
    },

    nav: {
      position: "relative",
      zIndex: 3,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: px(10),
    },

    brandWrap: {
      display: "flex",
      alignItems: "center",
      gap: px(12),
      minWidth: 0,
    },

    logo3d: {
      position: "relative",
      width: px(short ? 42 : 50),
      height: px(short ? 42 : 50),
      borderRadius: px(19),
      background:
        "linear-gradient(145deg, rgba(255,255,255,0.26), rgba(255,255,255,0.08))",
      display: "grid",
      placeItems: "center",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.35), 0 14px 26px rgba(0,0,0,0.28)",
      flexShrink: 0,
      border: "1px solid rgba(255,255,255,0.18)",
    },

    logoGlyph: {
      position: "relative",
      zIndex: 2,
      fontSize: px(short ? 20 : 24),
      lineHeight: 1,
    },

    logoRing: {
      position: "absolute",
      inset: px(-4),
      borderRadius: px(23),
      border: `1px solid ${accent}66`,
      pointerEvents: "none",
    },

    brandName: {
      margin: 0,
      fontSize: px(short ? 16 : 18),
      fontWeight: 900,
      lineHeight: 1,
      letterSpacing: -0.4,
    },

    brandSub: {
      margin: `${px(4)}px 0 0`,
      color: "#d6d3d1",
      fontSize: px(10),
      fontWeight: 600,
      whiteSpace: "nowrap",
      letterSpacing: 0.2,
    },

    backBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: px(4),
      border: "1px solid rgba(255,255,255,0.22)",
      borderRadius: 999,
      background: "rgba(255,255,255,0.10)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      color: "white",
      padding: `${px(8)}px ${px(14)}px ${px(8)}px ${px(10)}px`,
      fontSize: px(12),
      fontWeight: 800,
      cursor: "pointer",
      flexShrink: 0,
      fontFamily: FONT_STACK,
    },

    backArrow: {
      fontSize: px(18),
      lineHeight: 1,
      marginTop: px(-2),
    },

    stepRow: {
      position: "relative",
      zIndex: 3,
      display: "flex",
      alignItems: "center",
      gap: px(8),
      marginTop: px(short ? 16 : 22),
    },

    stepItem: {
      display: "flex",
      alignItems: "center",
      gap: px(6),
      flexShrink: 0,
    },

    stepDot: {
      width: px(22),
      height: px(22),
      borderRadius: "50%",
      display: "grid",
      placeItems: "center",
      background: "rgba(255,255,255,0.12)",
      border: "1px solid rgba(255,255,255,0.2)",
      color: "#d6d3d1",
      fontSize: px(10),
      fontWeight: 900,
      transition: "all 300ms ease",
    },

    stepLabel: {
      fontSize: px(10),
      fontWeight: 800,
      letterSpacing: 0.4,
      transition: "color 300ms ease",
    },

    stepLine: {
      flex: 1,
      height: 2,
      borderRadius: 2,
      minWidth: px(14),
      transition: "background 300ms ease",
    },

    headerText: {
      position: "relative",
      zIndex: 3,
      marginTop: selectedRole ? px(14) : px(short ? 22 : 30),
      transition: "all 300ms ease",
    },

    heroBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: px(7),
      padding: `${px(6)}px ${px(12)}px ${px(6)}px ${px(9)}px`,
      borderRadius: 999,
      background: `${accent}26`,
      border: `1px solid ${accent}59`,
      color: THEME.amberSoft,
      fontSize: px(10),
      letterSpacing: 1.6,
      fontWeight: 900,
      transition: "all 400ms ease",
    },

    heroBadgeDot: {
      width: px(7),
      height: px(7),
      borderRadius: "50%",
      background: accent,
      boxShadow: `0 0 0 3px ${accent}44`,
    },

    title: {
      margin: `${px(12)}px 0 0`,
      color: "white",
      fontSize: selectedRole ? px(27) : px(short ? 34 : 40),
      lineHeight: 1.04,
      fontWeight: 900,
      letterSpacing: -1.1,
      transition: "all 300ms ease",
      textShadow: "0 8px 30px rgba(0,0,0,0.35)",
    },

    subtitle: {
      margin: `${px(10)}px 0 0`,
      color: "#e7e5e4",
      fontSize: px(short ? 12 : 13),
      lineHeight: 1.45,
      fontWeight: 500,
      maxWidth: px(330),
    },

    roleCardsStack: {
      position: "relative",
      zIndex: 3,
      marginTop: px(short ? 18 : 24),
      display: "flex",
      flexDirection: "column",
      gap: px(short ? 12 : 14),
      perspective: 900,
    },

    roleCardsRow: {
      position: "relative",
      zIndex: 3,
      marginTop: px(16),
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: px(narrow ? 7 : 9),
      perspective: 900,
      transition: "all 360ms ease",
    },

    roleCard: {
      position: "relative",
      width: "100%",
      minHeight: px(short ? 84 : 96),
      borderRadius: px(28),
      border: "1px solid rgba(255,255,255,0.18)",
      background:
        "linear-gradient(145deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))",
      color: "white",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      cursor: "pointer",
      transition: "all 260ms ease",
      display: "flex",
      alignItems: "center",
      gap: px(13),
      padding: px(narrow ? 12 : 14),
      textAlign: "left",
      boxSizing: "border-box",
      overflow: "hidden",
      fontFamily: FONT_STACK,
    },

    roleCardCompact: {
      position: "relative",
      width: "100%",
      minHeight: px(short ? 76 : 92),
      borderRadius: px(24),
      border: "1px solid rgba(255,255,255,0.18)",
      background:
        "linear-gradient(145deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))",
      color: "white",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      cursor: "pointer",
      transition: "all 260ms ease",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: px(6),
      padding: px(7),
      textAlign: "center",
      boxSizing: "border-box",
      overflow: "hidden",
      fontFamily: FONT_STACK,
    },

    roleCardActive: {
      background:
        "linear-gradient(145deg, rgba(255,255,255,0.32), rgba(255,255,255,0.12))",
    },

    roleCardGlow: {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      borderRadius: "inherit",
    },

    roleIcon: {
      position: "relative",
      zIndex: 1,
      width: px(short ? 48 : 56),
      height: px(short ? 48 : 56),
      borderRadius: px(21),
      display: "grid",
      placeItems: "center",
      fontSize: px(short ? 25 : 29),
      boxShadow: "0 14px 26px rgba(0,0,0,0.24)",
      transition: "all 260ms ease",
      flexShrink: 0,
    },

    roleIconCompact: {
      position: "relative",
      zIndex: 1,
      width: px(short ? 36 : 42),
      height: px(short ? 36 : 42),
      borderRadius: px(16),
      display: "grid",
      placeItems: "center",
      fontSize: px(short ? 19 : 23),
      boxShadow: "0 12px 22px rgba(0,0,0,0.22)",
      transition: "all 260ms ease",
      flexShrink: 0,
    },

    roleTextBlock: {
      position: "relative",
      zIndex: 1,
      display: "flex",
      flexDirection: "column",
      gap: px(4),
      flex: 1,
      minWidth: 0,
    },

    roleLabel: {
      fontSize: px(16),
      fontWeight: 900,
      letterSpacing: -0.2,
    },

    roleLabelCompact: {
      position: "relative",
      zIndex: 1,
      fontSize: px(narrow ? 9 : 11),
      fontWeight: 900,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "100%",
    },

    roleDescription: {
      color: "#d6d3d1",
      fontSize: px(11),
      fontWeight: 600,
      lineHeight: 1.3,
    },

    roleStatus: {
      position: "relative",
      zIndex: 1,
      width: px(30),
      height: px(30),
      borderRadius: px(12),
      display: "grid",
      placeItems: "center",
      fontSize: px(15),
      fontWeight: 900,
      flexShrink: 0,
      transition: "all 260ms ease",
    },

    /* ------------------------------------------------------------------ */
    /*  Form sheet                                                         */
    /* ------------------------------------------------------------------ */
    formSection: {
      position: "relative",
      zIndex: 5,
      flex: 1,
      minHeight: 0,
      marginTop: px(-30),
      background: THEME.white,
      borderRadius: `${px(34)}px ${px(34)}px 0 0`,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      boxSizing: "border-box",
      padding: `0 ${horizontalPadding}px`,
      boxShadow: "0 -18px 40px rgba(2,6,23,0.22)",
    },

    sheetHandle: {
      width: px(44),
      height: px(5),
      borderRadius: 999,
      background: "#e7e5e4",
      margin: `${px(10)}px auto 0`,
      flexShrink: 0,
    },

    formScrollArea: {
      position: "relative",
      zIndex: 1,
      flex: 1,
      minHeight: 0,
      overflowY: "auto",
      overflowX: "hidden",
      WebkitOverflowScrolling: "touch",
      overscrollBehavior: "contain",
      paddingTop: px(12),
      paddingBottom: px(16),
      boxSizing: "border-box",
      pointerEvents: "auto",
    },

    emptyState: {
      marginTop: px(short ? 6 : 14),
      padding: `${px(22)}px ${px(18)}px`,
      borderRadius: px(28),
      border: "1px dashed #e0dad0",
      background:
        "linear-gradient(160deg, #fafaf9 0%, #ffffff 60%, #fffbeb 100%)",
      textAlign: "center",
    },

    emptyIconRow: {
      display: "flex",
      justifyContent: "center",
      gap: px(10),
      marginBottom: px(14),
    },

    emptyIcon: {
      width: px(44),
      height: px(44),
      borderRadius: px(16),
      display: "grid",
      placeItems: "center",
      fontSize: px(20),
      border: "1px solid transparent",
    },

    emptyTitle: {
      margin: 0,
      color: THEME.text,
      fontSize: px(15),
      fontWeight: 900,
      letterSpacing: -0.2,
    },

    emptyText: {
      margin: `${px(6)}px auto 0`,
      maxWidth: px(280),
      color: THEME.muted,
      fontSize: px(12),
      lineHeight: 1.5,
      fontWeight: 500,
    },

    formCard: {
      position: "relative",
      zIndex: 2,
      padding: px(narrow ? 14 : 16),
      paddingTop: px(narrow ? 18 : 20),
      borderRadius: px(30),
      background: THEME.surface,
      border: `1px solid ${THEME.lineSoft}`,
      boxShadow: "0 16px 34px rgba(0,0,0,0.07)",
      boxSizing: "border-box",
      pointerEvents: "auto",
      overflow: "hidden",
    },

    formCardAccent: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: px(4),
    },

    formHeader: {
      display: "flex",
      alignItems: "center",
      gap: px(12),
      marginBottom: px(12),
    },

    formKicker: {
      margin: 0,
      fontSize: px(10),
      letterSpacing: 1.6,
      fontWeight: 900,
    },

    formTitle: {
      margin: `${px(4)}px 0 0`,
      color: THEME.text,
      fontSize: px(19),
      fontWeight: 900,
      lineHeight: 1.1,
      letterSpacing: -0.4,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    roleIconBadge: {
      width: px(46),
      height: px(46),
      borderRadius: px(17),
      color: "white",
      display: "grid",
      placeItems: "center",
      fontSize: px(22),
      flexShrink: 0,
    },

    progressRing: {
      width: px(46),
      height: px(46),
      borderRadius: "50%",
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
      transition: "background 400ms ease",
    },

    progressRingInner: {
      width: px(36),
      height: px(36),
      borderRadius: "50%",
      background: THEME.surface,
      display: "grid",
      placeItems: "center",
    },

    progressRingValue: {
      fontSize: px(9.5),
      fontWeight: 900,
      letterSpacing: -0.2,
    },

    progressTrack: {
      height: px(5),
      borderRadius: 999,
      background: "#ece9e4",
      overflow: "hidden",
      marginBottom: px(16),
    },

    progressFill: {
      height: "100%",
      borderRadius: 999,
      transition: "width 420ms cubic-bezier(.22,1,.36,1)",
    },

    formFields: {
      position: "relative",
      zIndex: 2,
      display: "flex",
      flexDirection: "column",
      gap: px(14),
      pointerEvents: "auto",
    },

    sectionBlock: {
      padding: px(12),
      borderRadius: px(22),
      background: THEME.white,
      border: `1px solid ${THEME.line}`,
      boxShadow: "0 8px 18px rgba(0,0,0,0.035)",
    },

    sectionHeader: {
      display: "flex",
      alignItems: "center",
      gap: px(10),
      marginBottom: px(12),
    },

    sectionStep: {
      width: px(26),
      height: px(26),
      borderRadius: px(9),
      display: "grid",
      placeItems: "center",
      border: "1px solid transparent",
      fontSize: px(11),
      fontWeight: 900,
      flexShrink: 0,
    },

    sectionTitle: {
      margin: 0,
      color: THEME.text,
      fontSize: px(13.5),
      fontWeight: 900,
      letterSpacing: -0.2,
      lineHeight: 1.2,
    },

    sectionSubtitle: {
      margin: `${px(2)}px 0 0`,
      color: THEME.muted,
      fontSize: px(10.5),
      fontWeight: 500,
      lineHeight: 1.3,
    },

    sectionBody: {
      display: "flex",
      flexDirection: "column",
      gap: px(12),
    },

    fieldWrapper: {
      position: "relative",
      zIndex: 2,
      pointerEvents: "auto",
    },

    labelRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: px(8),
    },

    label: {
      display: "flex",
      alignItems: "center",
      gap: px(6),
      margin: `0 0 ${px(7)}px`,
      color: THEME.text,
      fontSize: px(12.5),
      fontWeight: 800,
      lineHeight: 1.25,
    },

    optionalTag: {
      padding: `${px(2)}px ${px(7)}px`,
      borderRadius: 999,
      background: "#f5f5f4",
      border: `1px solid ${THEME.line}`,
      color: THEME.muted,
      fontSize: px(9),
      fontWeight: 800,
      letterSpacing: 0.3,
    },

    counter: {
      marginBottom: px(7),
      color: THEME.faint,
      fontSize: px(10),
      fontWeight: 700,
      fontVariantNumeric: "tabular-nums",
    },

    countPill: {
      marginBottom: px(7),
      padding: `${px(3)}px ${px(8)}px`,
      borderRadius: 999,
      color: THEME.ink,
      fontSize: px(9.5),
      fontWeight: 900,
      whiteSpace: "nowrap",
    },

    fieldHint: {
      margin: `${px(6)}px 0 0 ${px(2)}px`,
      color: THEME.faint,
      fontSize: px(10.5),
      fontWeight: 500,
      lineHeight: 1.3,
    },

    inputShell: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      gap: px(8),
      height: px(50),
      padding: `0 ${px(12)}px`,
      border: `1.5px solid ${THEME.line}`,
      borderRadius: px(16),
      background: THEME.white,
      boxSizing: "border-box",
      transition: "border-color 220ms ease, box-shadow 220ms ease, background 220ms ease",
    },

    inputShellFocused: {
      borderColor: accent,
      boxShadow: `0 0 0 4px ${accent}26, 0 10px 24px ${accent}1f`,
      background: THEME.white,
    },

    inputShellValid: {
      borderColor: `${THEME.green}99`,
      background: "#f8fdf9",
    },

    inputIcon: {
      width: px(28),
      height: px(28),
      borderRadius: px(9),
      display: "grid",
      placeItems: "center",
      background: "#f5f5f4",
      fontSize: px(14),
      flexShrink: 0,
      filter: "grayscale(1)",
      opacity: 0.7,
      transition: "all 220ms ease",
    },

    inputIconActive: {
      filter: "grayscale(0)",
      opacity: 1,
      background: `${accent}1a`,
    },

    inputPrefix: {
      color: THEME.muted,
      fontSize: px(13),
      fontWeight: 800,
      paddingRight: px(8),
      borderRight: `1px solid ${THEME.line}`,
      flexShrink: 0,
      lineHeight: 1,
    },

    input: {
      flex: 1,
      minWidth: 0,
      height: "100%",
      border: 0,
      padding: 0,
      fontSize: px(13.5),
      fontWeight: 600,
      outline: "none",
      background: "transparent",
      color: THEME.text,
      WebkitTextFillColor: THEME.text,
      boxSizing: "border-box",
      pointerEvents: "auto",
      touchAction: "manipulation",
      userSelect: "text",
      WebkitUserSelect: "text",
      fontFamily: FONT_STACK,
    },

    inputMono: {
      fontFamily:
        '"SF Mono", "JetBrains Mono", Menlo, Consolas, monospace',
      letterSpacing: 0.8,
    },

    validMark: {
      width: px(22),
      height: px(22),
      borderRadius: "50%",
      display: "grid",
      placeItems: "center",
      background: THEME.green,
      color: "white",
      fontSize: px(11),
      fontWeight: 900,
      flexShrink: 0,
      boxShadow: `0 6px 14px ${THEME.green}55`,
    },

    validMarkTextarea: {
      position: "absolute",
      right: px(12),
      bottom: px(12),
      width: px(22),
      height: px(22),
      borderRadius: "50%",
      display: "grid",
      placeItems: "center",
      background: THEME.green,
      color: "white",
      fontSize: px(11),
      fontWeight: 900,
      boxShadow: `0 6px 14px ${THEME.green}55`,
    },

    textareaShell: {
      position: "relative",
      border: `1.5px solid ${THEME.line}`,
      borderRadius: px(16),
      background: THEME.white,
      boxSizing: "border-box",
      transition: "border-color 220ms ease, box-shadow 220ms ease, background 220ms ease",
      overflow: "hidden",
    },

    textarea: {
      display: "block",
      width: "100%",
      minHeight: px(92),
      border: 0,
      padding: px(14),
      fontSize: px(13.5),
      fontWeight: 600,
      outline: "none",
      background: "transparent",
      color: THEME.text,
      WebkitTextFillColor: THEME.text,
      boxSizing: "border-box",
      resize: "vertical",
      fontFamily: FONT_STACK,
      lineHeight: 1.45,
      pointerEvents: "auto",
      touchAction: "manipulation",
      userSelect: "text",
      WebkitUserSelect: "text",
    },

    categoryGrid: {
      display: "grid",
      gridTemplateColumns: veryNarrow ? "1fr" : "repeat(2, minmax(0, 1fr))",
      gap: px(9),
    },

    categoryChip: {
      minHeight: px(44),
      display: "flex",
      alignItems: "center",
      gap: px(8),
      border: `1.5px solid ${THEME.line}`,
      borderRadius: px(15),
      background: "white",
      color: THEME.text,
      fontSize: px(narrow ? 10.5 : 11.5),
      fontWeight: 800,
      cursor: "pointer",
      transition: "all 220ms ease",
      boxShadow: "0 7px 16px rgba(0,0,0,0.04)",
      padding: `0 ${px(10)}px`,
      overflow: "hidden",
      textAlign: "left",
      pointerEvents: "auto",
      fontFamily: FONT_STACK,
    },

    categoryChipHover: {
      borderColor: `${accent}aa`,
      background: `${accent}0d`,
    },

    categoryChipActive: {
      background: "linear-gradient(135deg, #020617, #92400e)",
      color: "white",
      borderColor: "#92400e",
      boxShadow: "0 12px 22px rgba(146,64,14,0.24)",
    },

    chipMark: {
      width: px(20),
      height: px(20),
      borderRadius: px(7),
      display: "grid",
      placeItems: "center",
      background: "#f5f5f4",
      color: THEME.muted,
      fontSize: px(11),
      fontWeight: 900,
      flexShrink: 0,
      transition: "all 220ms ease",
    },

    chipMarkActiveDark: {
      background: "rgba(255,255,255,0.18)",
      color: "white",
    },

    chipMarkActiveGreen: {
      background: THEME.green,
      color: "white",
    },

    chipText: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      minWidth: 0,
    },

    /* ------------------------------------------------------------------ */
    /*  Seller widgets                                                     */
    /* ------------------------------------------------------------------ */
    sellerProductOptions: {
      display: "grid",
      gridTemplateColumns: veryNarrow ? "1fr" : "repeat(2,minmax(0,1fr))",
      gap: px(9),
    },

    sellerProductOption: {
      minHeight: px(66),
      display: "grid",
      gridTemplateColumns: "auto minmax(0,1fr) auto",
      alignItems: "center",
      gap: px(9),
      padding: `0 ${px(10)}px`,
      border: `1.5px solid ${THEME.line}`,
      borderRadius: px(17),
      background: THEME.white,
      color: THEME.stoneMid,
      textAlign: "left",
      cursor: "pointer",
      transition: "all 220ms ease",
      boxShadow: "0 7px 15px rgba(0,0,0,.04)",
      fontFamily: FONT_STACK,
    },

    sellerProductOptionActive: {
      borderColor: THEME.green,
      background: "linear-gradient(135deg,#dcfce7,#f0fdf4)",
      color: "#166534",
      boxShadow: "0 12px 24px rgba(34,197,94,.18)",
      transform: "translateY(-1px)",
    },

    sellerProductIcon: {
      width: px(34),
      height: px(34),
      display: "grid",
      placeItems: "center",
      borderRadius: px(11),
      background: "#f5f5f4",
      fontSize: px(17),
      transition: "all 220ms ease",
    },

    sellerProductIconActive: {
      background: "linear-gradient(145deg,#22c55e,#15803d)",
      boxShadow: "0 8px 16px rgba(34,197,94,.3)",
    },

    sellerProductText: {
      display: "flex",
      flexDirection: "column",
      gap: px(2),
      minWidth: 0,
    },

    sellerProductLabel: {
      fontSize: px(12),
      fontWeight: 900,
      lineHeight: 1.2,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    sellerProductCaption: {
      fontSize: px(9.5),
      fontWeight: 600,
      color: THEME.muted,
      lineHeight: 1.2,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    sellerProductCheck: {
      width: px(20),
      height: px(20),
      borderRadius: "50%",
      display: "grid",
      placeItems: "center",
      border: `1.5px solid ${THEME.line}`,
      color: "white",
      fontSize: px(11),
      fontWeight: 900,
      transition: "all 220ms ease",
    },

    sellerProductCheckActive: {
      background: THEME.green,
      borderColor: THEME.green,
    },

    sandMaterialOptions: {
      display: "grid",
      gridTemplateColumns: "repeat(2,minmax(0,1fr))",
      gap: px(9),
    },

    sandMaterialOption: {
      minHeight: px(46),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: px(8),
      padding: `0 ${px(10)}px`,
      border: `1.5px solid ${THEME.line}`,
      borderRadius: px(15),
      background: THEME.white,
      color: THEME.stoneMid,
      fontSize: px(12),
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: "0 7px 16px rgba(0,0,0,.04)",
      transition: "all 220ms ease",
      fontFamily: FONT_STACK,
    },

    sandMaterialOptionActive: {
      borderColor: THEME.green,
      background: "linear-gradient(135deg,#dcfce7,#f0fdf4)",
      color: "#166534",
      boxShadow: "0 10px 22px rgba(34,197,94,.15)",
    },

    productionTitleRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: px(9),
      marginBottom: px(9),
    },

    productionUnitToggle: {
      flexShrink: 0,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: px(2),
      padding: px(3),
      border: `1px solid ${THEME.line}`,
      borderRadius: 999,
      background: "#f5f5f4",
    },

    productionUnitButton: {
      minHeight: px(28),
      padding: `0 ${px(9)}px`,
      border: 0,
      borderRadius: 999,
      background: "transparent",
      color: THEME.muted,
      fontSize: px(9.5),
      fontWeight: 800,
      whiteSpace: "nowrap",
      cursor: "pointer",
      fontFamily: FONT_STACK,
    },

    productionUnitButtonActive: {
      background: "linear-gradient(135deg,#22c55e,#15803d)",
      color: "white",
      boxShadow: "0 6px 14px rgba(34,197,94,.25)",
    },

    addressGrid: {
      display: "grid",
      gridTemplateColumns: veryNarrow ? "1fr" : "repeat(2,minmax(0,1fr))",
      gap: px(10),
    },

    frequencyGrid: {
      display: "grid",
      gridTemplateColumns: veryNarrow ? "1fr" : "repeat(2, minmax(0, 1fr))",
      gap: px(9),
    },

    frequencyChip: {
      position: "relative",
      height: px(44),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: px(6),
      border: `1.5px solid ${THEME.line}`,
      borderRadius: px(15),
      background: "white",
      color: THEME.text,
      fontSize: px(12),
      fontWeight: 800,
      cursor: "pointer",
      transition: "all 220ms ease",
      boxShadow: "0 7px 16px rgba(0,0,0,0.04)",
      padding: `0 ${px(8)}px`,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      pointerEvents: "auto",
      fontFamily: FONT_STACK,
    },

    frequencyChipActive: {
      color: "#0b1220",
    },

    frequencyDot: {
      width: px(7),
      height: px(7),
      borderRadius: "50%",
      background: "rgba(2,6,23,0.55)",
      flexShrink: 0,
    },

    /* ------------------------------------------------------------------ */
    /*  Bottom panel                                                       */
    /* ------------------------------------------------------------------ */
    bottomPanel: {
      position: "relative",
      zIndex: 20,
      flexShrink: 0,
      width: `calc(100% + ${horizontalPadding * 2}px)`,
      marginLeft: -horizontalPadding,
      marginRight: -horizontalPadding,
      marginTop: "auto",
      padding: `${px(12)}px ${horizontalPadding}px`,
      paddingBottom: `calc(${px(12)}px + env(safe-area-inset-bottom, 0px))`,
      borderRadius: `${px(30)}px ${px(30)}px 0 0`,
      background: "rgba(250,250,249,0.92)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      border: `1px solid ${THEME.lineSoft}`,
      borderBottom: 0,
      boxShadow: "0 -14px 36px rgba(0,0,0,0.10)",
      boxSizing: "border-box",
      pointerEvents: "auto",
    },

    privacyNote: {
      padding: `${px(10)}px ${px(12)}px`,
      borderRadius: px(20),
      background: "linear-gradient(135deg, #fffbeb, #fff7e0)",
      border: `1px solid ${THEME.amberSoft}`,
      display: "flex",
      alignItems: "center",
      gap: px(10),
    },

    lockIcon: {
      width: px(42),
      height: px(42),
      borderRadius: px(15),
      background: "linear-gradient(145deg, #1c1917, #44403c)",
      color: "white",
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
      fontSize: px(18),
      boxShadow: "0 8px 18px rgba(28,25,23,0.28)",
    },

    privacyTitle: {
      margin: 0,
      color: THEME.text,
      fontSize: px(12),
      fontWeight: 900,
      lineHeight: 1.2,
    },

    privacyText: {
      margin: `${px(3)}px 0 0`,
      color: THEME.muted,
      fontSize: px(11),
      lineHeight: 1.35,
      fontWeight: 600,
    },

    submitBtn: {
      position: "relative",
      width: "100%",
      height: px(56),
      marginTop: px(12),
      border: 0,
      borderRadius: px(22),
      color: "white",
      fontSize: px(16.5),
      fontWeight: 900,
      cursor: "pointer",
      transition: "all 260ms ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: px(10),
      overflow: "hidden",
      letterSpacing: -0.2,
      fontFamily: FONT_STACK,
    },

    submitBtnDisabled: {
      background:
        "linear-gradient(135deg, rgba(2,6,23,0.38), rgba(146,64,14,0.38))",
      opacity: 0.55,
      boxShadow: "none",
      cursor: "not-allowed",
    },

    submitBtnBright: {
      background: "linear-gradient(135deg, #020617 0%, #3b2a1a 55%, #92400e 100%)",
      opacity: 1,
      boxShadow:
        "0 18px 38px rgba(146,64,14,0.30), inset 0 1px 0 rgba(255,255,255,0.14)",
    },

    submitLabel: {
      position: "relative",
      zIndex: 1,
    },

    submitArrow: {
      position: "relative",
      zIndex: 1,
      width: px(28),
      height: px(28),
      borderRadius: "50%",
      display: "grid",
      placeItems: "center",
      background: "rgba(255,255,255,0.14)",
      fontSize: px(15),
      lineHeight: 1,
      transition: "opacity 260ms ease",
    },

    signInRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: px(4),
      marginTop: px(10),
    },

    signInText: {
      color: THEME.muted,
      fontSize: px(12.5),
      lineHeight: 1.2,
      fontWeight: 600,
    },

    signInLink: {
      padding: `${px(4)}px ${px(7)}px`,
      border: 0,
      borderRadius: px(8),
      background: "transparent",
      color: "#b45309",
      fontSize: px(12.5),
      lineHeight: 1.2,
      fontWeight: 900,
      textDecoration: "underline",
      textUnderlineOffset: px(3),
      textDecorationThickness: 2,
      cursor: "pointer",
      fontFamily: FONT_STACK,
    },

    /* ------------------------------------------------------------------ */
    /*  Existing account popup                                             */
    /* ------------------------------------------------------------------ */
    popupOverlay: {
      position: "absolute",
      inset: 0,
      zIndex: 200,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: px(18),
      background: "rgba(2,6,23,.74)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
    },

    existingAccountPopup: {
      position: "relative",
      width: "100%",
      maxWidth: px(330),
      overflow: "hidden",
      padding: `${px(26)}px ${px(18)}px ${px(18)}px`,
      border: "1px solid rgba(245,158,11,.30)",
      borderRadius: px(28),
      background: "linear-gradient(145deg,#ffffff,#fffaf0)",
      textAlign: "center",
      boxShadow:
        "0 32px 85px rgba(0,0,0,.42), 0 0 45px rgba(245,158,11,.14)",
    },

    popupGlow: {
      position: "absolute",
      left: "50%",
      top: px(-65),
      width: px(190),
      height: px(135),
      borderRadius: "50%",
      background: "rgba(245,158,11,.24)",
      filter: `blur(${px(30)}px)`,
      transform: "translateX(-50%)",
      pointerEvents: "none",
    },

    accountWarningIcon: {
      position: "relative",
      zIndex: 2,
      width: px(64),
      height: px(64),
      margin: "0 auto",
      display: "grid",
      placeItems: "center",
      border: `${px(5)}px solid #fef3c7`,
      borderRadius: "50%",
      background: "linear-gradient(145deg,#f59e0b,#ea580c)",
      color: "white",
      fontSize: px(29),
      fontWeight: 900,
      boxShadow:
        "0 15px 30px rgba(234,88,12,.27), 0 0 0 8px rgba(245,158,11,.08)",
    },

    popupKicker: {
      position: "relative",
      zIndex: 2,
      margin: `${px(16)}px 0 0`,
      color: "#b45309",
      fontSize: px(9),
      letterSpacing: px(1.4),
      fontWeight: 900,
    },

    popupTitle: {
      position: "relative",
      zIndex: 2,
      margin: `${px(7)}px 0 0`,
      color: THEME.text,
      fontSize: px(22),
      lineHeight: 1.08,
      letterSpacing: -0.5,
      fontWeight: 900,
    },

    popupMessage: {
      position: "relative",
      zIndex: 2,
      maxWidth: px(270),
      margin: `${px(10)}px auto 0`,
      color: "#57534e",
      fontSize: px(13),
      lineHeight: 1.45,
      fontWeight: 500,
    },

    registeredPhone: {
      position: "relative",
      zIndex: 2,
      display: "grid",
      gridTemplateColumns: "auto minmax(0,1fr) auto",
      alignItems: "center",
      gap: px(9),
      marginTop: px(16),
      padding: px(11),
      border: "1px solid #fde68a",
      borderRadius: px(17),
      background: "linear-gradient(145deg,#fffbeb,#fef3c7)",
      textAlign: "left",
    },

    phoneIcon: {
      width: px(38),
      height: px(38),
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
      borderRadius: px(13),
      background: "linear-gradient(145deg,#1c1917,#44403c)",
      color: "#fbbf24",
      fontSize: px(17),
      fontWeight: 900,
    },

    phoneDetails: {
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: px(3),
      color: "#92400e",
      fontSize: px(8),
      letterSpacing: px(0.7),
      fontWeight: 900,
    },

    phoneValue: {
      color: THEME.text,
      fontSize: px(14),
      letterSpacing: 0.4,
      fontVariantNumeric: "tabular-nums",
    },

    registeredCheck: {
      width: px(25),
      height: px(25),
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
      borderRadius: "50%",
      background: THEME.green,
      color: "white",
      fontSize: px(11),
      fontWeight: 900,
    },

    popupActions: {
      position: "relative",
      zIndex: 2,
      display: "grid",
      gridTemplateColumns: "minmax(0,.9fr) minmax(0,1.1fr)",
      gap: px(9),
      marginTop: px(18),
    },

    changeNumberButton: {
      minHeight: px(47),
      padding: `0 ${px(9)}px`,
      border: `1px solid ${THEME.line}`,
      borderRadius: px(17),
      background: THEME.surface,
      color: "#57534e",
      fontSize: px(12),
      fontWeight: 800,
      cursor: "pointer",
      fontFamily: FONT_STACK,
    },

    popupSignInButton: {
      minHeight: px(47),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: px(8),
      padding: `0 ${px(11)}px`,
      border: 0,
      borderRadius: px(17),
      background: "linear-gradient(135deg,#020617,#92400e)",
      color: "white",
      fontSize: px(13),
      fontWeight: 900,
      boxShadow: "0 13px 27px rgba(146,64,14,.25)",
      cursor: "pointer",
      fontFamily: FONT_STACK,
    },
  };
}
