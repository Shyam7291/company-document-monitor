import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  acceptRateQuote,
} from "../api/orderApi";

const BASE_W = 206;
const BASE_H = 445;
const HEADER_BG_IMAGE = "";

// Frontend testing settings.
// Later, these values should come from the backend.
const INITIAL_REQUEST_STATUS = "checking";
const INITIAL_CONTACTED_SELLERS = 8;
const TOTAL_MATCHED_SELLERS = 12;
const INITIAL_SELLER_RESPONSES = 3;
const SIX_HOURS_IN_SECONDS =
  6 * 60 * 60;

const INDIA_OFFSET_MINUTES = 330;

const QUOTE_ACTIVE_START_HOUR = 7;
const QUOTE_ACTIVE_END_HOUR = 21;

function getIndiaTimeParts(value) {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const indiaTime = new Date(
    date.getTime() +
      INDIA_OFFSET_MINUTES *
        60 *
        1000
  );

  return {
    year:
      indiaTime.getUTCFullYear(),

    month:
      indiaTime.getUTCMonth(),

    date:
      indiaTime.getUTCDate(),

    hour:
      indiaTime.getUTCHours(),

    minute:
      indiaTime.getUTCMinutes(),

    second:
      indiaTime.getUTCSeconds(),
  };
}

function createIndiaInstant(
  year,
  month,
  date,
  hour,
  minute = 0,
  second = 0
) {
  return new Date(
    Date.UTC(
      year,
      month,
      date,
      hour,
      minute,
      second
    ) -
      INDIA_OFFSET_MINUTES *
        60 *
        1000
  );
}

function getNextQuoteResumeTime(
  nowValue = new Date()
) {
  const parts =
    getIndiaTimeParts(nowValue);

  if (!parts) {
    return null;
  }

  if (
    parts.hour <
    QUOTE_ACTIVE_START_HOUR
  ) {
    return createIndiaInstant(
      parts.year,
      parts.month,
      parts.date,
      QUOTE_ACTIVE_START_HOUR
    );
  }

  if (
    parts.hour >=
    QUOTE_ACTIVE_END_HOUR
  ) {
    return createIndiaInstant(
      parts.year,
      parts.month,
      parts.date + 1,
      QUOTE_ACTIVE_START_HOUR
    );
  }

  return null;
}

function calculateActiveQuoteSeconds(
  startValue,
  endValue
) {
  let cursor = new Date(startValue);
  const end = new Date(endValue);

  if (
    Number.isNaN(cursor.getTime()) ||
    Number.isNaN(end.getTime()) ||
    cursor >= end
  ) {
    return 0;
  }

  let activeMilliseconds = 0;

  while (cursor < end) {
    const parts =
      getIndiaTimeParts(cursor);

    if (!parts) {
      return 0;
    }

    const activeStart =
      createIndiaInstant(
        parts.year,
        parts.month,
        parts.date,
        QUOTE_ACTIVE_START_HOUR
      );

    const activeEnd =
      createIndiaInstant(
        parts.year,
        parts.month,
        parts.date,
        QUOTE_ACTIVE_END_HOUR
      );

    if (cursor < activeStart) {
      cursor = activeStart;

      if (cursor >= end) {
        break;
      }
    }

    if (cursor >= activeEnd) {
      cursor = createIndiaInstant(
        parts.year,
        parts.month,
        parts.date + 1,
        QUOTE_ACTIVE_START_HOUR
      );

      continue;
    }

    const segmentEnd =
      end < activeEnd
        ? end
        : activeEnd;

    activeMilliseconds +=
      segmentEnd.getTime() -
      cursor.getTime();

    cursor = segmentEnd;

    if (cursor >= activeEnd) {
      const currentParts =
        getIndiaTimeParts(cursor);

      cursor = createIndiaInstant(
        currentParts.year,
        currentParts.month,
        currentParts.date + 1,
        QUOTE_ACTIVE_START_HOUR
      );
    }
  }

  return Math.max(
    0,
    Math.ceil(
      activeMilliseconds / 1000
    )
  );
}

function getQuoteTimerState(
  validUntilValue,
  nowValue = new Date()
) {
  const now =
    nowValue instanceof Date
      ? nowValue
      : new Date(nowValue);

  const validUntil =
    new Date(validUntilValue);

  if (
    Number.isNaN(now.getTime()) ||
    Number.isNaN(
      validUntil.getTime()
    )
  ) {
    return {
      remainingSeconds: 0,
      isPaused: false,
      resumeAt: null,
      isExpired: true,
    };
  }

  if (now >= validUntil) {
    return {
      remainingSeconds: 0,
      isPaused: false,
      resumeAt: null,
      isExpired: true,
    };
  }

  const indiaParts =
    getIndiaTimeParts(now);

  const isPaused =
    indiaParts.hour <
      QUOTE_ACTIVE_START_HOUR ||
    indiaParts.hour >=
      QUOTE_ACTIVE_END_HOUR;

  const resumeAt = isPaused
    ? getNextQuoteResumeTime(now)
    : null;

  return {
    remainingSeconds:
      calculateActiveQuoteSeconds(
        now,
        validUntil
      ),

    isPaused,
    resumeAt,
    isExpired: false,
  };
}

function formatIndiaResumeTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString(
    "en-IN",
    {
      timeZone: "Asia/Kolkata",
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
  );
}


function useViewport() {
  const [viewport, setViewport] = useState({
    width:
      typeof window !== "undefined"
        ? window.innerWidth
        : 390,
    height:
      typeof window !== "undefined"
        ? window.innerHeight
        : 844,
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
    window.addEventListener("orientationchange", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener(
        "orientationchange",
        update
      );
    };
  }, []);

  return viewport;
}
function calculateCheckingSeconds(
  selectedOrder
) {
  const rawCreatedTime =
    selectedOrder?.timestamp ||
    selectedOrder?.createdAt ||
    selectedOrder?.created_at ||
    selectedOrder?.rawCreatedAt;

  if (!rawCreatedTime) {
    return 0;
  }

  const createdTime =
    typeof rawCreatedTime === "number"
      ? rawCreatedTime
      : new Date(
          rawCreatedTime
        ).getTime();

  if (
    !Number.isFinite(createdTime)
  ) {
    return 0;
  }

  const checkingDeadline =
    createdTime +
    SIX_HOURS_IN_SECONDS * 1000;

  return Math.max(
    0,
    Math.ceil(
      (
        checkingDeadline -
        Date.now()
      ) / 1000
    )
  );
}

export default function RateDetailsPage({
  selectedOrder,
  goToPage4,
  goToPage9,
  goToPage8,
}) {
  const viewport = useViewport();

  const styles = useMemo(
    () => createStyles(viewport),
    [viewport.width, viewport.height]
  );

  /*
    requestStatus values:
    checking
    rateReady
  */
  /*
  requestStatus values:
  checking
  rateReady
*/
const isBackendExpired =
  selectedOrder?.rawStatus === "expired";

const requestStatus =
  selectedOrder?.rawStatus === "rate_ready" ||
  isBackendExpired
    ? "rateReady"
    : "checking";

/*
  decision values:
  pending
  accepted
  rejected
*/
const [decision, setDecision] = useState("pending");

const [showRejectPopup, setShowRejectPopup] =
  useState(false);

const [showAcceptPopup, setShowAcceptPopup] =
  useState(false);
const [showMaterialReview, setShowMaterialReview] =
  useState(false);
const [declinedMaterialByKey, setDeclinedMaterialByKey] =
  useState({});
const [referencePreview, setReferencePreview] =
  useState(null);
  const [
    selectedOptionByMaterial,
    setSelectedOptionByMaterial,
  ] = useState({});
  
  const [isAccepting, setIsAccepting] =
    useState(false);

const [contactedSellers] = useState(
  INITIAL_CONTACTED_SELLERS
);

const [sellerResponses] = useState(
  INITIAL_SELLER_RESPONSES
);

// Six-hour timer for finding the best rate
const [
  remainingSeconds,
  setRemainingSeconds,
] = useState(() =>
  calculateCheckingSeconds(
    selectedOrder
  )
);

const [timerNow, setTimerNow] =
  useState(() => Date.now());

const quoteTimerState = useMemo(
  () =>
    getQuoteTimerState(
      selectedOrder?.quote?.validUntil,
      new Date(timerNow)
    ),
  [
    selectedOrder?.quote?.validUntil,
    timerNow,
  ]
);

const acceptanceRemainingSeconds =
  quoteTimerState.remainingSeconds;

const isAcceptanceTimerPaused =
  quoteTimerState.isPaused;

const acceptanceTimerResumeAt =
  quoteTimerState.resumeAt;

const acceptanceTimerResumeText =
  formatIndiaResumeTime(
    acceptanceTimerResumeAt
  );

const trackerRef = useRef(null);

const isChecking =
  requestStatus === "checking";

const isRateReady =
  requestStatus === "rateReady";

  const isAcceptanceExpired =
  isBackendExpired ||
  (
    isRateReady &&
    acceptanceRemainingSeconds <= 0 &&
    decision === "pending"
  );

  const orderItems = Array.isArray(
    selectedOrder?.materials
  )
    ? selectedOrder.materials.map(
        (material) => ({
          product:
            material.materialName ||
            "Stone material",
  
          vehicles: Number(
            material.totalVehicles || 0
          ),
  
          quantity: Number(
            material.totalTons || 0
          ),
          selectedReference:
            material.selectedReference || null,
        })
      )
    : [];
  
  const totalVehicles = Number(
    selectedOrder?.totalVehicles || 0
  );
  
  const totalTons = Number(
    selectedOrder?.totalTons || 0
  );
  const requestId =
  selectedOrder?.requestId ||
  selectedOrder?.id ||
  "Request unavailable";

  const requestedArrivalDate =
  selectedOrder?.requestedArrivalDate || "";

const formattedArrivalDate = (() => {
  if (!requestedArrivalDate) {
    return "Not provided";
  }

  const dateOnly = String(
    requestedArrivalDate
  ).slice(0, 10);

  const dateParts = dateOnly
    .split("-")
    .map(Number);

  if (
    dateParts.length !== 3 ||
    dateParts.some(
      (part) => !Number.isFinite(part)
    )
  ) {
    return "Not provided";
  }

  const [year, month, day] = dateParts;

  const parsedDate = new Date(
    year,
    month - 1,
    day
  );

  if (
    Number.isNaN(parsedDate.getTime())
  ) {
    return "Not provided";
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
})();

const quote = selectedOrder?.quote || null;
const quoteItems = Array.isArray(quote?.items)
  ? quote.items
  : [];
const quoteGroups = useMemo(() => {
  const groups = [];
  const groupByOrderItem = new Map();
  quoteItems.forEach((item) => {
    const groupKey = item.orderItemId || item.materialName || item.id;
    if (!groupByOrderItem.has(groupKey)) {
      const group = {
        key: groupKey,
        orderItemId: item.orderItemId || "",
        materialName: item.materialName || "Quoted material",
        totalTons: Number(item.totalTons || 0),
        totalVehicles: Number(item.totalVehicles || 0),
        options: [],
      };
      groupByOrderItem.set(groupKey, group);
      groups.push(group);
    }
    groupByOrderItem.get(groupKey).options.push(item);
  });
  groups.forEach((group) => {
    group.options.sort((first, second) =>
      Number(first.finalRatePerTon || first.ratePerTon || 0) -
      Number(second.finalRatePerTon || second.ratePerTon || 0)
    );
  });
  return groups;
}, [quoteItems]);
const selectedOptionCount = quoteGroups.filter(
  (group) => Boolean(selectedOptionByMaterial[group.key])
).length;
const hasAtLeastOneSelectedMaterial =
  selectedOptionCount > 0;
const allMaterialDecisionsComplete =
  quoteGroups.length > 0 &&
  quoteGroups.every(
    (group) =>
      Boolean(selectedOptionByMaterial[group.key]) ||
      declinedMaterialByKey[group.key] === true
  );
const commonAdminNote = String(quote?.adminRemarks || "").trim();
console.log("Selected order quote:", quote);



const sellerProgress = Math.min(
  100,
  Math.round(
    (contactedSellers / TOTAL_MATCHED_SELLERS) * 100
  )
);

// Six-hour checking countdown
const countdownHours = String(
  Math.floor(remainingSeconds / 3600)
).padStart(2, "0");

const countdownMinutes = String(
  Math.floor((remainingSeconds % 3600) / 60)
).padStart(2, "0");

const countdownSeconds = String(
  remainingSeconds % 60
).padStart(2, "0");

const countdownText =
  `${countdownHours}:${countdownMinutes}:${countdownSeconds}`;

// Four-hour rate acceptance countdown
const acceptanceHours = String(
  Math.floor(acceptanceRemainingSeconds / 3600)
).padStart(2, "0");

const acceptanceMinutes = String(
  Math.floor(
    (acceptanceRemainingSeconds % 3600) / 60
  )
).padStart(2, "0");

const acceptanceSeconds = String(
  acceptanceRemainingSeconds % 60
).padStart(2, "0");

const acceptanceCountdownText =
  `${acceptanceHours}:${acceptanceMinutes}:${acceptanceSeconds}`;
  const finalStatus =
  decision === "accepted"
    ? {
        label: "Accepted",
        color: "green",
        symbol: "✓",
      }
    : decision === "rejected"
    ? {
        label: "Rejected",
        color: "red",
        symbol: "×",
      }
    : {
        label: "Waiting for your confirmation",
        color: "orange",
        symbol: "",
      };  
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trackerElement = trackerRef.current;

      if (!trackerElement) return;

      if (isChecking) {
        trackerElement.scrollTo({
          left: 70,
          behavior: "smooth",
        });
      } else {
        trackerElement.scrollTo({
          left:
            trackerElement.scrollWidth -
            trackerElement.clientWidth,
          behavior: "smooth",
        });
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [isChecking]);

  useEffect(() => {
    if (
      !isRateReady ||
      decision !== "pending"
    ) {
      return undefined;
    }
  
    setTimerNow(Date.now());
  
    const acceptanceTimer =
      window.setInterval(() => {
        setTimerNow(Date.now());
      }, 1000);
  
    return () => {
      window.clearInterval(
        acceptanceTimer
      );
    };
  }, [
    isRateReady,
    decision,
    selectedOrder?.quote?.validUntil,
  ]);

  useEffect(() => {
    if (!isChecking) {
      return undefined;
    }
  
    const updateCheckingTimer = () => {
      setRemainingSeconds(
        calculateCheckingSeconds(
          selectedOrder
        )
      );
    };
  
    updateCheckingTimer();
  
    const countdownTimer =
      window.setInterval(
        updateCheckingTimer,
        1000
      );
  
    return () => {
      window.clearInterval(
        countdownTimer
      );
    };
  }, [
    isChecking,
    selectedOrder,
  ]);
  

  useEffect(() => {
    if (!isRateReady || quoteGroups.length === 0) return;
    setSelectedOptionByMaterial((current) => {
      const next = { ...current };
      let changed = false;
      quoteGroups.forEach((group) => {
        const savedOption = group.options.find(
          (option) => option.selectedByBuyer
        );
        const preferredOption = savedOption || null;
        if (preferredOption && next[group.key] !== preferredOption.id) {
          next[group.key] = preferredOption.id;
          changed = true;
        }
      });
      return changed ? next : current;
    });
  }, [isRateReady, quoteGroups]);

  const selectQuoteOption = (groupKey, quoteItemId) => {
    if (isAcceptanceExpired || decision !== "pending" || isAccepting) return;
    setSelectedOptionByMaterial((current) => ({
      ...current,
      [groupKey]: quoteItemId,
    }));
    setDeclinedMaterialByKey((current) => {
      if (!current[groupKey]) return current;
      const next = { ...current };
      delete next[groupKey];
      return next;
    });
  };

  const acceptRate = () => {
    if (
      isAcceptanceExpired ||
      decision !== "pending" ||
      isAccepting
    ) {
      return;
    }
    if (!hasAtLeastOneSelectedMaterial) {
      window.alert(
        "Select at least one material reference to continue."
      );
      return;
    }
    setShowMaterialReview(true);
  };

  const markMaterialDeclined = (groupKey) => {
    setSelectedOptionByMaterial((current) => {
      if (!current[groupKey]) return current;
      const next = { ...current };
      delete next[groupKey];
      return next;
    });
    setDeclinedMaterialByKey((current) => ({
      ...current,
      [groupKey]: true,
    }));
  };

  const returnToMaterialSelection = (groupKey) => {
    setDeclinedMaterialByKey((current) => {
      if (!current[groupKey]) return current;
      const next = { ...current };
      delete next[groupKey];
      return next;
    });
    setShowMaterialReview(false);
    window.setTimeout(() => {
      document
        .getElementById(`quote-group-${groupKey}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 80);
  };

  const confirmMaterialDecisions = async () => {
    if (
      !allMaterialDecisionsComplete ||
      !hasAtLeastOneSelectedMaterial ||
      isAccepting
    ) {
      return;
    }
    const materialDecisions = quoteGroups.map((group) => ({
      orderItemId: group.orderItemId,
      decision: selectedOptionByMaterial[group.key]
        ? "accepted"
        : "declined",
      quoteItemId:
        selectedOptionByMaterial[group.key] || null,
    }));

    setIsAccepting(true);
    try {
      const result = await acceptRateQuote(
        requestId,
        materialDecisions
      );
      setDecision("accepted");
      setShowMaterialReview(false);
      setShowAcceptPopup(true);
      console.log(
        "Partial delivery order created:",
        result.deliveryId
      );
    } catch (error) {
      console.error(
        "Unable to accept selected materials:",
        error
      );
      window.alert(
        error.message ||
          "Unable to confirm the selected materials."
      );
    } finally {
      setIsAccepting(false);
    }
  };
  const rejectRate = () => {
    if (isAcceptanceExpired) return;
  
    setDecision("rejected");
    setShowRejectPopup(false);
  };
  

  if (!selectedOrder) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          padding: 24,
          background: "#f6f4ef",
          color: "#292524",
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: 58,
            height: 58,
            display: "grid",
            placeItems: "center",
            borderRadius: 18,
            background: "#fef3c7",
            fontSize: 27,
          }}
        >
          ₹
        </div>
  
        <h2 style={{ margin: 0 }}>
          Request details unavailable
        </h2>
  
        <p
          style={{
            maxWidth: 280,
            margin: 0,
            color: "#78716c",
            lineHeight: 1.5,
          }}
        >
          Return to Recent Orders and select a rate request.
        </p>
  
        <button
          type="button"
          onClick={goToPage9 || goToPage4}
          style={{
            minHeight: 44,
            padding: "0 18px",
            border: 0,
            borderRadius: 16,
            background:
              "linear-gradient(135deg, #f59e0b, #ea580c)",
            color: "white",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          View Recent Orders
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{globalCss}</style>

      <main style={styles.phone}>
        <nav
          style={styles.fixedTopBar}
          aria-label="Rate request navigation"
        >
          <div style={styles.fixedTopBarShade} />
          <div style={styles.fixedTopBarGrid} />
          <div style={styles.fixedTopBarBeam} />
          <div style={styles.fixedTopBarEdge} />
          <button
            type="button"
            style={styles.backButton}
            onClick={goToPage9 || goToPage4}
            aria-label="Back to Home"
          >
            ‹
          </button>
          <div style={styles.topBarIdentity}>
            <div style={styles.topBarMedallion}>
              <span
                style={styles.topBarMedallionRing}
              />
              <span
                style={styles.topBarMedallionMark}
              >
                ₹
              </span>
            </div>
            <div style={styles.topBarTitleBlock}>
              <div style={styles.topBarTitle}>
                RATE REQUEST
              </div>
              <div style={styles.topBarStatusLine}>
                <span
                  style={{
                    ...styles.topBarStatusDot,
                    background: isChecking
                      ? "#fbbf24"
                      : "#22c55e",
                    boxShadow: isChecking
                      ? "0 0 8px rgba(251,191,36,.85)"
                      : "0 0 8px rgba(34,197,94,.85)",
                  }}
                />
                <span
                  style={styles.topBarStatusText}
                >
                  {isChecking
                    ? "Live seller scan"
                    : "Quote ready"}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            style={styles.helpButton}
          >
            <span style={styles.helpButtonIcon}>
              ?
            </span>
            Help
          </button>
        </nav>
        <div
          className="rate-page-scroll"
          style={styles.scrollArea}
        >
          <header style={styles.header}>
            <div style={styles.headerShade} />
            <div style={styles.headerGrid} />

            <div style={styles.heroRow}>
              <div style={{ minWidth: 0 }}>
              <p style={styles.eyebrow}>
  REQUEST ID: {requestId}
</p>

                <h1 style={styles.title}>
                  {isChecking ? (
                    <>
                      Finding Your
                      <br />
                      Best Rate
                    </>
                  ) : (
                    <>
                      Your Best Rate
                      <br />
                      Is Ready
                    </>
                  )}
                </h1>

                <p style={styles.heroText}>
                  {isChecking
                    ? "We’re comparing rates and transport availability with verified sellers near your delivery location."
                    : "Review the quote and accept or reject the seller rate."}
                </p>
              </div>

              <div
                style={{
                  ...styles.rateIcon,
                  ...(isChecking
                    ? styles.rateIconScanning
                    : {}),
                }}
              >
                {isChecking ? "⌕" : "₹"}
              </div>
            </div>
          </header>

          <section style={styles.content}>
            <article style={styles.trackerCard}>
              <p style={styles.trackerHeading}>
                Rate request status
              </p>

              <div
                ref={trackerRef}
                className="tracker-scroll"
                style={styles.trackerViewport}
              >
                <div style={styles.tracker}>
                  <StatusStep
                    styles={styles}
                    label="Request submitted"
                    state="done"
                  />

                  <StatusConnector
                    styles={styles}
                    state="done"
                  />

                  <StatusStep
                    styles={styles}
                    label="Checking with sellers"
                    state={
                      isChecking ? "active" : "done"
                    }
                    symbol={
                      isChecking ? "⌕" : "✓"
                    }
                  />

                  <StatusConnector
                    styles={styles}
                    state={
                      isRateReady
                        ? "done"
                        : "waiting"
                    }
                  />

                  <StatusStep
                    styles={styles}
                    label="Best rate provided"
                    state={
                      isRateReady
                        ? "done"
                        : "waiting"
                    }
                  />

                  <StatusConnector
                    styles={styles}
                    state={
                      isRateReady
                        ? finalStatus.color
                        : "waiting"
                    }
                  />

                  <StatusStep
                    styles={styles}
                    label={
                      isRateReady
                        ? finalStatus.label
                        : "Your confirmation"
                    }
                    state={
                      isRateReady
                        ? finalStatus.color
                        : "waiting"
                    }
                    symbol={
                      isRateReady
                        ? finalStatus.symbol
                        : ""
                    }
                    wide
                  />
                </div>
              </div>
            </article>

            <div style={styles.rateNotice}>
              <div
                style={{
                  ...styles.noticeIcon,
                  ...(isChecking
                    ? styles.noticeIconChecking
                    : {}),
                }}
              >
                {isChecking ? "⌕" : "✓"}
              </div>

              <div style={{ minWidth: 0 }}>
                <b style={styles.noticeTitle}>
                  {isChecking
                    ? "Checking with verified sellers"
                    : "Best rate provided"}
                </b>

                <p style={styles.noticeText}>
                  {isChecking
                    ? "StoneRate is comparing material rates, transport availability and delivery timing."
                    : "The quote is waiting for your confirmation."}
                </p>
              </div>
            </div>

            {isChecking && (
              <>
                <article style={styles.scanningCard}>
                  <div style={styles.scannerArea}>
                    <div style={styles.scannerRingOuter}>
                      <div
                        style={styles.scannerGridLineOne}
                      />

                      <div
                        style={styles.scannerGridLineTwo}
                      />

                      <div
                        style={styles.scannerRingMiddle}
                      >
                        <div
                          style={styles.scannerRingInner}
                        >
                          <span
                            style={styles.scannerCentre}
                          >
                            ₹
                          </span>
                        </div>
                      </div>

                      <div
                        style={styles.scannerBeam}
                      />

                      <span
                        style={{
                          ...styles.sellerDot,
                          ...styles.sellerDotOne,
                        }}
                      />

                      <span
                        style={{
                          ...styles.sellerDot,
                          ...styles.sellerDotTwo,
                        }}
                      />

                      <span
                        style={{
                          ...styles.sellerDot,
                          ...styles.sellerDotThree,
                        }}
                      />

                      <span
                        style={{
                          ...styles.sellerDot,
                          ...styles.sellerDotFour,
                        }}
                      />
                    </div>
                  </div>

                  <div style={styles.scanningText}>
                    <span
                      style={styles.scanningEyebrow}
                    >
                      LIVE SELLER SEARCH
                    </span>

                    <h2 style={styles.scanningTitle}>
                      Scanning nearby sellers
                    </h2>

                    <p
                      style={
                        styles.scanningDescription
                      }
                    >
                      Comparing material price,
                      transport cost and vehicle
                      availability.
                    </p>
                  </div>
                </article>

                <article
                  style={styles.sellerProgressCard}
                >
                  <div
                    style={styles.sellerProgressHeader}
                  >
                    <div>
                      <span
                        style={styles.progressEyebrow}
                      >
                        SELLER OUTREACH
                      </span>

                      <h3
                        style={styles.progressTitle}
                      >
                        {contactedSellers} of{" "}
                        {TOTAL_MATCHED_SELLERS} sellers
                        contacted
                      </h3>
                    </div>

                    <div
                      style={
                        styles.progressPercentage
                      }
                    >
                      {sellerProgress}%
                    </div>
                  </div>

                  <div
                    style={
                      styles.sellerProgressTrack
                    }
                  >
                    <div
                      style={{
                        ...styles.sellerProgressFill,
                        width: `${sellerProgress}%`,
                      }}
                    />
                  </div>

                  <div
                    style={styles.sellerMetricGrid}
                  >
                    <div
                      style={styles.sellerMetric}
                    >
                      <span>Matched</span>
                      <b>
                        {TOTAL_MATCHED_SELLERS}
                      </b>
                    </div>

                    <div
                      style={styles.sellerMetric}
                    >
                      <span>Contacted</span>
                      <b>{contactedSellers}</b>
                    </div>

                    <div
                      style={styles.sellerMetric}
                    >
                      <span>Responses</span>
                      <b>{sellerResponses}</b>
                    </div>
                  </div>
                </article>

                <article style={styles.countdownCard}>
                  <div style={styles.countdownIcon}>
                    ◷
                  </div>

                  <div
                    style={styles.countdownContent}
                  >
                    <span
                      style={styles.countdownLabel}
                    >
                      ESTIMATED UPDATE WITHIN
                    </span>

                    {remainingSeconds > 0 ? (
                      <strong
                        style={
                          styles.countdownValue
                        }
                      >
                        {countdownText}
                      </strong>
                    ) : (
                      <strong
                        style={
                          styles.countdownExpired
                        }
                      >
                        Follow-up in progress
                      </strong>
                    )}

                    <p
                      style={
                        styles.countdownDescription
                      }
                    >
                      {remainingSeconds > 0
                        ? "We aim to provide the best available rate before this timer ends."
                        : "The rate check is taking longer than expected. We’re following up with sellers and will notify you as soon as possible."}
                    </p>
                  </div>
                </article>

                <article
                  style={styles.comparisonCard}
                >
                  <div
                    style={styles.comparisonHeader}
                  >
                    <div>
                      <span
                        style={styles.progressEyebrow}
                      >
                        RATE COMPARISON
                      </span>

                      <h3
                        style={styles.comparisonTitle}
                      >
                        What StoneRate is checking
                      </h3>
                    </div>

                    <span style={styles.liveBadge}>
                      <span
                        style={styles.liveBadgeDot}
                      />
                      Live
                    </span>
                  </div>

                  <ComparisonRow
                    styles={styles}
                    label="Material availability"
                    status="Checked"
                    state="done"
                  />

                  <ComparisonRow
                    styles={styles}
                    label="Seller price per ton"
                    status="Checking"
                    state="active"
                  />

                  <ComparisonRow
                    styles={styles}
                    label="Vehicle availability"
                    status="Checking"
                    state="active"
                  />

                  <ComparisonRow
                    styles={styles}
                    label="Transport cost"
                    status="Waiting"
                    state="waiting"
                  />

                  <ComparisonRow
                    styles={styles}
                    label="Delivery timing"
                    status="Waiting"
                    state="waiting"
                    last
                  />
                </article>

                <div
                  style={styles.notificationCard}
                >
                  <div
                    style={styles.notificationIcon}
                  >
                    🔔
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <b
                      style={
                        styles.notificationTitle
                      }
                    >
                      We’ll notify you when the rate
                      is ready
                    </b>

                    <p
                      style={
                        styles.notificationText
                      }
                    >
                      You can leave this page. Seller
                      outreach will continue in the
                      background.
                    </p>
                  </div>
                </div>
              </>
            )}

{isRateReady && (
  <>
    {decision === "pending" && (
      <article
        style={{
          ...styles.acceptanceTimerCard,
          ...(isAcceptanceExpired
            ? styles.acceptanceTimerCardExpired
            : {}),
        }}
      >
        <div
          style={{
            ...styles.acceptanceTimerIcon,
            ...(isAcceptanceExpired
              ? styles.acceptanceTimerIconExpired
              : {}),
          }}
        >
          {isAcceptanceExpired ? "!" : "◷"}
        </div>

        <div style={styles.acceptanceTimerContent}>
          <span
            style={{
              ...styles.acceptanceTimerLabel,
              ...(isAcceptanceExpired
                ? styles.acceptanceTimerLabelExpired
                : {}),
            }}
          >
            {isAcceptanceExpired
  ? "RESPONSE WINDOW CLOSED"
  : isAcceptanceTimerPaused
    ? "TIMER PAUSED OVERNIGHT"
    : "RATE RESERVED FOR"}
          </span>

          {isAcceptanceExpired ? (
            <strong
              style={styles.acceptanceExpiredTitle}
            >
              Response time expired
            </strong>
          ) : (
            <>
  <strong
    style={{
      ...styles.acceptanceTimerValue,
      ...(isAcceptanceTimerPaused
        ? styles.acceptanceTimerValuePaused
        : {}),
    }}
  >
    {acceptanceCountdownText}
  </strong>

  {isAcceptanceTimerPaused &&
    acceptanceTimerResumeText && (
      <span
        style={
          styles.acceptanceResumeText
        }
      >
        Resumes{" "}
        {acceptanceTimerResumeText}
      </span>
    )}
</>
          )}

          <p
            style={{
              ...styles.acceptanceTimerDescription,
              ...(isAcceptanceExpired
                ? styles.acceptanceTimerDescriptionExpired
                : {}),
            }}
          >
            {isAcceptanceExpired
  ? "No response was received within the four usable-hour response window. This quotation is no longer available for acceptance."
  : isAcceptanceTimerPaused
    ? "The quotation timer is paused between 9:00 PM and 7:00 AM, so you receive valid daytime hours to review and respond."
    : "Please accept or reject this rate before the timer ends. The timer pauses daily between 9:00 PM and 7:00 AM."}
          </p>
        </div>
      </article>
    )}

    <div style={styles.sectionHeading}>
      <div>
        <p style={styles.sectionEyebrow}>
          QUOTE DETAILS
        </p>

        <h2 style={styles.sectionTitle}>
          Rate summary
        </h2>
      </div>

      <div
        style={{
          ...styles.validPill,
          ...(isAcceptanceExpired
            ? styles.expiredPill
            : {}),
        }}
      >
        {isAcceptanceExpired
  ? "Expired"
  : isAcceptanceTimerPaused
    ? "Timer paused"
    : "4 usable hours"}
      </div>
    </div>

    {commonAdminNote && (
      <article style={styles.adminNoteCard}>
        <div style={styles.adminNoteIcon}>i</div>
        <div style={{ minWidth: 0 }}>
          <span style={styles.adminNoteLabel}>MESSAGE FROM STONERATE</span>
          <p style={styles.adminNoteText}>{commonAdminNote}</p>
        </div>
      </article>
    )}
    {quoteGroups.map((group, groupIndex) => (
      <section id={`quote-group-${group.key}`} key={group.key} style={{ ...styles.optionGroup, marginTop: groupIndex === 0 ? 0 : 14 }}>
        <div style={styles.optionGroupHeader}>
          <div>
            <span style={styles.optionGroupEyebrow}>OPTIONAL: CHOOSE ONE REFERENCE</span>
            <h3 style={styles.optionGroupTitle}>{group.materialName}</h3>
            <p style={styles.optionGroupMeta}>
              {group.totalTons} tons • {group.totalVehicles} {group.totalVehicles === 1 ? "vehicle" : "vehicles"}
            </p>
          </div>
          <span style={{ ...styles.groupSelectionPill, ...(selectedOptionByMaterial[group.key] ? styles.groupSelectionPillDone : {}) }}>
            {selectedOptionByMaterial[group.key]
              ? "Selected"
              : declinedMaterialByKey[group.key]
                ? "Not required"
                : `${group.options.length} options`}
          </span>
        </div>
        <div style={styles.optionStack}>
          {group.options.map((quoteItem, optionIndex) => {
            const selected = selectedOptionByMaterial[group.key] === quoteItem.id;
            const reference = {
              sampleCode: quoteItem.sampleCode || "",
              imageUrl: quoteItem.imageUrl || "",
              thumbnailUrl: quoteItem.thumbnailUrl || quoteItem.imageUrl || "",
              sourceArea: quoteItem.sourceArea || "",
              adminNote: quoteItem.remarks || "",
            };
            const displayRate = Number(quoteItem.finalRatePerTon || quoteItem.ratePerTon || 0);
            return (
              <article key={quoteItem.id || `${group.key}-${optionIndex}`} style={{ ...styles.quoteCard, ...(selected ? styles.quoteCardSelected : {}), ...(isAcceptanceExpired ? styles.quoteCardExpired : {}) }}>
                <div style={styles.quoteGlow} />
                <button type="button" style={styles.optionSelectSurface} onClick={() => selectQuoteOption(group.key, quoteItem.id)} disabled={isAcceptanceExpired || decision !== "pending"} aria-pressed={selected}>
                  <span style={{ ...styles.optionRadio, ...(selected ? styles.optionRadioSelected : {}) }}>{selected ? "✓" : ""}</span>
                  <span style={styles.optionChoiceText}>{selected ? "Selected option" : `Option ${optionIndex + 1}`}</span>
                  {optionIndex === 0 && <span style={styles.lowestRateBadge}>LOWEST RATE</span>}
                </button>
                <div style={styles.optionBody}>
                  {reference.imageUrl ? (
                    <button type="button" style={styles.optionImageButton} onClick={() => setReferencePreview({ materialName: group.materialName, selectedReference: reference })}>
                      <img src={reference.thumbnailUrl || reference.imageUrl} alt={`${group.materialName} reference ${optionIndex + 1}`} style={styles.optionImage} loading="lazy" />
                      <span style={styles.optionImageZoom}>View</span>
                    </button>
                  ) : <div style={styles.optionImageFallback}>🪨</div>}
                  <div style={styles.optionMainInfo}>
                    <span style={styles.optionSampleLabel}>REFERENCE</span>
                    <b style={styles.optionSampleCode}>{reference.sampleCode || `Option ${optionIndex + 1}`}</b>
                    <span style={styles.optionSource}>{reference.sourceArea || "Source not specified"}</span>
                    <div style={styles.optionRateRow}><b>₹{displayRate.toLocaleString("en-IN")}</b><span>/ ton</span></div>
                  </div>
                </div>
                <div style={styles.quoteMetaGrid}>
                  <div style={styles.quoteMetaItem}><span>Quantity</span><b>{group.totalTons} tons</b></div>
                  <div style={styles.quoteMetaItem}><span>Vehicles</span><b>{group.totalVehicles}</b></div>
                  <div style={styles.quoteMetaItem}><span>Transport</span><b>{quoteItem.transportIncluded ? "Included" : "Not included"}</b></div>
                </div>
                <div style={styles.estimatedRow}><span>Estimated order value</span><b>₹{(displayRate * group.totalTons).toLocaleString("en-IN")}</b></div>
                {quoteItem.remarks && <div style={styles.optionNote}><b>Option note</b><span>{quoteItem.remarks}</span></div>}
              </article>
            );
          })}
        </div>
      </section>
    ))}
</>
)}
            <div style={styles.sectionHeading}>
              <div>
                <p style={styles.sectionEyebrow}>
                  REQUEST DETAILS
                </p>

                <h2 style={styles.sectionTitle}>
                  Order summary
                </h2>
              </div>

              <div style={styles.requestPill}>
                {totalTons} tons
              </div>
            </div>

            <article style={styles.tableCard}>
              <div style={styles.tableHeader}>
                <span>Product</span>
                <span>Vehicle</span>
                <span>Qty.</span>
              </div>

              {orderItems.map((item, index) => (
                <React.Fragment
                  key={item.product}
                >
                  {index > 0 && (
                    <div
                      style={styles.tableDivider}
                    />
                  )}

                  <div style={styles.tableRow}>
                    <div style={styles.productCell}>
                      {item.selectedReference?.imageUrl ? (
                        <button
                          type="button"
                          style={styles.referenceThumbButton}
                          onClick={() => setReferencePreview({
                            materialName: item.product,
                            selectedReference: item.selectedReference,
                          })}
                          aria-label={`View selected reference for ${item.product}`}
                        >
                          <img
                            src={item.selectedReference.thumbnailUrl || item.selectedReference.imageUrl}
                            alt={`${item.product} selected reference`}
                            style={styles.referenceThumbImage}
                            loading="lazy"
                          />
                          <span style={styles.referenceZoom}>⌕</span>
                        </button>
                      ) : (
                        <span style={styles.productIcon}>🪨</span>
                      )}
                      <span style={styles.productTextWrap}>
                        <b>{item.product}</b>
                        {item.selectedReference?.sampleCode && (
                          <small style={styles.sampleCodeText}>
                            {item.selectedReference.sampleCode}
                          </small>
                        )}
                      </span>
                    </div>

                    <div style={styles.vehicleCell}>
  <b>{item.vehicles}</b>
</div>

                    <div style={styles.qtyCell}>
                      <b>{item.quantity}</b>
                      <span>tons</span>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </article>

            <article style={styles.deliveryCard}>
              <div style={styles.deliveryIcon}>
                📅
              </div>

              <div
                style={{
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <span style={styles.detailLabel}>
                  Expected delivery
                </span>

                <b style={styles.deliveryDate}>
  {formattedArrivalDate}
</b>
              </div>

              <div style={styles.deliveryStatus}>
                Scheduled
              </div>
            </article>

            {isRateReady &&
              decision === "accepted" && (
                <div style={styles.acceptedCard}>
                  <div
                    style={styles.acceptedIcon}
                  >
                    ✓
                  </div>

                  <div>
                    <b>Rate accepted</b>

                    <p>
                      Continue to the
                      supplier-details page to review
                      and confirm the seller.
                    </p>
                  </div>
                </div>
              )}

            {isRateReady &&
              decision === "rejected" && (
                <div style={styles.rejectedCard}>
                  <div
                    style={styles.rejectedIcon}
                  >
                    ×
                  </div>

                  <div>
                    <b>Rate rejected</b>

                    <p>
                      This quote will not be used to
                      place the order.
                    </p>
                  </div>
                </div>
              )}

            

            <div style={styles.bottomSpacer} />
          </section>
        </div>

        <footer style={styles.fixedFooter}>
          {isChecking && (
            <>
              <div
                style={styles.checkingFooterHint}
              >
                <span
                  style={styles.checkingFooterDot}
                />

                <span>
                  Seller outreach is currently in
                  progress
                </span>
              </div>

              <button
                type="button"
                style={styles.checkingButton}
                disabled
              >
                <span
                  style={styles.footerSpinner}
                >
                  ⌕
                </span>

                Checking Best Rates...
              </button>
            </>
          )}

{isRateReady &&
  decision === "pending" &&
  !isAcceptanceExpired && (
              <>
                <div style={styles.footerHint}>
                  <span>🛡️</span>

                  <span>
                    {hasAtLeastOneSelectedMaterial
                      ? `${selectedOptionCount} material(s) selected. Review the remaining materials before confirming.`
                      : "Select at least one material reference to continue."}
                  </span>
                </div>

                <div
                  style={styles.footerButtons}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setShowRejectPopup(true)
                    }
                    style={styles.rejectButton}
                  >
                    <span>×</span>
                    Reject Rate
                  </button>

                  <button
                    type="button"
                    onClick={acceptRate}
                    disabled={!hasAtLeastOneSelectedMaterial || isAccepting}
                    style={{
                      ...styles.acceptButton,
                      ...(!hasAtLeastOneSelectedMaterial || isAccepting ? styles.acceptButtonDisabled : {}),
                    }}
                  >
                    <span>✓</span>
                    {isAccepting ? "Confirming..." : "Review Selection"}
                  </button>
                </div>
              </>
            )}

{isRateReady &&
  decision === "pending" &&
  isAcceptanceExpired && (
    <>
      <div style={styles.expiredFooterHint}>
        <span>!</span>

        <span>
        No response was received within four usable hours
        </span>
      </div>

      <button
        type="button"
        style={styles.expiredFooterButton}
        disabled
      >
        Response Time Expired
      </button>
    </>
  )}  

          {isRateReady &&
            decision === "accepted" && (
              <>
                <div
                  style={styles.footerHintGreen}
                >
                  <span>✓</span>
                  <span>
                    Rate accepted successfully
                  </span>
                </div>

                <button
  type="button"
  style={styles.nextPageButton}
  onClick={goToPage8}
>
  View Active Order
  <b>›</b>
</button>
              </>
            )}

          {isRateReady &&
            decision === "rejected" && (
              <>
                <div
                  style={styles.footerHintRed}
                >
                  <span>×</span>

                  <span>
                    This rate has been rejected
                  </span>
                </div>

                <button
                  type="button"
                  style={
                    styles.rejectedOnlyButton
                  }
                  disabled
                >
                  Rate Rejected
                </button>
              </>
            )}
        </footer>

        {referencePreview && (
          <ReferencePreview
            materialName={referencePreview.materialName}
            reference={referencePreview.selectedReference}
            requestId={requestId}
            onClose={() => setReferencePreview(null)}
            styles={styles}
          />
        )}
        {showRejectPopup && (
          <div style={styles.popupOverlay}>
            <div style={styles.rejectPopup}>
              <div style={styles.warningIcon}>
                !
              </div>

              <h2 style={styles.popupTitle}>
                Reject this rate?
              </h2>

              <p style={styles.popupText}>
                The quote will be marked as rejected
                and will not be used to place this
                order.
              </p>

              <div style={styles.popupButtons}>
                <button
                  type="button"
                  onClick={() =>
                    setShowRejectPopup(false)
                  }
                  style={styles.cancelButton}
                >
                  Keep Rate
                </button>

                <button
                  type="button"
                  onClick={rejectRate}
                  style={
                    styles.confirmRejectButton
                  }
                >
                  Yes, Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {showMaterialReview && (
          <div
            style={{
              ...styles.popupOverlay,
              alignItems: "flex-end",
              padding: 0,
              background: "rgba(2,6,23,.68)",
              backdropFilter: "blur(10px)",
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-label="Review material selection"
              style={{
                width: "100%",
                height: "calc(100% - 8px)",
                maxWidth: "none",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,.7)",
                borderBottom: 0,
                borderRadius: "28px 28px 0 0",
                background:
                  "linear-gradient(180deg,#ffffff 0%,#fbfcff 55%,#f7f8fb 100%)",
                boxShadow: "0 -24px 70px rgba(2,6,23,.38)",
                animation: "reviewSheetUp 260ms cubic-bezier(.22,.8,.28,1)",
              }}
            >
              <header
                style={{
                  position: "relative",
                  flexShrink: 0,
                  padding: "8px 16px 10px",
                  borderBottom: "1px solid #e8edf4",
                  background: "rgba(255,255,255,.96)",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 5,
                    margin: "0 auto 8px",
                    borderRadius: 999,
                    background: "#cbd5e1",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <span
                      style={{
                        display: "block",
                        color: "#b45309",
                        fontSize: 9,
                        fontWeight: 950,
                        letterSpacing: 1.1,
                      }}
                    >
                      FINAL MATERIAL REVIEW
                    </span>
                    <h2
                      style={{
                        margin: "4px 0 0",
                        color: "#0f172a",
                        fontSize: 18,
                        lineHeight: 1.1,
                        fontWeight: 950,
                      }}
                    >
                      Review your order
                    </h2>
                    <p
                      style={{
                        margin: "5px 0 0",
                        color: "#64748b",
                        fontSize: 11,
                        lineHeight: 1.35,
                      }}
                    >
                      Confirm every material before creating the Active Order.
                    </p>
                  </div>
                  <div
                    style={{
                      minWidth: 66,
                      padding: "7px 9px",
                      border: "1px solid #dbeafe",
                      borderRadius: 13,
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      textAlign: "center",
                    }}
                  >
                    <b style={{ display: "block", fontSize: 14 }}>
                      {quoteGroups.filter(
                        (group) =>
                          selectedOptionByMaterial[group.key] ||
                          declinedMaterialByKey[group.key]
                      ).length}
                      /{quoteGroups.length}
                    </b>
                    <span style={{ fontSize: 8, fontWeight: 900 }}>
                      DECIDED
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    height: 4,
                    marginTop: 8,
                    overflow: "hidden",
                    borderRadius: 999,
                    background: "#e2e8f0",
                  }}
                >
                  <div
                    style={{
                      width: `${
                        quoteGroups.length
                          ? (quoteGroups.filter(
                              (group) =>
                                selectedOptionByMaterial[group.key] ||
                                declinedMaterialByKey[group.key]
                            ).length /
                              quoteGroups.length) *
                            100
                          : 0
                      }%`,
                      height: "100%",
                      borderRadius: 999,
                      background:
                        "linear-gradient(90deg,#f59e0b,#22c55e)",
                      transition: "width 220ms ease",
                    }}
                  />
                </div>
              </header>

              <div
                className="material-review-scroll"
                style={{
                  flex: 1,
                  minHeight: 0,
                  display: "grid",
                  alignContent: "start",
                  gap: 8,
                  overflowY: "auto",
                  padding: "10px 12px 10px",
                  scrollbarWidth: "none",
                }}
              >
                {[...quoteGroups]
                  .sort((first, second) => {
                    const firstPending =
                      !selectedOptionByMaterial[first.key] &&
                      !declinedMaterialByKey[first.key];
                    const secondPending =
                      !selectedOptionByMaterial[second.key] &&
                      !declinedMaterialByKey[second.key];
                    return Number(secondPending) - Number(firstPending);
                  })
                  .map((group) => {
                    const selectedId =
                      selectedOptionByMaterial[group.key];
                    const selectedOption = group.options.find(
                      (option) => option.id === selectedId
                    );
                    const declined =
                      declinedMaterialByKey[group.key] === true;
                    const displayRate = Number(
                      selectedOption?.finalRatePerTon ||
                        selectedOption?.ratePerTon ||
                        0
                    );
                    const estimatedValue =
                      displayRate * Number(group.totalTons || 0);

                    return (
                      <article
                        key={group.key}
                        style={{
                          position: "relative",
                          overflow: "visible",
                          padding: 12,
                          border: selectedOption
                            ? "1px solid #86efac"
                            : declined
                              ? "1px solid #fecaca"
                              : "1px solid #fcd34d",
                          borderRadius: 18,
                          background: selectedOption
                            ? "linear-gradient(145deg,#f0fdf4,#ffffff)"
                            : declined
                              ? "linear-gradient(145deg,#fff7f7,#ffffff)"
                              : "linear-gradient(145deg,#fffbeb,#ffffff)",
                          boxShadow: selectedOption
                            ? "0 10px 24px rgba(21,128,61,.09)"
                            : "0 8px 20px rgba(15,23,42,.055)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: 10,
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <h3
                              style={{
                                margin: 0,
                                color: "#0f172a",
                                fontSize: 14,
                                lineHeight: 1.2,
                                fontWeight: 950,
                              }}
                            >
                              {group.materialName}
                            </h3>
                            <span
                              style={{
                                display: "block",
                                marginTop: 4,
                                color: "#64748b",
                                fontSize: 10,
                              }}
                            >
                              {group.totalTons} tons · {group.totalVehicles}{" "}
                              {group.totalVehicles === 1
                                ? "vehicle"
                                : "vehicles"}
                            </span>
                          </div>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              flexShrink: 0,
                              padding: "5px 8px",
                              borderRadius: 999,
                              background: selectedOption
                                ? "#dcfce7"
                                : declined
                                  ? "#fee2e2"
                                  : "#fef3c7",
                              color: selectedOption
                                ? "#15803d"
                                : declined
                                  ? "#b91c1c"
                                  : "#a16207",
                              fontSize: 8,
                              fontWeight: 950,
                            }}
                          >
                            {selectedOption
                              ? "✓ INCLUDED"
                              : declined
                                ? "× NOT REQUIRED"
                                : "• DECISION REQUIRED"}
                          </span>
                        </div>

                        {selectedOption ? (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "50px minmax(0,1fr) auto",
                              alignItems: "center",
                              gap: 10,
                              marginTop: 11,
                              padding: 9,
                              border: "1px solid #dcfce7",
                              borderRadius: 14,
                              background: "rgba(255,255,255,.82)",
                            }}
                          >
                            {selectedOption.thumbnailUrl ||
                            selectedOption.imageUrl ? (
                              <img
                                src={
                                  selectedOption.thumbnailUrl ||
                                  selectedOption.imageUrl
                                }
                                alt={`${group.materialName} selected reference`}
                                style={{
                                  width: 50,
                                  height: 50,
                                  display: "block",
                                  borderRadius: 12,
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 50,
                                  height: 50,
                                  display: "grid",
                                  placeItems: "center",
                                  borderRadius: 12,
                                  background: "#ecfdf5",
                                  fontSize: 22,
                                }}
                              >
                                🪨
                              </div>
                            )}
                            <div style={{ minWidth: 0 }}>
                              <b
                                style={{
                                  display: "block",
                                  overflow: "hidden",
                                  color: "#0f172a",
                                  fontSize: 12,
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {selectedOption.sampleCode ||
                                  "Selected reference"}
                              </b>
                              <span
                                style={{
                                  display: "block",
                                  marginTop: 3,
                                  overflow: "hidden",
                                  color: "#64748b",
                                  fontSize: 10,
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {selectedOption.sourceArea ||
                                  "Source not specified"}
                              </span>
                              <b
                                style={{
                                  display: "block",
                                  marginTop: 5,
                                  color: "#15803d",
                                  fontSize: 12,
                                }}
                              >
                                ₹{displayRate.toLocaleString("en-IN")} / ton
                              </b>
                            </div>
                            <div
                              style={{
                                textAlign: "right",
                                color: "#475569",
                              }}
                            >
                              <span
                                style={{
                                  display: "block",
                                  fontSize: 8,
                                  fontWeight: 850,
                                }}
                              >
                                EST. TOTAL
                              </span>
                              <b
                                style={{
                                  display: "block",
                                  marginTop: 3,
                                  color: "#0f172a",
                                  fontSize: 11,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                ₹{estimatedValue.toLocaleString("en-IN")}
                              </b>
                            </div>
                          </div>
                        ) : declined ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 10,
                              marginTop: 10,
                              padding: "9px 10px",
                              borderRadius: 12,
                              background: "#fff1f2",
                            }}
                          >
                            <span
                              style={{
                                color: "#991b1b",
                                fontSize: 10,
                                lineHeight: 1.35,
                              }}
                            >
                              Excluded from Active Order. Kept in Rate Request history.
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                returnToMaterialSelection(group.key)
                              }
                              style={{
                                flexShrink: 0,
                                minHeight: 32,
                                padding: "0 10px",
                                border: "1px solid #fecaca",
                                borderRadius: 10,
                                background: "white",
                                color: "#b91c1c",
                                fontSize: 9,
                                fontWeight: 900,
                                cursor: "pointer",
                              }}
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <div style={{ marginTop: 10 }}>
                            <p
                              style={{
                                margin: 0,
                                color: "#78350f",
                                fontSize: 11,
                                lineHeight: 1.4,
                                fontWeight: 700,
                              }}
                            >
                              Add this material to your Active Order?
                            </p>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1.12fr .88fr",
                                gap: 8,
                                marginTop: 9,
                              }}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  returnToMaterialSelection(group.key)
                                }
                                style={{
                                  minWidth: 0,
                                  minHeight: 40,
                                  padding: "0 8px",
                                  border: "1px solid #f59e0b",
                                  borderRadius: 12,
                                  background: "white",
                                  color: "#92400e",
                                  fontSize: 10,
                                  fontWeight: 950,
                                  whiteSpace: "nowrap",
                                  cursor: "pointer",
                                }}
                              >
                                Choose Reference
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  markMaterialDeclined(group.key)
                                }
                                style={{
                                  minWidth: 0,
                                  minHeight: 40,
                                  padding: "0 8px",
                                  border: "1px solid #fecaca",
                                  borderRadius: 12,
                                  background: "#fff7f7",
                                  color: "#b91c1c",
                                  fontSize: 10,
                                  fontWeight: 950,
                                  whiteSpace: "nowrap",
                                  cursor: "pointer",
                                }}
                              >
                                Not Required
                              </button>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
              </div>

              <div
                role="group"
                aria-label="Review actions"
                style={{
                  flexShrink: 0,
                  display: "grid",
                  gridTemplateColumns: ".72fr 1.28fr",
                  gap: 9,
                  padding:
                    "9px 12px calc(env(safe-area-inset-bottom,0px) + 9px)",
                  borderTop: "1px solid #e2e8f0",
                  background: "rgba(255,255,255,.93)",
                  backdropFilter: "blur(16px)",
                  boxShadow: "0 -12px 30px rgba(15,23,42,.08)",
                }}
              >
                <button
                  type="button"
                  disabled={isAccepting}
                  onClick={() => setShowMaterialReview(false)}
                  style={{
                    minHeight: 46,
                    border: "1px solid #dbe1ea",
                    borderRadius: 14,
                    background: "white",
                    color: "#475569",
                    fontSize: 12,
                    fontWeight: 950,
                    cursor: "pointer",
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={
                    !allMaterialDecisionsComplete ||
                    !hasAtLeastOneSelectedMaterial ||
                    isAccepting
                  }
                  onClick={confirmMaterialDecisions}
                  style={{
                    minHeight: 46,
                    border: 0,
                    borderRadius: 14,
                    background:
                      allMaterialDecisionsComplete &&
                      hasAtLeastOneSelectedMaterial
                        ? "linear-gradient(135deg,#22c55e,#15803d)"
                        : "#cbd5e1",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 950,
                    boxShadow:
                      allMaterialDecisionsComplete &&
                      hasAtLeastOneSelectedMaterial
                        ? "0 11px 24px rgba(21,128,61,.22)"
                        : "none",
                    cursor:
                      allMaterialDecisionsComplete &&
                      hasAtLeastOneSelectedMaterial
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  {isAccepting
                    ? "Confirming..."
                    : `Confirm ${selectedOptionCount} ${
                        selectedOptionCount === 1
                          ? "Material"
                          : "Materials"
                      }`}
                </button>
              </div>
            </section>
          </div>
        )}
        {showAcceptPopup && (
          <div style={styles.popupOverlay}>
            <div style={styles.acceptPopup}>
              <div style={styles.popupGlow} />

              <div style={styles.greenTick}>
                ✓
              </div>

              <h2 style={styles.popupTitle}>
                Rate Accepted
              </h2>

              <p style={styles.popupText}>
                Your selected materials have been confirmed. Materials marked as not required were excluded from the Active Order.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowAcceptPopup(false)
                }
                style={styles.doneButton}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ReferencePreview({ materialName, reference, requestId, onClose, styles }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const handler = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div style={styles.referenceOverlay} role="presentation" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`${materialName} selected material reference`}
        style={styles.referenceDialog}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={styles.referencePreviewTop}>
          <div>
            <span style={styles.referencePreviewEyebrow}>SELECTED MATERIAL REFERENCE</span>
            <h2 style={styles.referencePreviewTitle}>{materialName}</h2>
          </div>
          <button type="button" style={styles.referenceCloseButton} onClick={onClose} aria-label="Close material reference preview">×</button>
        </div>
        <div style={styles.referenceImageArea}>
          {!imageFailed && reference?.imageUrl ? (
            <img
              src={reference.imageUrl}
              alt={`${materialName} selected material reference`}
              style={styles.referenceLargeImage}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div style={styles.referenceImageFallback}><span>🪨</span><b>Image unavailable</b></div>
          )}
        </div>
        <div style={styles.referenceDetails}>
          <div style={styles.referenceDetailRow}><span>Sample</span><b>{reference?.sampleCode || "Not provided"}</b></div>
          <div style={styles.referenceDetailRow}><span>Source</span><b>{reference?.sourceArea || "Not provided"}</b></div>
          <div style={styles.referenceDetailRow}><span>Request</span><b>{requestId}</b></div>
          {reference?.adminNote && (
            <div style={styles.referenceNote}><span>REFERENCE NOTE</span><p>{reference.adminNote}</p></div>
          )}
          <p style={styles.referenceDisclaimer}>
            This image is a visual material reference. Natural variation, lighting, moisture and dust may affect final appearance.
          </p>
        </div>
      </section>
    </div>
  );
}

function StatusStep({
  styles,
  label,
  state,
  symbol,
  wide,
}) {
  const circleStyle =
    state === "done" || state === "green"
      ? styles.statusCircleGreen
      : state === "red"
      ? styles.statusCircleRed
      : state === "waiting"
      ? styles.statusCircleWaiting
      : styles.statusCircleOrange;

  const labelStyle =
    state === "done" || state === "green"
      ? styles.statusLabelGreen
      : state === "red"
      ? styles.statusLabelRed
      : state === "waiting"
      ? styles.statusLabelWaiting
      : styles.statusLabelOrange;

  return (
    <div
      style={{
        ...styles.statusStep,
        ...(wide ? styles.statusStepWide : {}),
      }}
    >
      <div
        style={{
          ...styles.statusCircle,
          ...circleStyle,
        }}
      >
        {state === "done" ? "✓" : symbol}
      </div>

      <span
        style={{
          ...styles.statusLabel,
          ...labelStyle,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function StatusConnector({ styles, state }) {
  const background =
    state === "done" || state === "green"
      ? "#22c55e"
      : state === "red"
      ? "linear-gradient(to right, #22c55e, #ef4444)"
      : state === "waiting"
      ? "#e7e5e4"
      : "linear-gradient(to right, #22c55e, #f59e0b)";

  return (
    <div
      style={{
        ...styles.statusConnector,
        background,
      }}
    />
  );
}

function ComparisonRow({
  styles,
  label,
  status,
  state,
  last,
}) {
  const icon =
    state === "done"
      ? "✓"
      : state === "active"
      ? "⌕"
      : "•";

  return (
    <div
      style={{
        ...styles.comparisonRow,
        ...(last
          ? styles.comparisonRowLast
          : {}),
      }}
    >
      <span
        style={{
          ...styles.comparisonIcon,
          ...(state === "done"
            ? styles.comparisonIconDone
            : {}),
          ...(state === "active"
            ? styles.comparisonIconActive
            : {}),
          ...(state === "waiting"
            ? styles.comparisonIconWaiting
            : {}),
        }}
      >
        {icon}
      </span>

      <span style={styles.comparisonLabel}>
        {label}
      </span>

      <span
        style={{
          ...styles.comparisonStatus,
          ...(state === "done"
            ? styles.comparisonStatusDone
            : {}),
          ...(state === "active"
            ? styles.comparisonStatusActive
            : {}),
          ...(state === "waiting"
            ? styles.comparisonStatusWaiting
            : {}),
        }}
      >
        {status}
      </span>
    </div>
  );
}

function createStyles(viewport) {
  const vw = viewport.width || 390;
  const vh = viewport.height || 844;

  const isDesktop = vw >= 700;
  const appW = isDesktop ? 390 : vw;
  const appH = isDesktop ? 844 : vh;

  const rawScale = Math.min(
    appW / BASE_W,
    appH / BASE_H
  );

  const scale = Math.max(
    0.86,
    Math.min(2.05, rawScale)
  );

  const grow = (value, factor) =>
    value +
    (value * scale - value) * factor;

  // Container widths / max-widths keep the original growth curve
  // so wide panels never feel cramped.
  const msWide = (value, factor = 0.55) =>
    Math.round(grow(value, factor));

  // Fonts, icons, paddings and radii: growth past a comfortable
  // size is compressed (~half rate) so nothing looks oversized on a
  // real phone. Never returns less than the design value.
  const COMFORT_LIMIT = 20;

  const ms = (value, factor = 0.55) => {
    const grown = grow(value, factor);

    if (grown <= COMFORT_LIMIT) {
      return Math.round(grown);
    }

    return Math.round(
      Math.max(
        value,
        COMFORT_LIMIT +
          (grown - COMFORT_LIMIT) * 0.52
      )
    );
  };

  const tiny = appW <= 230;
  const short = appH <= 620;

  // Single source of truth for the fixed top bar height so the
  // scroll area always starts exactly below it.
  const topBarH = ms(52);

  return {
    page: {
      width: "100vw",
      height: "100dvh",
      minHeight: "100dvh",
      display: "flex",
      justifyContent: "center",
      alignItems: isDesktop
        ? "center"
        : "stretch",
      margin: 0,
      padding: isDesktop ? 10 : 0,
      overflow: "hidden",
      background: isDesktop
        ? "#f4f1ea"
        : "#0b0907",
      fontFamily: "Arial, sans-serif",
    },

    phone: {
      position: "relative",
      width: isDesktop ? 390 : "100vw",
      height: isDesktop ? 844 : "100dvh",
      overflow: "hidden",
      background: "#f6f4ef",
      borderRadius: isDesktop ? 30 : 0,
      boxShadow: isDesktop
        ? "0 25px 70px rgba(0,0,0,.25)"
        : "none",
    },
    acceptanceTimerCard: {
      display: "flex",
      alignItems: "center",
      gap: ms(12),
      marginTop: ms(12),
      padding: ms(13),
      border: "1px solid #fcd34d",
      borderRadius: ms(21),
      background:
        "linear-gradient(135deg, #fffbeb, #fef3c7)",
      boxShadow:
        "0 12px 26px rgba(146,64,14,.12)",
    },
    
    acceptanceTimerCardExpired: {
      borderColor: "#fecaca",
      background:
        "linear-gradient(135deg, #fff7f7, #fee2e2)",
      boxShadow:
        "0 12px 26px rgba(185,28,28,.08)",
    },
    
    acceptanceTimerIcon: {
      width: ms(46),
      height: ms(46),
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
      borderRadius: ms(16),
      background:
        "linear-gradient(135deg, #f59e0b, #ea580c)",
      color: "white",
      fontSize: ms(20),
      fontWeight: 950,
      boxShadow:
        "0 10px 22px rgba(234,88,12,.24)",
    },
    
    acceptanceTimerIconExpired: {
      background:
        "linear-gradient(135deg, #ef4444, #b91c1c)",
      boxShadow:
        "0 10px 22px rgba(239,68,68,.20)",
    },
    
    acceptanceTimerContent: {
      minWidth: 0,
      flex: 1,
    },
    
    acceptanceTimerLabel: {
      display: "block",
      color: "#92400e",
      fontSize: ms(6.8),
      letterSpacing: ms(.9),
      fontWeight: 950,
    },
    
    acceptanceTimerLabelExpired: {
      color: "#b91c1c",
    },
    
    acceptanceTimerValue: {
      display: "block",
      marginTop: ms(3),
      color: "#78350f",
      fontSize: ms(21),
      lineHeight: 1,
      letterSpacing: ms(1),
      fontWeight: 950,
    },
    acceptanceTimerValuePaused: {
      color: "#1d4ed8",
    },
    
    acceptanceResumeText: {
      display: "inline-flex",
      marginTop: ms(5),
      padding: `${ms(4)}px ${ms(7)}px`,
      borderRadius: 999,
      background: "#eff6ff",
      color: "#1d4ed8",
      fontSize: ms(7),
      lineHeight: 1.2,
      fontWeight: 900,
    },
    acceptanceExpiredTitle: {
      display: "block",
      marginTop: ms(4),
      color: "#991b1b",
      fontSize: ms(12),
      lineHeight: 1.1,
      fontWeight: 950,
    },
    
    acceptanceTimerDescription: {
      margin: `${ms(6)}px 0 0`,
      color: "#92400e",
      fontSize: ms(7.5),
      lineHeight: 1.35,
      fontWeight: 650,
    },
    
    acceptanceTimerDescriptionExpired: {
      color: "#991b1b",
    },
    
    expiredPill: {
      background: "#fee2e2",
      color: "#b91c1c",
    },
    
    quoteCardExpired: {
      filter: "saturate(.72)",
      opacity: 0.84,
    },
    
    bestRateBadgeExpired: {
      borderColor: "rgba(239,68,68,.35)",
      background: "rgba(239,68,68,.16)",
      color: "#fecaca",
    },
    
    expiredFooterHint: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: ms(6),
      marginBottom: ms(7),
      color: "#b91c1c",
      fontSize: ms(7.8),
      fontWeight: 900,
    },
    
    expiredFooterButton: {
      width: "100%",
      minHeight: ms(48),
      border: "1px solid #fecaca",
      borderRadius: ms(18),
      background:
        "linear-gradient(135deg, #ef4444, #b91c1c)",
      color: "white",
      fontSize: ms(10),
      fontWeight: 950,
      opacity: 0.82,
    },

    fixedTopBar: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      zIndex: 70,
      height: topBarH,
      display: "grid",
      gridTemplateColumns: "auto minmax(0,1fr) auto",
      alignItems: "center",
      gap: ms(tiny ? 7 : 10),
      padding: `0 ${ms(tiny ? 9 : 12)}px`,
      overflow: "hidden",
      background:
        "radial-gradient(circle at 8% 120%,rgba(245,158,11,.26),transparent 42%),radial-gradient(circle at 92% -30%,rgba(251,191,36,.22),transparent 46%),linear-gradient(118deg,#050403 0%,#14100d 46%,#2a1608 78%,#3d1d08 100%)",
      borderBottom:
        "1px solid rgba(245,158,11,.20)",
      boxShadow:
        "0 10px 26px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.06)",
    },
    fixedTopBarShade: {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      background:
        "linear-gradient(180deg,rgba(255,255,255,.07),transparent 42%,rgba(0,0,0,.30))",
    },
    fixedTopBarGrid: {
      position: "absolute",
      inset: 0,
      opacity: 0.5,
      pointerEvents: "none",
      backgroundImage:
        "linear-gradient(rgba(245,158,11,.075) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,.075) 1px, transparent 1px)",
      backgroundSize: `${ms(16)}px ${ms(16)}px`,
      WebkitMaskImage:
        "linear-gradient(90deg,transparent,#000 30%,#000 70%,transparent)",
      maskImage:
        "linear-gradient(90deg,transparent,#000 30%,#000 70%,transparent)",
    },
    fixedTopBarBeam: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: "-40%",
      width: "40%",
      pointerEvents: "none",
      background:
        "linear-gradient(100deg,transparent,rgba(253,230,138,.16),transparent)",
      animation:
        "topBarBeamSweep 5.6s linear infinite",
    },
    fixedTopBarEdge: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 2,
      pointerEvents: "none",
      background:
        "linear-gradient(90deg,transparent,rgba(245,158,11,.75),rgba(253,230,138,.95),rgba(245,158,11,.75),transparent)",
      boxShadow: "0 0 10px rgba(245,158,11,.45)",
    },

    topBarIdentity: {
      position: "relative",
      zIndex: 2,
      minWidth: 0,
      display: "flex",
      alignItems: "center",
      gap: ms(tiny ? 6 : 8),
    },
    topBarMedallion: {
      position: "relative",
      width: ms(28),
      height: ms(28),
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
      borderRadius: "50%",
      background:
        "linear-gradient(140deg,#f59e0b,#b45309)",
      boxShadow:
        "0 0 0 1px rgba(253,230,138,.45), 0 6px 16px rgba(245,158,11,.35)",
    },
    topBarMedallionRing: {
      position: "absolute",
      inset: ms(-3),
      borderRadius: "50%",
      border:
        "1px solid rgba(251,191,36,.55)",
      animation:
        "topBarRingPulse 2.4s ease-in-out infinite",
    },
    topBarMedallionMark: {
      color: "#1c1004",
      fontSize: ms(13),
      fontWeight: 950,
      lineHeight: 1,
    },
    topBarTitleBlock: {
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: ms(2),
    },
    topBarTitle: {
      overflow: "hidden",
      color: "#fef3c7",
      fontSize: ms(10.5),
      letterSpacing: ms(1.4),
      fontWeight: 950,
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      textShadow:
        "0 0 12px rgba(245,158,11,.35)",
    },
    topBarStatusLine: {
      display: "flex",
      alignItems: "center",
      gap: ms(5),
      minWidth: 0,
    },
    topBarStatusDot: {
      width: ms(5),
      height: ms(5),
      flexShrink: 0,
      borderRadius: "50%",
      animation:
        "sellerDotPulse 1.6s ease-in-out infinite",
    },
    topBarStatusText: {
      overflow: "hidden",
      color: "rgba(253,230,138,.72)",
      fontSize: ms(8),
      letterSpacing: ms(0.4),
      fontWeight: 800,
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
    },

    scrollArea: {
      position: "absolute",
      left: 0,
      right: 0,
      top: topBarH,
      bottom: 0,
      width: "100%",
      height: "auto",
      overflowY: "auto",
      overflowX: "hidden",
      scrollBehavior: "smooth",
      WebkitOverflowScrolling: "touch",
    },

    header: {
      position: "relative",
      zIndex: 1,
      padding: `${ms(short ? 8 : 11)}px ${ms(
        tiny ? 10 : 13
      )}px ${ms(12)}px`,
      overflow: "hidden",
      color: "white",
      backgroundImage: HEADER_BG_IMAGE
        ? `linear-gradient(
            135deg,
            rgba(5,4,3,.58),
            rgba(28,25,23,.46) 55%,
            rgba(120,53,15,.34)
          ),
          url("${HEADER_BG_IMAGE}")`
        : "radial-gradient(circle at 84% 10%, rgba(245,158,11,.45), transparent 30%), linear-gradient(135deg, #080706, #1c1917 54%, #78350f)",
      backgroundSize: "cover",
      backgroundPosition: "center 42%",
      backgroundRepeat: "no-repeat",
    },

    headerShade: {
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(to bottom, rgba(0,0,0,.02), rgba(0,0,0,.32))",
      pointerEvents: "none",
    },

    headerGrid: {
      position: "absolute",
      inset: 0,
      opacity: 0.24,
      pointerEvents: "none",
      backgroundImage:
        "linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)",
      backgroundSize: `${ms(30)}px ${ms(
        30
      )}px`,
    },

    topBar: {
      position: "relative",
      zIndex: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: ms(8),
    },

    backButton: {
      position: "relative",
      zIndex: 2,
      justifySelf: "start",
      width: ms(30),
      height: ms(30),
      display: "grid",
      placeItems: "center",
      padding: 0,
      border:
        "1px solid rgba(253,230,138,.28)",
      borderRadius: ms(11),
      background:
        "linear-gradient(150deg,rgba(255,255,255,.14),rgba(255,255,255,.04))",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,.18), 0 4px 12px rgba(0,0,0,.32)",
      color: "#fef3c7",
      fontSize: ms(19),
      lineHeight: 1,
      cursor: "pointer",
    },



    helpButton: {
      position: "relative",
      zIndex: 2,
      justifySelf: "end",
      display: "flex",
      alignItems: "center",
      gap: ms(4),
      height: ms(28),
      padding: `0 ${ms(9)}px`,
      border:
        "1px solid rgba(253,230,138,.30)",
      borderRadius: 999,
      background:
        "linear-gradient(150deg,rgba(245,158,11,.24),rgba(255,255,255,.05))",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,.16), 0 4px 12px rgba(0,0,0,.30)",
      color: "#fef3c7",
      fontSize: ms(8.6),
      fontWeight: 900,
      whiteSpace: "nowrap",
      cursor: "pointer",
    },
    helpButtonIcon: {
      width: ms(13),
      height: ms(13),
      display: "grid",
      placeItems: "center",
      borderRadius: "50%",
      border:
        "1px solid rgba(253,230,138,.55)",
      color: "#fde68a",
      fontSize: ms(8),
      fontWeight: 950,
      lineHeight: 1,
    },

    heroRow: {
      position: "relative",
      zIndex: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: ms(12),
      marginTop: ms(14),
    },

    eyebrow: {
      margin: 0,
      color: "#fde68a",
      fontSize: ms(7.1),
      letterSpacing: ms(1.25),
      fontWeight: 950,
    },

    title: {
      margin: `${ms(6)}px 0 0`,
      fontSize: ms(short ? 23 : 28),
      lineHeight: 1.02,
      letterSpacing: -0.7,
      fontWeight: 950,
    },

    heroText: {
      maxWidth: msWide(220),
      margin: `${ms(8)}px 0 0`,
      color: "#e7e5e4",
      fontSize: ms(8.7),
      lineHeight: 1.35,
      fontWeight: 650,
    },

    rateIcon: {
      width: ms(44),
      height: ms(44),
      display: "grid",
      placeItems: "center",
      borderRadius: ms(20),
      background:
        "linear-gradient(135deg, #f59e0b, #ea580c)",
      color: "white",
      fontSize: ms(22),
      fontWeight: 950,
      boxShadow:
        "0 15px 30px rgba(234,88,12,.32)",
      flexShrink: 0,
    },

    rateIconScanning: {
      animation:
        "scannerIconPulse 1.8s ease-in-out infinite",
    },

    content: {
      padding: `${ms(13)}px ${ms(
        tiny ? 9 : 13
      )}px 0`,
      color: "#111827",
      background:
        "linear-gradient(180deg, #fff, #f6f4ef 58%, #efede8)",
    },

    trackerCard: {
      padding: `${ms(12)}px ${ms(
        8
      )}px ${ms(10)}px`,
      border: "1px solid #e7e5e4",
      borderRadius: ms(20),
      background: "white",
      boxShadow:
        "0 10px 24px rgba(0,0,0,.05)",
    },

    trackerHeading: {
      margin: `0 0 ${ms(11)}px`,
      textAlign: "center",
      fontSize: ms(11),
      fontWeight: 950,
    },

    trackerViewport: {
      width: "100%",
      overflowX: "auto",
      overflowY: "hidden",
      scrollbarWidth: "none",
      paddingBottom: ms(3),
    },

    tracker: {
      minWidth: msWide(455),
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
    },

    statusStep: {
      width: ms(78),
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      flexShrink: 0,
      textAlign: "center",
    },

    statusStepWide: {
      width: ms(100),
    },

    statusCircle: {
      width: ms(25),
      height: ms(25),
      display: "grid",
      placeItems: "center",
      borderRadius: "50%",
      fontSize: ms(10),
      fontWeight: 950,
    },

    statusCircleGreen: {
      background: "#22c55e",
      color: "white",
      boxShadow:
        "0 6px 14px rgba(34,197,94,.22)",
    },

    statusCircleOrange: {
      background: "#f59e0b",
      color: "white",
      boxShadow:
        "0 6px 14px rgba(245,158,11,.24)",
      animation:
        "scannerIconPulse 1.8s ease-in-out infinite",
    },

    statusCircleRed: {
      background: "#ef4444",
      color: "white",
      boxShadow:
        "0 6px 14px rgba(239,68,68,.22)",
    },

    statusCircleWaiting: {
      border: "2px solid #d6d3d1",
      background: "#f5f5f4",
      color: "#a8a29e",
      boxShadow: "none",
    },

    statusLabel: {
      marginTop: ms(6),
      fontSize: ms(7),
      lineHeight: 1.16,
      fontWeight: 850,
    },

    statusLabelGreen: {
      color: "#166534",
    },

    statusLabelOrange: {
      color: "#92400e",
    },

    statusLabelRed: {
      color: "#b91c1c",
    },

    statusLabelWaiting: {
      color: "#a8a29e",
    },

    statusConnector: {
      width: ms(22),
      height: ms(4),
      marginTop: ms(10.5),
      borderRadius: 999,
      flexShrink: 0,
    },

    rateNotice: {
      display: "flex",
      gap: ms(10),
      marginTop: ms(11),
      padding: ms(12),
      border: "1px solid #fde68a",
      borderRadius: ms(19),
      background:
        "linear-gradient(135deg, #fffbeb, #fef3c7)",
      boxShadow:
        "0 10px 22px rgba(146,64,14,.08)",
    },

    noticeIcon: {
      width: ms(36),
      height: ms(36),
      display: "grid",
      placeItems: "center",
      borderRadius: ms(14),
      background: "#22c55e",
      color: "white",
      fontSize: ms(18),
      fontWeight: 950,
      flexShrink: 0,
    },

    noticeIconChecking: {
      background:
        "linear-gradient(135deg, #f59e0b, #ea580c)",
      animation:
        "scannerIconPulse 1.8s ease-in-out infinite",
    },

    noticeTitle: {
      color: "#78350f",
      fontSize: ms(10.1),
    },

    noticeText: {
      margin: `${ms(4)}px 0 0`,
      color: "#92400e",
      fontSize: ms(8.1),
      lineHeight: 1.35,
      fontWeight: 650,
    },

    scanningCard: {
      display: "grid",
      gridTemplateColumns:
        "auto minmax(0,1fr)",
      alignItems: "center",
      gap: ms(14),
      marginTop: ms(12),
      padding: ms(14),
      overflow: "hidden",
      border:
        "1px solid rgba(245,158,11,.24)",
      borderRadius: ms(22),
      background:
        "linear-gradient(135deg, #17100b, #3f2414 58%, #78350f)",
      color: "white",
      boxShadow:
        "0 16px 34px rgba(120,53,15,.18)",
    },

    scannerArea: {
      width: ms(80),
      height: ms(80),
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
    },

    scannerRingOuter: {
      position: "relative",
      width: ms(72),
      height: ms(72),
      display: "grid",
      placeItems: "center",
      overflow: "hidden",
      border:
        "1px solid rgba(251,191,36,.36)",
      borderRadius: "50%",
      background:
        "radial-gradient(circle, rgba(245,158,11,.18), rgba(245,158,11,.04) 54%, transparent 55%)",
      boxShadow:
        "0 0 30px rgba(245,158,11,.18), inset 0 0 25px rgba(245,158,11,.10)",
    },

    scannerGridLineOne: {
      position: "absolute",
      left: "50%",
      top: 0,
      bottom: 0,
      width: 1,
      background:
        "rgba(251,191,36,.16)",
    },

    scannerGridLineTwo: {
      position: "absolute",
      left: 0,
      right: 0,
      top: "50%",
      height: 1,
      background:
        "rgba(251,191,36,.16)",
    },

    scannerRingMiddle: {
      width: "66%",
      height: "66%",
      display: "grid",
      placeItems: "center",
      border:
        "1px solid rgba(251,191,36,.30)",
      borderRadius: "50%",
    },

    scannerRingInner: {
      width: "52%",
      height: "52%",
      display: "grid",
      placeItems: "center",
      border:
        "1px solid rgba(251,191,36,.28)",
      borderRadius: "50%",
      background: "rgba(245,158,11,.12)",
    },

    scannerCentre: {
      width: ms(25),
      height: ms(25),
      display: "grid",
      placeItems: "center",
      borderRadius: "50%",
      background:
        "linear-gradient(135deg,#f59e0b,#ea580c)",
      color: "white",
      fontSize: ms(13),
      fontWeight: 950,
      boxShadow:
        "0 8px 18px rgba(234,88,12,.32)",
    },

    scannerBeam: {
      position: "absolute",
      left: "50%",
      top: "50%",
      width: "48%",
      height: "48%",
      borderRadius: "100% 0 0 0",
      background:
        "linear-gradient(45deg, rgba(245,158,11,.40), transparent 72%)",
      transformOrigin: "0 0",
      animation:
        "radarSweep 2.4s linear infinite",
    },

    sellerDot: {
      position: "absolute",
      width: ms(6),
      height: ms(6),
      borderRadius: "50%",
      background: "#22c55e",
      boxShadow:
        "0 0 9px rgba(34,197,94,.95)",
      animation:
        "sellerDotPulse 1.5s ease-in-out infinite",
    },

    sellerDotOne: {
      left: "21%",
      top: "28%",
    },

    sellerDotTwo: {
      right: "18%",
      top: "32%",
      animationDelay: ".35s",
    },

    sellerDotThree: {
      left: "34%",
      bottom: "17%",
      animationDelay: ".7s",
    },

    sellerDotFour: {
      right: "26%",
      bottom: "25%",
      animationDelay: "1s",
    },

    scanningText: {
      minWidth: 0,
    },

    scanningEyebrow: {
      color: "#fbbf24",
      fontSize: ms(6.8),
      letterSpacing: ms(1.05),
      fontWeight: 950,
    },

    scanningTitle: {
      margin: `${ms(5)}px 0 0`,
      color: "white",
      fontSize: ms(14),
      lineHeight: 1.08,
      fontWeight: 950,
    },

    scanningDescription: {
      margin: `${ms(6)}px 0 0`,
      color: "#d6d3d1",
      fontSize: ms(8),
      lineHeight: 1.4,
      fontWeight: 650,
    },

    sellerProgressCard: {
      marginTop: ms(12),
      padding: ms(13),
      border: "1px solid #e7e5e4",
      borderRadius: ms(21),
      background: "white",
      boxShadow:
        "0 10px 24px rgba(0,0,0,.05)",
    },

    sellerProgressHeader: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: ms(10),
    },

    progressEyebrow: {
      color: "#b45309",
      fontSize: ms(6.8),
      letterSpacing: ms(1),
      fontWeight: 950,
    },

    progressTitle: {
      margin: `${ms(4)}px 0 0`,
      color: "#111827",
      fontSize: ms(11),
      fontWeight: 950,
    },

    progressPercentage: {
      minWidth: ms(38),
      height: ms(29),
      display: "grid",
      placeItems: "center",
      padding: `0 ${ms(7)}px`,
      borderRadius: 999,
      background: "#fffbeb",
      color: "#b45309",
      fontSize: ms(8),
      fontWeight: 950,
    },

    sellerProgressTrack: {
      height: ms(7),
      marginTop: ms(11),
      overflow: "hidden",
      borderRadius: 999,
      background: "#f1f0ee",
    },

    sellerProgressFill: {
      height: "100%",
      borderRadius: 999,
      background:
        "linear-gradient(90deg,#f59e0b,#ea580c)",
      boxShadow:
        "0 0 12px rgba(245,158,11,.28)",
      transition: "width 500ms ease",
    },

    sellerMetricGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: ms(7),
      marginTop: ms(11),
    },

    sellerMetric: {
      display: "flex",
      flexDirection: "column",
      gap: ms(3),
      minWidth: 0,
      padding: ms(8),
      border: "1px solid #eeeae6",
      borderRadius: ms(13),
      background: "#fafaf9",
      color: "#78716c",
      fontSize: ms(7),
    },

    countdownCard: {
      display: "flex",
      alignItems: "center",
      gap: ms(12),
      marginTop: ms(12),
      padding: ms(13),
      border: "1px solid #fde68a",
      borderRadius: ms(21),
      background:
        "linear-gradient(135deg,#fffbeb,#fef3c7)",
      boxShadow:
        "0 10px 22px rgba(146,64,14,.08)",
    },

    countdownIcon: {
      width: ms(43),
      height: ms(43),
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
      borderRadius: ms(15),
      background:
        "linear-gradient(135deg,#f59e0b,#ea580c)",
      color: "white",
      fontSize: ms(20),
      fontWeight: 950,
    },

    countdownContent: {
      minWidth: 0,
    },

    countdownLabel: {
      display: "block",
      color: "#92400e",
      fontSize: ms(6.8),
      letterSpacing: ms(0.85),
      fontWeight: 950,
    },

    countdownValue: {
      display: "block",
      marginTop: ms(3),
      color: "#78350f",
      fontSize: ms(20),
      lineHeight: 1,
      letterSpacing: ms(1),
      fontWeight: 950,
    },

    countdownExpired: {
      display: "block",
      marginTop: ms(4),
      color: "#b45309",
      fontSize: ms(11),
      fontWeight: 950,
    },

    countdownDescription: {
      margin: `${ms(6)}px 0 0`,
      color: "#92400e",
      fontSize: ms(7.5),
      lineHeight: 1.35,
      fontWeight: 650,
    },

    comparisonCard: {
      marginTop: ms(12),
      padding: ms(13),
      border: "1px solid #e7e5e4",
      borderRadius: ms(21),
      background: "white",
      boxShadow:
        "0 10px 24px rgba(0,0,0,.05)",
    },

    comparisonHeader: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: ms(8),
      marginBottom: ms(8),
    },

    comparisonTitle: {
      margin: `${ms(4)}px 0 0`,
      fontSize: ms(11),
      fontWeight: 950,
    },

    liveBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: ms(4),
      padding: `${ms(5)}px ${ms(8)}px`,
      borderRadius: 999,
      background: "#ecfdf5",
      color: "#15803d",
      fontSize: ms(7),
      fontWeight: 950,
    },

    liveBadgeDot: {
      width: ms(6),
      height: ms(6),
      borderRadius: "50%",
      background: "#22c55e",
      boxShadow:
        "0 0 7px rgba(34,197,94,.75)",
      animation:
        "sellerDotPulse 1.5s ease-in-out infinite",
    },

    comparisonRow: {
      display: "grid",
      gridTemplateColumns:
        "auto minmax(0,1fr) auto",
      alignItems: "center",
      gap: ms(8),
      padding: `${ms(8)}px 0`,
      borderBottom:
        "1px solid #eeeae6",
    },

    comparisonRowLast: {
      borderBottom: 0,
    },

    comparisonIcon: {
      width: ms(25),
      height: ms(25),
      display: "grid",
      placeItems: "center",
      borderRadius: ms(9),
      fontSize: ms(10),
      fontWeight: 950,
    },

    comparisonIconDone: {
      background: "#dcfce7",
      color: "#15803d",
    },

    comparisonIconActive: {
      background: "#fef3c7",
      color: "#b45309",
      animation:
        "scannerIconPulse 1.8s ease-in-out infinite",
    },

    comparisonIconWaiting: {
      background: "#f5f5f4",
      color: "#a8a29e",
    },

    comparisonLabel: {
      minWidth: 0,
      color: "#292524",
      fontSize: ms(8.4),
      fontWeight: 800,
    },

    comparisonStatus: {
      padding: `${ms(4)}px ${ms(7)}px`,
      borderRadius: 999,
      fontSize: ms(6.9),
      fontWeight: 950,
    },

    comparisonStatusDone: {
      background: "#ecfdf5",
      color: "#15803d",
    },

    comparisonStatusActive: {
      background: "#fffbeb",
      color: "#b45309",
    },

    comparisonStatusWaiting: {
      background: "#f5f5f4",
      color: "#78716c",
    },

    notificationCard: {
      display: "flex",
      alignItems: "center",
      gap: ms(10),
      marginTop: ms(12),
      padding: ms(12),
      border: "1px solid #dbeafe",
      borderRadius: ms(19),
      background: "#eff6ff",
    },

    notificationIcon: {
      width: ms(36),
      height: ms(36),
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
      borderRadius: ms(13),
      background: "#dbeafe",
      fontSize: ms(17),
    },

    notificationTitle: {
      color: "#1e3a8a",
      fontSize: ms(9),
    },

    notificationText: {
      margin: `${ms(4)}px 0 0`,
      color: "#1d4ed8",
      fontSize: ms(7.5),
      lineHeight: 1.35,
    },

    sectionHeading: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: ms(9),
      marginTop: ms(16),
      marginBottom: ms(9),
    },

    sectionEyebrow: {
      margin: 0,
      color: "#b45309",
      fontSize: ms(7.3),
      letterSpacing: ms(1.15),
      fontWeight: 950,
    },

    sectionTitle: {
      margin: `${ms(3)}px 0 0`,
      fontSize: ms(15),
      fontWeight: 950,
    },

    validPill: {
      padding: `${ms(5)}px ${ms(8)}px`,
      borderRadius: 999,
      background: "#ecfdf5",
      color: "#15803d",
      fontSize: ms(7.7),
      fontWeight: 950,
    },

    requestPill: {
      padding: `${ms(5)}px ${ms(8)}px`,
      borderRadius: 999,
      background: "#fffbeb",
      color: "#b45309",
      fontSize: ms(7.7),
      fontWeight: 950,
    },

    adminNoteCard: { display: "flex", gap: ms(10), marginBottom: ms(12), padding: ms(12), border: "1px solid #bfdbfe", borderRadius: ms(18), background: "linear-gradient(135deg,#eff6ff,#dbeafe)", color: "#1e3a8a" },
    adminNoteIcon: { width: ms(30), height: ms(30), display: "grid", placeItems: "center", flexShrink: 0, borderRadius: ms(11), background: "#2563eb", color: "white", fontWeight: 950 },
    adminNoteLabel: { fontSize: ms(6.8), letterSpacing: ms(.8), fontWeight: 950 },
    adminNoteText: { margin: `${ms(4)}px 0 0`, fontSize: ms(8.2), lineHeight: 1.45, fontWeight: 700 },
    optionGroup: { padding: ms(11), border: "1px solid #e7e5e4", borderRadius: ms(22), background: "rgba(255,255,255,.9)", boxShadow: "0 10px 24px rgba(0,0,0,.05)" },
    optionGroupHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: ms(8), marginBottom: ms(10) },
    optionGroupEyebrow: { color: "#b45309", fontSize: ms(6.6), letterSpacing: ms(.85), fontWeight: 950 },
    optionGroupTitle: { margin: `${ms(3)}px 0 0`, color: "#111827", fontSize: ms(13), lineHeight: 1.15, fontWeight: 950 },
    optionGroupMeta: { margin: `${ms(4)}px 0 0`, color: "#78716c", fontSize: ms(7.5), fontWeight: 750 },
    groupSelectionPill: { flexShrink: 0, padding: `${ms(5)}px ${ms(8)}px`, borderRadius: 999, background: "#f5f5f4", color: "#78716c", fontSize: ms(7), fontWeight: 950 },
    groupSelectionPillDone: { background: "#dcfce7", color: "#15803d" },
    optionStack: { display: "grid", gap: ms(10) },
    quoteCard: {
      position: "relative",
      overflow: "hidden",
      padding: ms(15),
      borderRadius: ms(22),
      background:
        "linear-gradient(135deg, #020617, #292524)",
      color: "white",
      boxShadow:
        "0 17px 36px rgba(0,0,0,.18)",
    },

    quoteCardSelected: { border: "2px solid #22c55e", boxShadow: "0 18px 38px rgba(21,128,61,.22)" },
    optionSelectSurface: { position: "relative", zIndex: 3, width: "100%", minHeight: ms(34), display: "flex", alignItems: "center", gap: ms(7), padding: 0, border: 0, background: "transparent", color: "white", textAlign: "left", cursor: "pointer" },
    optionRadio: { width: ms(22), height: ms(22), display: "grid", placeItems: "center", flexShrink: 0, border: "2px solid rgba(255,255,255,.42)", borderRadius: "50%", color: "transparent", fontSize: ms(8), fontWeight: 950 },
    optionRadioSelected: { borderColor: "#22c55e", background: "#22c55e", color: "white" },
    optionChoiceText: { fontSize: ms(8), fontWeight: 950 },
    lowestRateBadge: { marginLeft: "auto", padding: `${ms(4)}px ${ms(7)}px`, borderRadius: 999, background: "rgba(245,158,11,.18)", color: "#fde68a", fontSize: ms(6.4), fontWeight: 950 },
    optionBody: { position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: `${msWide(66)}px minmax(0,1fr)`, gap: ms(10), marginTop: ms(9) },
    optionImageButton: { position: "relative", width: msWide(66), height: msWide(66), padding: 0, overflow: "hidden", border: "1px solid rgba(253,230,138,.35)", borderRadius: ms(14), background: "#171717", cursor: "pointer" },
    optionImage: { width: "100%", height: "100%", display: "block", objectFit: "cover" },
    optionImageZoom: { position: "absolute", left: ms(5), bottom: ms(5), padding: `${ms(3)}px ${ms(6)}px`, borderRadius: 999, background: "rgba(0,0,0,.72)", color: "white", fontSize: ms(6), fontWeight: 900 },
    optionImageFallback: { width: msWide(66), height: msWide(66), display: "grid", placeItems: "center", borderRadius: ms(14), background: "rgba(255,255,255,.08)", fontSize: ms(21) },
    optionMainInfo: { minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" },
    optionSampleLabel: { color: "#a8a29e", fontSize: ms(6.2), letterSpacing: ms(.7), fontWeight: 950 },
    optionSampleCode: { marginTop: ms(3), overflow: "hidden", color: "white", fontSize: ms(10), textOverflow: "ellipsis", whiteSpace: "nowrap" },
    optionSource: { marginTop: ms(3), overflow: "hidden", color: "#d6d3d1", fontSize: ms(7), textOverflow: "ellipsis", whiteSpace: "nowrap" },
    optionRateRow: { display: "flex", alignItems: "flex-end", gap: ms(4), marginTop: ms(7), color: "#fbbf24", fontSize: ms(16), fontWeight: 950 },
    optionNote: { position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: ms(3), marginTop: ms(9), padding: ms(9), borderRadius: ms(12), background: "rgba(255,255,255,.08)", color: "#e7e5e4", fontSize: ms(7.3), lineHeight: 1.4 },
    quoteGlow: {
      position: "absolute",
      right: ms(-30),
      top: ms(-35),
      width: ms(105),
      height: ms(105),
      borderRadius: "50%",
      background:
        "rgba(245,158,11,.25)",
      filter: `blur(${ms(20)}px)`,
    },

    quoteTopRow: {
      position: "relative",
      zIndex: 2,
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: ms(10),
    },

    quoteLabel: {
      margin: 0,
      color: "#d6d3d1",
      fontSize: ms(9.3),
    },

    quoteValueRow: {
      display: "flex",
      alignItems: "flex-end",
      gap: ms(3),
      marginTop: ms(5),
    },

    rupeeSymbol: {
      marginBottom: ms(4),
      color: "#fbbf24",
      fontSize: ms(18),
      fontWeight: 950,
    },

    quoteValue: {
      fontSize: ms(31),
      lineHeight: 1,
    },

    perTon: {
      marginBottom: ms(4),
      color: "#d6d3d1",
      fontSize: ms(9.5),
      fontWeight: 800,
    },

    bestRateBadge: {
      padding: `${ms(6)}px ${ms(9)}px`,
      border:
        "1px solid rgba(245,158,11,.35)",
      borderRadius: 999,
      background: "rgba(245,158,11,.16)",
      color: "#fde68a",
      fontSize: ms(7.6),
      fontWeight: 950,
    },

    quoteMetaGrid: {
      position: "relative",
      zIndex: 2,
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: ms(7),
      marginTop: ms(13),
    },

    quoteMetaItem: {
      display: "flex",
      flexDirection: "column",
      gap: ms(3),
      minWidth: 0,
      padding: ms(8),
      borderRadius: ms(13),
      background:
        "rgba(255,255,255,.08)",
      color: "#d6d3d1",
      fontSize: ms(7.2),
    },

    estimatedRow: {
      position: "relative",
      zIndex: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: ms(8),
      marginTop: ms(10),
      padding: ms(9),
      borderRadius: ms(12),
      background:
        "rgba(255,255,255,.1)",
      color: "#e7e5e4",
      fontSize: ms(8.4),
    },

    tableCard: {
      overflow: "hidden",
      border: "1px solid #e7e5e4",
      borderRadius: ms(20),
      background:
        "rgba(255,255,255,.96)",
      boxShadow:
        "0 10px 24px rgba(0,0,0,.055)",
    },

    tableHeader: {
      display: "grid",
      gridTemplateColumns:
        "1.55fr .85fr .65fr",
      gap: ms(6),
      padding: `${ms(9)}px ${ms(11)}px`,
      background: "#1c1917",
      color: "#fde68a",
      fontSize: ms(7.5),
      fontWeight: 950,
    },

    tableRow: {
      display: "grid",
      gridTemplateColumns:
        "1.55fr .85fr .65fr",
      alignItems: "center",
      gap: ms(6),
      padding: `${ms(11)}px`,
      fontSize: ms(8.5),
    },

    productCell: {
      display: "flex",
      alignItems: "center",
      gap: ms(7),
      minWidth: 0,
      lineHeight: 1.15,
    },

    productIcon: {
      width: ms(27),
      height: ms(27),
      display: "grid",
      placeItems: "center",
      borderRadius: ms(10),
      background: "#fef3c7",
      flexShrink: 0,
    },

    vehicleCell: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 0,
      fontSize: ms(10),
      fontWeight: 950,
      color: "#292524",
    },

    qtyCell: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: ms(1),
      color: "#92400e",
    },

    tableDivider: {
      height: 1,
      margin: `0 ${ms(11)}px`,
      background: "#eeeae6",
    },

    deliveryCard: {
      display: "flex",
      alignItems: "center",
      gap: ms(9),
      marginTop: ms(12),
      padding: ms(12),
      border: "1px solid #e7e5e4",
      borderRadius: ms(20),
      background: "white",
      boxShadow:
        "0 10px 24px rgba(0,0,0,.05)",
    },

    deliveryIcon: {
      width: ms(38),
      height: ms(38),
      display: "grid",
      placeItems: "center",
      borderRadius: ms(14),
      background: "#fffbeb",
      fontSize: ms(19),
      flexShrink: 0,
    },

    detailLabel: {
      display: "block",
      color: "#78716c",
      fontSize: ms(7.8),
    },

    deliveryDate: {
      display: "block",
      marginTop: ms(3),
      fontSize: ms(11.2),
    },

    deliveryStatus: {
      padding: `${ms(5)}px ${ms(8)}px`,
      borderRadius: 999,
      background: "#ecfdf5",
      color: "#15803d",
      fontSize: ms(7.6),
      fontWeight: 950,
    },

    acceptedCard: {
      display: "flex",
      gap: ms(9),
      marginTop: ms(12),
      padding: ms(12),
      border: "1px solid #bbf7d0",
      borderRadius: ms(18),
      background: "#f0fdf4",
      color: "#166534",
      fontSize: ms(8.4),
      lineHeight: 1.35,
    },

    acceptedIcon: {
      width: ms(30),
      height: ms(30),
      display: "grid",
      placeItems: "center",
      borderRadius: ms(11),
      background: "#22c55e",
      color: "white",
      fontWeight: 950,
      flexShrink: 0,
    },

    rejectedCard: {
      display: "flex",
      gap: ms(9),
      marginTop: ms(12),
      padding: ms(12),
      border: "1px solid #fecaca",
      borderRadius: ms(18),
      background: "#fff7f7",
      color: "#991b1b",
      fontSize: ms(8.4),
      lineHeight: 1.35,
    },

    rejectedIcon: {
      width: ms(30),
      height: ms(30),
      display: "grid",
      placeItems: "center",
      borderRadius: ms(11),
      background: "#ef4444",
      color: "white",
      fontWeight: 950,
      flexShrink: 0,
    },

    testReadyButton: {
      width: "100%",
      minHeight: ms(40),
      marginTop: ms(14),
      border: "1px dashed #d97706",
      borderRadius: ms(15),
      background: "#fffbeb",
      color: "#92400e",
      fontSize: ms(8),
      fontWeight: 900,
      cursor: "pointer",
    },

    testCheckingButton: {
      width: "100%",
      minHeight: ms(40),
      marginTop: ms(14),
      border: "1px dashed #a8a29e",
      borderRadius: ms(15),
      background: "#fafaf9",
      color: "#57534e",
      fontSize: ms(8),
      fontWeight: 900,
      cursor: "pointer",
    },

    bottomSpacer: {
      height: ms(118),
    },

    fixedFooter: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 30,
      padding: `${ms(8)}px ${ms(
        13
      )}px calc(env(safe-area-inset-bottom, 0px) + ${ms(
        10
      )}px)`,
      background:
        "linear-gradient(to top, #f6f4ef 76%, rgba(246,244,239,.98) 90%, rgba(246,244,239,.82))",
      borderTop:
        "1px solid rgba(120,113,108,.12)",
      boxShadow:
        "0 -12px 30px rgba(0,0,0,.10)",
    },

    checkingFooterHint: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: ms(6),
      marginBottom: ms(7),
      color: "#92400e",
      fontSize: ms(7.8),
      fontWeight: 800,
    },

    checkingFooterDot: {
      width: ms(7),
      height: ms(7),
      borderRadius: "50%",
      background: "#f59e0b",
      boxShadow:
        "0 0 8px rgba(245,158,11,.65)",
      animation:
        "sellerDotPulse 1.5s ease-in-out infinite",
    },

    checkingButton: {
      width: "100%",
      minHeight: ms(48),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: ms(8),
      border: 0,
      borderRadius: ms(18),
      background:
        "linear-gradient(135deg,#f59e0b,#ea580c)",
      color: "white",
      fontSize: ms(10),
      fontWeight: 950,
      opacity: 1,
    },

    footerSpinner: {
      display: "grid",
      placeItems: "center",
      width: ms(24),
      height: ms(24),
      borderRadius: "50%",
      background:
        "rgba(255,255,255,.16)",
      animation:
        "scannerIconPulse 1.8s ease-in-out infinite",
    },

    footerHint: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: ms(5),
      marginBottom: ms(7),
      color: "#78716c",
      fontSize: ms(7.8),
      fontWeight: 700,
    },

    footerHintGreen: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: ms(5),
      marginBottom: ms(7),
      color: "#15803d",
      fontSize: ms(8),
      fontWeight: 900,
    },

    footerHintRed: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: ms(5),
      marginBottom: ms(7),
      color: "#b91c1c",
      fontSize: ms(8),
      fontWeight: 900,
    },

    footerButtons: {
      display: "grid",
      gridTemplateColumns: "1fr 1.18fr",
      gap: ms(8),
    },

    rejectButton: {
      minHeight: ms(48),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: ms(6),
      border: "1px solid #fecaca",
      borderRadius: ms(18),
      background: "#fff7f7",
      color: "#b91c1c",
      fontSize: ms(9.3),
      fontWeight: 950,
      cursor: "pointer",
    },

    acceptButton: {
      minHeight: ms(48),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: ms(6),
      border: 0,
      borderRadius: ms(18),
      background:
        "linear-gradient(135deg, #22c55e, #15803d)",
      color: "white",
      fontSize: ms(9.3),
      fontWeight: 950,
      boxShadow:
        "0 12px 24px rgba(34,197,94,.22)",
      cursor: "pointer",
    },

    acceptButtonDisabled: { background: "#a8a29e", boxShadow: "none", cursor: "not-allowed", opacity: .72 },
    nextPageButton: {
      position: "relative",
      width: "100%",
      minHeight: ms(48),
      border: 0,
      borderRadius: ms(18),
      background:
        "linear-gradient(135deg, #22c55e, #15803d)",
      color: "white",
      fontSize: ms(10),
      fontWeight: 950,
      boxShadow:
        "0 12px 24px rgba(34,197,94,.22)",
      cursor: "pointer",
    },

    rejectedOnlyButton: {
      width: "100%",
      minHeight: ms(48),
      border: 0,
      borderRadius: ms(18),
      background: "#ef4444",
      color: "white",
      fontSize: ms(10),
      fontWeight: 950,
      boxShadow:
        "0 12px 24px rgba(239,68,68,.20)",
    },

    referenceThumbButton: { position: "relative", width: ms(36), height: ms(36), flexShrink: 0, padding: 0, overflow: "hidden", border: "1px solid #fde68a", borderRadius: ms(11), background: "#fef3c7", cursor: "pointer", boxShadow: "0 5px 12px rgba(146,64,14,.12)" },
    referenceThumbImage: { width: "100%", height: "100%", display: "block", objectFit: "cover" },
    referenceZoom: { position: "absolute", right: 2, bottom: 2, width: ms(14), height: ms(14), display: "grid", placeItems: "center", borderRadius: "50%", background: "rgba(28,25,23,.82)", color: "white", fontSize: ms(7) },
    productTextWrap: { minWidth: 0, display: "flex", flexDirection: "column", gap: ms(3) },
    sampleCodeText: { color: "#b45309", fontSize: ms(6.8), fontWeight: 900, letterSpacing: ms(.25) },
    quoteReferenceButton: { position: "relative", zIndex: 2, width: "100%", display: "grid", gridTemplateColumns: "auto minmax(0,1fr) auto", alignItems: "center", gap: ms(9), marginTop: ms(12), padding: ms(8), border: "1px solid rgba(253,230,138,.25)", borderRadius: ms(14), background: "rgba(255,255,255,.08)", color: "white", textAlign: "left", cursor: "pointer" },
    quoteReferenceImage: { width: ms(42), height: ms(42), borderRadius: ms(11), objectFit: "cover", border: "1px solid rgba(253,230,138,.35)" },
    quoteReferenceText: { minWidth: 0, display: "flex", flexDirection: "column", gap: ms(3) },
    quoteReferenceArrow: { width: ms(26), height: ms(26), display: "grid", placeItems: "center", borderRadius: "50%", background: "rgba(245,158,11,.18)", color: "#fde68a", fontSize: ms(12) },
    referenceOverlay: { position: "absolute", inset: 0, zIndex: 120, display: "flex", alignItems: "center", justifyContent: "center", padding: ms(14), background: "rgba(2,6,23,.86)", backdropFilter: "blur(9px)" },
    referenceDialog: { width: "100%", maxWidth: msWide(315), maxHeight: "92%", overflowY: "auto", border: "1px solid rgba(255,255,255,.15)", borderRadius: ms(24), background: "linear-gradient(160deg,#17100b,#0c0a09)", color: "white", boxShadow: "0 30px 80px rgba(0,0,0,.55)" },
    referencePreviewTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: ms(10), padding: ms(14) },
    referencePreviewEyebrow: { color: "#fbbf24", fontSize: ms(6.6), fontWeight: 950, letterSpacing: ms(.9) },
    referencePreviewTitle: { margin: `${ms(4)}px 0 0`, fontSize: ms(16), lineHeight: 1.12 },
    referenceCloseButton: { width: ms(34), height: ms(34), flexShrink: 0, border: "1px solid rgba(255,255,255,.18)", borderRadius: ms(12), background: "rgba(255,255,255,.08)", color: "white", fontSize: ms(20), cursor: "pointer" },
    referenceImageArea: { minHeight: msWide(205), display: "grid", placeItems: "center", padding: `0 ${ms(12)}px`, background: "#050505" },
    referenceLargeImage: { width: "100%", maxHeight: msWide(280), display: "block", objectFit: "contain", borderRadius: ms(16) },
    referenceImageFallback: { display: "flex", flexDirection: "column", alignItems: "center", gap: ms(8), color: "#d6d3d1" },
    referenceDetails: { padding: ms(14) },
    referenceDetailRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: ms(12), padding: `${ms(8)}px 0`, borderBottom: "1px solid rgba(255,255,255,.09)", color: "#a8a29e", fontSize: ms(8) },
    referenceNote: { marginTop: ms(11), padding: ms(10), border: "1px solid rgba(245,158,11,.24)", borderRadius: ms(13), background: "rgba(245,158,11,.09)", color: "#fde68a", fontSize: ms(7.5), lineHeight: 1.45 },
    referenceDisclaimer: { margin: `${ms(11)}px 0 0`, color: "#a8a29e", fontSize: ms(7.4), lineHeight: 1.5 },
    popupOverlay: {
      position: "absolute",
      inset: 0,
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: ms(18),
      background: "rgba(2,6,23,.72)",
      backdropFilter: "blur(8px)",
    },

    rejectPopup: {
      width: "100%",
      maxWidth: msWide(280),
      padding: `${ms(23)}px ${ms(
        18
      )}px ${ms(18)}px`,
      borderRadius: ms(25),
      border: "1px solid #fecaca",
      background: "white",
      textAlign: "center",
      boxShadow:
        "0 30px 80px rgba(0,0,0,.38)",
    },

    acceptPopup: {
      position: "relative",
      width: "100%",
      maxWidth: msWide(280),
      overflow: "hidden",
      padding: `${ms(25)}px ${ms(
        18
      )}px ${ms(18)}px`,
      borderRadius: ms(25),
      border: "1px solid #bbf7d0",
      background:
        "linear-gradient(145deg, white, #f0fdf4)",
      textAlign: "center",
      boxShadow:
        "0 30px 80px rgba(0,0,0,.38)",
    },

    warningIcon: {
      width: ms(58),
      height: ms(58),
      margin: "0 auto",
      display: "grid",
      placeItems: "center",
      borderRadius: "50%",
      background: "#fee2e2",
      color: "#dc2626",
      fontSize: ms(25),
      fontWeight: 950,
      boxShadow:
        "0 0 0 7px rgba(239,68,68,.08)",
    },

    popupGlow: {
      position: "absolute",
      left: "50%",
      top: ms(-65),
      width: ms(170),
      height: ms(130),
      borderRadius: "50%",
      background:
        "rgba(34,197,94,.20)",
      filter: `blur(${ms(28)}px)`,
      transform: "translateX(-50%)",
    },

    greenTick: {
      position: "relative",
      zIndex: 2,
      width: ms(62),
      height: ms(62),
      margin: "0 auto",
      display: "grid",
      placeItems: "center",
      border: `${ms(5)}px solid #dcfce7`,
      borderRadius: "50%",
      background:
        "linear-gradient(135deg, #22c55e, #15803d)",
      color: "white",
      fontSize: ms(26),
      fontWeight: 950,
    },

    popupTitle: {
      margin: `${ms(17)}px 0 0`,
      color: "#111827",
      fontSize: ms(19),
      lineHeight: 1.06,
      fontWeight: 950,
    },

    popupText: {
      margin: `${ms(10)}px auto 0`,
      maxWidth: msWide(235),
      color: "#57534e",
      fontSize: ms(9),
      lineHeight: 1.45,
      fontWeight: 650,
    },

    popupButtons: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: ms(8),
      marginTop: ms(17),
    },

    cancelButton: {
      minHeight: ms(42),
      border: "1px solid #e7e5e4",
      borderRadius: ms(16),
      background: "#fafaf9",
      color: "#44403c",
      fontSize: ms(9),
      fontWeight: 900,
      cursor: "pointer",
    },

    confirmRejectButton: {
      minHeight: ms(42),
      border: 0,
      borderRadius: ms(16),
      background: "#ef4444",
      color: "white",
      fontSize: ms(9),
      fontWeight: 950,
      cursor: "pointer",
    },

    doneButton: {
      position: "relative",
      zIndex: 2,
      width: "100%",
      minHeight: ms(44),
      marginTop: ms(17),
      border: 0,
      borderRadius: ms(17),
      background:
        "linear-gradient(135deg, #22c55e, #15803d)",
      color: "white",
      fontSize: ms(10.5),
      fontWeight: 950,
      cursor: "pointer",
    },
  };
}

const globalCss = `
* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  width: 100%;
  height: 100%;
  min-height: 100%;
  background: #0b0907;
  overflow: hidden;
}

button,
input,
select,
textarea {
  font: inherit;
}

.rate-page-scroll,
.tracker-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.rate-page-scroll::-webkit-scrollbar,
.tracker-scroll::-webkit-scrollbar,
.material-review-scroll::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

body {
  -webkit-text-size-adjust: 100%;
}

@keyframes reviewSheetUp {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes radarSweep {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes sellerDotPulse {
  0%,
  100% {
    opacity: 0.55;
    transform: scale(0.82);
  }

  50% {
    opacity: 1;
    transform: scale(1.25);
  }
}

@keyframes scannerIconPulse {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.07);
  }
}

@keyframes topBarBeamSweep {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(400%);
  }
}

@keyframes topBarRingPulse {
  0%,
  100% {
    opacity: .85;
    transform: scale(1);
  }

  50% {
    opacity: .25;
    transform: scale(1.16);
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
`;
