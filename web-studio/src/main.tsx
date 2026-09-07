import { ClerkProvider } from "@clerk/clerk-react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./index.css";

/**
 * Clerk publishable key. Public by design (it ships in the bundle). Defaults to
 * the development instance so local previews work with no setup; production
 * sets VITE_CLERK_PUBLISHABLE_KEY to the live key.
 */
const PUBLISHABLE_KEY =
  (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined) ??
  "pk_test_cHJlbWl1bS1ib2JjYXQtMzkuY2xlcmsuYWNjb3VudHMuZGV2JA";

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
    <App />
  </ClerkProvider>,
);
