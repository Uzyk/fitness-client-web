import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CoachApp from "./coach/CoachApp.jsx";
import { ThemeProvider } from "./coach/hooks/useTheme.jsx";
import "./coach/coach.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <CoachApp />
    </ThemeProvider>
  </StrictMode>,
);
