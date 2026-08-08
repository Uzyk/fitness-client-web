import { useCoach } from "../context/CoachContext.jsx";

export default function CoachActionToast() {
  const { actionMessage } = useCoach();
  if (!actionMessage) return null;

  return (
    <div
      className={`coach-action-toast${actionMessage.isError ? " coach-action-toast--error" : ""}`}
      role="status"
    >
      {actionMessage.text}
    </div>
  );
}
