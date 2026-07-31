Create a complete production-ready React component for src/pages/Page6.js for StoneRate’s final rate-request confirmation page.

Return only the full Page6.js code. Use JavaScript, React hooks, JSX, inline style objects, and an internal globalCss string. No TypeScript, external UI libraries, package installation, partial snippets, placeholders, HTML entities, or extra files. It must compile in StackBlitz.

Preserve:

import { createRateRequest } from "../api/orderApi";

Use exactly:

export default function OrderConfirmationPage({
  orderDraft,
  goToPage5,
  goToPage7,
}) {
}

Page 5 passes:

{
  materials: [{
    materialName,
    sampleId,
    sampleCode,
    sampleImageUrl,
    sampleSourceArea,
    sampleUploadedAt,
    sampleExpiresAt,
    sampleAdminNote,
    vehicles: [{
      vehicleId,
      vehicleName,
      capacityTons,
      quantity,
      totalTons
    }],
    totalVehicles,
    totalTons
  }],
  totalMaterials,
  totalVehicles,
  totalTons,
  createdAt
}

Use:

const orderItems = Array.isArray(orderDraft?.materials)
  ? orderDraft.materials
  : [];

Safely normalize materials without mutating orderDraft. Ensure vehicles is an array, convert numeric fields with Number, exclude zero quantities, recalculate each vehicle totalTons, material totals, and request totals. Preserve all sample fields and the backend vehicle structure.

Create states for requestedArrivalDate, contactNumber, deliveryAddress, orderNotes, confirmed, submitted, isSubmitting, submitError, createdRequest, previewItem, and validationErrors. Restore existing delivery values from orderDraft.

Delivery fields:
- Date: required, not past, India current date as min, readable formatted date, parse YYYY-MM-DD by splitting values to avoid timezone errors.
- Contact: required, fixed +91 prefix, digits only, exactly 10 digits, maxLength 10.
- Address: required, multiline, 10 to 1,000 characters, location icon, helper text: “Use the exact location where the vehicles should deliver the material.”
- Notes: optional, multiline, maximum 2,000 characters, live counter, placeholder: “Add access instructions, preferred calling time or site directions.”

Design a premium high-tech mobile checkout using dark graphite and charcoal, amber and gold accents, metallic borders, subtle grids and glows, glass panels, high contrast, compact typography, touch-friendly controls, and restrained animations. No table or generic white form.

Use useViewport() and createStyles(viewport). At 700px or wider, center a 390 × 844 phone frame. On mobile use the full viewport, safe-area insets, no horizontal overflow, a scrollable main area, and an accessible fixed or sticky submission area.

Header:
- Back and Edit buttons call goToPage5.
- Badge: “FINAL REVIEW”
- Title: “Confirm Your Request”
- Subtitle: “Review selected quality references and add delivery details.”
- Recalculated materials, vehicles, and tons summary.

Render one premium card per material with a lazy-loaded thumbnail, material name, sample code, source area, upload time, fresh or expired state, vehicle and ton totals, vehicle breakdown, optional admin note, View image, and Edit selection. Never show seller identity.

Image preview must be a full-screen dark accessible dialog with full image, close control, material details, admin note, and this disclaimer:

“This image is a visual material reference. Natural variation, lighting, moisture and dust may affect final appearance.”

If sampleExpiresAt is missing, do not crash. If expired, display a red warning, disable submission, show “This daily sample has expired. Return to the material gallery and select a fresh reference.” and provide a goToPage5 button. Never submit an expired sample.

Include compact sections for:
- Materials, vehicles, tons, and visual-reference totals.
- “Rate enquiry only” notice explaining no payment is required and submission does not confirm delivery.
- Three steps: Request submitted; StoneRate checks material-wise rates; Buyer reviews and confirms rates.
- Confirmation checkbox: “I confirm that the selected material references, vehicle quantities, requested delivery date, contact number and delivery address are correct.”

Submit is disabled unless materials exist, samples are unexpired, date/contact/address are valid, consent is checked, and submission is idle.

Before submission create:

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

Then call:

const result = await createRateRequest(completeOrderDraft);

During submission disable navigation-sensitive controls, show an inline loader, and label the button “Submitting Rate Request...”. On error show a red retryable error card without clearing data.

After success show an accessible premium popup with a green success symbol, “Rate Request Submitted”, createdRequest?.publicRequestId, “Checking sellers”, supporting text “StoneRate has started checking material-wise rates and transport availability.”, and a Done button that calls goToPage7(). Do not navigate before Done.

If no valid materials exist, show a polished empty state with “No materials selected”, “Return to Today’s Materials and add at least one sample to your request.”, and a goToPage5 button.

Do not use localStorage, sessionStorage, or network fetching. Include button types, labels, alt text, aria-modal, keyboard support, visible focus, reduced-motion CSS, lazy thumbnails, full image only in preview, useMemo normalization/totals, and helper components in the same file such as SelectedMaterialCard, VehicleBreakdown, ImagePreview, DeliveryField, SummaryMetric, EmptyDraftState, and SuccessPopup.

Return only complete compilable Page6.js code with every helper, style, validation, and behavior included.
