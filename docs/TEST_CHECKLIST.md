# Manual Test Checklist

## Navigation & shell
- [ ] Every route in the README route table loads without a 404 or unhandled error
- [ ] Desktop nav highlights the active section; mobile bottom nav appears only when authenticated
- [ ] Breadcrumbs and back buttons are present on all interior pages and link correctly
- [ ] Footer links (Privacy, Terms, Resources, FAQ, Help) all resolve

## Auth
- [ ] "Continue with demo account" on `/login`, `/signup`, and `/` all seed identical demo data
- [ ] Manual signup blocks submission when passwords don't match, and shows an inline error
- [ ] Manual signup requires the Terms/Privacy acknowledgement checkbox
- [ ] `/forgot-password` shows a confirmation state after submission
- [ ] Signing out clears local demo state and redirects to `/`
- [ ] Visiting a protected route while signed out redirects to `/login`

## Dashboard
- [ ] Empty state renders correctly for a brand-new (non-demo) signup with zero claims
- [ ] Demo dashboard shows both seeded claims, correct document/timeline/event counts, deadlines,
      notifications, and recent activity
- [ ] "Report an Incident" and "Rate My Claim" CTAs are visible and functional

## Incident intake
- [ ] Category picker (`/report-incident`) links to both intake flows with correct descriptions
- [ ] Step counter and percent-complete update as fields are filled
- [ ] Required fields block "Save and continue" with a clear inline error; skippable fields allow
      "I don't know" / "Not applicable" / "I will provide this later"
- [ ] Back / Next / Exit and return later / Save as draft all behave correctly
- [ ] Review step lists all prior steps and supports jumping back to edit
- [ ] Submitting shows a confirmation screen with links to Rate My Claim, Documents, and Dashboard
- [ ] Reloading the browser mid-flow preserves progress (autosave via localStorage)

## Documents
- [ ] Uploading a file (simulated) adds it to the correct claim's document list
- [ ] Category, description, and "mark important" controls all persist
- [ ] Recommended-documents list reflects the selected claim's category
- [ ] Removing a document updates the list and dashboard counts

## Timeline
- [ ] Adding an event with a date and title appends it in chronological order
- [ ] Editing and deleting existing events works and updates immediately
- [ ] Demo claims show pre-seeded, chronologically ordered events

## Rate My Claim
- [ ] Score, band, and all sub-metrics render for a claim with data
- [ ] "How this score was produced" factor list sums sensibly and matches visible claim data
- [ ] "Improve My Score" routes back into the relevant intake flow
- [ ] "Request Lawyer Review" routes to Lawyer Matches
- [ ] Limitation notice is always visible and unambiguous (no outcome/settlement claims)

## Lawyer matches
- [ ] Matches filter correctly by the selected claim's category
- [ ] Requesting a consultation requires the consent checkbox before "Confirm & send" is enabled
- [ ] Confirmed requests show a persistent confirmation state per lawyer card

## Resources & FAQ
- [ ] Category filters on `/resources` narrow results correctly; "Open" expands/collapses content
- [ ] FAQ search filters both questions and answers; accordion opens one at a time

## Responsive / accessibility
- [ ] All pages are usable at a 375px-wide mobile viewport and a 1440px desktop viewport
- [ ] Interactive elements show a visible focus ring when tabbed to
- [ ] Color contrast is legible for body text and disclaimer banners

## Build
- [ ] `npm run build` completes with no type errors
- [ ] `npm run dev` boots and the demo flow works end-to-end with no console errors
