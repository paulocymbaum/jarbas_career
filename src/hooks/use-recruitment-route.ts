import { useEffect, useState } from "react";

export function useRecruitmentRoute() {
  const [isRecruitmentView, setIsRecruitmentView] = useState(
    () => typeof window !== "undefined" && window.location.hash === "#recruitment",
  );

  useEffect(() => {
    const sync = () => {
      setIsRecruitmentView(window.location.hash === "#recruitment");
    };

    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return isRecruitmentView;
}
