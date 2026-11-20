import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FreelancePage } from "./pages/FreelancePage";
import { initAnalytics } from "@/lib/analytics";
import "./index.css";

initAnalytics();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FreelancePage />
  </StrictMode>,
);
