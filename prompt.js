Create a complete, production-quality React component for:

src/pages/Page6.js

StoneRate Page 6 is the final review, delivery-details, and submission step for a construction-material rate request.

CORE REQUIREMENTS

- Return the complete Page6.js source in one response.
- No partial snippets, omitted styles, placeholders, or additional files.
- Use JavaScript, React hooks, JSX, inline style objects, and an internal globalCss string.
- No TypeScript, Tailwind, Bootstrap, Material UI, external UI libraries, or package installation.
- Must compile in StackBlitz React.
- Use normal JSX characters, not HTML entities.
- Preserve this import:

import { createRateRequest } from "../api/orderApi";

Use this exact component signature:

export default function OrderConfirmationPage({
  orderDraft,
  goToPage5,
  goToPage7,
}) {
}

PAGE PURPOSE

Page 5 lets buyers select one daily sample per material category, vehicle quantities, and multiple cart materials.

Page 6 must:

1. Show selected material images and details.
2. Show vehicle quantities and tonnage.
3. Preview each selected image.
4. Collect delivery and contact details.
5. Validate required fields.
6. Confirm and submit through createRateRequest.
7. Show a success popup with the generated SR request ID.
8. Call goToPage7() only when Done is tapped.

Do not remove existing backend submission behavior.

INCOMING DRAFT

{
  materials: [
    {
      materialName,
      sampleId,
      sampleCode,
      sampleImageUrl,
      sampleSourceArea,
      sampleUploadedAt,
      sampleExpiresAt,
      sampleAdminNote,
      vehicles: [
        {
          vehicleId,
          vehicleName,
          capacityTons,
          quantity,
          totalTons
        }
      ],
      totalVehicles,
      totalTons
    }
  ],
  totalMaterials,
  totalVehicles,
  totalTons,
  createdAt
}

Handle missing or malformed fields safely.

Use:

const orderItems = Array.isArray(orderDraft?.materials)
  ? orderDraft.materials
  : [];

Do not mutate orderDraft. Recalculate all totals from normalized materials.

REQUIRED STATE

Create states for:

- requestedArrivalDate
- contactNumber
- deliveryAddress
- orderNotes
- confirmed
- submitted
- isSubmitting
- submitError
- createdRequest
- previewItem
- validationErrors

Restore delivery values from orderDraft when available.

DELIVERY FIELDS

Requested Date:
- Required.
- Cannot be in the past.
- Use the current India date as min.
- Show a readable selected date.
- Avoid timezone errors.
- Parse YYYY-MM-DD by splitting year, month, and day.
- Do not append T00:00:00 to an ISO timestamp.

Contact Number:
- Required and exactly 10 digits.
- Remove non-numeric input while typing.
- Maximum length 10.
- Show fixed +91 prefix.
- Show a clear inline error.

Delivery Address:
- Required.
- Minimum 10 characters.
- Maximum 1,000 characters.
- Multiline input with location icon.
- Helper text: “Use the exact location where the vehicles should deliver the material.”

Buyer Notes:
- Optional.
- Maximum 2,000 characters.
- Show live character count.
- Placeholder: “Add access instructions, preferred calling time or site directions.”

DESIGN

Create a premium, high-tech mobile-commerce checkout experience:

- Dark graphite and charcoal base.
- Warm amber and gold accents.
- Metallic borders, subtle grids, glows, and glass panels.
- Compact typography and strong hierarchy.
- High contrast and touch-friendly controls.
- Restrained animations.
- No plain table or generic white form.

For widths of 700px or more, center the app in a 390 × 844 phone frame.

On mobile:
- Use full viewport.
- Respect safe-area insets.
- Prevent horizontal overflow.
- Keep content vertically scrollable.
- Keep submission controls accessible.

Use useViewport() and createStyles(viewport).

HEADER

Create a compact sticky header containing:

- Back button calling goToPage5.
- “FINAL REVIEW” badge.
- Title: “Confirm Your Request”
- Subtitle: “Review selected quality references and add delivery details.”
- Edit button calling goToPage5.

Add a summary strip showing recalculated total materials, vehicles, and tons.

MATERIAL CARDS

Render one premium card per selected material, showing:

- Large reference thumbnail
- Material name
- Sample code
- Source area
- Upload time
- Freshness or expiry status
- Total vehicles
- Total tons
- Vehicle breakdown
- Admin note when available
- View image button
- Edit selection button calling goToPage5

Do not display seller identity. Use loading="lazy" for thumbnails.

IMAGE PREVIEW

Clicking the image or View image opens a full-screen dark preview containing:

- Full image
- Close button
- Material name
- Sample code
- Source area
- Upload time
- Admin note
- Disclaimer:

“This image is a visual material reference. Natural variation, lighting, moisture and dust may affect final appearance.”

Load the full image only when preview opens.

EXPIRED SAMPLES

If sampleExpiresAt is absent, do not crash.

If a sample expired before submission:

- Show a red warning.
- Disable submission.
- Show: “This daily sample has expired. Return to the material gallery and select a fresh reference.”
- Add a button calling goToPage5.
- Never silently submit an expired sample.

After successful submission, the backend creates the permanent request snapshot.

ADDITIONAL SECTIONS

Request Totals:
- Selected materials
- Total vehicles
- Total tons
- Selected visual references
- Do not show quoted rates.

Rate Enquiry Notice:
- Heading: “Rate enquiry only”
- Text: “No payment is required now. StoneRate will check material-wise rates, transport availability and delivery timing before asking for approval.”
- Also show: “Submitting this request does not create a confirmed delivery order.”

What Happens Next:
1. Request submitted
2. StoneRate checks material-wise rates
3. Buyer reviews and confirms the rates

State that submission automatically enters the checking stage.

CONFIRMATION CONSENT

Add a premium checkbox card with this meaning:

“I confirm that the selected material references, vehicle quantities, requested delivery date, contact number and delivery address are correct.”

Disable submission until:

- At least one valid material exists.
- No sample is expired.
- Delivery date is valid.
- Contact number has exactly 10 digits.
- Delivery address is valid.
- Confirmation is checked.
- Submission is not in progress.

NORMALIZATION

For every material:

- Ensure vehicles is an array.
- Convert numeric values with Number.
- Ignore zero-quantity vehicles.
- Recalculate each vehicle’s totalTons.
- Recalculate material totalVehicles and totalTons.
- Recalculate request totals.

Preserve these sample fields:

- sampleId
- sampleCode
- sampleImageUrl
- sampleSourceArea
- sampleUploadedAt
- sampleExpiresAt
- sampleAdminNote

Preserve each vehicle as:

{
  vehicleId,
  vehicleName,
  capacityTons,
  quantity,
  totalTons
}

SUBMISSION

Before submission, create:

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

const result = await createRateRequest(
  completeOrderDraft
);

Support idle, validating, submitting, success, and error states.

During submission:

- Disable navigation-sensitive actions.
- Disable the submit button.
- Show an inline loader.
- Change label to “Submitting Rate Request...”

On error:

- Show a visible red error card.
- Preserve materials and buyer-entered fields.
- Allow retry.
- Do not clear the draft.

SUCCESS POPUP

After success, show:

- Green success symbol
- “Rate Request Submitted”
- createdRequest?.publicRequestId
- Status: “Checking sellers”
- Text: “StoneRate has started checking material-wise rates and transport availability.”
- Done button

Done must call:

goToPage7();

Do not navigate before Done is tapped.

EMPTY STATE

If no valid materials exist, show:

- “No materials selected”
- “Return to Today’s Materials and add at least one sample to your request.”
- Button calling goToPage5

Do not allow submission.

NAVIGATION AND RESTORATION

- Calling goToPage5 must not clear orderDraft.
- Preserve Page 6 field state while mounted.
- Allow App.js to pass the completed draft back if supported.
- Do not use localStorage or sessionStorage.

ACCESSIBILITY AND PERFORMANCE

Include:

- type="button" on buttons
- Image alt text
- Icon-button aria-label
- aria-modal dialogs
- Proper field labels
- Keyboard interaction
- Visible focus states
- Sufficient contrast
- Reduced-motion support
- useMemo for normalized materials and totals
- No fetching inside Page 6
- No base64 images
- No duplicate full-resolution images

Keep helper components in the same file, such as:

- SelectedMaterialCard
- VehicleBreakdown
- ImagePreview
- DeliveryField
- SummaryMetric
- EmptyDraftState
- SuccessPopup

OUTPUT

Return only the complete Page6.js code. Do not add explanations, partial snippets, ellipses, or references to existing styles. Include every helper, style, CSS rule, validation, and working behavior required for compilation.
