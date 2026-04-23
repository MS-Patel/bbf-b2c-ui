

# Investor Portal — Final Wire-Up

The B2C portal already satisfies every requirement in the spec: feature-sliced architecture, Axios + interceptors, custom React Query hooks, Zustand stores, RHF + Zod, Recharts, skeletons, responsive shell, all auth flows (login + OTP + signup + forgot password), full Investor feature set (dashboard, portfolio + drill-down, 4 order wizards, transactions, KYC/profile, goals, tax harvesting, AI insights, notifications), public landing, and the compliance footer.

Two small loose ends remain from the previous polish plan that were never wired:

## Gaps

1. **Goals page "New goal" button is still a toast stub.** The `GoalWizardDialog` component is fully built but never imported or rendered.
2. **Holding detail page is missing the "View scheme page" link** to the scheme factsheet.

That's it — everything else is in place.

## Changes

### 1. Wire `GoalWizardDialog` into Goals page
**File:** `src/routes/app.investor.goals.tsx`
- Import `GoalWizardDialog` from `@/features/goals/components/goal-wizard-dialog`
- Add local state: `const [wizardOpen, setWizardOpen] = useState(false)` and `const [extraGoals, setExtraGoals] = useState<Goal[]>([])`
- Replace the toast `onClick` on the "New goal" button with `() => setWizardOpen(true)`
- Append created goals to local overlay (same pattern as Profile page's `extraBanks`/`extraNominees`) so new goals appear immediately
- Mount `<GoalWizardDialog open={wizardOpen} onOpenChange={setWizardOpen} onCreate={(goal) => setExtraGoals((p) => [...p, goal])} />` at the bottom of the page

### 2. Add "View scheme page" link on holding detail
**File:** `src/routes/app.investor.portfolio.$holdingId.tsx`
- In the header actions area (next to existing Redeem/Switch/Invest buttons), add a `<Button asChild variant="ghost">` linking to `/app/investor/explore/$schemeId` with `params={{ schemeId: holding.schemeCode }}`
- Use the `Compass` or `ExternalLink` icon from lucide-react

## Verification
- Click "New goal" on `/app/investor/goals` → multi-step wizard opens, completes, new goal appears in the list
- On any holding detail page, "View scheme page" navigates to the matching scheme factsheet
- All existing flows (4 order wizards, KYC dialogs, signup, landing) continue to work

## Files
**Edited only** (no new files):
- `src/routes/app.investor.goals.tsx`
- `src/routes/app.investor.portfolio.$holdingId.tsx`

After these two edits the investor portal fully implements the B2C spec end-to-end.

