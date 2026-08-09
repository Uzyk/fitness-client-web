import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import InviteApp from "./invite/InviteApp.jsx";
import "./invite/invite.css";
import "./styles/desktop-layout.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <InviteApp />
  </StrictMode>,
);
