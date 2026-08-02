Create a modern, mobile-first Admin Dashboard page for a construction-material ordering platform called StoneRate.

The page should use a light, attractive theme and feel high-tech, polished, premium, and visually stunning. Use clean typography, subtle gradients, soft shadows, refined cards, tasteful animations, and professional icons. The interface should remain easy to understand and comfortable to use on mobile devices. Avoid making the page overly crowded.

TOP ADMIN AREA

At the top of the page, display a personalized admin greeting such as:

“Hi, Alok”

Include a short supporting message such as:

“Here’s what’s happening with StoneRate operations today.”

The header should also include:

- A three-line hamburger menu button
- A notification bell with an unread indicator when alerts are available
- A refresh action or last-updated indicator
- A professional StoneRate Admin identity
- A clean and premium visual treatment suitable for an operations dashboard

THREE-LINE HAMBURGER MENU

When the admin taps the three-line menu, open an attractive side drawer or overlay menu.

The menu should contain:

1. Dashboard
   - Returns to the main admin dashboard

2. Users & Partners
   - Opens account-management options
   - Include Buyers, Sellers, and Transporters
   - Each user category should later support filters for registrations during the past 7 days, 1 month, 3 months, and all time
   - Allow future search by name, phone number, account ID, city, or verification status

3. Support & Issues
   - Opens buyer complaints, material-quality issues, delivery problems, account issues, and transporter concerns

4. Reports & Analytics
   - Opens reports for request volume, material demand, quotation activity, delivery performance, user registrations, and operational trends

5. Notifications
   - Opens all system and operational alerts

6. Activity Log
   - Opens a history of important admin actions, including sample uploads, quotation publishing, assignments, and status changes

7. Settings
   - Opens administrative settings for material categories, vehicle types, quotation validity, sample visibility, image retention, support information, and access control

8. Admin Profile
   - Opens the signed-in administrator’s profile and account settings

9. Logout
   - Signs the administrator out after an appropriate confirmation

The side menu should be attractive, smooth, responsive, and easy to close. Clearly highlight the currently selected page.

DASHBOARD SUMMARY

The homepage should act as a true operational dashboard. Show concise, live summary information without creating duplicate categories.

Include these three main dashboard statistics:

1. Samples Uploaded Today
   - Show the number of material-reference samples uploaded today
   - This count should later come from the backend

2. Rate Requests
   - Show the total number of relevant rate requests
   - Include a smaller indicator for requests that currently require admin action
   - Do not create separate “New Requests” and “Rate Pending” summary cards because those belong to the same Rate Requests workflow

3. Active Orders
   - Show the total number of active delivery orders
   - Include a smaller indicator for orders requiring assignment or status updates
   - Do not create separate “Confirmed Orders” and “Active Orders” cards because confirmed orders are part of the active-order workflow

Do not include Delivered Today as a main dashboard statistic.

The summary cards should be visually distinct, interactive, and easy to scan. Tapping a summary card should open the corresponding operational page with a relevant filter applied.

ATTENTION REQUIRED

Add an “Attention Required” section below the summary.

This section should display only operational items that currently need action. Possible examples include:

- Rate requests waiting for material-wise rates
- Material samples expiring soon
- Active orders waiting for seller or vehicle assignment
- Delivery statuses that have not been updated on time
- Quotations that will expire soon
- Support issues requiring an admin response

Each attention item should:

- Clearly explain the required action
- Use an appropriate visual indicator
- Include a View or Resolve action
- Open the relevant page with the correct filter applied

Use color carefully:

- Amber for actions required soon
- Red for overdue or urgent issues
- Blue for informational updates
- Green for cleared or completed conditions

If there is nothing requiring attention, show a positive empty state such as:

“No urgent actions right now.”

MANAGE OPERATIONS

The main dashboard should provide only three prominent operational buttons:

1. Daily Material Samples
   Supporting text:
   “Upload and manage material reference samples.”

   This will later open a page where the admin can:
   - Upload material images
   - Select material categories
   - Add sample codes
   - Add source areas
   - Add reference notes
   - Set availability
   - View active samples
   - View samples expiring soon
   - View expired samples
   - Preview reference images

2. Rate Requests
   Supporting text:
   “Review buyer requests and publish material-wise rates.”

   This will later open a page where the admin can:
   - View submitted buyer requests
   - Filter by request status
   - View each selected material reference
   - Review quantities and vehicle requirements
   - Enter a separate rate for every material
   - Specify whether transport is included
   - Add material-specific remarks
   - Set quotation validity
   - Publish the quotation

3. Active Orders
   Supporting text:
   “Manage assignments, loading, transit, and delivery.”

   This will later open a page where the admin can:
   - Filter orders by Confirmed, Loading, In Transit, Delivered, or Cancelled
   - Assign sellers
   - Assign transporters, vehicles, and drivers
   - Update loading progress
   - Mark vehicles as dispatched
   - Change delivery status
   - Review selected material-reference images
   - Complete delivery operations

Do not place Users & Partners among these homepage operation buttons. Users & Partners should be available only through the three-line menu.

BOTTOM NAVIGATION

Add a persistent mobile bottom navigation bar with exactly three items:

1. Home
   - Opens the Admin Dashboard

2. Orders
   - Opens the Rate Requests and Active Orders workspace
   - The Orders section may use internal tabs or filters for Rate Requests and Active Orders

3. Samples
   - Opens Daily Material Samples

Clearly highlight the currently active navigation item. Use professional icons and short labels. The bottom navigation should be visually integrated with the light dashboard theme and remain accessible while scrolling.

VISUAL DIRECTION

The overall visual style should be:

- Light and attractive
- High-tech and modern
- Premium and polished
- Mobile-first and responsive
- Visually stunning without becoming cluttered
- Suitable for fast daily operational use
- Consistent with a construction-material marketplace
- Professional rather than playful

Use:

- Clean white or warm-light surfaces
- Subtle amber, orange, blue, and green accents
- Soft shadows and refined borders
- Modern icons
- Smooth menu and card interactions
- Clear status indicators
- Strong visual hierarchy
- Accessible text contrast
- Touch-friendly buttons
- Elegant loading and empty states

Avoid:

- Dark-heavy styling
- Excessive decorative elements
- Duplicate dashboard metrics
- Too many homepage buttons
- Large blocks of unnecessary text
- Hard-coded operational values
- Overcrowded cards
- Repeating Users & Partners on both the homepage and menu
- Repeating Rate Requests as separate New Requests and Rate Pending metrics
- Repeating Active Orders as separate Confirmed and Active metrics

FUNCTIONAL EXPECTATIONS

Prepare the dashboard so all statistics and attention items can later receive live backend data.

Use reusable components for:

- Summary cards
- Attention items
- Operation buttons
- Notification indicators
- Side-menu items
- Bottom-navigation items
- Loading states
- Empty states
- Error states

For the initial frontend version, demonstration data may be used, but clearly structure the code so demonstration values can be replaced with API responses later.

The final result should feel like a sophisticated operational command center for StoneRate, with immediate access to daily samples, rate requests, and active orders, while secondary administrative functions remain organized inside the three-line menu.
