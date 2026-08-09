import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import PortalApp from "./portal/PortalApp.jsx";
import { ThemeProvider } from "./coach/hooks/useTheme.jsx";
import "./portal/portal.css";
import "./admin/admin.css";
import "./coach/coach.css";
import "./styles/desktop-layout.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <PortalApp />
    </ThemeProvider>
  </StrictMode>,
);
