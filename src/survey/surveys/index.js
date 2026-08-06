import { coachDiscoverySurvey } from "./coach-discovery.js";

const registry = {
  "coach-discovery": coachDiscoverySurvey,
};

export function getSurveyBySlug(slug) {
  return registry[slug] || registry["coach-discovery"];
}

export function listSurveys() {
  return Object.values(registry);
}

export { coachDiscoverySurvey };
