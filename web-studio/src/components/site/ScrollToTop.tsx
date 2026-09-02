import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Sends the window back to the top on navigation, and to an anchor when the
 * link carried one. Without this, moving between pages keeps the old scroll.
 */
export function ScrollToTop(): null {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);

  return null;
}
