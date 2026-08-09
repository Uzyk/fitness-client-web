import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SurveyApp from "./survey/SurveyApp.jsx";
import { getSurveyBySlug } from "./survey/surveys/index.js";
import "./styles/desktop-layout.css";

const params = new URLSearchParams(window.location.search);
const slug = params.get("s") || "coach-discovery";
const survey = getSurveyBySlug(slug);

document.title = `${survey.title} — Encuesta`;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SurveyApp survey={survey} />
  </StrictMode>,
);
