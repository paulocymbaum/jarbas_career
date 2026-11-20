import { useEffect, useState } from "react";
import { type AdminTab, adminHashForTab, parseAdminHash } from "@/lib/admin-routing";

export function useAdminRoute() {
  const [route, setRoute] = useState(() =>
    typeof window !== "undefined"
      ? parseAdminHash(window.location.hash)
      : { isAdmin: false, tab: "profile" as AdminTab },
  );

  useEffect(() => {
    const sync = () => {
      setRoute(parseAdminHash(window.location.hash));
    };

    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const setTab = (tab: AdminTab) => {
    const nextHash = adminHashForTab(tab);
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
    setRoute(parseAdminHash(nextHash));
  };

  return {
    isAdminView: route.isAdmin,
    activeTab: route.tab,
    setActiveTab: setTab,
  };
}
