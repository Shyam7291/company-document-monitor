Create a complete, production-quality React component for:

src/pages/Page6.js

This page is the final confirmation and delivery-details step for a construction-material rate-request application called StoneRate.

IMPORTANT REQUIREMENTS

Return the complete Page6.js source code in one response.

Do not return partial snippets.
Do not omit styles.
Do not use TypeScript.
Do not use Tailwind, Bootstrap, Material UI or external UI libraries.
Do not require package installation.
Use standard React JavaScript, React hooks and JSX.
Use inline JavaScript style objects and an internal globalCss string.
The code must compile in StackBlitz React.
Use normal JSX characters, not HTML entities such as &lt; or =&gt;.
Do not insert placeholder comments in place of working functionality.

PRESERVE THIS IMPORT

import { createRateRequest } from "../api/orderApi";

COMPONENT SIGNATURE

Use this exact component signature:

export default function OrderConfirmationPage({
  orderDraft,
  goToPage5,
  goToPage7,
}) {
}

PURPOSE

Page 5 is now a visual material marketplace.

On Page 5, the buyer:

1. Browses daily material sample images.
2. Selects one preferred image per material category.
3. Selects vehicle quantities.
4. Adds multiple materials to a request cart.
5. Continues to Page 6.

Page 6 must:

1. Display the selected material-image references.
2. Display the selected vehicle quantities and tonnage.
3. Allow the buyer to preview each selected image.
4. Collect common delivery and contact information.
5. Validate all required information.
6. Let the buyer confirm the request.
7. Submit the request using createRateRequest.
8. Display a success popup containing the generated SR request ID.
9. Call goToPage7 when the buyer closes the success popup.

Do not remove working backend submission behavior.

ORDER DRAFT RECEIVED FROM PAGE 5

The incoming orderDraft follows this structure:

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

Page 6 must safely handle missing or malformed fields.

Use:

const orderItems = Array.isArray(orderDraft?.materials)
  ? orderDraft.materials
  : [];

Calculate totals safely from the material items rather than blindly trusting frontend-provided totals.

Do not mutate orderDraft directly.

NEW PAGE 6 RESPONSIBILITY

The redesigned Page 5 no longer collects:

- Requested delivery date
- Contact number
- Delivery address
- Buyer notes

Page 6 must collect these fields.

Create React states for:

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

If the incoming orderDraft already contains any of these delivery fields, restore them as the initial values.

DELIVERY DATE

Add a date input for the requested delivery date.

Requirements:

- Required
- Must not allow a past date
- Use the current India date as the minimum
- Display a readable formatted date after selection
- Avoid timezone errors
- Parse YYYY-MM-DD by splitting year, month and day
- Do not create invalid values by appending T00:00:00 to a full ISO timestamp

CONTACT NUMBER

Add a contact-number input.

Requirements:

- Required
- Exactly 10 digits
- Remove non-numeric characters as the buyer types
- Maximum length 10
- Display +91 as a fixed prefix
- Show a clear validation message when invalid

DELIVERY ADDRESS

Add a multiline delivery-address field.

Requirements:

- Required
- Minimum practical length, such as 10 characters
- Maximum 1,000 characters
- Display a location icon
- Add helper text:
  “Use the exact location where the vehicles should deliver the material.”

BUYER NOTES

Add an optional buyer-notes textarea.

Requirements:

- Maximum 2,000 characters
- Show a live character counter
- Example placeholder:
  “Add access instructions, preferred calling time or site directions.”

PAGE DESIGN

Create a genuinely new, premium, high-tech confirmation experience.

The visual design should match a high-end material marketplace:

- Dark graphite and charcoal background
- Warm amber and gold accents
- Metallic borders
- Subtle grid patterns and glows
- Glassmorphism panels
- Clean, compact typography
- Strong visual hierarchy
- High contrast
- Touch-friendly controls
- Smooth but restrained animations
- Premium mobile-commerce checkout feeling
- No oversized headings
- No plain HTML table
- No generic white form layout

For widths of 700px and above:

- Display the application inside a centered 390 × 844 phone frame.

For mobile:

- Use the full viewport.
- Respect safe-area insets.
- Keep the main content vertically scrollable.
- Keep the final submission area accessible.
- Prevent horizontal overflow.

Use a useViewport hook and createStyles(viewport).

HEADER

Create a compact sticky or fixed high-tech header containing:

- Back button calling goToPage5
- Badge: “FINAL REVIEW”
- Page title: “Confirm Your Request”
- Subtitle:
  “Review selected quality references and add delivery details.”
- Compact Edit button calling goToPage5

Below the title, display a premium summary strip:

- Total materials
- Total vehicles
- Total tons

Use the actual recalculated totals.

SELECTED MATERIAL REFERENCE SECTION

Replace the old table with one premium card per selected material.

Each material card must clearly display:

- Large selected reference-image thumbnail
- Material name
- Sample code
- Sample source area
- Sample upload time
- Freshness or expiry status
- Total vehicles
- Total tons
- Vehicle breakdown
- Material-specific admin note, if available
- “Edit selection” button calling goToPage5
- Image-preview button

Example card structure:

[Selected image]

M-Sand
Sample SRMS-401
Sarjapur Plant
Uploaded today

18 tons
1 vehicle
Transport quotation pending

Vehicle breakdown:
Hyva
1 vehicle × 18 tons

Selected reference note:
Fine manufactured sand with a consistent warm-grey appearance.

[View image] [Edit selection]

Do not display seller identity.

IMAGE PREVIEW

When the buyer taps a selected material image or “View image”, open a full-screen preview.

The preview must include:

- Large selected image
- Close button
- Material name
- Sample code
- Source area
- Upload time
- Admin note
- Visual-reference disclaimer

Use this disclaimer:

“This image is a visual material reference. Natural variation, lighting, moisture and dust may affect final appearance.”

The preview must use a dark, high-contrast backdrop.

SELECTED IMAGE EXPIRY BEHAVIOR

The daily marketplace sample may expire after selection.

Page 6 must distinguish between:

1. A sample that expired before the request was submitted.
2. A permanent request snapshot that will be created after submission.

For the frontend confirmation step:

- If sampleExpiresAt is missing, do not crash.
- If a selected sample is already expired, show a red warning.
- Disable submission while any selected sample is expired.
- Tell the buyer:
  “This daily sample has expired. Return to the material gallery and select a fresh reference.”
- Provide a button calling goToPage5.

Do not silently submit an expired reference.

DELIVERY DETAILS SECTION

Create a section titled:

“Delivery details”

Add attractive form cards for:

1. Requested delivery date
2. Contact number
3. Delivery address
4. Optional buyer notes

Use icons, labels, helper text and inline validation.

Do not place all fields in one plain rectangular form.

Each field should have a clear focused state.

ORDER TOTALS SECTION

Add a compact confirmation summary near the bottom showing:

- Number of selected materials
- Total vehicles
- Total tons
- Number of selected visual references

This section should not display quoted rates because the request is still waiting for rate checking.

RATE-ENQUIRY NOTICE

Display a concise notice:

“Rate enquiry only”

Text:

“No payment is required now. StoneRate will check material-wise rates, transport availability and delivery timing before asking for approval.”

Also state:

“Submitting this request does not create a confirmed delivery order.”

WHAT HAPPENS NEXT

Show a compact three-step process:

1. Request submitted
2. StoneRate checks material-wise rates
3. Buyer reviews and confirms the rates

The request will automatically enter the checking stage after submission.

CONFIRMATION CONSENT

Add a premium checkable confirmation card.

Use this exact meaning:

“I confirm that the selected material references, vehicle quantities, requested delivery date, contact number and delivery address are correct.”

The submit button must remain disabled until:

- At least one material exists
- No selected sample is expired
- Requested delivery date is valid
- Contact number is exactly 10 digits
- Delivery address is valid
- Buyer confirmation is checked
- Submission is not already in progress

SUBMISSION PAYLOAD

Before calling createRateRequest, create a new complete request object:

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

Preserve the sample fields inside each material object.

Do not remove:

- sampleId
- sampleCode
- sampleImageUrl
- sampleSourceArea
- sampleUploadedAt
- sampleExpiresAt
- sampleAdminNote

Preserve the vehicle structure expected by the current backend:

{
  vehicleId,
  vehicleName,
  capacityTons,
  quantity,
  totalTons
}

NORMALIZE AND VALIDATE TOTALS

For every material:

- Ensure vehicles is an array.
- Ignore vehicles with a quantity of zero.
- Convert numeric values using Number.
- Recalculate each vehicle’s totalTons.
- Recalculate material totalVehicles.
- Recalculate material totalTons.
- Recalculate full-request totals.

Do not trust the displayed totals alone.

The backend will validate again later.

SUBMISSION STATES

Support:

- Idle
- Validating
- Submitting
- Submission success
- Submission error

During submission:

- Disable navigation-sensitive actions
- Disable the submit button
- Change the label to:
  “Submitting Rate Request...”
- Show an inline loading indicator

On API error:

- Display the error message in a visible red error card
- Keep all buyer-entered fields and selected materials
- Allow retry

Do not clear the draft after an error.

SUCCESS POPUP

After a successful API response, display a premium success popup.

The popup must show:

- Green success symbol
- Heading:
  “Rate Request Submitted”
- Generated request ID from:
  createdRequest?.publicRequestId
- Current status:
  “Checking sellers”
- Supporting text:
  “StoneRate has started checking material-wise rates and transport availability.”
- Done button

The Done button must call:

goToPage7();

Do not navigate to Page 7 before the buyer taps Done.

If the current application redirects Done to Recent Orders through App.js, preserve that callback behavior.

EMPTY OR MISSING DRAFT STATE

If orderDraft is missing or contains no valid materials, do not render a broken confirmation screen.

Display a polished empty state:

- Heading:
  “No materials selected”
- Message:
  “Return to Today’s Materials and add at least one sample to your request.”
- Button calling goToPage5

Do not allow submission.

DRAFT RESTORATION

When the buyer returns from Page 6 to Page 5:

- Call goToPage5
- Do not clear orderDraft
- Preserve delivery fields in local Page 6 state while the component remains mounted
- Ensure the complete draft can later be passed back through App.js if that navigation supports it

Do not use localStorage or sessionStorage.

ACCESSIBILITY

Include:

- type="button" on buttons
- alt text for every image
- aria-label for icon-only actions
- aria-modal on dialogs
- Visible focus states
- Proper labels for every form field
- Sufficient color contrast
- Keyboard-accessible buttons
- Reduced-motion support

PERFORMANCE

Use:

- loading="lazy" for selected thumbnails
- Full image loading only when preview opens
- useMemo for normalized materials and totals
- No network fetching inside Page 6
- No base64 images
- No duplicate full-resolution images

HELPER COMPONENTS

Use helper components in the same file where useful, such as:

- SelectedMaterialCard
- VehicleBreakdown
- ImagePreview
- DeliveryField
- SummaryMetric
- EmptyDraftState
- SuccessPopup

Keep all helpers inside Page6.js.

Do not create additional files.

DO NOT REMOVE EXISTING BUSINESS BEHAVIOR

The current Page 6 already imports and calls createRateRequest.

Preserve:

- createRateRequest integration
- submitted state
- isSubmitting state
- submitError state
- createdRequest state
- generated public request ID display
- confirmation checkbox behavior
- success popup
- goToPage5 navigation
- goToPage7 callback
- no-payment notice

Improve the structure and appearance without breaking those behaviors.

OUTPUT REQUIREMENT

Return only the complete Page6.js code.

