# HomeSync — Product Design Requirements

**Groceries · Chores · Expenses · Intelligence — One App for Shared Living**

---

| Field          | Value              |
|----------------|--------------------|
| **Author**     | Prachi             |
| **Version**    | 4.1                |
| **Date**       | December 16, 2025  |
| **Status**     | Approved           |
| **Classification** | Internal       |

---

## Revision History

| Version | Date       | Author | Changes |
|---------|------------|--------|---------|
| 1.0     | 12/10/2025 | Prachi | Initial draft with core feature definitions, scope, and technical approach. |
| 1.1     | 12/16/2025 | Prachi | Refined scope boundaries, added API overview, and clarified data model. |
| 2.0     | 12/16/2025 | Prachi | Comprehensive rewrite: full database schema, wireframe layouts, detailed API contracts, auto-categorization logic, user personas, and acceptance criteria. |
| 3.0     | 12/16/2025 | Prachi | Added Splitwise-style expenses to MVP. Adopted two-repository architecture with Supabase, Vercel, and Render. |
| 4.0     | 12/16/2025 | Prachi | Full-scope release: authentication, multi-household, notifications, advanced expense splitting, analytics & fairness scoring, household intelligence (grocery-expense linking, low-stock detection, suggested lists), and PWA support brought into MVP. Only native mobile apps remain out of scope. |
| 4.1     | 12/16/2025 | Prachi | Added single-person mode support. Redesigned chore system with three assignment types: fixed (all members), rotating (configurable frequency + fair rotation), and self-assigned (personal reminders). Added household budget tracking with threshold alerts. Added auto-generated monthly expense summaries. Enhanced receipt attachment UX. |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Vision & Goals](#3-product-vision--goals)
4. [Target Users & Personas](#4-target-users--personas)
5. [Platform Scope](#5-platform-scope)
6. [Scope Definition](#6-scope-definition)
7. [Assumptions & Constraints](#7-assumptions--constraints)
8. [Functional Requirements](#8-functional-requirements)
   - 8.1 [Authentication & User Management](#81-authentication--user-management)
   - 8.2 [Household Management](#82-household-management)
   - 8.3 [Dashboard](#83-dashboard)
   - 8.4 [Groceries Management](#84-groceries-management)
   - 8.5 [Chores Management](#85-chores-management)
   - 8.6 [Shared Expenses Management](#86-shared-expenses-management)
   - 8.7 [Analytics & Fairness Scoring](#87-analytics--fairness-scoring)
   - 8.8 [Household Intelligence](#88-household-intelligence)
   - 8.9 [Notifications & Reminders](#89-notifications--reminders)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Page & Screen Definitions](#10-page--screen-definitions)
11. [Design System & UI Guidelines](#11-design-system--ui-guidelines)
12. [Auto-Categorization Logic](#12-auto-categorization-logic)
13. [User Flows](#13-user-flows)
14. [Data Model](#14-data-model)
15. [Technical Architecture](#15-technical-architecture)
16. [API Specification](#16-api-specification)
17. [Error Handling & Edge Cases](#17-error-handling--edge-cases)
18. [Success Criteria](#18-success-criteria)
19. [Risks & Mitigation](#19-risks--mitigation)
20. [Future Expansion Roadmap (Post-MVP)](#20-future-expansion-roadmap-post-mvp)
21. [Implementation Plan](#21-implementation-plan)

---

## 1. Executive Summary

HomeSync is a comprehensive web-based household management platform purpose-built for **individuals, small families, and roommates**. It addresses the persistent challenge of coordinating everyday shared responsibilities — grocery shopping, household chores, shared expenses, task ownership, and household inventory — that are typically managed through fragmented, informal methods like group chats, spreadsheets, sticky notes, or memory alone.

HomeSync works equally well for a single person managing their own household as it does for a group of five roommates splitting everything. A solo user can track personal groceries, assign themselves chores as reminders, manage personal budgets, and benefit from the same intelligence features — then seamlessly invite others when their living situation changes.

HomeSync delivers a full-featured household operating system:

- **Shared Grocery List** with intelligent auto-categorization, priority management, and low-stock detection.
- **Smart Chores Board** with three assignment modes: fixed chores (assigned to all members, like cleaning your own room), rotating chores (fairly distributed with configurable frequency — every 2 days, weekly, biweekly, monthly), and self-assigned personal tasks for individual reminders.
- **Splitwise-Style Shared Expenses** with equal, percentage-based, and exact-amount splits, receipt attachment on every expense, settlement tracking, recurring expenses, spending analytics, **household budgets** with threshold alerts, and **auto-generated monthly expense summaries**.
- **Household Intelligence** that links grocery purchases to expenses, detects low-stock items, and suggests grocery lists based on purchase history.
- **Analytics & Fairness Dashboard** showing contribution breakdowns for chores and expenses per household member.
- **Notifications & Reminders** via email and in-app alerts for overdue chores, upcoming recurring expenses, budget thresholds, and low-stock items.
- **User Authentication** with email/password and OAuth (Google), supporting multiple households per user.
- **Progressive Web App (PWA)** support for installability, offline access, and push notifications on mobile devices.

By combining groceries, chores, expenses, intelligence, and accountability into a single purpose-built tool, HomeSync eliminates the need for households to juggle multiple apps and instead provides one cohesive experience designed for the daily rhythms of shared living.

The application is built with a React/TypeScript frontend (Vite, deployed on Vercel) and a Node.js/Express backend (deployed on Render), with Supabase (managed PostgreSQL) as the database. The only feature intentionally deferred is native mobile applications (iOS/Android); the PWA provides a near-native mobile experience in the interim.

---

## 2. Problem Statement

### 2.1 Background

In shared living environments — whether among roommates, couples, or small families — household coordination is rarely formalized. Daily responsibilities like grocery shopping, cleaning, cooking, and bill splitting tend to be managed through ad-hoc methods: text message threads, verbal agreements, spreadsheets, or mental tracking. While these approaches work intermittently, they consistently produce friction as household complexity grows.

### 2.2 Core Problems Identified

| Problem | Description |
|---------|-------------|
| **Forgotten Items** | Grocery needs are scattered across multiple conversations and mental lists, leading to items being consistently overlooked during shopping trips. |
| **Duplicate Purchases** | Without a shared, real-time view of what has been bought, multiple household members purchase the same items independently. |
| **Uneven Chore Distribution** | The absence of visible tracking leads to perceived or actual imbalances in who does what, creating resentment over time. |
| **Ambiguous Ownership** | When no one is explicitly responsible for a task, it is frequently deferred or dropped entirely. |
| **Expense Confusion** | Shared costs for groceries, utilities, and supplies are tracked informally (or not at all), leading to disputes about who owes whom. |
| **No Accountability** | Without historical data on contributions, conversations about fairness devolve into "he said / she said" disputes. |
| **App Fatigue** | Households need 3+ separate tools (notes app, to-do app, Splitwise) to manage groceries, chores, and expenses. Adoption drops when the workflow is fragmented. |
| **Inventory Blindness** | No one knows what's running low at home until it's completely out, triggering emergency shopping trips. |
| **Increased Household Stress** | The cumulative effect of these coordination failures erodes trust and increases unnecessary interpersonal tension. |

### 2.3 Why Existing Tools Fall Short

General-purpose tools like messaging apps, shared notes, or generic to-do lists are not designed for recurring household coordination. Splitwise handles expenses well but does not address groceries or chores. Dedicated household apps that do exist tend to be over-featured and require significant setup, or they cover only one domain. There is no single, comprehensive tool that treats grocery coordination, chore management, expense splitting, fairness tracking, and inventory intelligence as interconnected parts of the same problem.

### 2.4 Opportunity

HomeSync fills this gap by unifying every dimension of household coordination into a single platform. Instead of switching between apps, households use one tool that understands how these responsibilities relate to each other — linking a grocery purchase to a shared expense, detecting when staples are running low, showing who has been doing more than their fair share, and proactively reminding members of upcoming responsibilities.

---

## 3. Product Vision & Goals

> *To make shared living effortless by providing a single, intelligent platform that handles every dimension of household coordination — from groceries to chores to money to accountability.*

HomeSync is the central operating system for household life. It doesn't just track what needs to be done — it understands patterns, ensures fairness, and proactively reduces friction.

### 3.1 Product Goals

1. **Eliminate household coordination friction** by centralizing groceries, chores, expenses, inventory, and accountability into a single, accessible interface.
2. **Make shared responsibilities visible and transparent** so every household member can see what needs to be done, who is responsible, what has been completed or paid, and how contributions compare.
3. **Eliminate expense disputes** by providing clear, real-time balance tracking with flexible splitting options and a minimal-transaction settlement system.
4. **Drive accountability without conflict** by presenting contribution data transparently — showing facts, not judgments — so fairness conversations are grounded in data.
5. **Anticipate household needs** through intelligent features like low-stock detection, suggested grocery lists, and recurring expense automation.
6. **Enable fast, repeatable daily interactions** — adding a grocery item, marking a chore complete, or logging an expense should each take under 5 seconds.
7. **Provide a near-native mobile experience** through PWA support: installable on home screens, works offline for viewing, and delivers push notifications.

### 3.2 Engineering & Learning Goals

1. Build a production-quality full-stack web application using React with TypeScript (frontend) and Node.js with Express (backend).
2. Implement secure user authentication with email/password and Google OAuth.
3. Design and manage a multi-tenant database architecture supporting multiple households per user.
4. Implement and manage a modern cloud-native deployment pipeline: Vercel (frontend), Render (backend), and Supabase (managed PostgreSQL).
5. Build a Progressive Web App with service worker, offline support, and push notifications.
6. Practice professional development workflows including Git, GitHub PRs, Postman testing, and CI/CD.
7. Design a modular, scalable architecture across two independent repositories.
8. Demonstrate strong product thinking, user empathy, and attention to detail through comprehensive documentation and thoughtful UX decisions.

---

## 4. Target Users & Personas

### 4.1 Primary User Segments

- **Individuals** managing their own household, groceries, chores, and personal budget
- Roommates sharing apartments or houses (2–5 people)
- Small families managing daily household tasks (2–4 members)
- Couples splitting domestic responsibilities and shared costs

### 4.2 User Characteristics

| Characteristic | Details |
|---------------|---------|
| **Technical Proficiency** | Non-technical to moderately technical. The app must require no technical knowledge. |
| **Schedule** | Busy with work, school, or caregiving. Limited time for coordination tools. |
| **Interaction Pattern** | Quick, focused sessions (<2 minutes). Opens the app to accomplish one task and leaves. |
| **Device Usage** | Primarily mobile (PWA on home screen) during routines; desktop for planning sessions. |
| **Motivation** | Wants fairness and clarity in shared responsibilities and finances without conflict. |

### 4.3 User Personas

#### Persona 1: Maya — The Organized Roommate

| Attribute | Details |
|-----------|---------|
| **Demographics** | 26, software engineer, lives with two roommates. |
| **Behaviors** | Manages groceries via iMessage Notes. Tracks expenses in Splitwise but roommates forget to log. Handles chore coordination verbally. |
| **Pain Points** | Duplicate purchases weekly. Splitwise balances always wrong. Feels she does more chores but can't prove it. Three separate tools is exhausting. No one notices when household staples run out. |
| **Goals** | One place for groceries, chores, expenses, and fairness tracking. Effortless adoption. Wants the app to tell her what's running low. Push notifications when a roommate logs an expense so she can verify it. |

#### Persona 2: David — The Busy Parent

| Attribute | Details |
|-----------|---------|
| **Demographics** | 38, full-time worker, two kids (8 and 12), shares duties and expenses with partner. |
| **Behaviors** | Grocery runs 2–3 times/week, often spontaneous. Tracks expenses via messy spreadsheet. |
| **Pain Points** | Forgets items or buys duplicates. Spreadsheet always outdated. Monthly "who owes what" conversations are stressful. Chores pile up with no tracking. Kids' responsibilities lack accountability. |
| **Goals** | Quick-glance dashboard at the store. Chore board visible to whole family. Running expense ledger replacing the spreadsheet. Auto-suggested grocery lists based on what the family usually buys. Installable on phone without going to an app store. |

#### Persona 3: Sam — The Low-Maintenance Roommate

| Attribute | Details |
|-----------|---------|
| **Demographics** | 24, graduate student, shares a house with 3 others. |
| **Behaviors** | Pays when asked but rarely initiates. Forgets chores unless reminded. Doesn't check shared notes. |
| **Pain Points** | Feels nagged by roommates. Loses track of what he owes. Doesn't notice when supplies run out. |
| **Goals** | Get reminded when it's his turn to do something. See clearly what he owes without asking. A simple way to settle up. Doesn't want to download yet another app — browser or home screen shortcut is fine. |

#### Persona 4: Anita — The Solo Organizer

| Attribute | Details |
|-----------|---------|
| **Demographics** | 30, freelance designer, lives alone in a one-bedroom apartment. |
| **Behaviors** | Uses sticky notes for grocery reminders. Forgets recurring tasks like changing AC filters or deep-cleaning the fridge. Budgets loosely with a mental estimate; overspends on dining out without realizing it until credit card statement arrives. |
| **Pain Points** | No system for personal chore reminders — things like "descale the coffee machine every 2 weeks" just slip. Grocery runs are reactive (realizes she's out of something mid-cooking). Has no visibility into monthly spending patterns until it's too late. |
| **Goals** | A personal dashboard that tracks her grocery needs, reminds her of recurring household tasks, and shows monthly spending against a budget. Wants to use the same tool if she eventually gets a roommate — no migration needed. |

---

## 5. Platform Scope

### 5.1 Platform Decision

HomeSync will be developed as a **web application with Progressive Web App (PWA) capabilities**, accessible through modern web browsers on desktop and mobile devices, and installable on mobile home screens.

### 5.2 Scope Details

| Included | Excluded |
|----------|----------|
| Modern desktop browsers (Chrome, Firefox, Safari, Edge) | Native iOS application |
| Mobile web browsers (responsive layout) | Native Android application |
| PWA: installable on home screen, offline view support, push notifications | |
| Service worker for caching and offline access | |
| Web push notifications via Push API | |

### 5.3 Rationale

A PWA approach provides the best of both worlds: full web accessibility with near-native mobile capabilities (installability, push notifications, offline access) without the cost and complexity of maintaining native codebases. This is the optimal tradeoff for a project at this stage — users get a first-class mobile experience, and development stays focused on a single web codebase.

---

## 6. Scope Definition

### 6.1 In-Scope

#### 6.1.1 Authentication & User Management
- User registration with email/password.
- Google OAuth login.
- Secure session management using JWT (access + refresh tokens).
- User profile: name, email, avatar (optional).
- Password reset via email.

#### 6.1.2 Household Management
- Create a new household with a name.
- **Single-person mode**: a household with one member is fully functional. All features (groceries, chores, expenses, budgets, intelligence) work for solo users. Chores default to self-assigned. Expenses track personal spending without splits.
- Invite members via a shareable invite link or code.
- Accept/decline invitations.
- A user can belong to multiple households and switch between them.
- Household settings: name, member management (remove members, transfer ownership).
- Roles: Owner (can manage household settings) and Member (standard access).

#### 6.1.3 Shared Grocery List
- Add items with name (required), quantity (optional, defaults to 1), and priority (Low/Medium/High, defaults to Medium).
- Auto-categorization via keyword matching (Section 12).
- Display grouped by category.
- Toggle bought/unbought.
- Delete items.
- Filter by: All, Unbought, High Priority.
- Low-stock detection: when an item is marked as bought, the system tracks purchase frequency and can suggest re-adding it when it's likely running low.
- Suggested grocery list: based on purchase history, the system generates a "You might need" list of items the household regularly buys.

#### 6.1.4 Shared Chores Board
- Add chores with name, frequency, and **assignment type**.
- **Three assignment types:**
  - **Fixed (All Members)**: chores that every member must do independently (e.g., "Clean your own room — mop and vacuum"). Each member tracks their own completion. The chore appears on everyone's list.
  - **Rotating**: chores that rotate fairly among members (e.g., "Take out trash"). The system automatically assigns the next person based on who did it least recently. **Configurable frequency**: daily, every 2 days, every 3 days, weekly, biweekly, monthly.
  - **Self-Assigned (Personal)**: tasks a member assigns to themselves as personal reminders (e.g., "Descale coffee machine"). Only visible to the assignee. Ideal for solo users or personal responsibilities.
- Display with frequency, assignment type badge, assigned person(s), status (pending/completed/overdue), and last completion date.
- Mark complete with timestamp logging.
- Auto-determine status based on frequency and last completion.
- For rotating chores: after completion, the system automatically advances assignment to the next member in the fair rotation queue.

#### 6.1.5 Shared Expenses (Splitwise-Style)
- Add expense with: description, amount, paid-by, split-among, date, and category.
- **Three split types:**
  - **Equal split** (default): total divided evenly.
  - **Percentage split**: each member assigned a percentage (must sum to 100%).
  - **Exact amount split**: each member assigned a specific dollar amount (must sum to total).
- Display running expense log sorted by date.
- Real-time balance calculation per member.
- Debt simplification algorithm for minimal settlement transactions.
- Record settlements to adjust balances.
- Delete expenses with cascade recalculation.
- **Recurring expenses**: define an expense that auto-creates on a schedule (monthly rent, weekly cleaning service). User confirms or edits before it's finalized each cycle.
- **Receipt photo upload**: attach a photo of a receipt to any expense **at the time of entry**. The add-expense form includes a receipt attachment field. Stored in Supabase Storage. Viewable by all household members inline.
- **Expense categories**: Groceries, Utilities, Rent, Dining Out, Household Supplies, Transportation, Entertainment, Other.
- **Expense groups/tags**: optionally tag expenses (e.g., "Trip to Costco") for grouping.
- Filter by date range, category, paid-by, or tag.
- **Household Budget**: set a weekly or monthly spending budget for the household (or per category). The system tracks spending against the budget in real-time. When spending reaches 80% of the budget, surface a warning in the dashboard and via notification. When exceeded, show a clear alert.
- **Monthly Expense Summary**: at the end of each month (or on-demand), auto-generate a summary report showing: total spending, breakdown by category, per-member contributions, comparison to budget, and top expenses. Displayed as a dedicated view within the Expenses page. Recommendations (e.g., "You spent 40% more on Dining Out than last month") are a post-MVP enhancement.

#### 6.1.6 Analytics & Fairness Scoring
- **Chore contribution dashboard**: per-member breakdown of chores completed over a configurable time period (week, month, all-time). Visual bar chart or pie chart.
- **Expense contribution dashboard**: per-member breakdown of total paid vs. total owed. Spending by category. Monthly trend line.
- **Fairness indicator**: a simple, non-judgmental metric showing relative contribution balance across chores and expenses. Not a score or a leaderboard — a transparency tool.
- All analytics are household-scoped and visible to all members.

#### 6.1.7 Household Intelligence
- **Grocery → Expense linking**: when a grocery item is marked as bought, optionally prompt the user to log the associated expense in one tap ("Log $X for these groceries?").
- **Low-stock detection**: based on historical purchase frequency, detect when commonly purchased items are likely running low and surface them in the dashboard.
- **Suggested grocery list**: analyze the household's purchase history and generate a "You might need" section showing items that are typically purchased on a recurring basis but haven't been added recently.

#### 6.1.8 Notifications & Reminders
- **In-app notifications**: a notification bell/panel showing recent activity (expenses logged, chores completed, invitations).
- **Email notifications**: configurable per user. Options include: daily digest of household activity, immediate alerts for new expenses, and weekly chore summary.
- **Push notifications** (via PWA): overdue chore reminders, new expense alerts, recurring expense prompts, low-stock alerts, **budget threshold warnings** (80% and 100%).
- **Notification preferences**: each user can enable/disable notification types at a granular level.

#### 6.1.9 Dashboard
- Summary cards: total groceries, unbought count, total chores, overdue chores, total expenses (this month), net balance, low-stock items count, **budget utilization (% spent)**.
- "Needs Attention" section: high-priority unbought groceries, overdue chores, unsettled balances, upcoming recurring expenses, low-stock items, **budget threshold warnings**.
- Quick navigation to all pages.
- "You might need" grocery suggestions.
- Recent activity feed.

#### 6.1.10 Progressive Web App (PWA)
- Service worker for asset caching and offline view support.
- Web app manifest for installability (home screen icon, splash screen, standalone display mode).
- Offline mode: users can view cached groceries, chores, and balances. Actions taken offline are queued and synced when connectivity returns.
- Push notification support via the Push API and a notification service.

#### 6.1.11 Technical Scope
- React with TypeScript SPA (Vite), deployed on Vercel.
- Node.js with Express backend, deployed on Render.
- Supabase (managed PostgreSQL) for database.
- Supabase Storage for receipt image uploads.
- Two independent GitHub repositories: `homesync-frontend` and `homesync-backend`.
- JWT-based authentication with refresh token rotation.
- RESTful API design.
- Professional commit practices and PR workflow.

### 6.2 Out-of-Scope

| Feature | Rationale |
|---------|-----------|
| **Native iOS Application** | PWA provides near-native experience. Native apps require separate codebases and app store approval processes. |
| **Native Android Application** | Same as above. PWA covers the mobile use case. |
| **Payment Integration** | Actual money transfers require financial compliance (PCI, money transmitter licenses). Settlement in the app is a record; actual payment happens offline via Venmo/Zelle/cash. |
| **AI/ML-based Categorization** | Keyword-based categorization is sufficient. ML models add infrastructure complexity. May explore in future. |
| **Real-time Collaboration (WebSockets)** | Polling or refetch-on-focus is sufficient for household-scale usage. WebSocket infrastructure is deferred. |

---

## 7. Assumptions & Constraints

### 7.1 Assumptions

1. Users will interact with the application daily or multiple times per week, with sessions lasting under 2 minutes.
2. Households typically contain 2–5 members.
3. Users prioritize clarity, speed, and simplicity over feature richness.
4. Equal splitting covers the majority of expense-sharing scenarios; percentage and exact splits cover the rest.
5. Users will settle debts offline (cash, Venmo, Zelle); the app only tracks balances.
6. Purchase frequency data from 4–6 weeks of usage is sufficient for meaningful low-stock predictions.
7. Push notification support varies by browser; Safari on iOS has limited support. This is an accepted limitation.

### 7.2 Constraints

| Constraint | Impact |
|-----------|--------|
| **Development Timeline** | 8–10 weeks for the full-scope MVP. Features are prioritized in implementation waves. |
| **Single Developer** | All design, development, testing, and documentation handled by one person. Limits parallelization. |
| **Web-Only (with PWA)** | No native mobile features beyond what PWA provides. Push notification support varies by OS/browser. |
| **Supabase Free Tier** | Database may pause after inactivity on free tier. Health check endpoint mitigates this. Storage limits apply for receipt uploads. |
| **No Payment Processing** | Settlements are informational only. No actual money movement. |

---

## 8. Functional Requirements

### 8.1 Authentication & User Management

#### Purpose
Provide secure, per-user access to the application so that data is private, households are isolated, and each user has a personalized experience.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| A-01 | User registration with email and password. Password must be minimum 8 characters with at least one number and one letter. | Must Have |
| A-02 | Google OAuth login via Supabase Auth or Passport.js. | Must Have |
| A-03 | JWT-based session management: short-lived access token (15 min) + long-lived refresh token (7 days) with rotation. | Must Have |
| A-04 | Password reset flow: user requests reset → receives email with secure token → sets new password. | Must Have |
| A-05 | User profile page: view and edit name, email, avatar (upload or Gravatar). | Should Have |
| A-06 | Logout: clears tokens from client and invalidates refresh token server-side. | Must Have |
| A-07 | Protected routes: all API endpoints except /auth/* require a valid access token. | Must Have |

#### Acceptance Criteria
- A new user can register, log in, and access their household within 30 seconds.
- An invalid or expired token returns 401 Unauthorized.
- Google OAuth creates a new user on first login and links to existing account on subsequent logins.
- Password reset tokens expire after 1 hour.

---

### 8.2 Household Management

#### Purpose
Allow users to create and manage households, invite other members, and switch between households they belong to.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| H-01 | Create a new household with a name. The creating user becomes the Owner. | Must Have |
| H-02 | Generate a shareable invite link or 6-character alphanumeric invite code for the household. | Must Have |
| H-03 | Join a household via invite link or code. New member is assigned the Member role. | Must Have |
| H-04 | A user can belong to multiple households and switch between them via a household selector in the header. | Must Have |
| H-05 | Household Owner can: rename the household, remove members, transfer ownership, and delete the household. | Must Have |
| H-06 | Leave a household (non-owners). If the last member leaves, the household is archived. | Must Have |
| H-07 | Household member list visible to all members with names, roles, and join dates. | Should Have |
| H-08 | **Single-person mode**: a household with one member is fully functional. All features adapt gracefully — expense splits are hidden, chores default to self-assigned, budget tracks personal spending, and the UI avoids showing multi-member concepts (balances, settlement, rotation) until a second member joins. | Must Have |

#### Acceptance Criteria
- A newly created household appears in the user's household selector immediately.
- An invite code can be used exactly once per user (cannot join the same household twice).
- Removing a member does not delete their historical contribution data (expenses, chore completions).
- Deleting a household soft-deletes (archives) all associated data.
- **Single-person**: a solo user sees no split-type selector, no balance panel, and no settlement UI. When a second member joins, these elements appear automatically without any configuration.

---

### 8.3 Dashboard

#### Purpose
Serve as the landing page and command center for the active household, providing an immediate snapshot of what needs attention across all domains.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| D-01 | Display summary cards: total groceries, unbought count, total chores, overdue chores, total expenses (this month), net balance, low-stock items count, and **budget utilization** (% spent with color-coded progress). | Must Have |
| D-02 | "Needs Attention" section: high-priority unbought groceries, overdue chores, unsettled balances above a threshold, upcoming recurring expenses (next 3 days), low-stock items, and **budget threshold warnings**. | Must Have |
| D-03 | "You Might Need" section: suggested grocery items based on purchase history. | Should Have |
| D-04 | Recent activity feed: last 10 actions across the household (expense logged, chore completed, item added). | Should Have |
| D-05 | Quick navigation to Groceries, Chores, Expenses, and Analytics pages. | Must Have |
| D-06 | Dashboard data scoped to the currently active household. Refreshes on page load and on household switch. | Must Have |

#### Acceptance Criteria
- When no data exists, each section shows an appropriate empty state.
- Summary counts accurately reflect the database state for the active household.
- "Needs Attention" shows a success message ("All caught up!") when empty.
- Switching households immediately updates all dashboard data.

---

### 8.4 Groceries Management

#### Purpose
Provide a centralized, shared grocery list with intelligent categorization, priority management, and intelligence features that anticipate household needs.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| G-01 | Add a grocery item with: Name (required), Quantity (optional, defaults to 1), Priority (Low/Medium/High, defaults to Medium). | Must Have |
| G-02 | Auto-assign category via keyword matching (Section 12). | Must Have |
| G-03 | Display items grouped by category with collapsible headers. | Must Have |
| G-04 | Toggle bought/unbought with a single click/tap. | Must Have |
| G-05 | Delete an item with confirmation. | Must Have |
| G-06 | Filter by: All, Unbought, High Priority. | Must Have |
| G-07 | Bought items visually distinct (strikethrough, muted) but visible unless filtered. | Should Have |
| G-08 | Priority indicator (color-coded badge). | Should Have |
| G-09 | **Low-stock detection**: track purchase frequency per item. When an item hasn't been purchased within its typical cycle, flag it as "likely low" in the dashboard. | Should Have |
| G-10 | **Suggested grocery list**: analyze purchase history to generate "You might need" suggestions. User can add suggestions to the active list with one tap. | Should Have |
| G-11 | **Grocery → Expense prompt**: when items are marked as bought, optionally show a prompt to log the associated expense ("Log $X for these groceries?"). | Should Have |

#### Acceptance Criteria
- Empty name shows validation error; item is not created.
- New item appears under correct category without page refresh.
- Bought/unbought state persists across reloads.
- Filters update view instantly.
- Low-stock suggestions appear after at least 3 purchase cycles of historical data for an item.
- Suggested list shows items not currently in the active grocery list that the household typically buys.

---

### 8.5 Chores Management

#### Purpose
Provide a smart chore management system that supports three distinct assignment models — fixed chores for everyone, fairly rotating chores, and personal self-assigned tasks — with configurable frequencies and completion tracking.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| C-01 | Add a chore with: Name (required), **Assignment Type** (Fixed / Rotating / Self-Assigned), Frequency, and assignment details based on type. | Must Have |
| C-02 | **Fixed (All Members) chores**: assigned to every household member simultaneously. Each member independently tracks their own completion. Example: "Clean your own room (mop & vacuum)" — appears on every member's chore list with independent status per person. | Must Have |
| C-03 | **Rotating chores**: assigned to household members in a fair rotation. After the current assignee completes the chore, the system automatically assigns it to the next member (based on fewest completions or round-robin). | Must Have |
| C-04 | **Configurable frequency** for all chore types: Daily, Every 2 Days, Every 3 Days, Weekly, Biweekly (every 2 weeks), Monthly. | Must Have |
| C-05 | **Self-Assigned (Personal) chores**: a member assigns a task to themselves only. Visible only to the assignee. Functions as a personal reminder within the household context. Ideal for solo users. | Must Have |
| C-06 | Display chores with: name, assignment type badge (Fixed / Rotating / Personal), frequency, current assignee(s), status (pending/completed/overdue), and last completed date. | Must Have |
| C-07 | Mark a chore as completed, recording a timestamp and the completing member in ChoreCompletionLog. | Must Have |
| C-08 | Auto-determine status (pending/overdue) based on frequency and last completion date per assignee. | Must Have |
| C-09 | For **rotating chores**: after completion, automatically advance assignment to the next member in the rotation queue. Display who is next. | Must Have |
| C-10 | Visually distinguish overdue chores (red highlight/badge). | Should Have |
| C-11 | Delete a chore (Owner, creator, or assignee for personal chores). Completion history is preserved for analytics. | Should Have |
| C-12 | **Solo user behavior**: when a household has one member, all chores behave as self-assigned. If members are added later, fixed and rotating chores automatically include the new members. | Should Have |

#### Acceptance Criteria
- Empty name shows validation error.
- **Fixed chore**: if 3 members exist, the chore shows independently on each member's list. Member A completing it does not mark it complete for Members B and C.
- **Rotating chore (weekly)**: Member A completes it on Monday → auto-assigned to Member B. If Member B doesn't complete it by next Monday → shows as overdue for Member B.
- **Configurable frequency**: a chore set to "Every 2 Days" completed on Monday becomes overdue by Wednesday evening if not done.
- **Self-assigned chore**: only visible to the creator. Does not appear in other members' views or affect their fairness analytics.
- **Rotation fairness**: given Members A, B, C — if A has completed a rotating chore 5 times, B 3 times, and C 4 times, the next assignment goes to B.

---

### 8.6 Shared Expenses Management

#### Purpose
Provide a Splitwise-style expense tracking system with flexible splitting, recurring expenses, receipt uploads, and settlement tracking.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| E-01 | Add an expense with: Description (required), Amount (required, >0), Paid-by (dropdown), Split-among (multi-select, defaults to all), Split type (equal/percentage/exact), Date (defaults to today), Category (dropdown), **Receipt attachment (optional, inline in form)**. | Must Have |
| E-02 | **Equal split**: total / number of selected members. | Must Have |
| E-03 | **Percentage split**: each member assigned a percentage. UI enforces percentages sum to 100%. | Must Have |
| E-04 | **Exact amount split**: each member assigned a dollar amount. UI enforces amounts sum to total. | Must Have |
| E-05 | Display running expense log: description, amount, who paid, split details, date, category. Sorted newest first. | Must Have |
| E-06 | Real-time balance calculation per member. Positive = owed money, negative = owes money. | Must Have |
| E-07 | Debt simplification: minimal transaction settlement summary (greedy algorithm). | Must Have |
| E-08 | Record settlements ("Settle Up"): log a payment between two members to adjust balances. | Must Have |
| E-09 | Delete expense with confirmation. CASCADE deletes splits. Balances recalculate. | Must Have |
| E-10 | **Recurring expenses**: define an expense template with a schedule (monthly/weekly). System auto-creates a draft expense on schedule. User confirms, edits, or dismisses before it affects balances. | Should Have |
| E-11 | **Receipt attachment**: attach a photo (JPEG/PNG, max 5MB) to any expense **directly in the add-expense form**. Receipt field is part of the expense creation flow, not a separate upload step. Stored in Supabase Storage. Viewable inline by all household members. | Must Have |
| E-12 | **Expense tags**: optionally tag expenses with custom labels for grouping. | Should Have |
| E-13 | Filter expenses by: date range, category, paid-by, tag. | Should Have |
| E-14 | **Household Budget**: set a weekly or monthly spending budget for the overall household and optionally per expense category. Track spending against budget in real-time. Display a progress bar (e.g., "$1,200 / $2,000 — 60%"). At 80% utilization, surface a warning in the dashboard and trigger a notification. At 100%, show a clear "Budget Exceeded" alert. | Must Have |
| E-15 | **Monthly Expense Summary**: auto-generate a summary at the end of each month (also available on-demand). Summary includes: total spending, breakdown by category (bar chart), per-member contributions (who paid what), comparison to monthly budget (over/under), and top 5 largest expenses. Displayed as a dedicated section within the Expenses page. | Should Have |
| E-16 | **Solo user mode**: when a household has one member, the split-among field is hidden (defaults to self). Expenses function as personal spending tracking against the budget. | Should Have |

#### Acceptance Criteria
- $90 split equally among 3 members = $30 each.
- $100 split 50%/30%/20% among 3 members = $50/$30/$20.
- $100 split exact $60/$25/$15 among 3 members validates sum = $100.
- Balances update in real-time after add/delete/settle.
- Settlement summary produces minimum transactions to zero all balances.
- Recording a settlement adjusts balances without altering original expenses.
- Deleting an expense recalculates all balances as if it never existed.
- Amount rejects zero, negative, or non-numeric input.
- Recurring expense draft appears in a "Pending" state and does not affect balances until confirmed.
- Uploaded receipt is accessible to all household members and displays inline.
- **Budget**: setting a $2,000 monthly budget, then logging $1,600 in expenses shows the progress bar at 80% and triggers a warning notification.
- **Budget**: exceeding the budget changes the progress bar to red and shows "Budget Exceeded" in the dashboard.
- **Monthly summary**: summary accurately reflects all expenses for the calendar month, with correct category totals and per-member breakdowns.
- **Solo user**: a single-member household can log expenses without selecting split type or split-among; the amount is tracked as personal spending against the budget.

#### Balance Calculation Logic

For each expense, the system computes the net effect on each member. The payer gains a credit equal to (total − their share), and each other participant incurs a debt equal to their share. The running balance for each member is the sum of all credits minus all debts across all expenses and settlements.

**Rounding rule**: all monetary values rounded to 2 decimal places. Any rounding remainder (e.g., $10 / 3 = $3.33 + $3.33 + $3.34) is assigned to the payer to ensure amounts always sum to the total.

#### Debt Simplification Algorithm

To minimize settlement transactions, the system uses a greedy algorithm:
1. Compute net balances for all members.
2. Separate into creditors (positive balance) and debtors (negative balance).
3. Sort both lists by absolute value (descending).
4. Match the largest debtor with the largest creditor.
5. Transfer the minimum of the two amounts.
6. Update balances and repeat until all are zero.

This produces the minimum number of transfers needed.

---

### 8.7 Analytics & Fairness Scoring

#### Purpose
Provide transparent, data-driven visibility into household contributions so that fairness conversations are grounded in facts, not feelings.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| AN-01 | **Chore contribution dashboard**: per-member count of chores completed, filterable by time period (this week, this month, all-time). Visualized as a horizontal bar chart. | Must Have |
| AN-02 | **Expense contribution dashboard**: per-member total paid vs. total owed. Spending breakdown by category (pie/donut chart). Monthly spending trend (line chart). | Must Have |
| AN-03 | **Fairness indicator**: a simple visual (e.g., balance bar) showing relative chore contribution across members. No numerical score — just a transparency tool. | Should Have |
| AN-04 | All analytics scoped to the active household and visible to all members. | Must Have |
| AN-05 | Time period selector: Week, Month, 3 Months, All Time. | Should Have |

#### Acceptance Criteria
- Chore chart accurately reflects completion log data for the selected period.
- Expense chart matches the sum of all expense records.
- Switching time periods re-renders charts instantly.
- A household with only one member still shows meaningful data (no division-by-zero or empty charts).

#### Design Principles for Analytics
- **Transparency, not gamification**: no points, badges, leaderboards, or rankings. The goal is shared visibility, not competition.
- **Non-judgmental framing**: labels like "Contribution Overview" rather than "Who's Doing More."
- **Contextual**: always show the time period being analyzed. Contribution imbalances may be temporary and intentional (e.g., one person is traveling).

---

### 8.8 Household Intelligence

#### Purpose
Reduce cognitive load by using historical data to anticipate household needs and surface actionable suggestions.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| HI-01 | **Low-stock detection**: for items that have been purchased at least 3 times, calculate average days between purchases. When current days since last purchase exceeds the average, flag the item as "likely low." | Should Have |
| HI-02 | Surface low-stock items in the dashboard "Needs Attention" section and optionally as push notifications. | Should Have |
| HI-03 | **Suggested grocery list**: identify items purchased 3+ times in the last 60 days that are not currently on the active grocery list. Present as a "You might need" section. | Should Have |
| HI-04 | Allow one-tap addition of suggested items to the active grocery list. | Should Have |
| HI-05 | **Grocery → Expense linking**: after marking grocery items as bought, show an optional inline prompt to log the shopping trip as a shared expense. Pre-fill description ("Grocery Run — [Date]") and allow the user to enter the total amount. | Should Have |

#### Acceptance Criteria
- Low-stock detection does not trigger for items purchased fewer than 3 times (insufficient data).
- Suggested items exclude items already on the active grocery list.
- The grocery → expense prompt is optional and dismissable; it does not block the bought-toggle flow.

---

### 8.9 Notifications & Reminders

#### Purpose
Proactively surface timely information to household members through in-app, email, and push notification channels.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| N-01 | **In-app notification panel**: bell icon in header showing unread count. Panel lists recent events: expense added, chore completed, member joined, recurring expense due, low-stock alert. | Must Have |
| N-02 | Mark individual notifications as read. "Mark all as read" action. | Must Have |
| N-03 | **Email notifications** (configurable per user): daily household activity digest, immediate alert for expenses above a threshold, weekly chore summary. | Should Have |
| N-04 | **Push notifications** (PWA): overdue chore reminders (morning of the day it becomes overdue), new expense logged by another member, recurring expense due for confirmation, low-stock alerts. | Should Have |
| N-05 | **Notification preferences page**: per-user toggles for each notification type and channel (in-app, email, push). | Must Have |
| N-06 | Push notification opt-in flow: request permission on first login with clear explanation of value. Respect denial gracefully. | Must Have |

#### Acceptance Criteria
- A new expense logged by Member A appears in Member B's notification panel within 30 seconds (polling interval).
- Email digest is sent at 8 AM in the user's configured timezone (or UTC if not set).
- Push notifications are only sent if the user has granted permission and enabled that notification type.
- Disabling a notification type immediately stops delivery for that type.

---

## 9. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NF-01 | **Usability** | Intuitive enough for a new user to complete core actions (add item, mark chore, log expense) without onboarding. |
| NF-02 | **Responsiveness** | Fully functional across desktop (1024px+), tablet (768px+), and mobile (320px+). |
| NF-03 | **Performance** | Page load <2s on broadband. API responses <500ms. Dashboard renders within 1s of data fetch. |
| NF-04 | **Architecture** | Frontend and backend in independent repositories, communicating via documented REST APIs. |
| NF-05 | **API Design** | Consistent naming, appropriate HTTP methods, meaningful status codes and error messages. |
| NF-06 | **Code Quality** | Modular, well-organized, readable. TypeScript on frontend. Inline docs for non-obvious logic. |
| NF-07 | **Developer Experience** | Each repo runnable locally with one command. READMEs document full setup. |
| NF-08 | **Accessibility** | Keyboard-navigable. Form labels on all inputs. Color not sole state indicator. WCAG AA contrast. |
| NF-09 | **Financial Accuracy** | All monetary calculations to 2 decimal places. Rounding remainder to payer. Balances always sum to zero. |
| NF-10 | **Security** | Passwords hashed (bcrypt). JWT with short-lived access tokens. CORS restricted to frontend origin. Input sanitization. SQL parameterization. HTTPS enforced. |
| NF-11 | **Data Privacy** | Household data visible only to members. API endpoints enforce household-level authorization. Users can only access households they belong to. |
| NF-12 | **Offline Support** | PWA service worker caches static assets and last-fetched data. Offline users see cached state with a clear "You're offline" indicator. |
| NF-13 | **Scalability** | Database schema supports multi-household, multi-user from day one. Indexes on foreign keys and frequently queried columns. |

---

## 10. Page & Screen Definitions

### 10.1 Login / Register Page (Route: /login, /register)

**Layout**: Centered card on a clean background. Logo at top. Form fields: email, password (+ name for register). "Sign in with Google" button. Link to toggle between login/register. "Forgot password?" link on login.

**Responsive**: Card is max-width 440px on desktop, full-width with padding on mobile.

---

### 10.2 Household Selector / Onboarding (Route: /households)

**Layout**: After login, if the user has no households: onboarding screen with two options — "Create a Household" and "Join with Invite Code." If the user has households: a list of household cards showing name, member count, and a "Switch" button. Plus a "Create New" and "Join" option.

**Responsive**: Cards stack vertically on mobile.

---

### 10.3 Dashboard (Route: /)

**Layout**:

- **Header Bar**: Logo/wordmark left. Household selector dropdown center. Navigation links (Dashboard, Groceries, Chores, Expenses, Analytics) and notification bell + user avatar right. Active page highlighted.
- **Summary Cards Row**: 7 cards — Total Groceries, Unbought, Total Chores, Overdue Chores, Expenses (This Month), Net Balance, Low-Stock Items. Each card has label, large value, icon.
- **Needs Attention Section**: Vertically stacked items with status badges and quick-action buttons. When empty: "All caught up!"
- **You Might Need Section**: Horizontal scrollable list of suggested grocery items with one-tap "Add" buttons.
- **Recent Activity Feed**: Last 10 household actions with timestamps and member avatars.
- **Quick Navigation**: Three cards — "Go to Groceries," "Go to Chores," "Go to Expenses."

**Responsive**:
- Desktop (1024px+): Summary cards in a single row or 4+3 grid. Two-column layout for Needs Attention + Activity Feed.
- Tablet (768–1023px): Summary cards in 4+3 grid. Single column below.
- Mobile (<768px): Cards stack vertically. Nav collapses to hamburger. Activity feed limited to 5 items.

---

### 10.4 Groceries Page (Route: /groceries)

**Layout**:

- **Add Item Form**: Name input (placeholder: "Add a grocery item..."), quantity number input, priority dropdown, submit button. Horizontal on desktop, stacked on mobile. Resets after submission.
- **Filter Bar**: Toggle buttons: "All," "Unbought," "High Priority." Active highlighted.
- **"You Might Need" Banner** (collapsible): Suggested items as chips with "+" buttons.
- **Categorized Item List**: Items grouped under collapsible category headers. Each row: checkbox (bought toggle), name (strikethrough if bought), quantity badge, priority dot, delete button.
- **Empty State**: Icon, "Your grocery list is empty," "Add your first item above."

**Responsive**: Desktop: form in single row. Mobile: form stacks; priority as small dot; delete via swipe/secondary.

---

### 10.5 Chores Page (Route: /chores)

**Layout**:

- **Add Chore Form**: Name input, **assignment type selector** (Fixed / Rotating / Personal — segmented control), frequency dropdown (**expanded options**: Daily, Every 2 Days, Every 3 Days, Weekly, Biweekly, Monthly). For Rotating chores: a "Participants" multi-select (defaults to all members) to define the rotation pool. For Personal chores: auto-assigned to current user (no assignee selector). Submit button.
- **Chore List — Tabbed or Filtered View**: Three view tabs: "All Chores," "My Chores," "Overdue." Each chore card shows: name, **assignment type badge** (Fixed/Rotating/Personal with distinct colors), frequency badge, current assignee (for rotating) or "All Members" (for fixed) or "Just You" (for personal), status (Pending/Completed/Overdue), last completed date, and "Mark Complete" button. For **fixed chores**, each member sees their own completion status independently. For **rotating chores**, only the current assignee sees the "Mark Complete" button; other members see "Assigned to [Name]." Overdue chores have a red left border accent.
- **Rotation Indicator**: For rotating chores, a small "Next: [Member]" label shows who will be assigned after the current member completes it.
- **Empty State**: "No chores set up yet. Add a chore to get started."

**Responsive**: Desktop: wide cards with all details visible. Mobile: stacked cards, compact type/frequency badges, full-width "Mark Complete" button.

---

### 10.6 Expenses Page (Route: /expenses)

**Layout**:

- **Budget Status Bar** (top of page): A prominent horizontal progress bar showing current spending vs. budget (e.g., "$1,450 / $2,000 — 72%"). Color transitions: green (0–79%), amber (80–99%), red (100%+). If per-category budgets exist, show a collapsible breakdown below the main bar. "Manage Budgets" link opens budget settings. For solo users, this functions as a personal spending tracker.
- **Balance Summary Panel**: Grid of member balance cards. Green for positive ("is owed $XX"), red for negative ("owes $XX"). Settlement summary: "To settle up: David pays Maya $20." Hidden in solo mode.
- **Add Expense Form**: Description input, amount input ($), paid-by dropdown, split-type selector (Equal/Percentage/Exact — segmented control), split-among (multi-select checkboxes, all checked by default). When Percentage or Exact is selected, per-member input fields appear below. Date picker, category dropdown, tag input (optional), **receipt attachment** (camera/file picker button integrated directly in the form with thumbnail preview). Submit: "Add Expense." In solo mode, split fields are hidden.
- **Settle Up Button**: Opens modal — who is paying, who is receiving, amount. Pre-fills from settlement summary.
- **Recurring Expenses Section** (collapsible): List of active recurring expense templates. Each shows: description, amount, frequency, next due date, "Edit" and "Pause/Resume" actions.
- **Monthly Summary Section** (collapsible): Auto-generated summary for the current or selected month. Shows: total spending, category breakdown (horizontal bar chart), per-member contributions, budget comparison (over/under), and top 5 largest expenses. Month selector dropdown to view past summaries. Note: AI-powered recommendations (e.g., "You spent 40% more on Dining Out than last month — consider setting a category budget") are a post-MVP enhancement.
- **Expense Log**: Chronological list (newest first). Each expense: description, amount, payer, split summary, date, category badge, tag pills, **receipt thumbnail** (click to expand). Settlements: green background, "David paid Maya $20 — Settlement." Delete button per entry.
- **Filter Bar**: Date range, category, paid-by, tag.
- **Empty State**: "No expenses logged yet."

**Responsive**: Desktop: budget bar full-width; balance panel as horizontal cards; log as table. Mobile: budget bar stacks above content; balance scrolls horizontally; log entries as compact cards; settle-up as bottom sheet; monthly summary charts stack vertically.

---

### 10.7 Analytics Page (Route: /analytics)

**Layout**:

- **Time Period Selector**: Segmented control — This Week, This Month, 3 Months, All Time.
- **Chore Contribution Section**: Horizontal bar chart showing completions per member. Below chart: a simple table with member name and count.
- **Expense Contribution Section**: Two charts side by side (desktop) or stacked (mobile). Left: bar chart of total paid per member. Right: donut chart of spending by category.
- **Monthly Trend Section**: Line chart showing total household spending per month (last 6 months).
- **Fairness Indicator**: A stacked bar showing relative chore contribution. No scores — just a visual.

**Responsive**: Desktop: charts side by side where appropriate. Mobile: all charts stack, full-width.

---

### 10.8 Notification Preferences (Route: /settings/notifications)

**Layout**: Table of notification types with toggle switches for each channel (In-App, Email, Push). Types: New Expense, Chore Overdue, Recurring Expense Due, Low-Stock Alert, **Budget Warning (80%)**, **Budget Exceeded (100%)**, Member Joined, Daily Digest, Weekly Summary.

---

### 10.9 User Profile / Settings (Route: /settings)

**Layout**: Name, email (read-only), avatar upload, password change (current + new), household list with leave/switch actions, notification preferences link, logout button.

---

## 11. Design System & UI Guidelines

### 11.1 Design Principles

1. **User-Centered**: Every design decision justified by the user's task flow.
2. **Minimal Cognitive Load**: Show only what's relevant. Progressive disclosure for complexity.
3. **Clear Information Hierarchy**: Counts, statuses, and actions immediately visible.
4. **Consistent Visual Language**: Colors, spacing, patterns consistent across all pages.
5. **Web-First, Mobile-Friendly**: Desktop primary, with responsive adaptations.
6. **Clear System Feedback**: Every action produces visible feedback.
7. **Non-Judgmental Analytics**: Transparency without competition.

### 11.2 UI States

| State | Behavior |
|-------|----------|
| **Empty** | Friendly message with icon and call-to-action. |
| **Loading** | Skeleton screen or spinner. Interactive elements disabled. |
| **Error** | Inline error with retry. No full-page error for recoverable failures. |
| **Normal** | Data loaded. Default interactive state. |
| **Completed** | Strikethrough/muted. Visible unless filtered. |
| **Offline** | Cached data displayed with a prominent "You're offline" banner. Actions queued. |

### 11.3 Typography & Color Guidance

- Clean sans-serif: Inter, system-ui, or sans-serif fallback.
- Body: 14–16px. Headers: 18–20px. Page titles: 24–28px.
- Primary accent for interactive elements.
- Semantic colors: green (success, credit, completed), yellow/amber (pending, warning), red (overdue, error, debt).
- Financial: green for positive balances, red for negative.
- WCAG AA contrast minimum.

---

## 12. Auto-Categorization Logic

### 12.1 Overview

When a user adds a grocery item, the backend auto-assigns a category via keyword matching against the item name. This reduces manual effort and organizes the list by shopping section.

### 12.2 Category Definitions & Keywords

| Category | Sample Keywords |
|----------|-----------------|
| **Produce** | apple, banana, tomato, lettuce, onion, potato, carrot, spinach, avocado, pepper, broccoli, garlic, lemon, lime, orange, grape, berry, mushroom, celery, cucumber |
| **Dairy & Eggs** | milk, cheese, yogurt, butter, cream, egg, sour cream, cottage cheese |
| **Meat & Seafood** | chicken, beef, pork, salmon, shrimp, fish, turkey, bacon, sausage, steak, ground meat, lamb |
| **Bakery** | bread, bagel, tortilla, muffin, croissant, roll, bun, pita, naan |
| **Pantry & Dry Goods** | rice, pasta, cereal, flour, sugar, oil, vinegar, sauce, soup, bean, lentil, oat, nut, peanut butter, honey, salt, spice |
| **Frozen** | frozen, ice cream, pizza (frozen), waffle, popsicle |
| **Beverages** | water, juice, soda, coffee, tea, beer, wine, kombucha, energy drink |
| **Snacks** | chip, cracker, cookie, popcorn, granola bar, candy, chocolate, pretzel |
| **Household & Cleaning** | paper towel, toilet paper, dish soap, detergent, sponge, trash bag, foil, wrap, bleach, cleaner |
| **Personal Care** | shampoo, conditioner, soap, toothpaste, toothbrush, deodorant, razor, lotion, tissue |
| **Other** | Default fallback |

### 12.3 Matching Rules

1. Normalize item name: lowercase, trim whitespace.
2. Iterate through keyword map in defined order.
3. Check if any keyword is a substring of the normalized name.
4. Assign the first matching category.
5. If no match → "Other."

### 12.4 Extensibility

The keyword map is stored as a configurable JSON file (not hardcoded in business logic), allowing future expansion to user-defined categories or ML-based classification.

---

## 13. User Flows

### 13.1 Registration & Household Setup

| Step | User Action | System Response |
|------|-------------|-----------------|
| 1 | Visits HomeSync URL. | Login page renders. |
| 2 | Clicks "Register." Enters name, email, password. | Validates inputs. Creates user. Issues JWT. |
| 3 | Redirected to Household page. Clicks "Create Household." Enters "Apartment 4B." | Creates household. Sets user as Owner. |
| 4 | Copies invite link and sends to roommates. | Invite link generated. |
| 5 | Roommate clicks link, registers, and joins. | New member added to household. |

### 13.2 Grocery Flow

| Step | User Action | System Response |
|------|-------------|-----------------|
| 1 | Navigates to Groceries. | Renders form, filters, categorized list. |
| 2 | Enters "Almond Milk," qty 2, priority "High." | Real-time validation. |
| 3 | Clicks "Add Item." | POST /api/items. Categorized as "Dairy & Eggs." |
| 4 | Item appears under "Dairy & Eggs." | UI updates. Form resets. |
| 5 | At store, checks off "Almond Milk." | PATCH /api/items/:id. Strikethrough applied. |
| 6 | Prompt appears: "Log expense for this shopping trip?" | User taps "Yes," enters $45. Expense created. |

### 13.3 Chore Flow — Fixed (All Members)

| Step | User Action | System Response |
|------|-------------|-----------------|
| 1 | Navigates to Chores. | Renders form and chore list. |
| 2 | Adds "Clean Your Room (Mop & Vacuum)," selects **Fixed**, frequency **Weekly**. | Validates. |
| 3 | Clicks "Add Chore." | POST /api/chores. Assignment type: fixed. Chore appears on every member's list independently. |
| 4 | Maya completes her room. Clicks "Mark Complete." | POST /api/chores/:id/complete. Logs completion for Maya. David and Sam's status remain "Pending." |
| 5 | Sam doesn't clean his room by next week. | Sam's instance shows "Overdue" in red. Maya and David's statuses are unaffected. |

### 13.4 Chore Flow — Rotating

| Step | User Action | System Response |
|------|-------------|-----------------|
| 1 | Adds "Take Out Trash," selects **Rotating**, frequency **Every 2 Days**, participants: Maya, David, Sam. | Validates. |
| 2 | Clicks "Add Chore." | POST /api/chores. Auto-assigned to Maya (alphabetical or random for first assignment). |
| 3 | Maya takes out trash, clicks "Mark Complete." | Logs completion. System auto-assigns to David (fewest completions / round-robin). Card updates to show "Assigned to: David. Next: Sam." |
| 4 | David doesn't complete within 2 days. | David's chore shows "Overdue." |

### 13.5 Chore Flow — Self-Assigned (Personal)

| Step | User Action | System Response |
|------|-------------|-----------------|
| 1 | Maya adds "Descale Coffee Machine," selects **Personal**, frequency **Biweekly**. | Auto-assigned to Maya. |
| 2 | Clicks "Add Chore." | POST /api/chores. Only visible to Maya. Not shown to David or Sam. |
| 3 | Biweekly reminder fires. | Push notification to Maya: "Chore overdue: Descale Coffee Machine." |

### 13.6 Expense Flow (Percentage Split with Receipt)

| Step | User Action | System Response |
|------|-------------|-----------------|
| 1 | Navigates to Expenses. | Renders budget bar, balance panel, form, log. |
| 2 | Enters "Monthly Rent," $2400, paid by Maya. Selects "Percentage" split. **Attaches a photo of the rent receipt.** | Per-member percentage inputs appear. Receipt thumbnail preview shows. |
| 3 | Sets Maya 50%, David 30%, Sam 20%. | Validates percentages sum to 100%. |
| 4 | Clicks "Add Expense." | POST /api/expenses (multipart with receipt). Receipt uploaded to Supabase Storage. Maya: $1200 share, David: $720, Sam: $480. Maya is owed $1200. |
| 5 | Balances update. Budget bar advances. | Balance panel, settlement summary, and budget progress bar all update. |
| 6 | David clicks "Settle Up," pays Maya $720. | POST /api/settlements. David → $0. |

### 13.7 Budget Flow

| Step | User Action | System Response |
|------|-------------|-----------------|
| 1 | Navigates to Expenses → "Manage Budgets." | Budget settings panel opens. |
| 2 | Sets overall monthly budget: $2,000. Sets "Dining Out" category budget: $400/month. | POST /api/households/:hid/budgets (×2). |
| 3 | Over the month, household logs $1,600 total ($350 on Dining Out). | Budget bar: "$1,600 / $2,000 — 80%." Amber warning appears. Dining Out: "$350 / $400 — 87.5%." Notification: "You've reached 80% of your monthly budget." |
| 4 | Another $200 expense is logged on Dining Out. | Dining Out budget: "$550 / $400 — 137.5%." Red "Budget Exceeded" alert. Dashboard "Needs Attention" shows budget warning. |

### 13.8 Recurring Expense Flow

| Step | User Action | System Response |
|------|-------------|-----------------|
| 1 | Creates a recurring expense: "Rent," $2400, monthly, 1st of month. | Recurring template saved. |
| 2 | On the 1st, a draft expense appears in "Pending" state. | Push notification: "Recurring expense due: Rent $2400." |
| 3 | User reviews, confirms. | Expense finalized. Balances updated. |

---

## 14. Data Model

All data is stored in Supabase (managed PostgreSQL). The schema supports multi-user, multi-household from day one. Receipt images are stored in Supabase Storage.

### 14.1 User

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | UUID | PK | Unique identifier. |
| **email** | VARCHAR(255) | UNIQUE, NOT NULL | User's email address. |
| **password_hash** | VARCHAR(255) | NOT NULL (NULL for OAuth-only users) | Bcrypt-hashed password. |
| **name** | VARCHAR(100) | NOT NULL | Display name. |
| **avatar_url** | TEXT | NULLABLE | Profile image URL. |
| **google_id** | VARCHAR(255) | UNIQUE, NULLABLE | Google OAuth identifier. |
| **created_at** | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Registration timestamp. |

### 14.2 Household

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | UUID | PK | Unique identifier. |
| **name** | VARCHAR(100) | NOT NULL | Display name. |
| **invite_code** | VARCHAR(10) | UNIQUE, NOT NULL | Shareable join code. |
| **owner_id** | UUID | FK → User.id, NOT NULL | Household creator/owner. |
| **is_archived** | BOOLEAN | NOT NULL, DEFAULT FALSE | Soft-delete flag. |
| **created_at** | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp. |

### 14.3 HouseholdMember

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | UUID | PK | Unique identifier. |
| **household_id** | UUID | FK → Household.id, NOT NULL | Parent household. |
| **user_id** | UUID | FK → User.id, NOT NULL | The user. |
| **role** | VARCHAR(10) | NOT NULL, DEFAULT 'member', CHECK IN ('owner', 'member') | Role. |
| **joined_at** | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | When they joined. |
| UNIQUE(household_id, user_id) | | | Prevent duplicate membership. |

### 14.4 GroceryItem

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | UUID | PK | Unique identifier. |
| **household_id** | UUID | FK → Household.id, NOT NULL | Parent household. |
| **name** | VARCHAR(200) | NOT NULL | Item name. |
| **quantity** | INTEGER | NOT NULL, DEFAULT 1, CHECK > 0 | Units needed. |
| **priority** | VARCHAR(10) | NOT NULL, DEFAULT 'medium', CHECK IN ('low','medium','high') | Priority. |
| **category** | VARCHAR(50) | NOT NULL | Auto-assigned (Section 12). |
| **is_bought** | BOOLEAN | NOT NULL, DEFAULT FALSE | Purchase status. |
| **added_by** | UUID | FK → User.id, NULLABLE | Who added the item. |
| **created_at** | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | When added. |
| **updated_at** | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last modification. |

### 14.5 GroceryPurchaseLog

Tracks when items are bought for low-stock detection and purchase frequency analysis.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | UUID | PK | Unique identifier. |
| **household_id** | UUID | FK → Household.id, NOT NULL | Parent household. |
| **item_name** | VARCHAR(200) | NOT NULL | Normalized item name. |
| **purchased_at** | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | When bought. |
| **purchased_by** | UUID | FK → User.id, NULLABLE | Who bought it. |

### 14.6 Chore

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | UUID | PK | Unique identifier. |
| **household_id** | UUID | FK → Household.id, NOT NULL | Parent household. |
| **name** | VARCHAR(200) | NOT NULL | Chore name. |
| **assignment_type** | VARCHAR(15) | NOT NULL, CHECK IN ('fixed','rotating','self_assigned') | How the chore is assigned: fixed = all members, rotating = auto-rotate, self_assigned = personal. |
| **frequency** | VARCHAR(15) | NOT NULL, CHECK IN ('daily','every_2_days','every_3_days','weekly','biweekly','monthly') | Recurrence interval. |
| **current_assignee** | UUID | FK → HouseholdMember.id, NULLABLE | Current assignee for rotating chores. NULL for fixed (all members) chores. For self_assigned, set to the creator. |
| **created_by** | UUID | FK → User.id, NOT NULL | Who created the chore. |
| **created_at** | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation time. |

**Notes:**
- For **fixed** chores, `current_assignee` is NULL. The system uses ChoreCompletionLog to track each member's independent completion status.
- For **rotating** chores, `current_assignee` holds the member who currently needs to do it. After completion, the system updates this to the next member in rotation.
- For **self_assigned** chores, `current_assignee` is the creator and never changes.

### 14.7 ChoreCompletionLog

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | UUID | PK | Unique identifier. |
| **chore_id** | UUID | FK → Chore.id, NOT NULL | Completed chore. |
| **completed_by** | UUID | FK → HouseholdMember.id, NOT NULL | Who completed it. |
| **completed_at** | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Completion time. |

**Notes:** For fixed chores, each member creates their own completion entry. The system determines per-member overdue status by checking the most recent completion entry for each member independently.

### 14.8 Expense

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | UUID | PK | Unique identifier. |
| **household_id** | UUID | FK → Household.id, NOT NULL | Parent household. |
| **description** | VARCHAR(300) | NOT NULL | What the expense is for. |
| **amount** | DECIMAL(10,2) | NOT NULL, CHECK > 0 | Total amount. |
| **paid_by** | UUID | FK → HouseholdMember.id, NOT NULL | Who paid. |
| **split_type** | VARCHAR(12) | NOT NULL, DEFAULT 'equal', CHECK IN ('equal','percentage','exact') | How it's split. |
| **category** | VARCHAR(50) | NULLABLE | Expense category. |
| **tag** | VARCHAR(100) | NULLABLE | Optional grouping tag. |
| **expense_date** | DATE | NOT NULL, DEFAULT CURRENT_DATE | When expense occurred. |
| **receipt_url** | TEXT | NULLABLE | Supabase Storage URL for receipt image. |
| **recurring_template_id** | UUID | FK → RecurringExpense.id, NULLABLE | Link to recurring template if auto-generated. |
| **is_draft** | BOOLEAN | NOT NULL, DEFAULT FALSE | TRUE for unconfirmed recurring expense drafts. |
| **created_at** | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation. |

### 14.9 ExpenseSplit

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | UUID | PK | Unique identifier. |
| **expense_id** | UUID | FK → Expense.id, NOT NULL, ON DELETE CASCADE | Parent expense. |
| **member_id** | UUID | FK → HouseholdMember.id, NOT NULL | Member who owes. |
| **share_amount** | DECIMAL(10,2) | NOT NULL, CHECK >= 0 | This member's share. |
| **percentage** | DECIMAL(5,2) | NULLABLE | Percentage (for percentage splits). |

### 14.10 Settlement

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | UUID | PK | Unique identifier. |
| **household_id** | UUID | FK → Household.id, NOT NULL | Parent household. |
| **paid_by** | UUID | FK → HouseholdMember.id, NOT NULL | Debtor (making payment). |
| **paid_to** | UUID | FK → HouseholdMember.id, NOT NULL | Creditor (receiving payment). |
| **amount** | DECIMAL(10,2) | NOT NULL, CHECK > 0 | Settlement amount. |
| **settled_at** | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | When recorded. |

### 14.11 RecurringExpense

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | UUID | PK | Unique identifier. |
| **household_id** | UUID | FK → Household.id, NOT NULL | Parent household. |
| **description** | VARCHAR(300) | NOT NULL | Template description. |
| **amount** | DECIMAL(10,2) | NOT NULL, CHECK > 0 | Template amount. |
| **paid_by** | UUID | FK → HouseholdMember.id, NOT NULL | Default payer. |
| **split_type** | VARCHAR(12) | NOT NULL, DEFAULT 'equal' | Default split type. |
| **split_config** | JSONB | NULLABLE | Stored split details (member IDs + percentages/amounts). |
| **category** | VARCHAR(50) | NULLABLE | Default category. |
| **frequency** | VARCHAR(10) | NOT NULL, CHECK IN ('weekly','monthly') | Recurrence frequency. |
| **next_due_date** | DATE | NOT NULL | When next draft should be created. |
| **is_active** | BOOLEAN | NOT NULL, DEFAULT TRUE | Pause/resume toggle. |
| **created_at** | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation time. |

### 14.12 Budget

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | UUID | PK | Unique identifier. |
| **household_id** | UUID | FK → Household.id, NOT NULL | Parent household. |
| **period_type** | VARCHAR(10) | NOT NULL, CHECK IN ('weekly','monthly') | Budget period. |
| **amount** | DECIMAL(10,2) | NOT NULL, CHECK > 0 | Total budget amount for the period. |
| **category** | VARCHAR(50) | NULLABLE | If set, budget applies to this category only. If NULL, applies to overall household spending. |
| **warning_threshold** | DECIMAL(3,2) | NOT NULL, DEFAULT 0.80 | Percentage (0.00–1.00) at which a warning is triggered. Default 80%. |
| **is_active** | BOOLEAN | NOT NULL, DEFAULT TRUE | Whether this budget is active. |
| **created_at** | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation time. |
| UNIQUE(household_id, period_type, category) | | | One budget per household per period per category. |

**Notes:**
- A household can have an overall monthly budget (category = NULL) and additional per-category budgets (e.g., $500/month for Dining Out).
- Budget utilization is computed at query time by summing expenses within the current period window.
- Weekly budgets reset every Monday; monthly budgets reset on the 1st.

### 14.13 Notification

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | UUID | PK | Unique identifier. |
| **user_id** | UUID | FK → User.id, NOT NULL | Recipient. |
| **household_id** | UUID | FK → Household.id, NOT NULL | Context. |
| **type** | VARCHAR(30) | NOT NULL | e.g., 'expense_added', 'chore_overdue', 'low_stock', 'budget_warning', 'budget_exceeded'. |
| **title** | VARCHAR(200) | NOT NULL | Notification title. |
| **body** | TEXT | NULLABLE | Notification body. |
| **is_read** | BOOLEAN | NOT NULL, DEFAULT FALSE | Read status. |
| **created_at** | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | When created. |

### 14.14 NotificationPreference

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | UUID | PK | Unique identifier. |
| **user_id** | UUID | FK → User.id, NOT NULL | User. |
| **notification_type** | VARCHAR(30) | NOT NULL | Notification type. |
| **in_app** | BOOLEAN | NOT NULL, DEFAULT TRUE | In-app enabled. |
| **email** | BOOLEAN | NOT NULL, DEFAULT FALSE | Email enabled. |
| **push** | BOOLEAN | NOT NULL, DEFAULT FALSE | Push enabled. |
| UNIQUE(user_id, notification_type) | | | One preference per type per user. |

### 14.15 PushSubscription

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | UUID | PK | Unique identifier. |
| **user_id** | UUID | FK → User.id, NOT NULL | Subscriber. |
| **endpoint** | TEXT | NOT NULL | Push service endpoint. |
| **keys** | JSONB | NOT NULL | p256dh and auth keys. |
| **created_at** | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | When registered. |

### 14.16 RefreshToken

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | UUID | PK | Unique identifier. |
| **user_id** | UUID | FK → User.id, NOT NULL | Token owner. |
| **token_hash** | VARCHAR(255) | NOT NULL | Hashed refresh token. |
| **expires_at** | TIMESTAMPTZ | NOT NULL | Expiry. |
| **is_revoked** | BOOLEAN | NOT NULL, DEFAULT FALSE | Revocation flag. |
| **created_at** | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Issue time. |

### 14.17 Entity Relationships Summary

- One User has many HouseholdMembers (user can be in multiple households).
- One Household has many HouseholdMembers.
- One Household has many: GroceryItems, Chores, Expenses, Settlements, RecurringExpenses, Budgets, Notifications.
- One Chore has many ChoreCompletionLogs.
- One Expense has many ExpenseSplits (CASCADE delete).
- One RecurringExpense generates many Expenses (via recurring_template_id).
- One User has many: Notifications, NotificationPreferences, PushSubscriptions, RefreshTokens.

---

## 15. Technical Architecture

### 15.1 Architecture Overview

HomeSync is a decoupled client-server application with two independent repositories. The React/TypeScript frontend communicates with the Node.js/Express backend exclusively through REST APIs. The backend connects to Supabase (managed PostgreSQL) and Supabase Storage (for receipt images).

### 15.2 Deployment Architecture

| Layer | Platform | Details |
|-------|----------|---------|
| **Frontend** | Vercel | Auto-deploys from `homesync-frontend` repo. Env vars for API base URL. Global CDN. PWA service worker served from root. |
| **Backend** | Render | Auto-deploys from `homesync-backend` repo. Env vars for DB URL, JWT secret, CORS, email service. Web service with /health endpoint. |
| **Database** | Supabase | Managed PostgreSQL. Connected via DATABASE_URL. Migrations managed in backend repo. |
| **Storage** | Supabase Storage | Receipt image uploads. Public bucket with signed URLs for access control. |
| **Email** | Resend / SendGrid | Transactional emails: password reset, notification digests. Configured via API key in backend env. |
| **Push Service** | Web Push Protocol | VAPID keys generated and stored in backend env. Push subscriptions stored in DB. |

### 15.3 Frontend Stack

| Technology | Purpose |
|-----------|---------|
| React 18+ | Component-based UI. |
| TypeScript | Static typing. |
| Vite | Build tool with HMR. |
| React Router | Client-side routing. |
| Recharts / Chart.js | Analytics charts and visualizations. |
| Fetch API / Axios | HTTP client. |
| Workbox | PWA service worker generation and caching strategies. |
| CSS Modules / Tailwind CSS | Styling. |

### 15.4 Backend Stack

| Technology | Purpose |
|-----------|---------|
| Node.js | JavaScript runtime. |
| Express | Web framework. |
| PostgreSQL (Supabase) | Database. Connected via DATABASE_URL. |
| pg / node-postgres | PostgreSQL client. |
| bcrypt | Password hashing. |
| jsonwebtoken | JWT creation and verification. |
| web-push | Push notification delivery. |
| multer + Supabase Storage SDK | Receipt image upload handling. |
| node-cron | Scheduled jobs (recurring expenses, digest emails). |
| dotenv | Per-environment .env file loading. |
| Winston / Pino | Structured logging. |

### 15.5 Backend Repository Structure

Repository: `homesync-backend`

```
homesync-backend/
├── src/
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── household.routes.js
│   │   ├── member.routes.js
│   │   ├── grocery.routes.js
│   │   ├── chore.routes.js
│   │   ├── expense.routes.js
│   │   ├── settlement.routes.js
│   │   ├── balance.routes.js
│   │   ├── recurring.routes.js
│   │   ├── budget.routes.js
│   │   ├── analytics.routes.js
│   │   ├── notification.routes.js
│   │   └── dashboard.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── household.controller.js
│   │   ├── member.controller.js
│   │   ├── grocery.controller.js
│   │   ├── chore.controller.js
│   │   ├── expense.controller.js
│   │   ├── settlement.controller.js
│   │   ├── balance.controller.js
│   │   ├── recurring.controller.js
│   │   ├── budget.controller.js
│   │   ├── analytics.controller.js
│   │   ├── notification.controller.js
│   │   └── dashboard.controller.js
│   ├── config/
│   │   ├── env.js              # Loads NODE_ENV → resolves .env.{environment}
│   │   ├── logger.js           # Winston/Pino structured logging
│   │   └── database.js         # Supabase/pg connection pool
│   ├── middleware/
│   │   ├── auth.js             # JWT verification, attach user to req
│   │   ├── householdAccess.js  # Verify user belongs to requested household
│   │   ├── errorHandler.js     # Global error handling
│   │   ├── validator.js        # Request validation (Joi/Zod schemas)
│   │   └── cors.js             # CORS configuration
│   ├── utils/
│   │   ├── categorizer.js      # Grocery auto-categorization
│   │   ├── balanceCalculator.js # Balance + debt simplification
│   │   ├── stockDetector.js    # Low-stock detection logic
│   │   └── emailService.js     # Email sending wrapper
│   ├── jobs/
│   │   ├── recurringExpenses.js # Cron: create recurring expense drafts
│   │   ├── dailyDigest.js      # Cron: send daily email digests
│   │   ├── lowStockCheck.js    # Cron: detect low-stock items
│   │   ├── budgetCheck.js      # Cron: check budget thresholds after each expense, send alerts
│   │   └── monthlySummary.js   # Cron: auto-generate monthly expense summary on 1st of month
│   ├── templates/              # HTML email templates
│   │   ├── passwordReset.html
│   │   └── dailyDigest.html
│   └── server.js               # Express app init + startup + cron scheduling
├── tests/
├── .env
├── .env.development
├── .env.production
├── .env.test
├── .env.example
├── .prettierrc
├── eslint.config.mjs
├── package.json
└── README.md
```

**Environment Configuration**: `config/env.js` first loads NODE_ENV via `dotenv.config()`, then uses `path` to resolve `.env.{NODE_ENV}` (e.g., `.env.development`, `.env.production`). This allows per-environment database URLs, CORS origins, JWT secrets, and API keys.

**Key Environment Variables**:

| Variable | Description |
|----------|-------------|
| NODE_ENV | development / production / test |
| PORT | Server port (default: 3000) |
| DATABASE_URL | Supabase PostgreSQL connection string |
| CORS_ORIGIN | Allowed frontend origin |
| JWT_SECRET | Secret for signing access tokens |
| JWT_REFRESH_SECRET | Secret for signing refresh tokens |
| GOOGLE_CLIENT_ID | Google OAuth client ID |
| GOOGLE_CLIENT_SECRET | Google OAuth client secret |
| SUPABASE_URL | Supabase project URL (for storage) |
| SUPABASE_SERVICE_KEY | Supabase service role key (for storage) |
| EMAIL_API_KEY | Resend/SendGrid API key |
| VAPID_PUBLIC_KEY | Push notification public key |
| VAPID_PRIVATE_KEY | Push notification private key |
| LOG_LEVEL | Logging verbosity |

### 15.6 Frontend Repository Structure

Repository: `homesync-frontend`

```
homesync-frontend/
├── public/
│   ├── favicon.svg
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service worker (or generated by Workbox)
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   ├── SummaryCard/
│   │   ├── GroceryItem/
│   │   ├── ChoreCard/
│   │   ├── ExpenseRow/
│   │   ├── BalancePanel/
│   │   ├── SettleUpModal/
│   │   ├── SplitTypeSelector/
│   │   ├── NotificationBell/
│   │   ├── HouseholdSelector/
│   │   ├── ChartComponents/
│   │   ├── EmptyState/
│   │   └── ProtectedRoute/
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Households.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Groceries.tsx
│   │   ├── Chores.tsx
│   │   ├── Expenses.tsx
│   │   ├── Analytics.tsx
│   │   ├── Settings.tsx
│   │   └── NotificationPreferences.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useHousehold.ts
│   │   ├── useGroceries.ts
│   │   ├── useChores.ts
│   │   ├── useExpenses.ts
│   │   ├── useBalances.ts
│   │   ├── useBudgets.ts
│   │   ├── useAnalytics.ts
│   │   ├── useNotifications.ts
│   │   └── useMembers.ts
│   ├── services/
│   │   ├── api.ts              # Axios instance with JWT interceptor
│   │   ├── authService.ts
│   │   ├── householdService.ts
│   │   ├── groceryService.ts
│   │   ├── choreService.ts
│   │   ├── expenseService.ts
│   │   ├── balanceService.ts
│   │   ├── budgetService.ts
│   │   ├── analyticsService.ts
│   │   ├── notificationService.ts
│   │   └── memberService.ts
│   ├── utils/
│   │   ├── formatCurrency.ts
│   │   ├── dateUtils.ts
│   │   └── pushNotifications.ts # Push subscription management
│   ├── types/
│   │   └── index.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── HouseholdContext.tsx
│   ├── App.tsx
│   └── main.tsx
├── .env                        # VITE_API_BASE_URL=http://localhost:3000/api
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 16. API Specification

All endpoints prefixed with `/api`. JSON request/response. JWT required for all endpoints except `/api/auth/*`.

### 16.1 Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register with email/password. Returns tokens. |
| POST | /api/auth/login | Login with email/password. Returns tokens. |
| POST | /api/auth/google | Google OAuth login/register. Returns tokens. |
| POST | /api/auth/refresh | Exchange refresh token for new access token. |
| POST | /api/auth/logout | Revoke refresh token. |
| POST | /api/auth/forgot-password | Send password reset email. |
| POST | /api/auth/reset-password | Set new password with reset token. |

### 16.2 Household Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/households | List user's households. |
| POST | /api/households | Create new household. |
| GET | /api/households/:id | Get household details + members. |
| PATCH | /api/households/:id | Update household (Owner only). |
| DELETE | /api/households/:id | Archive household (Owner only). |
| POST | /api/households/join | Join via invite code. |
| POST | /api/households/:id/leave | Leave a household. |
| DELETE | /api/households/:id/members/:memberId | Remove a member (Owner only). |

### 16.3 Grocery Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/households/:hid/items | Fetch groceries (filter query param). |
| POST | /api/households/:hid/items | Add item (auto-categorizes). |
| PATCH | /api/households/:hid/items/:id | Update item (toggle bought, edit). |
| DELETE | /api/households/:hid/items/:id | Delete item. |
| GET | /api/households/:hid/items/suggestions | Get "You might need" suggestions. |

### 16.4 Chore Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/households/:hid/chores | Fetch chores with computed status. |
| POST | /api/households/:hid/chores | Add chore. |
| PATCH | /api/households/:hid/chores/:id | Update chore (reassign, edit). |
| DELETE | /api/households/:hid/chores/:id | Delete chore. |
| POST | /api/households/:hid/chores/:id/complete | Mark complete (creates log). |

### 16.5 Expense Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/households/:hid/expenses | Fetch expenses with splits (filters: date, category, paid_by, tag). |
| POST | /api/households/:hid/expenses | Add expense (calculates splits). |
| DELETE | /api/households/:hid/expenses/:id | Delete expense (CASCADE). |
| POST | /api/households/:hid/expenses/:id/receipt | Upload receipt image. |

### 16.6 Balance & Settlement Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/households/:hid/balances | Net balances + settlement summary. |
| GET | /api/households/:hid/settlements | Fetch all settlements. |
| POST | /api/households/:hid/settlements | Record a settlement. |

### 16.7 Recurring Expense Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/households/:hid/recurring | List recurring expense templates. |
| POST | /api/households/:hid/recurring | Create recurring template. |
| PATCH | /api/households/:hid/recurring/:id | Edit or pause/resume. |
| DELETE | /api/households/:hid/recurring/:id | Delete template. |
| POST | /api/households/:hid/expenses/:id/confirm | Confirm a recurring draft expense. |

### 16.8 Budget Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/households/:hid/budgets | List all active budgets (overall + per-category). |
| POST | /api/households/:hid/budgets | Create a budget (overall or per-category). |
| PATCH | /api/households/:hid/budgets/:id | Update budget amount, threshold, or active status. |
| DELETE | /api/households/:hid/budgets/:id | Delete a budget. |
| GET | /api/households/:hid/budgets/status | Get current budget utilization: amount spent vs. budget for each active budget, with warning/exceeded flags. |

### 16.9 Analytics Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/households/:hid/analytics/chores | Chore contributions (query: period). |
| GET | /api/households/:hid/analytics/expenses | Expense contributions + category breakdown (query: period). |
| GET | /api/households/:hid/analytics/trends | Monthly spending trends. |
| GET | /api/households/:hid/analytics/monthly-summary | Auto-generated monthly expense summary: total spending, category breakdown, per-member contributions, budget comparison, top 5 expenses. Query param: month (YYYY-MM, defaults to current). |

### 16.10 Notification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notifications | Fetch user's notifications (paginated). |
| PATCH | /api/notifications/:id/read | Mark as read. |
| POST | /api/notifications/read-all | Mark all as read. |
| GET | /api/notifications/preferences | Get notification preferences. |
| PATCH | /api/notifications/preferences | Update preferences. |
| POST | /api/push/subscribe | Register push subscription. |
| DELETE | /api/push/subscribe | Unregister push subscription. |

### 16.11 Dashboard Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/households/:hid/dashboard | Aggregated summary: groceries, chores, expenses, balances, budget utilization, low-stock, suggestions, recent activity. |

### 16.12 Error Response Format

```json
{ "error": "Human-readable message", "code": "VALIDATION_ERROR" }
```

| HTTP Status | Code | When Used |
|-------------|------|-----------|
| 400 | VALIDATION_ERROR | Invalid request fields. |
| 401 | UNAUTHORIZED | Missing or invalid token. |
| 403 | FORBIDDEN | User lacks permission (e.g., non-owner managing household). |
| 404 | NOT_FOUND | Resource doesn't exist. |
| 409 | CONFLICT | Duplicate (e.g., already a member). |
| 500 | INTERNAL_ERROR | Unexpected server error. |

---

## 17. Error Handling & Edge Cases

| Scenario | Expected Behavior | Implementation |
|----------|-------------------|----------------|
| Empty form submission | Inline validation error. No API call. | Frontend validation. |
| Network error | Dismissible error banner. Retain input for retry. | Try/catch around fetch. |
| Server error | Generic message to user. Detailed log server-side. | Express error middleware + logger. |
| Rapid double-click | Disable button during request. | Loading state + disabled. |
| Expense rounding | $10 / 3 = $3.34 + $3.33 + $3.33. Remainder to payer. | balanceCalculator.js rounding logic. |
| Percentage doesn't sum to 100% | Prevent submission. Show inline error. | Frontend validation + backend check. |
| Exact amounts don't sum to total | Prevent submission. Show inline error. | Frontend validation + backend check. |
| Delete expense with splits | CASCADE delete removes splits. Balances recalculate. | ON DELETE CASCADE + balance re-query. |
| Settle more than owed | Validation error. | Backend validation. |
| Expired access token | Auto-refresh via interceptor. Retry original request. | Axios interceptor + /auth/refresh. |
| Expired refresh token | Redirect to login. | AuthContext clears state. |
| User removed from household | API returns 403 on next request. UI redirects to household selector. | householdAccess middleware. |
| Concurrent edits | Last-write-wins. | Accepted tradeoff. |
| Empty lists | Friendly empty state with CTA. | Conditional rendering. |
| Offline (PWA) | Show cached data. "You're offline" banner. Queue actions. | Service worker + IndexedDB queue. |
| Push permission denied | Graceful fallback. In-app and email still work. | Check permission state. |
| Receipt upload too large | Reject >5MB with clear error. | multer size limit + frontend validation. |
| Fixed chore — member removed | Chore continues for remaining members. Removed member's history preserved. | Filter active members at query time. |
| Rotating chore — 1 member left | Rotation degrades to self-assigned behavior. | Rotation logic handles single-member edge case. |
| Solo user — split fields | Split-type and split-among hidden. Expense tracked as personal spending. | Frontend conditional rendering based on member count. |
| Budget not set | Budget bar hidden. No threshold notifications fired. | Conditional rendering + null check. |
| Budget exceeded | Red progress bar + "Exceeded" badge. Dashboard alert. Push notification. | Budget status computed at query time from expense sum. |
| Monthly summary — no expenses | Summary shows "$0 total" with empty category chart and friendly message. | Handle zero-expense month gracefully. |

---

## 18. Success Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| SC-01 | Users can register, log in (email + Google), and manage profiles. | Walkthrough + Postman. |
| SC-02 | Users can create, join, switch, and manage multiple households. | Walkthrough + Postman. |
| SC-03 | Full grocery CRUD with categorization, filters, and low-stock suggestions. | Walkthrough + Postman. |
| SC-04 | Chores support all three assignment types (Fixed, Rotating, Self-Assigned) with correct per-member status tracking. | Walkthrough + Postman. |
| SC-05 | Fixed chores show independent completion status per member. Rotating chores auto-advance assignee after completion. | Automated tests. |
| SC-06 | Configurable chore frequencies (daily through monthly) compute overdue status correctly. | Automated tests. |
| SC-07 | Expenses support equal, percentage, and exact splits with correct calculations. Receipt attachment works inline in the add-expense form. | Automated tests + Postman. |
| SC-08 | Balances always sum to zero across all household members. | Automated test. |
| SC-09 | Recurring expenses auto-generate drafts on schedule and can be confirmed. | Cron test + walkthrough. |
| SC-10 | Household budgets track spending in real-time. Warnings trigger at configured threshold. "Exceeded" alert triggers at 100%. | Walkthrough + Postman. |
| SC-11 | Monthly expense summary auto-generates with correct totals, category breakdowns, and budget comparison. | Cross-reference with DB. |
| SC-12 | Analytics charts accurately reflect data for selected time periods. | Cross-reference with DB. |
| SC-13 | In-app, email, and push notifications deliver correctly per user preferences, including budget alerts. | End-to-end test per channel. |
| SC-14 | Dashboard aggregates all data correctly including budget utilization for the active household. | Cross-reference with DB. |
| SC-15 | **Single-person mode**: a solo user can use all features (groceries, chores, expenses, budget) without encountering split/assignment UI that doesn't apply. | Walkthrough. |
| SC-16 | App is responsive on desktop (1024px+), tablet (768px), and mobile (375px). | Chrome DevTools. |
| SC-17 | PWA is installable, shows cached data offline, and delivers push notifications. | Lighthouse audit + manual test. |
| SC-18 | Both repos follow professional Git practices. | Repo audit. |
| SC-19 | Frontend deployed on Vercel, backend on Render, DB on Supabase — all working in production. | Production URL test. |
| SC-20 | READMEs include setup, tech stack, env vars, API docs, and screenshots. | README review. |

---

## 19. Risks & Mitigation

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Scope Magnitude** | High | Phased implementation (Section 21). Core features first, then layers of intelligence. Strict sprint boundaries. |
| **Timeline Overrun** | High | 8–10 week estimate includes buffer. If behind, analytics and intelligence features are deprioritized before core flows. |
| **Authentication Complexity** | Medium | Use Supabase Auth or Passport.js for heavy lifting. Don't build from scratch. |
| **Financial Calculation Bugs** | High | Comprehensive test suite. Rounding handled deterministically. Balances-sum-to-zero invariant tested. |
| **CORS / Deployment Issues** | Medium | Configure cross-origin setup in Week 1 before feature work. |
| **Push Notification Browser Limits** | Medium | PWA push is well-supported on Android/Chrome. Safari/iOS support is limited. Document limitations. Fallback to email/in-app. |
| **Supabase Free Tier Limits** | Low | Health check keeps DB alive. Monitor storage usage for receipts. Upgrade tier if needed. |
| **Over-Engineering** | Medium | Start simple. Ship working features before polishing. |
| **Single Developer Burnout** | Medium | Realistic weekly milestones. Avoid crunch by shipping incrementally. |

---

## 20. Future Expansion Roadmap (Post-MVP)

With the comprehensive MVP covering groceries, chores (fixed/rotating/personal), expenses (advanced splits, receipts, budgets, monthly summaries), analytics, intelligence, notifications, auth, multi-household, solo-user support, and PWA — the post-MVP roadmap focuses on deepening the experience:

| Phase | Theme | Key Features |
|-------|-------|--------------|
| **Post-MVP 1** | Smart Recommendations | AI-powered monthly spending recommendations (e.g., "Dining Out spending increased 40% — consider a category budget"). Chore scheduling optimization. Grocery substitution suggestions. |
| **Post-MVP 2** | Native Mobile | iOS and Android native apps using React Native or Flutter. Deep OS integration (widgets, Siri/Google Assistant shortcuts). |
| **Post-MVP 3** | Real-Time Collaboration | WebSocket integration for live updates. Collaborative grocery list editing with presence indicators. |
| **Post-MVP 4** | AI & ML | ML-based grocery categorization. Smart expense detection from bank statement imports. Predictive chore scheduling. |
| **Post-MVP 5** | Payment Integration | In-app settlement via Stripe/PayPal. Direct bank transfers for settling debts. |
| **Post-MVP 6** | Household Marketplace | Template sharing (chore schedules, grocery lists) across households. Community-contributed category maps. |

---

## 21. Implementation Plan

The full-scope MVP is developed in 5 two-week sprints across 10 weeks:

| Sprint | Weeks | Focus | Deliverables |
|--------|-------|-------|-------------|
| **Sprint 1** | 1–2 | **Foundation + Auth** | Both repos initialized. Express + Supabase connection. DB schema + migrations (all 17 tables). Auth endpoints (register, login, Google OAuth, JWT). Household CRUD + invite system + single-person mode. Frontend: Login, Register, Household selector pages. Basic routing + auth context. Deploy pipeline: Vercel + Render + Supabase. |
| **Sprint 2** | 3–4 | **Groceries + Chores** | Grocery CRUD APIs + auto-categorization. Chore CRUD APIs with **all three assignment types** (Fixed/Rotating/Self-Assigned) + configurable frequencies (daily through monthly) + completion logging + auto-rotation logic. Frontend: Groceries page (form, filters, categorized list). Chores page (assignment type selector, frequency options, per-member status for fixed chores, rotation display). Dashboard: summary cards + needs attention. Responsive layout. |
| **Sprint 3** | 5–6 | **Expenses + Budgets** | Expense API: all 3 split types + validation. Balance calculation + debt simplification. Settlement API. **Receipt attachment** integrated in add-expense form via Supabase Storage. Recurring expense templates + cron job. **Budget CRUD API + budget status/utilization endpoint + budget threshold cron job.** Frontend: Expenses page (form with receipt field, split selector, **budget progress bar**, balance panel, log, settle up, recurring section). Solo-user mode (hide split fields when single member). Dashboard integration. |
| **Sprint 4** | 7–8 | **Intelligence + Analytics + Notifications** | GroceryPurchaseLog tracking. Low-stock detection + cron job. Suggested grocery list endpoint. Grocery → expense linking prompt. **Monthly expense summary API + auto-generation cron job (1st of month).** Analytics APIs (chore contributions with assignment-type awareness, expense breakdown, spending trends). Frontend: Analytics page with charts. **Monthly summary view within Expenses page.** In-app notification system. Email service (digests, budget alerts). Push notifications (VAPID, subscription, delivery). Notification preferences UI. |
| **Sprint 5** | 9–10 | **PWA + Polish + Launch** | Service worker (Workbox): caching, offline support. PWA manifest: installability, splash screen. Offline indicator + action queuing. End-to-end testing of all flows (including fixed/rotating/personal chores, budget thresholds, monthly summaries, solo-user mode). Error, empty, and loading states across all pages. Responsive polish. Lighthouse audit (PWA, accessibility, performance). README documentation with screenshots for both repos. Final code review and cleanup. Production deployment verification. |
