# Product Admin Dashboard

A feature-rich, responsive product management dashboard built with Next.js (App Router), TypeScript, Tailwind CSS, and Axios. Consumes the free [DummyJSON API](https://dummyjson.com).

## 🚀 Live Demo

**Deployment:** [View Live App on Vercel](#) *(Link will be generated upon Vercel deployment)*

**Test Credentials:**
- **Username:** `emilys`
- **Password:** `emilyspass`

## 📦 Setup & Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/dARSHANdR4/product-dashboard.git
   cd product-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## ✅ Feature Checklist

### Core Requirements
- [x] **Authentication:** Login page, inline errors, auth guard middleware, double-submit lock.
- [x] **Shared Axios Instance:** Interceptors inject token and normalize error shapes (auto-logout on 401).
- [x] **Product List & Pagination:** Responsive table/cards, server-pagination, state synced to URL, bounds checking.
- [x] **Search:** Debounced input (450ms) with `AbortController` to prevent race conditions.
- [x] **Filter & Sort:** Category dropdown, multi-field sorting, asc/desc toggle.
- [x] **Product Detail Page:** Dynamic route, custom "Not Found" UI, info grid, review listing.
- [x] **CRUD Operations:** Client-side form validation, delete confirmation modal.
- [x] **Loading/Empty States:** Shimmer skeletons, distinct "No results" empty states, error state with Retry button.
- [x] **Engineering Rules:** No external UI/fetching libraries (hand-rolled contexts/hooks), small components, TS rigor.

### Differentiators (Advanced Features)
- [x] **Optimistic UI Updates with Rollback:** Edit and delete update the UI immediately and rollback gracefully if the request fails.
- [x] **Dark Mode Toggle:** Explicit user control (`class` strategy) persisted to `localStorage`, with OS-fallback and FOUC prevention.
- [x] **Toast Notification System:** Custom built context/provider handling stacked notifications, auto-dismiss, and progress bars.
- [x] **Bulk Actions:** Select multiple products for bulk deletion via `Promise.allSettled`, with partial UI rollback for failed deletions.
- [x] **In-Memory Cache Layer:** deterministic string keyed cache for product lists to eliminate redundant network round trips (60s TTL).

## 🧠 Design Decisions & Tradeoffs

### 1. Token Storage
**Decision:** Tokens are stored in a module-level variable (memory) and backed up to `sessionStorage`.
**Why:** The DummyJSON API doesn't allow setting secure `httpOnly` cookies via a proxy. Storing directly in `localStorage` makes the app vulnerable to XSS. `sessionStorage` mitigates this slightly by scoping the token to the tab session, allowing the app to survive page refreshes while remaining more secure than persistent local storage.

### 2. Search & Category Mutual Exclusivity
**Decision:** Selecting a category clears the search term, and typing a search clears the active category.
**Why:** DummyJSON does not provide an endpoint that supports querying by *both* search term and category simultaneously. Rather than silently ignoring one of the user's inputs, the UI explicitly clears the conflicting filter and shows a Toast explaining the action (e.g., "Category selected — search cleared").

### 3. Simulating Local Persistence
**Decision:** All successful CRUD actions are merged into a global `ProductsContext`.
**Why:** DummyJSON is a mock API; it accepts POST/PUT/DELETE requests and returns success (HTTP 200/201), but does not persist the changes to the database. To create a seamless UX, the dashboard artificially merges these returned changes into local context state. Newly added products receive a temporary negative ID so the UI can render them during the session. The cache is immediately invalidated upon any mutation to prevent stale data from resurfacing.

### 4. Cache & Revalidation Strategy
**Decision:** Serve directly from cache on hit without background revalidation.
**Why:** A stale-while-revalidate pattern is overkill for a mock API and introduces visual stutter if the mock data resets out from under the user. The 60-second TTL strikes a balance between speed and freshness.

## 🐛 Challenges & Solutions

**Problem:** Testing optimistic rollback paths for edit and delete.
**Context:** Since DummyJSON always returns `200 OK` for mutations, it was impossible to organically verify that the UI correctly reverted to its previous state upon an API failure.
**Solution:** I implemented a developer-only `simulateFailure` flag in `ProductsContext`. A hidden toggle button in the Navbar (visible only in dev mode) allows me to artificially throw an error inside the `try/catch` block *after* the optimistic UI update is applied but *before* the API call completes. This successfully proved the snapshot-and-revert logic works flawlessly, and triggers the appropriate error toast.

## 🤖 AI Usage

AI tools were leveraged during this project primarily for:
1. **Scaffolding boilerplate CSS:** Generating the raw keyframe animations for the shimmer skeletons and toast slide-in/out effects.
2. **Icon generation:** Writing the inline SVG strings for the various UI icons (sun/moon, checkmarks, warning icons) without needing to install an external icon library.
3. **Data interfaces:** Quickly generating comprehensive TypeScript interfaces (`Product`, `ProductReview`) from the DummyJSON documentation JSON responses.
All architectural logic, state management (especially the complex optimistic update and bulk delete logic), and React Context plumbing was hand-rolled.
