import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { JSX, ReactNode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollToTop } from "@/components/site/ScrollToTop";
import { AuthProvider } from "@/hooks/useAuth";
import { ProgressProvider } from "@/hooks/useProgress";
import { useProgressSync } from "@/hooks/useProgressSync";

import Home from "./pages/Home";
import About from "./pages/About";
import Vocab from "./pages/Vocab";
import VocabSet from "./pages/VocabSet";
import Explore from "./pages/Explore";
import Learn from "./pages/Learn";
import Lesson from "./pages/Lesson";
import Culture from "./pages/Culture";
import Proverbs from "./pages/Proverbs";
import Traditions from "./pages/Traditions";
import WordOfTheDay from "./pages/WordOfTheDay";
import Feedback from "./pages/Feedback";
import Profile from "./pages/Profile";
import AuthCallback from "./pages/AuthCallback";
import { Privacy, Terms } from "./pages/Legal";
import Studio from "./pages/Studio";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});

/** Keeps browser progress and account progress in step while the app is open. */
function SyncGate({ children }: { children: ReactNode }): JSX.Element {
  useProgressSync();
  return <>{children}</>;
}

const App = (): JSX.Element => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProgressProvider>
        <SyncGate>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/vocab" element={<Vocab />} />
                <Route path="/vocab/:setId" element={<VocabSet />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/learn/:lessonId" element={<Lesson />} />
                <Route path="/culture" element={<Culture />} />
                <Route path="/culture/proverbs" element={<Proverbs />} />
                <Route path="/culture/traditions" element={<Traditions />} />
                <Route path="/culture/word-of-the-day" element={<WordOfTheDay />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />

                {/* Links from the old site keep working. */}
                <Route path="/more" element={<Culture />} />
                <Route path="/more/proverbs" element={<Proverbs />} />
                <Route path="/more/culture" element={<Traditions />} />
                <Route path="/more/word-of-the-day" element={<WordOfTheDay />} />
                <Route path="/more/about" element={<About />} />
                <Route path="/more/feedback" element={<Feedback />} />

                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* Private content studio, password protected. */}
                <Route path="/studio" element={<Studio />} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SyncGate>
      </ProgressProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
