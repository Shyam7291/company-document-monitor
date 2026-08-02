Create a complete, mobile-first Admin Dashboard for a construction-material ordering platform called StoneRate.

TECHNOLOGY REQUIREMENTS

Build the dashboard using React with JavaScript and JSX only.

Generate exactly ONE complete file named:

AdminDashboard.js

Do not generate:

- A separate CSS file
- A README file
- A package.json file
- A separate icon component
- A separate data file
- TypeScript
- Tailwind CSS
- External component libraries
- External icon libraries
- Placeholder code
- Shortened code
- Comments such as “add remaining code here”
- Missing JSX sections

All component code, reusable components, demonstration data, icons, styles, animations, overlays, drawer logic, notification logic, and responsive behavior must be contained inside AdminDashboard.js.

Use React functional components and React Hooks such as:

- useState
- useEffect
- useMemo

The file must export:

export default function AdminDashboard() {
  // Complete implementation
}

Use organized inline style objects or a CSS string rendered through a style tag inside the component. Keep every style scoped to the admin dashboard so the dashboard does not affect buyer pages in the same React application.

The file must compile and run immediately when pasted into an existing React project.

PAGE PURPOSE

The Admin Dashboard should be a compact operational dashboard, not a collection of oversized cards.

The dashboard should quickly answer:

1. What is happening today?
2. What requires admin attention?
3. Which operational area should the admin open next?

The page must feel:

- Highly attractive
- High-tech
- Premium
- Modern
- Stunning
- Clean
- Professional
- Light-themed
- Mobile-first
- Compact
- Easy to scan
- Suitable for daily operational use

Avoid a plain generic admin template. Create a distinctive StoneRate visual identity using subtle construction-material-inspired details, refined gradients, soft glow effects, elegant borders, layered light surfaces, premium typography, and polished micro-interactions.

Do not make the interface dark or visually heavy.

HEADER

At the top, create a compact premium header containing:

- A three-line hamburger menu button
- StoneRate Admin branding
- A small supporting label such as “Operations Dashboard”
- A refresh button
- A notification button with an unread-count badge
- A personalized greeting:

Hi, Alok

- Supporting text:

Here is what is happening with StoneRate operations today.

- A subtle last-updated indicator

Keep the header elegant and compact. Do not allow the header to occupy an excessive portion of the mobile screen.

TODAY’S OVERVIEW

Show exactly three operational statistics:

1. Samples Uploaded Today
2. Rate Requests
3. Active Orders

These three statistics must appear together in ONE compact horizontal row on a normal mobile screen.

Do not make the first statistic full width.

Do not stack the three statistics vertically on standard mobile screens.

Do not create large, tall dashboard cards.

Each statistic should use a compact attractive information tile with:

- A subtle icon
- A normal-sized number
- A short label
- A very small supporting indicator when needed

Example supporting indicators:

- Samples Uploaded Today: “3 expiring soon”
- Rate Requests: “2 require action”
- Active Orders: “1 needs assignment”

The information must remain readable without making the row excessively tall.

Use responsive text and spacing so all three tiles fit properly. Shorten supporting text visually when required, but preserve the meaning.

The statistics should look like refined dashboard indicators, not large content cards.

Do not show:

- New Requests as a separate statistic
- Rate Pending as a separate statistic
- Confirmed Orders as a separate statistic
- Delivered Today

Rate-request statuses will later be handled through filters inside the Rate Requests page.

Confirmed orders will later be handled through filters inside Active Orders.

ATTENTION REQUIRED

Add a compact “Attention Required” section after the overview row.

Show actionable operational alerts such as:

- Requests waiting for material-wise rates
- Material samples expiring soon
- Active orders waiting for assignment
- Delivery statuses requiring updates
- Quotations nearing expiry

Each attention item should be compact and attractive.

Each item should include:

- A small status icon
- A concise title
- One short supporting line
- A small View or Resolve action

Use:

- Red for urgent items
- Amber for actions required soon
- Blue for informational operational actions
- Green for cleared conditions

Do not use large alert cards with excessive empty space.

If there are no alerts, show an elegant positive empty state:

No urgent actions right now.

MANAGE OPERATIONS

Add a “Manage Operations” section containing exactly three main operational buttons:

1. Daily Material Samples
   Supporting text:
   Upload and manage material reference samples.

2. Rate Requests
   Supporting text:
   Review buyer requests and publish material-wise rates.

3. Active Orders
   Supporting text:
   Manage assignments, loading, transit, and delivery.

These operation buttons should be attractive and easy to tap, but should not be oversized.

Give each button:

- A polished icon
- A clear title
- One concise supporting line
- A directional indicator
- A distinctive accent color

Do not include Users & Partners in the Manage Operations section.

THREE-LINE HAMBURGER MENU

When the hamburger button is tapped, open a polished side drawer.

The drawer must fit completely within the mobile viewport.

The drawer must not create horizontal scrolling.

The drawer must not display a horizontal scrollbar.

Menu labels and supporting descriptions must never overlap or collide.

Long labels must wrap naturally if required.

The drawer should have enough width for readable content without exceeding the screen.

The drawer should support vertical scrolling only when the menu content exceeds the available height.

The drawer header should show:

- Admin avatar or initials
- Administrator name: Alok
- Role: StoneRate Administrator
- Close button

Include these menu options:

1. Dashboard
   Description:
   Operations overview

2. Users & Partners
   Description:
   Buyers, sellers, and transporters

3. Support & Issues
   Description:
   Complaints and operational concerns

4. Reports & Analytics
   Description:
   Business and delivery performance

5. Notifications
   Description:
   System and operational alerts

6. Activity Log
   Description:
   Admin action history

7. Settings
   Description:
   Materials, vehicles, quotation validity, sample expiry, image retention, and access control

8. Admin Profile
   Description:
   Account and access settings

9. Logout
   Description:
   Sign out of StoneRate Admin

The active menu item should be visually highlighted.

Logout should have a distinct warning treatment and open a confirmation popup.

Do not duplicate Users & Partners on the homepage.

Users & Partners should appear only inside the hamburger menu.

NOTIFICATIONS

The notification button should open an attractive notification panel or bottom sheet.

Use demonstration notifications such as:

- A new rate request was received
- Material samples are expiring soon
- An active order requires assignment

The notification panel should:

- Fit within the viewport
- Support vertical scrolling if necessary
- Have no horizontal overflow
- Include a close action
- Differentiate unread notifications

BOTTOM NAVIGATION

Add a persistent mobile bottom navigation bar with exactly three items:

1. Home
2. Orders
3. Samples

Home opens the dashboard.

Orders will later open a workspace containing Rate Requests and Active Orders.

Samples will later open Daily Material Samples.

Clearly highlight the active item.

Keep the bottom navigation compact, premium, and integrated with the light theme.

Do not create oversized navigation buttons.

RESPONSIVE BEHAVIOR

The dashboard must work properly on:

- Narrow mobile screens
- Standard mobile screens
- Larger phones
- Tablets
- Desktop previews

On a standard mobile screen:

- The three statistics must remain in one compact row
- The side menu must not overflow horizontally
- All labels must stay readable
- No text should overlap
- No card should be unnecessarily tall
- No horizontal page scrollbar should appear
- No horizontal menu scrollbar should appear
- The bottom navigation should remain fully visible
- The main content should scroll vertically
- Overlays should remain within the viewport

Use sensible responsive adjustments for very narrow screens while preserving the compact visual hierarchy.

ICONS

Create icons inside the same file.

Use one of these approaches:

- Small inline SVG components
- Simple polished CSS icons
- Carefully selected Unicode symbols only when visually appropriate

Prefer consistent inline SVG icons for a premium result.

Do not import icons from another file or external package.

INTERACTIONS

Include working frontend interactions for:

- Opening and closing the side menu
- Opening and closing notifications
- Refreshing the dashboard
- Showing a refreshed timestamp
- Clicking summary statistics
- Clicking attention actions
- Clicking operation buttons
- Switching bottom navigation
- Displaying temporary navigation feedback
- Opening and closing logout confirmation
- Closing overlays by tapping the backdrop
- Closing overlays with the Escape key
- Preventing background scrolling while an overlay is open

Use demonstration data for now.

When a page that does not yet exist is selected, show a polished temporary toast such as:

Opening Rate Requests

Do not cause navigation errors.

VISUAL QUALITY

Focus strongly on making the design attractive and visually impressive.

Use:

- Premium light surfaces
- Warm white and cool-white backgrounds
- Subtle amber, orange, blue, and green accents
- Refined gradients
- Soft shadows
- Elegant borders
- Compact rounded corners
- Clear typography
- Balanced whitespace
- Smooth opening and closing animations
- Subtle hover and press effects
- A professional StoneRate brand identity
- Small high-tech visual details
- Accessible color contrast

Avoid:

- Oversized cards
- Excessively large numbers
- Excessively large headings
- Large empty spaces
- Generic plain white rectangles
- Thick borders
- Heavy shadows
- Dark backgrounds
- Crowded content
- Duplicate information
- Horizontal scrolling
- Text collision
- Truncated menu labels
- Descriptions appearing on the same line as labels
- One statistic taking the complete row
- Different card heights without a clear reason

NORMAL INFORMATION SIZING

Use normal practical font sizes suitable for a mobile admin dashboard.

The greeting may be visually prominent, but it should not dominate the page.

Statistic numbers must be readable but compact.

Labels and indicators must fit naturally.

Cards should be sized according to their information rather than filling unnecessary screen space.

The user should be able to see:

- The header
- The complete three-statistic row
- At least part of the Attention Required section

without excessive scrolling on a standard mobile screen.

CODE QUALITY

Return the complete AdminDashboard.js file only.

Do not include explanations before or after the code.

Do not use markdown placeholders.

Do not omit any component.

Do not shorten repeated sections.

Do not require any file except AdminDashboard.js.

Ensure:

- All JSX tags are complete
- All template strings are valid
- All event handlers are functional
- All variables are defined
- All arrays are included
- All icons are included
- All styles are included
- All responsive rules are included
- The final export is valid
- The code compiles without missing-module errors

The final result should look like a sophisticated, premium, compact StoneRate operations command center, not a generic dashboard made from large cards.
