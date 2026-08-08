import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./coach/hooks/useTheme.jsx";
import PortalApp from "./portal/PortalApp.jsx";
import "./admin/admin.css";
import "./coach/coach.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <PortalApp />
    </ThemeProvider>
  </StrictMode>,
);
