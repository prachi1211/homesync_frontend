# HomeSync — Epic & Story Definitions

**Groceries · Chores · Expenses · Intelligence — One App for Shared Living**

---

| Field          | Value              |
|----------------|--------------------|
| **Author**     | Prachi             |
| **Version**    | 1.0                |
| **Date**       | February 16, 2026  |
| **Status**     | Draft              |
| **Classification** | Internal       |

---

## Revision History

| Version | Date       | Author | Changes |
|---------|------------|--------|---------|
| 1.0     | 02/16/2026 | Prachi | Initial epic definitions. Full story breakdown across 8 epics: Auth, Household Management, Groceries & Intelligence, Chores, Expenses & Budgets, Analytics, Notifications, and PWA. Post-MVP items identified. Derived from HomeSync PRD v4.1. |

---

## Document Overview

This document defines the complete set of Epics and User Stories for HomeSync — a comprehensive household management platform that unifies grocery coordination, chore tracking, shared expense splitting, budgeting, fairness analytics, and household intelligence into a single web application with PWA support.

HomeSync supports both **solo users** (one-person households managing personal tasks, groceries, and budgets) and **shared households** (2–5 members splitting chores, expenses, and responsibilities).

**Conventions used in this document:**

- Stories marked with 🟠 are **Post-MVP** and should be deferred to a future sprint.
- Stories are numbered within each epic using the format `EPIC_PREFIX-XX` (e.g., `AUTH-01`, `GRC-03`).
- Acceptance criteria are written from the perspective of the acting user.
- "Member" refers to any authenticated user within a household. "Owner" refers to the household creator with elevated permissions.
- All monetary calculations use 2 decimal places with rounding remainder assigned to the payer.

---

## Roles Summary

| Role | Description |
|------|-------------|
| **Owner** | The user who created the household. Can rename, delete, remove members, and transfer ownership. Also has all Member capabilities. |
| **Member** | A user who has joined a household via invite code/link. Can manage groceries, chores, expenses, and view analytics for that household. |
| **Solo User** | An Owner who is the only member in their household. All features adapt gracefully — split fields hidden, chores default to personal, budget tracks individual spending. |

---

## Table of Contents

1. [Epic 1: Authentication & User Management](#epic-1-authentication--user-management)
2. [Epic 2: Household Management](#epic-2-household-management)
3. [Epic 3: Groceries & Household Intelligence](#epic-3-groceries--household-intelligence)
4. [Epic 4: Chores](#epic-4-chores)
5. [Epic 5: Expenses, Budgets & Settlements](#epic-5-expenses-budgets--settlements)
6. [Epic 6: Analytics & Fairness](#epic-6-analytics--fairness)
7. [Epic 7: Notifications & Reminders](#epic-7-notifications--reminders)
8. [Epic 8: Progressive Web App (PWA)](#epic-8-progressive-web-app-pwa)
9. [Cross-Cutting: Dashboard](#cross-cutting-dashboard)
10. [Cross-Cutting Concerns](#cross-cutting-concerns)
11. [Data Model Overview](#data-model-overview)
12. [API Endpoint Summary](#api-endpoint-summary)
13. [Post-MVP Backlog Summary](#post-mvp-backlog-summary)

---

## Epic 1: Authentication & User Management

### Epic Overview

| Field | Details |
|-------|---------|
| **Epic ID** | AUTH |
| **Goal** | Provide secure, per-user access to the application via email/password and Google OAuth so that household data is private, users have personalized experiences, and sessions are managed securely with JWT. |
| **Primary Actors** | Unauthenticated visitor, Authenticated user |
| **Dependencies** | Supabase Auth or Passport.js (Google OAuth), Email service (password reset), bcrypt (hashing) |
| **Success Metric** | A new user can register, log in, and reach their household dashboard within 30 seconds. |

---

### AUTH-01: User Registration (Email/Password)

**As a** new user, **I want to** register with my email and password **so that** I can create an account and start managing my household.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-01.1 | Registration form: Name (required), Email (required, valid format), Password (required, min 8 chars, at least one letter + one number), Confirm Password. | Must Have |
| AUTH-01.2 | Client-side validation: all required fields present, email format, password strength, passwords match. | Must Have |
| AUTH-01.3 | Server-side validation: duplicate email check (reject if email already exists). | Must Have |
| AUTH-01.4 | On success: create User record, hash password with bcrypt, issue JWT access token (15 min) + refresh token (7 days), redirect to Household onboarding (create or join). | Must Have |
| AUTH-01.5 | On validation error: inline field-level errors without clearing other fields. | Must Have |
| AUTH-01.6 | Link to "Already have an account? Log in." | Must Have |

#### Acceptance Criteria

- Submitting with all valid fields creates a User record and redirects to the household setup page.
- Submitting with a duplicate email shows: "An account with this email already exists."
- Password "abc" shows: "Password must be at least 8 characters with at least one letter and one number."
- Mismatched confirm password shows: "Passwords do not match."

#### Page Layout

- **Desktop**: Centered card (max-width 440px) on a clean background. Logo at top. Form fields stacked vertically. "Sign up with Google" button below the form. Link to login at bottom.
- **Mobile**: Full-width with padding. Same stacked layout.

---

### AUTH-02: Google OAuth Login

**As a** user, **I want to** sign in with my Google account **so that** I can access HomeSync without creating a separate password.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-02.1 | "Sign in with Google" button on both login and register pages. | Must Have |
| AUTH-02.2 | On first-time Google login: create a new User record using Google profile data (name, email, avatar, google_id). Issue JWT tokens. Redirect to household onboarding. | Must Have |
| AUTH-02.3 | On subsequent Google login: match by google_id → issue JWT tokens → redirect to dashboard. | Must Have |
| AUTH-02.4 | If a user registered with email and later tries Google OAuth with the same email: link the Google account to the existing user (set google_id). | Should Have |
| AUTH-02.5 | OAuth flow managed via Supabase Auth or Passport.js with Google strategy. | Must Have |

#### Acceptance Criteria

- A new user clicking "Sign in with Google" → completes Google consent → lands on the household onboarding page with their name/avatar populated from Google.
- A returning user clicking "Sign in with Google" → lands on their dashboard within 2 seconds.
- A user who registered with email "maya@example.com" and later signs in with Google using the same email → same account, no duplicate created.

---

### AUTH-03: Login (Email/Password)

**As a** registered user, **I want to** log in with my email and password **so that** I can access my households and data.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-03.1 | Login form: Email, Password, "Log In" button. | Must Have |
| AUTH-03.2 | On valid credentials: issue JWT access token (15 min) + refresh token (7 days). Redirect to dashboard (or household onboarding if no households). | Must Have |
| AUTH-03.3 | On invalid credentials: "Invalid email or password." No indication of which field is wrong. | Must Have |
| AUTH-03.4 | "Forgot password?" link (see AUTH-05). | Must Have |
| AUTH-03.5 | "Sign in with Google" button. | Must Have |
| AUTH-03.6 | Link to "Don't have an account? Sign up." | Must Have |

#### Acceptance Criteria

- Valid credentials redirect to the dashboard within 1 second.
- Three consecutive failed attempts from the same IP within 5 minutes trigger a 60-second rate-limit cooldown.
- After the cooldown, the user can attempt again normally.

---

### AUTH-04: Session Management & Logout

**As a** logged-in user, **I want** my session to stay active across page reloads and expire securely **so that** I don't have to log in constantly but my account stays protected.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-04.1 | JWT access token (15 min) stored in memory. Refresh token (7 days) stored in httpOnly cookie or secure storage. | Must Have |
| AUTH-04.2 | **Automatic token refresh**: when an API call returns 401, the frontend interceptor calls `/auth/refresh` with the refresh token, obtains a new access token, and retries the original request — all transparently. | Must Have |
| AUTH-04.3 | **Refresh token rotation**: each refresh request issues a new refresh token and invalidates the old one. | Must Have |
| AUTH-04.4 | Expired refresh token → redirect to login page. Clear all client-side state. | Must Have |
| AUTH-04.5 | **Logout**: POST /auth/logout → revoke refresh token server-side → clear all tokens client-side → redirect to login. | Must Have |
| AUTH-04.6 | All API endpoints except `/auth/*` require a valid access token. Return 401 if missing or invalid. | Must Have |

#### Acceptance Criteria

- A user whose access token expires mid-session sees no interruption — the refresh happens transparently and the original request succeeds.
- A user whose refresh token expires is redirected to login with no stale data visible.
- After logout, pressing the browser back button does not show authenticated content.

---

### AUTH-05: Password Reset

**As a** user who forgot my password, **I want to** reset it via email **so that** I can regain access to my account.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-05.1 | "Forgot password?" page: email input + submit button. | Must Have |
| AUTH-05.2 | On submit: if email exists, generate a secure reset token (1-hour expiry), send email with reset link. Always show: "If an account exists with this email, you'll receive a reset link." (prevents email enumeration). | Must Have |
| AUTH-05.3 | Reset link opens a "Set New Password" form: Password, Confirm Password. Same validation rules as registration. | Must Have |
| AUTH-05.4 | On success: update password hash, invalidate all existing refresh tokens for this user, redirect to login with success message. | Must Have |
| AUTH-05.5 | Expired or invalid reset token: "This reset link has expired or is invalid. Please request a new one." | Must Have |

#### Acceptance Criteria

- Submitting a valid email sends the reset email within 60 seconds.
- Submitting a non-existent email shows the same generic message (no email enumeration).
- A reset token used after 1 hour shows the expiry error.
- After resetting, the user can log in with the new password immediately.

---

### AUTH-06: User Profile

**As a** logged-in user, **I want to** view and edit my profile **so that** I can keep my information up to date.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-06.1 | Profile page at `/settings`: displays Name, Email (read-only), Avatar. | Should Have |
| AUTH-06.2 | Edit name. Save → updates immediately. | Should Have |
| AUTH-06.3 | Upload avatar image (JPEG/PNG, max 2MB) or use Gravatar. Stored in Supabase Storage. | Should Have |
| AUTH-06.4 | Change password: Current Password, New Password, Confirm New Password. Validates current password before allowing change. | Should Have |
| AUTH-06.5 | Household list: all households the user belongs to with name, role, and "Leave" or "Switch" actions. | Should Have |
| AUTH-06.6 | Link to Notification Preferences (Epic 7). | Should Have |
| AUTH-06.7 | Logout button. | Must Have |

#### Acceptance Criteria

- Changing name is reflected in the header and all household member lists immediately.
- Uploading a new avatar replaces the old one across all UI components.
- Changing password with incorrect current password shows: "Current password is incorrect."

---

## Epic 2: Household Management

### Epic Overview

| Field | Details |
|-------|---------|
| **Epic ID** | HSH |
| **Goal** | Enable users to create households, invite members via shareable codes, switch between multiple households, and manage membership — with full support for single-person households that scale seamlessly when members join. |
| **Primary Actors** | Owner, Member, Solo User |
| **Dependencies** | Auth (authenticated users only) |
| **Success Metric** | A user can create a household and invite a roommate who joins within 60 seconds of receiving the invite code. |

---

### HSH-01: Create a Household

**As a** registered user, **I want to** create a new household **so that** I can start managing groceries, chores, and expenses in a shared space.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| HSH-01.1 | Create Household form: Household Name (required). | Must Have |
| HSH-01.2 | On success: create Household record, set the creating user as Owner, generate a unique 6-character alphanumeric invite code, create a HouseholdMember record linking the user. | Must Have |
| HSH-01.3 | Redirect to the Dashboard for the new household. | Must Have |
| HSH-01.4 | The household appears immediately in the user's household selector in the header. | Must Have |
| HSH-01.5 | **Single-person mode activates by default**: a household with one member adapts all features gracefully (details in HSH-06). | Must Have |

#### Acceptance Criteria

- Creating "Apartment 4B" → household appears in the selector, Dashboard loads with empty states and appropriate single-person UI.
- The invite code is displayed prominently on the household settings page for easy sharing.
- A user can create multiple households (e.g., one for roommates, one for family).

---

### HSH-02: Invite & Join a Household

**As a** household Owner, **I want to** invite others to my household via a shareable code or link **so that** my roommates/family can join and collaborate.

**As a** registered user, **I want to** join an existing household using an invite code **so that** I can access the shared grocery list, chores, and expenses.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| HSH-02.1 | Each household has a unique 6-character alphanumeric invite code and a shareable invite link (e.g., `/join?code=ABC123`). | Must Have |
| HSH-02.2 | **Share invite**: Owner can view and copy the invite code/link from the household settings page. | Must Have |
| HSH-02.3 | **Join form**: "Join a Household" page with a text input for the invite code. Also accessible via the invite link which auto-fills the code. | Must Have |
| HSH-02.4 | On valid code: create a HouseholdMember record with role `member`. Redirect to the Dashboard of the joined household. | Must Have |
| HSH-02.5 | Validation: reject if the user is already a member of this household ("You're already a member of this household"). | Must Have |
| HSH-02.6 | Validation: reject if the code is invalid ("Invalid invite code. Please check and try again."). | Must Have |
| HSH-02.7 | After joining, all multi-member features activate for the household (splits, balances, rotation, etc.) if the household previously had only one member. | Must Have |

#### Acceptance Criteria

- A user entering code "ABC123" that maps to "Apartment 4B" → joins and sees the Dashboard with existing data.
- A user already in "Apartment 4B" entering the same code → sees the "already a member" error.
- After a second member joins a solo household, the expense form gains split-type and split-among fields, the chores page shows rotation options, and the balance panel appears.

---

### HSH-03: Switch Between Households

**As a** user who belongs to multiple households, **I want to** switch between them quickly **so that** I can manage different living situations separately.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| HSH-03.1 | **Household selector** in the header: dropdown showing all households the user belongs to, with the active household highlighted. | Must Have |
| HSH-03.2 | Switching households immediately reloads all page data (dashboard, groceries, chores, expenses, analytics) scoped to the newly selected household. | Must Have |
| HSH-03.3 | The active household persists across page reloads and sessions (stored in localStorage or user preferences). | Must Have |
| HSH-03.4 | If a user has no households (all deleted/left): redirect to the "Create or Join" onboarding page. | Must Have |

#### Acceptance Criteria

- A user in "Apartment 4B" switches to "Family Home" → Dashboard refreshes with Family Home's data within 500ms.
- Reloading the page after a switch shows the last-selected household.
- If the user's only household is deleted by the owner, they see the "Create or Join" page on next load.

---

### HSH-04: Household Settings & Member Management

**As a** household Owner, **I want to** manage household settings and members **so that** I can rename the household, remove inactive members, or transfer ownership.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| HSH-04.1 | Household settings page: display name (editable), invite code (copyable), member list, and danger zone actions. | Must Have |
| HSH-04.2 | **Rename household**: Owner can edit the household name. Save → updates immediately across all members. | Must Have |
| HSH-04.3 | **Member list**: show all members with name, role (Owner/Member), and join date. | Must Have |
| HSH-04.4 | **Remove member** (Owner only): click to remove a member with confirmation. Historical data (chore completions, expenses paid) is preserved. The removed member loses access immediately. | Must Have |
| HSH-04.5 | **Transfer ownership** (Owner only): select a member → confirm → ownership transfers. Old owner becomes a regular member. | Must Have |
| HSH-04.6 | **Delete household** (Owner only): confirmation modal → soft-deletes (archives) the household and all associated data. All members lose access. | Must Have |
| HSH-04.7 | **Leave household** (non-owners): click "Leave" with confirmation. If the last member leaves, the household is archived. | Must Have |

#### Acceptance Criteria

- Removing Maya from "Apartment 4B" → Maya can no longer access that household. Her historical expense and chore data remains visible to other members.
- Transferring ownership from Maya to David → Maya sees "Member" badge, David sees "Owner" badge and gains access to settings.
- Deleting a household removes it from all members' household selectors immediately.
- The last member leaving a household triggers archival — the household no longer appears for anyone.

#### Page Layout

- **Settings Page**: Household name (inline editable) at top. Invite code with "Copy" button. Member list as a table: Name, Role Badge, Joined Date, Actions (Remove — owner only). Below: "Transfer Ownership" dropdown + button. Danger zone at bottom: "Delete Household" button (red, with confirmation modal). "Leave Household" button for non-owners.

---

### HSH-05: Household Onboarding

**As a** newly registered user with no households, **I want to** see a clear choice between creating a new household or joining an existing one **so that** I can get started immediately.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| HSH-05.1 | After registration (or login with no households): display an onboarding page with two options — "Create a Household" and "Join with Invite Code." | Must Have |
| HSH-05.2 | "Create a Household" → inline form for household name → creates and redirects to Dashboard. | Must Have |
| HSH-05.3 | "Join with Invite Code" → inline form for code → validates and redirects to Dashboard. | Must Have |
| HSH-05.4 | Clean, welcoming design with brief explanation of what a household is. | Must Have |

#### Acceptance Criteria

- A newly registered user who has no households lands on this page.
- After creating or joining, subsequent logins go directly to the Dashboard.

#### Page Layout

- **Desktop**: Two side-by-side cards. Left: "Create a Household" with name input and create button. Right: "Join a Household" with code input and join button. Brief description above each.
- **Mobile**: Cards stack vertically.

---

### HSH-06: Single-Person Mode

**As a** solo user, **I want** the entire app to work seamlessly for just me **so that** I can track my own groceries, chores, and spending without seeing irrelevant multi-person features.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| HSH-06.1 | When a household has exactly one member, the following UI adaptations apply automatically — no user configuration needed. | Must Have |
| HSH-06.2 | **Expenses**: split-type selector and split-among field are hidden. Expenses are logged as personal spending. Balance panel and settlement UI are hidden. | Must Have |
| HSH-06.3 | **Chores**: all chores function as self-assigned (personal reminders). Rotation and "assigned to all" labels are hidden. | Must Have |
| HSH-06.4 | **Budget**: budget tracking works as personal spending tracker. | Must Have |
| HSH-06.5 | **Analytics**: chore chart shows the solo user's completions. Expense chart shows personal spending breakdown. Fairness indicator is hidden. | Must Have |
| HSH-06.6 | When a second member joins: all multi-member features (splits, balances, rotation, fixed chores) activate automatically with no manual configuration. | Must Have |

#### Acceptance Criteria

- A solo user sees no "Paid by" dropdown, no "Split among" checkboxes, no balance panel, and no "Settle Up" button on the Expenses page.
- A solo user creating a chore sees no assignment type selector — it defaults to personal.
- After a second member joins, the solo user's next page load shows the full multi-member UI: split options, balance panel, chore assignment types.

---

## Epic 3: Groceries & Household Intelligence

### Epic Overview

| Field | Details |
|-------|---------|
| **Epic ID** | GRC |
| **Goal** | Provide a centralized, shared grocery list with intelligent auto-categorization, priority management, purchase tracking, low-stock detection, suggested re-order lists, and grocery-to-expense linking — reducing cognitive load and anticipating household needs. |
| **Primary Actors** | All household members |
| **Dependencies** | Household Management (household context), Expenses (grocery → expense linking), Dashboard (surfaces suggestions and low-stock alerts) |
| **Success Metric** | A user can add a grocery item in under 5 seconds, and after 4 weeks of usage, the system correctly suggests 3+ items the household is likely running low on. |

---

### GRC-01: Add Grocery Items

**As a** household member, **I want to** quickly add items to the shared grocery list **so that** everyone in the household can see what needs to be bought.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| GRC-01.1 | Add item form: Name (required), Quantity (optional, defaults to 1, must be >0), Priority (Low/Medium/High, defaults to Medium). | Must Have |
| GRC-01.2 | On submission: POST to API. **Auto-categorize** the item via keyword matching (Section 12 of PRD: 11 categories from Produce to Personal Care, with "Other" as fallback). | Must Have |
| GRC-01.3 | New item appears under the correct category group instantly (optimistic UI or fast refetch). | Must Have |
| GRC-01.4 | Form resets after successful submission. Focus returns to the Name input for rapid consecutive adds. | Must Have |
| GRC-01.5 | Validation: empty name shows inline error. Item is not created. | Must Have |

#### Acceptance Criteria

- Adding "Almond Milk" → auto-categorized under "Dairy & Eggs," appears in that group immediately.
- Adding "Sponge" → auto-categorized under "Household & Cleaning."
- Adding "Fancy New Gadget" (no keyword match) → categorized as "Other."
- Adding with empty name → inline error, no API call.
- After submitting "Bananas," the form clears and the cursor is in the Name field — ready for the next item.

#### Page Layout

- **Add Item Form**: Horizontal row (desktop): Name input (wide), Quantity input (narrow, number), Priority dropdown (narrow), "Add" button. Stacks vertically on mobile. Priority defaults to Medium.

---

### GRC-02: Grocery List Display & Interaction

**As a** household member, **I want to** see the grocery list organized by category, mark items as bought, and delete items **so that** I can efficiently shop and manage the list.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| GRC-02.1 | Display items **grouped by category** with collapsible section headers. Each header shows category name and item count. | Must Have |
| GRC-02.2 | Each item row: checkbox (toggle bought/unbought), item name, quantity badge, priority indicator (color-coded dot: green/amber/red), delete button. | Must Have |
| GRC-02.3 | **Toggle bought/unbought**: single click/tap on the checkbox. State persists across reloads. | Must Have |
| GRC-02.4 | Bought items: **strikethrough text, muted opacity**. Remain visible unless filtered out. | Should Have |
| GRC-02.5 | **Delete item**: click delete → confirmation (or swipe on mobile) → item removed. | Must Have |
| GRC-02.6 | **Filter bar**: toggle buttons — "All," "Unbought," "High Priority." Active filter highlighted. Filters update the view instantly. | Must Have |
| GRC-02.7 | **Empty state**: icon + "Your grocery list is empty. Add your first item above." | Must Have |

#### Acceptance Criteria

- A list with 8 items across 3 categories shows 3 collapsible sections with correct grouping.
- Checking "Almond Milk" → strikethrough + muted. Refreshing the page → still checked.
- Filtering "Unbought" hides all bought items. Switching to "All" shows them again.
- Filtering "High Priority" shows only items with priority = High.
- Deleting the last item in a category collapses that category section.

---

### GRC-03: Low-Stock Detection

**As a** household member, **I want** the system to detect when commonly purchased items are likely running low **so that** I can proactively add them to the grocery list before we run out.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| GRC-03.1 | When an item is toggled to "bought," create a `GroceryPurchaseLog` record: item name (normalized), purchased_at timestamp, purchased_by. | Must Have |
| GRC-03.2 | **Low-stock detection logic**: for items purchased at least 3 times, calculate the average days between purchases. When the current days since last purchase exceeds the average, flag the item as "likely low." | Should Have |
| GRC-03.3 | Surface low-stock items in the Dashboard's "Needs Attention" section with a "Low Stock" badge. | Should Have |
| GRC-03.4 | 🟠 Surface low-stock items as push notifications (PWA): "You might be running low on Almond Milk." | Post-MVP |
| GRC-03.5 | Low-stock detection does **not** trigger for items purchased fewer than 3 times (insufficient data). | Should Have |

#### Acceptance Criteria

- Milk purchased on Jan 1, Jan 8, Jan 15 (avg 7 days). If it's Jan 24 (9 days since last purchase, exceeds 7-day average) → "Milk" is flagged as likely low.
- An item purchased only twice is never flagged, regardless of time elapsed.
- Flagged items appear in the Dashboard "Needs Attention" section with a distinct "Low Stock" badge.

---

### GRC-04: Suggested Grocery List

**As a** household member, **I want** the system to suggest items I probably need to buy **so that** I don't have to remember recurring purchases.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| GRC-04.1 | **Suggested grocery list**: identify items purchased 3+ times in the last 60 days that are **not** currently on the active grocery list. | Should Have |
| GRC-04.2 | Display suggestions in a "You Might Need" section on the Groceries page (collapsible) and the Dashboard. | Should Have |
| GRC-04.3 | Each suggestion: item name with a **one-tap "+" button** to add it to the active grocery list (with default quantity and medium priority). | Should Have |
| GRC-04.4 | After adding a suggestion, it disappears from the suggestion list. | Should Have |

#### Acceptance Criteria

- A household that buys "Eggs" weekly and "Bananas" every 5 days sees both in the suggested list when neither is on the active grocery list.
- Tapping "+" on "Eggs" → adds "Eggs" to the active list under "Dairy & Eggs" with qty 1, priority Medium. The suggestion disappears.
- An item already on the active list never appears in suggestions.

#### Page Layout

- **Groceries Page**: Collapsible banner above the categorized list. Horizontal scroll of suggestion chips on mobile. Each chip: item name + "+" button.
- **Dashboard**: "You Might Need" section with the same chip layout.

---

### GRC-05: Grocery → Expense Linking

**As a** household member, **I want** to quickly log a grocery trip as a shared expense after marking items as bought **so that** I don't have to separately navigate to the Expenses page.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| GRC-05.1 | After marking one or more items as bought, show an optional inline prompt: "Log expense for this shopping trip?" with a text input for the total amount and a "Log Expense" button. | Should Have |
| GRC-05.2 | Pre-fill the expense description: "Grocery Run — [Today's Date]." Category pre-set to "Groceries." | Should Have |
| GRC-05.3 | On submit: create an Expense record with the entered amount, paid by the current user, default equal split among all members. | Should Have |
| GRC-05.4 | The prompt is **dismissible** — closing it does not affect the bought toggle. | Should Have |
| GRC-05.5 | In solo mode: prompt still appears but creates a personal expense (no split). | Should Have |

#### Acceptance Criteria

- After checking off 3 items, a subtle prompt appears below the list or as a toast: "Log expense?" with a dollar amount input.
- Entering $45 and tapping "Log Expense" → creates a Groceries expense for $45, split equally, and shows a success toast.
- Dismissing the prompt → items remain bought, no expense created.
- The prompt does not block or slow down the bought-toggle interaction.

---

## Epic 4: Chores

### Epic Overview

| Field | Details |
|-------|---------|
| **Epic ID** | CHR |
| **Goal** | Provide a smart chore management system with three distinct assignment models (fixed for all, fairly rotating, and personal self-assigned), configurable frequencies from daily to monthly, completion tracking with timestamps, and automatic rotation logic to ensure fairness. |
| **Primary Actors** | All household members |
| **Dependencies** | Household Management (member list for assignment), Analytics (completion data feeds fairness charts) |
| **Success Metric** | A household of 3 members can set up 5 rotating chores and have the system fairly distribute assignments with zero manual intervention after initial setup. |

---

### CHR-01: Add a Chore

**As a** household member, **I want to** add a chore with a specific assignment type and frequency **so that** the household has clear, recurring responsibilities.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| CHR-01.1 | Add chore form: Name (required), **Assignment Type** (Fixed / Rotating / Personal — segmented control), **Frequency** (Daily, Every 2 Days, Every 3 Days, Weekly, Biweekly, Monthly — dropdown). | Must Have |
| CHR-01.2 | **Fixed (All Members)**: no additional input needed — the chore is automatically assigned to every household member. Each member tracks completion independently. Example: "Clean your own room (mop & vacuum)." | Must Have |
| CHR-01.3 | **Rotating**: additional input — "Participants" multi-select (defaults to all members) to define the rotation pool. First assignment is random or alphabetical. | Must Have |
| CHR-01.4 | **Self-Assigned (Personal)**: auto-assigned to the creating user. No participant selector. Visible only to the creator. Functions as a personal reminder. | Must Have |
| CHR-01.5 | On submission: create Chore record with `assignment_type`, `frequency`, and `current_assignee` (null for fixed, set for rotating/personal). | Must Have |
| CHR-01.6 | Validation: empty name shows inline error. | Must Have |
| CHR-01.7 | **Solo user behavior**: when a household has one member, assignment type selector is hidden. All chores default to self-assigned (personal). | Should Have |

#### Acceptance Criteria

- Adding "Take Out Trash" as Rotating, Weekly, with all 3 members → creates chore, auto-assigns to one member, shows "Next: [Member B]" indicator.
- Adding "Clean Your Room" as Fixed → appears on every member's chore list independently.
- Adding "Descale Coffee Machine" as Personal, Biweekly → visible only to the creator.
- Solo user adding a chore sees only a name input and frequency dropdown. No assignment type selector.

#### Page Layout

- **Add Chore Form**: Name input (wide), Assignment Type segmented control (Fixed/Rotating/Personal), Frequency dropdown. For Rotating: "Participants" multi-select appears below. "Add Chore" button. Stacks vertically on mobile.

---

### CHR-02: Chore List Display & Status

**As a** household member, **I want to** see all my chores with their status, assignment type, and frequency **so that** I know what needs to be done and when.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| CHR-02.1 | Chore list: card-based layout. Each card shows: chore name, **assignment type badge** (Fixed — blue, Rotating — purple, Personal — gray), frequency badge, current assignee (for rotating) or "All Members" (for fixed) or "Just You" (for personal), status (Pending — amber, Completed — green, Overdue — red), last completed date. | Must Have |
| CHR-02.2 | **View tabs**: "All Chores," "My Chores" (chores assigned to or involving the current user), "Overdue." | Must Have |
| CHR-02.3 | **Auto-determine status**: compute pending/overdue based on frequency and the member's last completion date. Daily → overdue if not completed today. Every 2 Days → overdue if >2 days since last completion. Weekly → overdue after 7 days. Biweekly → overdue after 14 days. Monthly → overdue after 30 days. | Must Have |
| CHR-02.4 | Overdue chores: **red left border accent** and sorted to the top of the list. | Should Have |
| CHR-02.5 | For **fixed chores**: each member sees their own completion status independently. Member A completing it does not affect Member B's status. | Must Have |
| CHR-02.6 | For **rotating chores**: only the current assignee sees the "Mark Complete" button. Other members see "Assigned to [Name]." | Must Have |
| CHR-02.7 | **Rotation indicator** on rotating chores: "Next: [Member Name]" label. | Should Have |
| CHR-02.8 | **Empty state**: "No chores set up yet. Add a chore to get started." | Must Have |

#### Acceptance Criteria

- A fixed chore "Clean Your Room" with 3 members: Maya's card shows "Completed" (she did it), David's shows "Overdue" (he didn't), Sam's shows "Pending."
- A rotating chore "Take Out Trash" assigned to David: David sees "Mark Complete" button; Maya and Sam see "Assigned to: David."
- Overdue tab shows only chores where the current user has an overdue status.
- "My Chores" tab shows fixed chores (user's own status), rotating chores (if currently assigned or in the rotation pool), and all personal chores.

---

### CHR-03: Complete a Chore & Rotation Logic

**As a** household member, **I want to** mark a chore as complete **so that** the system tracks my contribution and advances the rotation for shared chores.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| CHR-03.1 | "Mark Complete" button on each chore card (visible per rules in CHR-02). | Must Have |
| CHR-03.2 | On click: create a `ChoreCompletionLog` record (chore_id, completed_by, completed_at). Update the chore's status to "Completed" for this member. | Must Have |
| CHR-03.3 | For **rotating chores**: after completion, automatically set `current_assignee` to the next member in the rotation queue. The next assignee is the member in the participant pool with the **fewest completions** of this specific chore (ties broken by round-robin order). | Must Have |
| CHR-03.4 | After rotation advance: the chore card updates to show the new assignee and "Next: [Member]." | Must Have |
| CHR-03.5 | For **fixed chores**: completion applies only to the completing member. Other members' status and "Mark Complete" button are unaffected. | Must Have |
| CHR-03.6 | For **personal chores**: completion resets the cycle for the solo user (e.g., biweekly chore completed today → next due in 14 days). | Must Have |

#### Acceptance Criteria

- Maya completes rotating chore "Take Out Trash" (Maya: 5 completions, David: 3, Sam: 4) → auto-assigned to David (fewest completions).
- Sam completes fixed chore "Clean Your Room" → his status changes to "Completed." Maya's and David's status remain unchanged.
- Completing a daily chore at 11 PM → status resets to "Pending" the next day.
- Completing a biweekly chore on Feb 1 → overdue status appears Feb 15 if not done again.

---

### CHR-04: Delete a Chore

**As a** household member, **I want to** delete a chore that is no longer relevant **so that** the chore list stays clean.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| CHR-04.1 | Delete button on each chore card. | Should Have |
| CHR-04.2 | **Permission**: Owner can delete any chore. Creator can delete their own chore. For personal chores, only the assignee can delete. | Should Have |
| CHR-04.3 | Confirmation modal: "Delete [Chore Name]? Completion history will be preserved for analytics." | Should Have |
| CHR-04.4 | On delete: remove the Chore record. ChoreCompletionLog entries are **preserved** (for analytics accuracy). | Should Have |

#### Acceptance Criteria

- Deleting "Take Out Trash" removes it from all members' chore lists. Historical completion data remains in analytics.
- A member who is not the creator or owner cannot delete a fixed or rotating chore (button hidden or disabled).
- A personal chore can only be deleted by its creator.

---

## Epic 5: Expenses, Budgets & Settlements

### Epic Overview

| Field | Details |
|-------|---------|
| **Epic ID** | EXP |
| **Goal** | Provide a Splitwise-style expense tracking system with three split types (equal, percentage, exact), inline receipt attachment, real-time balance calculation, debt simplification for minimal settlement transactions, recurring expense automation, household budgets with threshold alerts, and auto-generated monthly summaries. |
| **Primary Actors** | All household members |
| **Dependencies** | Household Management (member list for splits), Supabase Storage (receipt images), Notifications (budget alerts), Dashboard (budget utilization, balances) |
| **Success Metric** | A 3-member household can log 30 expenses over a month and at the end, the system produces the minimum number of settlement transactions needed to zero all balances. |

---

### EXP-01: Add an Expense

**As a** household member, **I want to** log a shared expense with flexible splitting options and an optional receipt **so that** the household can track who owes whom.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| EXP-01.1 | Add expense form: Description (required), Amount (required, >0), Paid-by (dropdown of members, defaults to current user), Split type (Equal / Percentage / Exact — segmented control), Split-among (multi-select checkboxes, defaults to all members), Date (date picker, defaults to today), Category (dropdown: Groceries, Utilities, Rent, Dining Out, Household Supplies, Transportation, Entertainment, Other), Tag (optional text input), **Receipt attachment** (camera/file picker, JPEG/PNG, max 5MB, with thumbnail preview). | Must Have |
| EXP-01.2 | **Equal split** (default): total / number of selected members. Rounding remainder to the payer. | Must Have |
| EXP-01.3 | **Percentage split**: per-member percentage input fields appear. UI enforces sum = 100%. | Must Have |
| EXP-01.4 | **Exact amount split**: per-member dollar input fields appear. UI enforces sum = total expense amount. | Must Have |
| EXP-01.5 | On submit: create Expense record + ExpenseSplit records for each member. Upload receipt to Supabase Storage. Update balances. | Must Have |
| EXP-01.6 | **Validation**: Amount must be >0. Percentage must sum to 100%. Exact amounts must sum to total. At least one member selected in split-among. Description required. | Must Have |
| EXP-01.7 | **Solo user mode**: split-type selector, split-among checkboxes, paid-by dropdown, and balance panel are all hidden. Expense is logged as personal spending against the budget. | Should Have |

#### Acceptance Criteria

- $90 expense, equal split among 3 members → $30 each.
- $100 expense, percentage split 50%/30%/20% → $50/$30/$20.
- $100 expense, exact split $60/$25/$15 → validates sum = $100.
- $10 expense, equal split among 3 → $3.34 (payer) + $3.33 + $3.33. Rounding remainder to payer.
- Attaching a receipt shows a thumbnail preview in the form. After submit, the receipt is viewable inline in the expense log.
- Amount of 0 or -5 → "Amount must be greater than zero."
- Percentages summing to 95% → "Percentages must add up to 100%."

#### Page Layout

- **Form**: Description input (full width), Amount input ($) + Paid-by dropdown (same row), Split type segmented control, Split-among checkboxes (with "Select All" toggle) — when Percentage or Exact selected, per-member input fields appear inline below each checkbox. Date picker + Category dropdown + Tag input (same row). Receipt attachment button with thumbnail preview. "Add Expense" submit button.

---

### EXP-02: Expense Log & Details

**As a** household member, **I want to** see a chronological log of all expenses with full details **so that** I can review spending and verify accuracy.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| EXP-02.1 | Expense log: chronological list sorted newest first. Each entry: description, total amount, who paid, split summary (e.g., "$30 each" or "Maya: $50, David: $30, Sam: $20"), date, category badge, tag pill (if any), receipt thumbnail icon (if receipt attached). | Must Have |
| EXP-02.2 | Click a receipt icon to view the full receipt image (modal or inline expansion). | Must Have |
| EXP-02.3 | Settlement entries visually distinct: green background/accent. Example: "David paid Maya $20 — Settlement." | Must Have |
| EXP-02.4 | **Delete expense**: delete button per entry → confirmation modal. CASCADE deletes split records. Balances recalculate as if the expense never existed. | Must Have |
| EXP-02.5 | **Filter bar**: date range picker, category dropdown, paid-by dropdown, tag search. | Should Have |
| EXP-02.6 | Pagination or infinite scroll. Default: 20 entries per page. | Should Have |
| EXP-02.7 | **Empty state**: "No expenses logged yet. Add your first expense above." | Must Have |

#### Acceptance Criteria

- A household with 15 expenses and 3 settlements shows all 18 entries in chronological order, settlements visually distinct.
- Deleting a $60 expense that was split 3 ways → each member's balance adjusts by $20.
- Filtering by "Dining Out" shows only dining expenses.
- Clicking a receipt thumbnail opens the full-size image.

---

### EXP-03: Real-Time Balances & Settlement

**As a** household member, **I want to** see how much I owe or am owed, with a simplified settlement plan, and be able to record payments **so that** we can settle up efficiently.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| EXP-03.1 | **Balance summary panel**: grid of member cards. Each card shows the member's name and net balance. Green for positive ("is owed $XX"), red for negative ("owes $XX"). | Must Have |
| EXP-03.2 | **Debt simplification**: below the balance cards, show a settlement summary using the greedy algorithm (match largest debtor to largest creditor, repeat until all zero). Example: "To settle up: David pays Maya $20, Sam pays Maya $15." This minimizes the number of transactions. | Must Have |
| EXP-03.3 | **Settle Up button**: opens a modal. Fields: Who is paying (dropdown), Who is receiving (dropdown), Amount (pre-filled from settlement summary). Submit creates a Settlement record and adjusts balances. | Must Have |
| EXP-03.4 | Settlement records do **not** modify original expenses — they create new Settlement entries that affect balance calculations. | Must Have |
| EXP-03.5 | Settlement amount validation: cannot exceed the amount owed. | Must Have |
| EXP-03.6 | Balances always sum to zero across all household members (invariant). | Must Have |
| EXP-03.7 | **Hidden in solo mode**: balance panel, settlement summary, and settle up button are not rendered when household has one member. | Should Have |

#### Acceptance Criteria

- 3 members: Maya paid $60 (split equally), David paid $30 (split equally). Balances: Maya +$30, David -$10, Sam -$20. Settlement: "Sam pays Maya $20, David pays Maya $10." (2 transactions minimum).
- David clicks "Settle Up," pays Maya $10 → David's balance goes to $0. Settlement entry appears in the log with green styling.
- At all times: sum of all member balances = $0.00 (automated test).
- Attempting to settle $50 when only $20 is owed → "Settlement amount exceeds outstanding balance."

---

### EXP-04: Recurring Expenses

**As a** household member, **I want to** set up recurring expenses (like rent or utilities) **so that** they auto-generate each cycle without manual re-entry.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| EXP-04.1 | **Create recurring template**: description, amount, paid-by, split type + config, category, frequency (weekly/monthly), start date. | Should Have |
| EXP-04.2 | **Cron job**: on the scheduled date, auto-create a **draft expense** (is_draft = true) from the template. Draft does not affect balances. | Should Have |
| EXP-04.3 | Draft appears in the expense log with a "Pending Confirmation" badge and "Confirm" / "Edit" / "Dismiss" actions. | Should Have |
| EXP-04.4 | **Confirm**: sets is_draft = false → balances update. **Edit**: opens the expense form pre-filled for modification before confirming. **Dismiss**: deletes the draft. | Should Have |
| EXP-04.5 | Recurring template management: list active templates with "Edit" and "Pause/Resume" actions. | Should Have |
| EXP-04.6 | Push/in-app notification when a recurring draft is created: "Recurring expense due: Rent $2,400." | Should Have |

#### Acceptance Criteria

- Template "Rent $2,400, monthly, 1st of month" → on March 1, a draft expense appears with "Pending" badge.
- Confirming the draft updates all member balances according to the split config.
- Editing the draft before confirming allows changing the amount (e.g., utility bill varies month to month).
- Pausing a template prevents future drafts from being generated until resumed.

#### Page Layout

- **Recurring Section** (Expenses page, collapsible): list of templates. Each: description, amount, frequency, next due date, Pause/Resume toggle, Edit button. Draft expenses appear at the top of the main expense log with a distinct "Pending" badge.

---

### EXP-05: Household Budget

**As a** household member, **I want to** set a weekly or monthly spending budget **so that** we know when we're approaching our limit and should be careful about the next purchase.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| EXP-05.1 | **Set budget**: overall household budget (weekly or monthly) and optionally per-category budgets (e.g., $500/month for Dining Out). | Must Have |
| EXP-05.2 | **Budget progress bar**: displayed at the top of the Expenses page. Shows "$X / $Y — Z%." Color transitions: green (0–79%), amber (80–99%), red (100%+). | Must Have |
| EXP-05.3 | Per-category budget progress (collapsible below main bar) if category budgets are set. | Should Have |
| EXP-05.4 | **Warning at 80%**: surface a warning in the Dashboard "Needs Attention" section and trigger a notification. | Must Have |
| EXP-05.5 | **Alert at 100%**: show "Budget Exceeded" badge in the Dashboard and on the Expenses page. Trigger a notification. | Must Have |
| EXP-05.6 | Budget utilization is computed at query time by summing confirmed (non-draft) expenses within the current period window. Weekly resets Monday; monthly resets on the 1st. | Must Have |
| EXP-05.7 | **Manage budgets page**: create, edit, delete budgets. "Manage Budgets" link from the Expenses page. | Must Have |
| EXP-05.8 | **Solo user**: budget works as a personal spending tracker. | Should Have |

#### Acceptance Criteria

- Budget set to $2,000/month. $1,600 logged → progress bar shows "80%," amber color, warning notification sent.
- Additional $500 logged → "$2,100 / $2,000 — 105%," red, "Budget Exceeded" alert in Dashboard.
- Category budget "Dining Out $400/month" with $350 spent → shows 87.5% in the per-category view.
- Deleting an expense recalculates budget utilization immediately.
- On the 1st of a new month, the monthly budget resets to $0 spent.

---

### EXP-06: Monthly Expense Summary

**As a** household member, **I want** an auto-generated summary at the end of each month **so that** we can review spending patterns and stay informed.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| EXP-06.1 | **Auto-generate** a monthly summary on the 1st of each month for the prior month (cron job). Also available **on-demand** via a month selector. | Should Have |
| EXP-06.2 | Summary includes: total spending, breakdown by category (horizontal bar chart), per-member contributions (who paid what — table), comparison to monthly budget (over/under with dollar amount), and top 5 largest expenses. | Should Have |
| EXP-06.3 | Displayed as a dedicated collapsible section within the Expenses page. Month selector dropdown to view past summaries. | Should Have |
| EXP-06.4 | 🟠 **Spending recommendations**: AI-powered insights such as "Dining Out increased 40% vs. last month — consider a category budget." | Post-MVP |

#### Acceptance Criteria

- On Feb 1, the January summary auto-generates. Total spending = $3,200, category breakdown accurate, per-member totals match sum of their paid expenses.
- Budget comparison: budget was $3,000, spent $3,200 → "Over budget by $200."
- Top 5 shows the 5 largest individual expenses by amount.
- Selecting "December" from the month dropdown shows December's summary.
- A month with zero expenses shows "$0 total" with a friendly empty message.

---

## Epic 6: Analytics & Fairness

### Epic Overview

| Field | Details |
|-------|---------|
| **Epic ID** | ANL |
| **Goal** | Provide transparent, data-driven visibility into household contributions for both chores and expenses — showing who's doing what and who's paying what — so that fairness conversations are grounded in facts, not feelings. Designed as a transparency tool, not a competition. |
| **Primary Actors** | All household members |
| **Dependencies** | Chores (completion log data), Expenses (payment data), Household Management (member list) |
| **Success Metric** | A household member can see the full contribution breakdown for the last month within 3 seconds of opening the Analytics page. |

---

### ANL-01: Chore Contribution Dashboard

**As a** household member, **I want to** see how chore completions are distributed across members **so that** we have transparent visibility into who's been doing what.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| ANL-01.1 | **Horizontal bar chart**: per-member count of chores completed for the selected time period. | Must Have |
| ANL-01.2 | **Time period selector**: This Week, This Month, 3 Months, All Time (segmented control). | Should Have |
| ANL-01.3 | Below chart: a simple table with Member Name and Completion Count for detailed reference. | Must Have |
| ANL-01.4 | **Assignment type awareness**: chart can be filtered or broken down by Fixed / Rotating / Personal. Personal chores only show for the member who created them. | Should Have |
| ANL-01.5 | All analytics scoped to the active household and visible to all members. | Must Have |

#### Acceptance Criteria

- A household with Maya (12 completions this month), David (8), Sam (10) → bar chart shows three bars with correct proportions.
- Switching from "This Month" to "All Time" re-renders the chart instantly with lifetime data.
- A solo user sees a single bar (their own completions) with no empty/broken chart.

---

### ANL-02: Expense Contribution Dashboard

**As a** household member, **I want to** see how expenses are distributed across members and categories **so that** we understand our spending patterns and individual contributions.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| ANL-02.1 | **Per-member bar chart**: total paid vs. total owed for each member. | Must Have |
| ANL-02.2 | **Category breakdown**: donut/pie chart showing spending by expense category (Groceries, Dining Out, etc.). | Must Have |
| ANL-02.3 | **Monthly spending trend**: line chart showing total household spending per month for the last 6 months. | Must Have |
| ANL-02.4 | **Time period selector** shared with chore dashboard (same segmented control). | Should Have |
| ANL-02.5 | All analytics scoped to the active household. | Must Have |

#### Acceptance Criteria

- A household that spent $1,200 on Groceries and $800 on Dining Out this month → donut chart shows correct proportions.
- Monthly trend shows 6 data points (or fewer if the household is newer).
- A solo user sees their personal spending breakdown by category (no "total paid vs. owed" — that's multi-member only).

---

### ANL-03: Fairness Indicator

**As a** household member, **I want** a visual indicator of relative chore contribution **so that** we can have informed conversations about fairness without it feeling confrontational.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| ANL-03.1 | **Fairness bar**: a stacked horizontal bar showing each member's relative share of total chore completions. No numerical score — just a proportional visual. | Should Have |
| ANL-03.2 | Labels: "Contribution Overview" — explicitly non-judgmental framing. | Should Have |
| ANL-03.3 | **Hidden in solo mode**: fairness indicator doesn't render for single-member households. | Should Have |
| ANL-03.4 | Contextual note below the chart: "Contributions may vary — some imbalances are temporary and intentional." | Should Have |

#### Acceptance Criteria

- 3 members with 40%/35%/25% share → bar segments reflect these proportions with member names/colors.
- Solo user → fairness section does not render.
- No numerical "fairness score" or ranking is shown — just the visual bar.

#### Design Principles

- **Transparency, not gamification**: no points, badges, leaderboards, or rankings.
- **Non-judgmental framing**: "Contribution Overview" not "Who's Doing More."
- **Contextual**: always shows the time period being analyzed.

---

### ANL-04: Analytics Page Layout

**As a** household member, **I want** all analytics in one organized page **so that** I can understand the household's contribution patterns at a glance.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| ANL-04.1 | Route: `/analytics`. | Must Have |
| ANL-04.2 | **Time period selector** at top (shared across all sections). | Should Have |
| ANL-04.3 | **Chore section**: bar chart + table (ANL-01). | Must Have |
| ANL-04.4 | **Expense section**: paid vs. owed chart + category donut (ANL-02). Side by side on desktop, stacked on mobile. | Must Have |
| ANL-04.5 | **Monthly trend section**: line chart (ANL-02.3). | Must Have |
| ANL-04.6 | **Fairness indicator** (ANL-03) — at bottom of chore section. | Should Have |

#### Acceptance Criteria

- All charts render with correct data. Switching time periods re-renders all charts.
- On mobile, all charts stack vertically and are full-width.
- Charts handle zero-data states gracefully (empty chart with "No data for this period" message).

---

## Epic 7: Notifications & Reminders

### Epic Overview

| Field | Details |
|-------|---------|
| **Epic ID** | NTF |
| **Goal** | Proactively surface timely information to household members through in-app, email, and push (PWA) notification channels — covering chore reminders, expense alerts, budget warnings, recurring expense prompts, and low-stock detections — with per-user configurability. |
| **Primary Actors** | All household members (receivers), System (sender) |
| **Dependencies** | Email service (Resend/SendGrid), PWA (push notifications), All other epics (event sources) |
| **Success Metric** | Every significant household event (expense logged, chore overdue, budget threshold hit) reaches the relevant user within 60 seconds via in-app notification and/or email. |

---

### NTF-01: In-App Notification System

**As a** household member, **I want to** see in-app notifications for household events **so that** I'm aware of updates without relying on email.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NTF-01.1 | **Notification bell** in the header with unread count badge. | Must Have |
| NTF-01.2 | Clicking the bell opens a **notification panel** (dropdown or slide-out) showing recent notifications sorted newest first. | Must Have |
| NTF-01.3 | Each notification: type icon, title, brief message, relative timestamp ("2 hours ago"), read/unread indicator. | Must Have |
| NTF-01.4 | **Notification types**: New Expense logged by another member, Chore Overdue, Chore Completed (by another member for a rotating chore you're next for), Recurring Expense Due, Budget Warning (80%), Budget Exceeded (100%), Low-Stock Alert, Member Joined/Left household. | Must Have |
| NTF-01.5 | Click a notification → navigate to the relevant page (e.g., Expenses page for a new expense). Mark as read on click. | Must Have |
| NTF-01.6 | "Mark All as Read" action. | Must Have |
| NTF-01.7 | Paginated: 10 per page in the panel with "Load More." | Should Have |
| NTF-01.8 | Notifications fetched via polling (every 30 seconds) or on page/tab focus. | Must Have |

#### Acceptance Criteria

- Maya logs a $45 expense → David and Sam see a notification "Maya logged $45.00 for Groceries" within 30 seconds.
- Clicking the notification navigates to the Expenses page. The notification is marked as read and the badge count decreases.
- "Mark All as Read" clears all unread indicators and resets the badge to 0.

---

### NTF-02: Email Notifications

**As a** household member, **I want to** receive configurable email notifications **so that** I stay informed even when I'm not actively using the app.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NTF-02.1 | **Daily household digest** (morning, 8 AM in user's timezone or UTC): summary of yesterday's activity — expenses logged, chores completed, chores overdue, budget status. | Should Have |
| NTF-02.2 | **Immediate expense alert**: when an expense above a configurable threshold is logged by another member. | Should Have |
| NTF-02.3 | **Weekly chore summary**: sent Monday morning. Chores completed vs. overdue per member for the past week. | Should Have |
| NTF-02.4 | **Budget alerts**: email when budget hits 80% and when exceeded. | Should Have |
| NTF-02.5 | All emails use consistent HomeSync branding: logo, colors, footer with unsubscribe/preferences link. | Should Have |
| NTF-02.6 | Emails managed by cron jobs (daily digest, weekly summary) and event-driven triggers (expense, budget). | Should Have |

#### Acceptance Criteria

- A user with daily digest enabled receives an email at 8 AM UTC summarizing yesterday's activity.
- A user with digest disabled receives no email.
- Budget 80% email: "Your household has used 80% of the $2,000 monthly budget. $400 remaining."

---

### NTF-03: Push Notifications (PWA)

**As a** household member who has installed the PWA, **I want to** receive push notifications on my device **so that** I get timely alerts without opening the app.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NTF-03.1 | Push notifications for: overdue chore reminders, new expense logged by another member, recurring expense due for confirmation, budget threshold warnings, low-stock alerts. | Should Have |
| NTF-03.2 | **Opt-in flow**: on first login, request push permission with a clear explanation: "Allow notifications to get chore reminders and expense alerts." Respect denial gracefully — in-app and email still work. | Must Have |
| NTF-03.3 | Push subscription stored in `PushSubscription` table (endpoint, keys). Delivered via Web Push protocol with VAPID keys. | Should Have |
| NTF-03.4 | Clicking a push notification opens the relevant page in the PWA. | Should Have |

#### Acceptance Criteria

- A user who grants push permission receives an overdue chore notification the morning it becomes overdue.
- A user who denies push → no push notifications, no repeated permission prompts. In-app and email still function.
- Push notification for "New Expense: $45 for Groceries by Maya" → tapping opens the Expenses page.

---

### NTF-04: Notification Preferences

**As a** household member, **I want to** control which notifications I receive and through which channels **so that** I'm not overwhelmed with alerts.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NTF-04.1 | **Notification preferences page** (Route: `/settings/notifications`). | Must Have |
| NTF-04.2 | Table of notification types with **toggle switches per channel**: In-App, Email, Push. | Must Have |
| NTF-04.3 | Types: New Expense, Chore Overdue, Recurring Expense Due, Low-Stock Alert, Budget Warning, Budget Exceeded, Member Joined, Daily Digest, Weekly Summary. | Must Have |
| NTF-04.4 | Disabling a type+channel immediately stops delivery. | Must Have |
| NTF-04.5 | Defaults: In-App = ON for all. Email = OFF for all. Push = OFF for all. | Should Have |

#### Acceptance Criteria

- A user disables "Chore Overdue" for Email → no more chore overdue emails. In-app notifications for chore overdue still work (if enabled).
- A user enables "Daily Digest" for Email → starts receiving the 8 AM email the next morning.

#### Page Layout

- **Preferences Page**: Table with notification type names as rows. Three columns: In-App, Email, Push. Each cell is a toggle switch. Save is automatic (toggle triggers PATCH).

---

## Epic 8: Progressive Web App (PWA)

### Epic Overview

| Field | Details |
|-------|---------|
| **Epic ID** | PWA |
| **Goal** | Provide a near-native mobile experience through PWA capabilities: installability (home screen icon), offline viewing of cached data, and push notification support — so users can access HomeSync without visiting an app store. |
| **Primary Actors** | All users (particularly mobile users) |
| **Dependencies** | Notifications (push delivery), Frontend build system (Workbox/service worker) |
| **Success Metric** | Lighthouse PWA audit score ≥ 90. App is installable, shows cached data offline, and delivers push notifications on supported browsers. |

---

### PWA-01: Service Worker & Caching

**As a** mobile user, **I want** the app to load quickly and show my last-viewed data when offline **so that** I can check my grocery list at the store even with spotty connectivity.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| PWA-01.1 | **Service worker** (via Workbox): intercepts network requests. Caches static assets (JS, CSS, images) with a cache-first strategy. Caches API responses (groceries, chores, balances) with a network-first strategy (fallback to cache if offline). | Should Have |
| PWA-01.2 | **Offline indicator**: when offline, display a prominent banner: "You're offline. Showing cached data." | Should Have |
| PWA-01.3 | 🟠 **Offline action queue**: actions taken while offline (toggling bought, marking chore complete) are queued in IndexedDB and synced when connectivity returns. | Post-MVP |
| PWA-01.4 | Cache invalidation: when the user comes back online, fresh data is fetched and the cached version is updated. | Should Have |

#### Acceptance Criteria

- Opening HomeSync in airplane mode shows the last-viewed grocery list, chore list, and balance summary with the "You're offline" banner.
- Returning online → banner disappears, data refreshes with latest from server.
- Static assets (app shell) load from cache → first meaningful paint under 1 second even on slow connections.

---

### PWA-02: Installability & Manifest

**As a** mobile user, **I want to** install HomeSync on my home screen **so that** I can access it like a native app without opening the browser.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| PWA-02.1 | **Web app manifest** (`manifest.json`): app name ("HomeSync"), short name, start URL ("/"), display mode (standalone), theme color, background color, icons (192px, 512px). | Should Have |
| PWA-02.2 | **Install prompt**: browser shows the "Add to Home Screen" banner automatically (or custom install button within the app). | Should Have |
| PWA-02.3 | **Standalone mode**: when launched from home screen, the app opens without browser chrome (URL bar, tabs). | Should Have |
| PWA-02.4 | **Splash screen**: brief branded splash screen on launch (auto-generated from manifest). | Should Have |

#### Acceptance Criteria

- On Android Chrome, visiting HomeSync shows "Add to Home Screen" prompt after 2+ visits.
- Tapping the home screen icon launches the app in standalone mode (no browser chrome).
- Lighthouse "Installable" check passes.

---

### PWA-03: Push Notification Infrastructure

**As the** system, **I need** push notification infrastructure **so that** NTF-03 (push notifications) can deliver alerts to users who have installed the PWA.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| PWA-03.1 | Generate VAPID keys (public + private). Store in backend environment variables. | Should Have |
| PWA-03.2 | Frontend: on push opt-in (NTF-03.2), subscribe via Push API. Send subscription (endpoint, keys) to backend → stored in `PushSubscription` table. | Should Have |
| PWA-03.3 | Backend: `web-push` library sends notifications to subscribed endpoints. | Should Have |
| PWA-03.4 | Service worker `push` event listener: displays the notification with title, body, icon, and click action (opens relevant page). | Should Have |

#### Acceptance Criteria

- Backend sends a push notification → user's device shows the notification with correct title and body.
- Tapping the notification opens HomeSync to the relevant page.
- An expired or invalid subscription endpoint is cleaned up (deleted from the database) on send failure.

---

## Cross-Cutting: Dashboard

The Dashboard is not a standalone epic but draws from all other epics. It is built incrementally as each epic delivers its data.

### DSH-01: Dashboard (Route: /)

**As a** household member, **I want** a single landing page that shows everything that needs my attention **so that** I can quickly assess the household's status.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| DSH-01.1 | **Summary cards row** (8 cards): Total Groceries, Unbought Count, Total Chores, Overdue Chores, Total Expenses (This Month), Net Balance, Low-Stock Items Count, Budget Utilization (% spent with progress bar). | Must Have |
| DSH-01.2 | **"Needs Attention" section**: high-priority unbought groceries, overdue chores (for the current user), unsettled balances above a threshold, upcoming recurring expenses (due within 3 days), low-stock items, budget warnings (80%+). When empty: "All caught up!" | Must Have |
| DSH-01.3 | **"You Might Need" section**: suggested grocery items (GRC-04) as horizontal scrollable chips with "+" buttons. | Should Have |
| DSH-01.4 | **Recent activity feed**: last 10 household actions (expense logged, chore completed, item added) with timestamps and member names. | Should Have |
| DSH-01.5 | **Quick navigation**: cards linking to Groceries, Chores, Expenses, Analytics. | Must Have |
| DSH-01.6 | Data scoped to the active household. Refreshes on page load and on household switch. | Must Have |
| DSH-01.7 | **Solo user adaptations**: hide "Net Balance" card. Budget card functions as personal spending tracker. | Should Have |

#### Acceptance Criteria

- A household with 2 overdue chores, 3 high-priority unbought items, and budget at 85% → all appear in "Needs Attention."
- A household with no issues → "All caught up!" message.
- Switching households reloads all dashboard data within 500ms.
- All summary card values match the database state for the active household.

#### Page Layout

- **Desktop (1024px+)**: Summary cards in a row or 4+4 grid. Two-column below: "Needs Attention" left, "Activity Feed" right. "You Might Need" and "Quick Navigation" below.
- **Tablet (768–1023px)**: Summary cards in 4+4 grid. Single column for content below.
- **Mobile (<768px)**: Cards stack vertically. Nav collapses to hamburger. Activity feed limited to 5 items.

---

## Cross-Cutting Concerns

These items apply across all epics and should be considered in every sprint.

### CC-01: Household-Scoped Authorization

| Requirement | Details |
|-------------|---------|
| Every data operation scoped to the active household. | API endpoints accept `household_id` parameter. Backend middleware verifies the authenticated user is a member of the requested household. |
| Non-members get 403 Forbidden. | A user who is not in "Apartment 4B" cannot access its groceries, chores, or expenses. |
| Owner-only actions enforced server-side. | Delete household, remove member, transfer ownership → verified against the Owner role. |

### CC-02: Responsive Design

| Breakpoint | Behavior |
|-----------|----------|
| Desktop (1024px+) | Full layout: header with navigation links, household selector, notification bell. Multi-column content. |
| Tablet (768–1023px) | Condensed header. Slightly narrowed content. |
| Mobile (< 768px) | Hamburger menu. Stacked layouts. Touch-optimized tap targets (min 44px). Swipe actions where appropriate. |

### CC-03: Error Handling Pattern

| Layer | Pattern |
|-------|---------|
| **Frontend validation** | Inline field-level errors. Prevent invalid API calls. |
| **API errors** | JSON format: `{ "error": "message", "code": "VALIDATION_ERROR" }`. HTTP codes: 400, 401, 403, 404, 409, 500. |
| **Network errors** | Dismissible error banner. Retain form input. "Retry" option where applicable. |
| **Auth errors** | 401 → auto-refresh token → retry original request. Expired refresh → redirect to login. |
| **Empty states** | Friendly message + icon + CTA for each page (groceries, chores, expenses, analytics). |
| **Loading states** | Skeleton screen or spinner. Interactive elements disabled during load. |

### CC-04: Financial Accuracy

| Rule | Details |
|------|---------|
| All monetary values to 2 decimal places. | Use DECIMAL(10,2) in PostgreSQL. |
| Rounding remainder to payer. | $10 / 3 = $3.34 (payer) + $3.33 + $3.33. |
| Balances always sum to zero. | Invariant enforced by the balance calculation logic and verified via automated tests. |

---

## Data Model Overview

Core entities — full field-level schemas defined in HomeSync PRD v4.1 (Section 14).

### Entity List

| Entity | Description | Key Fields |
|--------|-------------|------------|
| **User** | Authenticated user. | id, email, password_hash, name, avatar_url, google_id, created_at |
| **Household** | A shared living group. | id, name, invite_code, owner_id, is_archived, created_at |
| **HouseholdMember** | Links users to households. | id, household_id, user_id, role (owner/member), joined_at |
| **GroceryItem** | Item on the shared grocery list. | id, household_id, name, quantity, priority, category, is_bought, added_by, created_at |
| **GroceryPurchaseLog** | Tracks when items are bought (for intelligence). | id, household_id, item_name, purchased_at, purchased_by |
| **Chore** | A household task with assignment type. | id, household_id, name, assignment_type (fixed/rotating/self_assigned), frequency, current_assignee, created_by, created_at |
| **ChoreCompletionLog** | Records each chore completion. | id, chore_id, completed_by, completed_at |
| **Expense** | A logged expense. | id, household_id, description, amount, paid_by, split_type, category, tag, expense_date, receipt_url, recurring_template_id, is_draft, created_at |
| **ExpenseSplit** | Per-member share of an expense. | id, expense_id (CASCADE), member_id, share_amount, percentage |
| **Settlement** | A recorded payment between members. | id, household_id, paid_by, paid_to, amount, settled_at |
| **RecurringExpense** | Template for auto-generated expenses. | id, household_id, description, amount, paid_by, split_type, split_config (JSONB), category, frequency, next_due_date, is_active, created_at |
| **Budget** | Household spending limit. | id, household_id, period_type (weekly/monthly), amount, category (nullable — overall if null), warning_threshold, is_active, created_at |
| **Notification** | In-app notification. | id, user_id, household_id, type, title, body, is_read, created_at |
| **NotificationPreference** | Per-user per-type channel toggles. | id, user_id, notification_type, in_app, email, push |
| **PushSubscription** | PWA push subscription. | id, user_id, endpoint, keys (JSONB), created_at |
| **RefreshToken** | JWT refresh tokens. | id, user_id, token_hash, expires_at, is_revoked, created_at |

### Key Relationships

- One User → many HouseholdMembers (user can be in multiple households).
- One Household → many: HouseholdMembers, GroceryItems, Chores, Expenses, Settlements, RecurringExpenses, Budgets.
- One Chore → many ChoreCompletionLogs.
- One Expense → many ExpenseSplits (CASCADE delete).
- One RecurringExpense → many Expenses (via recurring_template_id).
- One User → many: Notifications, NotificationPreferences, PushSubscriptions, RefreshTokens.

---

## API Endpoint Summary

Grouped by epic. All endpoints prefixed with `/api`. JWT required except where noted.

### Authentication (AUTH)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | Public | Register with email/password. Returns tokens. |
| POST | /api/auth/login | Public | Login. Returns tokens. |
| POST | /api/auth/google | Public | Google OAuth login/register. Returns tokens. |
| POST | /api/auth/refresh | Public | Exchange refresh token for new access token. |
| POST | /api/auth/logout | Authenticated | Revoke refresh token. |
| POST | /api/auth/forgot-password | Public | Send password reset email. |
| POST | /api/auth/reset-password | Public | Set new password with reset token. |
| GET | /api/users/me | Authenticated | Get current user profile. |
| PATCH | /api/users/me | Authenticated | Update profile (name, avatar). |

### Household Management (HSH)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/households | Authenticated | List user's households. |
| POST | /api/households | Authenticated | Create new household. |
| GET | /api/households/:id | Member | Get household details + members. |
| PATCH | /api/households/:id | Owner | Update household (name). |
| DELETE | /api/households/:id | Owner | Archive household. |
| POST | /api/households/join | Authenticated | Join via invite code. |
| POST | /api/households/:id/leave | Member | Leave a household. |
| DELETE | /api/households/:id/members/:memberId | Owner | Remove a member. |
| PATCH | /api/households/:id/transfer-ownership | Owner | Transfer ownership. |

### Groceries (GRC)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/households/:hid/items | Member | Fetch groceries (filter: all/unbought/high-priority). |
| POST | /api/households/:hid/items | Member | Add item (auto-categorizes). |
| PATCH | /api/households/:hid/items/:id | Member | Update item (toggle bought, edit). |
| DELETE | /api/households/:hid/items/:id | Member | Delete item. |
| GET | /api/households/:hid/items/suggestions | Member | Get "You might need" suggestions. |

### Chores (CHR)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/households/:hid/chores | Member | Fetch chores with computed status. |
| POST | /api/households/:hid/chores | Member | Add chore (with assignment type + frequency). |
| PATCH | /api/households/:hid/chores/:id | Member | Update chore (reassign, edit). |
| DELETE | /api/households/:hid/chores/:id | Member/Owner | Delete chore. |
| POST | /api/households/:hid/chores/:id/complete | Member | Mark complete (creates log, advances rotation). |

### Expenses & Settlements (EXP)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/households/:hid/expenses | Member | Fetch expenses with splits (filters: date, category, paid_by, tag). |
| POST | /api/households/:hid/expenses | Member | Add expense (multipart: data + receipt). |
| DELETE | /api/households/:hid/expenses/:id | Member | Delete expense (CASCADE). |
| GET | /api/households/:hid/balances | Member | Net balances + settlement summary. |
| GET | /api/households/:hid/settlements | Member | Fetch all settlements. |
| POST | /api/households/:hid/settlements | Member | Record a settlement. |

### Recurring Expenses

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/households/:hid/recurring | Member | List recurring templates. |
| POST | /api/households/:hid/recurring | Member | Create template. |
| PATCH | /api/households/:hid/recurring/:id | Member | Edit or pause/resume. |
| DELETE | /api/households/:hid/recurring/:id | Member | Delete template. |
| POST | /api/households/:hid/expenses/:id/confirm | Member | Confirm a recurring draft. |

### Budgets

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/households/:hid/budgets | Member | List active budgets. |
| POST | /api/households/:hid/budgets | Member | Create a budget. |
| PATCH | /api/households/:hid/budgets/:id | Member | Update budget. |
| DELETE | /api/households/:hid/budgets/:id | Member | Delete a budget. |
| GET | /api/households/:hid/budgets/status | Member | Budget utilization (spent vs. budget, warnings). |

### Analytics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/households/:hid/analytics/chores | Member | Chore contributions (query: period). |
| GET | /api/households/:hid/analytics/expenses | Member | Expense contributions + category breakdown. |
| GET | /api/households/:hid/analytics/trends | Member | Monthly spending trends. |
| GET | /api/households/:hid/analytics/monthly-summary | Member | Auto-generated monthly summary (query: month). |

### Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/notifications | Authenticated | Fetch user's notifications (paginated). |
| PATCH | /api/notifications/:id/read | Authenticated | Mark as read. |
| POST | /api/notifications/read-all | Authenticated | Mark all as read. |
| GET | /api/notifications/preferences | Authenticated | Get notification preferences. |
| PATCH | /api/notifications/preferences | Authenticated | Update preferences. |
| POST | /api/push/subscribe | Authenticated | Register push subscription. |
| DELETE | /api/push/subscribe | Authenticated | Unregister push subscription. |

### Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/households/:hid/dashboard | Member | Aggregated summary: groceries, chores, expenses, balances, budget, low-stock, suggestions, recent activity. |

---

## Post-MVP Backlog Summary

All stories and features tagged as Post-MVP across all epics:

| ID | Feature | Epic |
|----|---------|------|
| GRC-03.4 | Low-stock push notifications | Groceries |
| EXP-06.4 | AI-powered spending recommendations in monthly summaries | Expenses |
| PWA-01.3 | Offline action queue (IndexedDB sync when reconnected) | PWA |
