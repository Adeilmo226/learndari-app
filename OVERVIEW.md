# LearnDari — Project Overview

Last updated: 2026-09-04

A Dari (Afghan Persian) language-learning product: iOS and Android apps for learners, a
public website + private content Studio, a Cloudflare Worker API, and a Supabase database.

---

## 1. What this project is

**LearnDari** teaches Dari through short Duolingo-style lessons built on vocabulary,
example sentences, proverbs and culture articles. Content is authored by the owner in a
private web Studio and served to the iOS app, the Android app and the website from one API.

Monetisation: free first lesson, then a subscription — **$4.99/month or $30/year**, each
starting with an Apple-managed free trial.

### Brand
- White background, Afghan red `#D7222E`, black text, green for correct answers.
- Hairline-bordered cards, generous corner rounding.
- Dari script used as display type.
- Native-feeling on each platform — not a web layout squeezed into a phone.

---

## 2. Repository layout

Five apps registered in `rork.json`:

| Folder | Framework | What it is |
|---|---|---|
| `ios-learndari/` | Swift / SwiftUI | The iPhone app (the product) |
| `android/` | Kotlin / Jetpack Compose | The Android app — a clone of the iPhone app |
| `web-studio/` | Vite + React + Tailwind + shadcn | Public website **and** private Studio CMS |
| `functions/` | Cloudflare Worker | The API — the only thing that touches the database |
| `backend/` | Supabase | Database schema + generated types |

```
ios-learndari/LearnDari/
  Models/      Content, LessonSession, ProgressSnapshot, VocabProgress, MockData
  Services/    Analytics, AudioService, AuthManager, ContentService,
               KeychainHelper, ProgressStore, ProgressSyncService, SubscriptionManager
  Views/       Learn, LessonSession, LessonSummary, Lesson, Vocab, VocabSet,
               Flashcards, Quiz, Explore, Culture, Profile, Paywall,
               ExerciseChoice, ExerciseMatch, WordRow, WordOfTheDayCard
  Assets.xcassets/  AppIcon, Logo, afghan_tea_ceremony (paywall artwork)

android/app/src/main/java/com/rork/learndariandroid/
  data/        Models, MockData, CultureTopics, ContentRepository, ProgressStore, Backend
  domain/      LessonSession — the exercise engine
  audio/       AudioService — recording → backend TTS → on-device TTS
  ui/theme/    Brand tokens + AppTheme
  ui/components/  AppCard, AudioButton, DariText, WordRow, StatTile,
                  WordOfTheDayCard, ProverbCard, buttons
  ui/screens/  Learn, Lesson, LessonSession, Exercises, Vocab, VocabSet,
               Flashcards, Quiz, Explore, Culture, Profile
  ui/navigation/  AppNavigation — bottom bar + NavHost
  LearnDariApplication.kt  AppGraph: the three long-lived services

web-studio/src/
  pages/       Home, Learn, Lesson, Vocab, VocabSet, Explore, Culture,
               About, Feedback, Legal, Profile, Studio, AuthCallback, NotFound
  components/site/    SiteLayout, SiteHeader, SiteFooter, Flashcard, QuizRunner,
                      ExerciseChoice, ExerciseMatch, AudioButton, SignInPanel, WaitlistForm
  components/studio/  Dashboard, Vocab, Lessons, Explore, Proverbs, WordOfTheDay,
                      Waitlist, History panels + WordTable, BulkPaste, LoginScreen
  hooks/       useAuth, useContent, useProgress, useProgressSync, useStudio
  lib/         api, publicApi, content, session, exercises, audio, utils

functions/
  index.ts          all routes
  content-store.ts  Durable Object holding authored content
  content-types.ts  shared content shapes
  supabase.ts       minimal REST client (service-role key)
  seed.ts           initial content seed
```

---

## 3. Live services and identifiers

| Thing | Value |
|---|---|
| API (Cloudflare Worker) | `https://learndari-backend.rork.app` |
| Website (preview deploy) | `https://1imxcfck7nq16l7mktvau-web-studio.rork.live` |
| Supabase project ref | `kgkrgulapvxrlcaydzji` |
| Supabase URL | `https://kgkrgulapvxrlcaydzji.supabase.co` |
| RevenueCat project | `proj472b9c32` |
| RevenueCat app (App Store) | `app65e74c824e` |
| iOS bundle id | `app.rork.1imxcfck7nq16l7mktvau` |
| Android application id | `com.rork.learndariandroid` |
| Entitlement identifier | `plus` |

### Environment variables

Public (safe in client bundles): `EXPO_PUBLIC_POSTHOG_API_KEY`, `EXPO_PUBLIC_POSTHOG_HOST`,
`EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`, `EXPO_PUBLIC_SUPABASE_URL`,
`EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_RORK_*`, `EXPO_PUBLIC_PROJECT_ID`.

Private (server only, never in client code): `SUPABASE_SERVICE_ROLE_KEY`,
`REVENUECAT_WEBHOOK_SECRET`, `RORK_AUTH_SECRET_KEY`, `STUDIO_PASSWORD`.

In Swift, read these via `Config.KEY_NAME` (`Config.swift`), never
`ProcessInfo.processInfo.environment`. In Kotlin, `Config.KEY_NAME` (`Config.kt`). In the
web app, `import.meta.env.VITE_*`.

The Android app additionally keeps a safe public default for the backend URL in
`data/Backend.kt`, so a fresh checkout still has working content and audio even before
any environment value is injected.

Missing: **`EXPO_PUBLIC_REVENUECAT_TEST_API_KEY`** — requires a Test Store app to be
created by hand in the RevenueCat dashboard.

---

## 4. Architecture and the rules that hold it together

These are deliberate decisions. Changing one has consequences worth knowing about.

**The Worker is the only thing that talks to the database.**
Supabase RLS is enabled with no policies; the Worker uses the service-role key. The apps
never hold database credentials. If you add a feature that reads user data, add a Worker
route — do not point a client at Supabase directly.

**Auth is split, on purpose.** The apps use Rork Auth; the Supabase project has native
Supabase Auth installed (its RLS expects `auth.uid()`, and the `user_id()` helper is not
installed). This is only safe *because* of the rule above. The Worker trusts the
platform-injected headers `X-Rork-User-Id`, `X-Rork-User-Email`, `X-Rork-User-Name`.

**This Supabase project holds pre-existing production data** (`user_profiles`,
`level_progress`, `vocabulary_progress`). Migrations are **additive only**. Never
`DROP` / `DELETE` / `TRUNCATE` without explicit confirmation from the owner. Migrations
apply to live production immediately — there is no preview and no rollback.

**One subscription table.** Webhooks write it; clients only read it. Apple pays today,
Stripe may pay tomorrow, and both land in the same row. Neither app ever asks Apple or
Stripe directly whether someone has paid — they ask this database. That is what stops the
app and the website disagreeing about who owes money.

**`external_ids jsonb`** exists on both `user_subscriptions` and `user_profiles` so old
website accounts / Stripe customers can be attached later without a schema rebuild.

**Entitlement = RevenueCat OR backend.** Either source saying "subscribed" grants access.
The alternative — requiring both — briefly locks out someone who has just paid, which is
the single worst thing a paywall can do.

**Timestamps are epoch milliseconds on every platform.** Progress merges take the best of
both records (`mergeProgress` in the Worker, `ProgressSnapshot.merged(with:)` in Swift).

**Android stores progress on the device only, for now.** It has no accounts and no
billing yet, so there is nothing to merge. When that lands it must go through the Worker
like everything else — never straight to Supabase.

**Trials are Apple's StoreKit introductory offers**, never a homemade countdown. Trial
length, prices and savings are read from StoreKit at runtime and never hardcoded —
otherwise the screen lies in other currencies and gets rejected.

---

## 5. Database schema (Supabase)

Types are generated to `backend/types.ts` and each app's
`src/integrations/supabase/types.ts`. Regenerate after any migration.

**`user_profiles`** (pre-existing, extended)
`avatar_url`, `auth_provider`, `last_active_at`, `external_ids jsonb default '{}'`.
Indexes: `user_profiles_email_idx`, `user_profiles_last_active_idx`.
The Worker's `touchProfile` upserts this and never nulls an existing email.

**`user_subscriptions`** (new)
`user_id` (text, PK), `status` (default `'none'`), `plan`, `store`, `product_id`,
`is_trial`, `will_renew`, `current_period_end`, `trial_ends_at`, `cancelled_at`,
`external_ids jsonb`, `last_event`, `last_event_at`, timestamps.
Indexes on `status` and `current_period_end`. RLS on.

**`learning_progress`** (new)
`user_id` (text, PK), `xp`, `streak`, `lessons_completed`, `words_learned`,
`last_active_date`, `snapshot jsonb`, `synced_at bigint`, timestamps.
Index `learning_progress_xp_idx`. RLS on.

Progress migration is **lazy**: the first Supabase read falls back to the old Durable
Object and copies the snapshot across, so nobody loses a streak mid-rollout. If Supabase
env vars are absent the Worker falls back to the Durable Object entirely.

---

## 6. API surface (`functions/index.ts`)

- `GET /health` — reports content, `database` and `billing` status.
- Content endpoints — vocab sets, lessons, explore items, proverbs, word of the day,
  culture articles. Backed by the `content-store` Durable Object; written by the Studio.
- `GET|POST /me/progress` — reads/writes `learning_progress`, with the one-time
  lift-and-copy from the Durable Object described above.
- `GET /me/subscription` — returns `isActive`, `status`, `plan`, `store`, `isTrial`,
  `willRenew`, `currentPeriodEnd`, `trialEndsAt`.
- `POST /webhooks/revenuecat` — shared-secret `Authorization` check, skips
  `$RCAnonymousID:` users, maps RevenueCat event types onto `status`.

Deploy: functions deploy from this repo; last good build id `9e80e5ae6a19367987451621b798370e`.

---

## 7. The lesson engine (identical on iOS, Android and web)

This spec was tuned deliberately; keep all three implementations in step if you change
it. The Kotlin port in `android/.../domain/LessonSession.kt` mirrors the Swift original
closely, tuning constants included.

- Each new word gets an **intro card** first.
- Then a mixed queue: ~50% multiple choice, ~25% listening, ~25% match-pairs,
  plus 2–4 review items drawn from previously seen words.
- Correct → **+15 strength**. Wrong → show the answer for 1.5s, requeue **3–5 items later**,
  **−20 strength**.
- A word's **third appearance after two misses is forced to multiple choice** — repeatedly
  failing the hardest exercise type teaches nothing but frustration.
- Decay between sessions: `strength = max(0, strength − daysSinceSeen * 5)`.
- Match-pairs capped at **2 per session**, and skipped entirely if fewer than 4 words are
  available.

**Audio**: human recordings uploaded via the Studio, with on-device / browser
speech synthesis as fallback. Azure TTS was evaluated and dropped.

On Android the fallback is `TextToSpeech` with a Persian voice, then Arabic, then
English. Downloaded clips are cached in the app's cache directory.

---

## 8. Subscriptions and analytics (iOS only so far)

**`Services/SubscriptionManager.swift`**
`entitlementID = "plus"`, `configure()`, `identify(userID:)`, `signOut()`,
`loadOffering()` (annual first), `purchase(_:)`, `restore()`, `refreshEntitlement()`,
`refreshFromBackend(token:)`, `canOpenLesson(completedLessonCount:)`,
`freeLessonAllowance = 1`.

`Purchases.logIn(userId)` ties receipts to a person, which is what lets webhook events
join to the right database row and what makes the subscription survive a new phone.

**`Views/PaywallView.swift`**
Artwork (`afghan_tea_ceremony`) → headline → benefits → two plans → one CTA → terms.
Computes `savingText` and `trialDays` from the StoreKit intro offer. Restore button.
Sign-in-then-purchase flow. Shows an honest "Plans aren't available" state while
RevenueCat has no offering configured.

**Gating**: `LearnView` gates `openLesson` / `openReview` behind `canOpenLesson`;
`ProfileView` shows plan label, renewal text, and a Manage Subscription link to
`https://apps.apple.com/account/subscriptions`.

**`Services/Analytics.swift`** — typed `Event` enum, `start()`, `capture`, `identify`,
`reset`. No-ops when the PostHog key is empty. Events: lesson started / finished /
abandoned (with progress %), answer correct / wrong, audio played, paywall seen, plan
tapped, trial started, purchase completed / failed, purchases restored, signed in / out.

**`LearnDariApp.swift`** wires it together: `Analytics.start()` in `init()`, injects
`subscriptions`, calls `configure()` on task, identifies/resets and calls RevenueCat
login/logout when `auth.user` changes, refreshes entitlement + backend on
`scenePhase == .active`.

---

## 9. Status

### Done
- Studio content pipeline (vocab, lessons, explore, proverbs, word of the day, waitlist,
  history, bulk paste, audio upload).
- iOS lesson flow to the spec above, plus example sentences.
- Full website rebuild matching the app, deployed.
- **Android app built** — all five tabs, the winding lesson path, the full exercise
  engine, flashcards, quizzes, culture and profile, plus its own generated app icon.
  Build green (`runChecks({ appPath: "android" })`).
- Supabase provisioned; three additive migrations applied; types regenerated.
- Worker: Supabase-backed progress, `/me/subscription`, RevenueCat webhook, health checks.
- RevenueCat connected; App Store app created; production key set.
- PostHog + RevenueCat SDKs installed in Xcode via SPM.
- Paywall, gating, analytics, restore, manage-subscription — all built.
- **iOS build is green** (`runChecks({ appPath: "ios-learndari" })`).

### Blocked on the owner (cannot be done from the agent environment)
1. **App Store Connect** — create the two subscription products ($4.99/month, $30/year),
   each with a free trial as an Introductory Offer. Add an In-App Purchase Key and confirm
   it shows *Valid credentials*.
2. **RevenueCat** — create an entitlement with identifier exactly `plus`, attach both
   products, add them to the default Offering as Monthly and Annual packages.
   Until this exists the paywall correctly shows "Plans aren't available".
3. **RevenueCat webhook** — URL `https://learndari-backend.rork.app/webhooks/revenuecat`,
   `Authorization` header set to `REVENUECAT_WEBHOOK_SECRET`.
4. **RevenueCat Test Store app** — must be created in the dashboard by hand; then fetch
   `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY` via the RevenueCat integration (not by typing it in).
5. **Verify a real purchase on a physical iPhone.** Apple does not permit purchases from
   the build environment, so this genuinely cannot be automated.

### Open to-do
- **Website subscription check** — the site does not yet read `/me/subscription`, so a
  paying subscriber gets no premium access on the web. This is the largest remaining gap
  and the obvious next job.
- **Android has no accounts, subscriptions or analytics** — progress is on-device only.
  Google Play Billing, Rork Auth and PostHog are all unstarted. The shared
  `user_subscriptions` table already has a `store` column ready to hold `play`.
- **Play Store listing** — no metadata, screenshots or feature graphic yet.
- **Website Stripe checkout** — deliberately deferred. When built, it must write into
  `user_subscriptions`, not a second table.
- **Migrating old website users** — `external_ids` is ready for it; the merge itself is
  unstarted. The old repo (`adeilmo226/learndari-website`) is deliberately not cloned or
  read.
- **Clerk migration decision** — deferred. The schema uses `user_id` (not `clerk_id`) so
  either outcome stays cheap.
- **Website design** — the owner is not yet sure they like the rebuild; expect changes.
- App Store listing metadata, screenshots and submission.
- End-to-end verification of `/me/subscription` and the webhook once RevenueCat has real
  products.

### Overridable decisions worth a second opinion
- `freeLessonAllowance = 1` — the first lesson is playable before the paywall. App
  reviewers need to see the product working, and people who have felt the app convert
  better than people staring at a price. One-line change if unwanted.
- **Sign-in is required before subscribing.** This is what ties payment to a person rather
  than a handset; removing it breaks cross-device and future web entitlement.

---

## 10. Working conventions

- Package manager is **bun**. Never npm or yarn.
- iOS: after any change run `runChecks({ appPath: "ios-learndari" })` until green.
  Android: `runChecks({ appPath: "android" })`.
  Web: `runChecks({ appPath: "web-studio" })`.
- Swift: MVVM, one type per file, `@State` private, modern APIs
  (`foregroundStyle`, `NavigationStack`, `@Observable`). The project uses
  `SWIFT_DEFAULT_ACTOR_ISOLATION = MainActor` — mark Codable DTOs and delegate
  callbacks `nonisolated`.
- Do **not** create or edit `.entitlements` for In-App Purchase.
- Android: Material 3 only, Compose Navigation, `MutableStateFlow` +
  `collectAsStateWithLifecycle`, no XML layouts. Dependencies go through
  `gradle/libs.versions.toml`.
- Web: TypeScript strict, Tailwind, shadcn/ui from `src/components/ui/`,
  `@tanstack/react-query` for server state, react-router-dom for routing.
- `web-studio/public/` files are cached at stable URLs — when changing a referenced
  asset, save it under a new filename rather than overwriting.
- Never log secrets, tokens or user data.
