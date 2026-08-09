import ScreenHeader from "../../coach/components/ScreenHeader.jsx";
import StudentRoutinesBrowser from "../components/StudentRoutinesBrowser.jsx";

export default function StudentRoutineScreen({ student, onLogout }) {
  return (
    <div className="coach-screen coach-screen--list">
      <ScreenHeader
        studioName={student.coach?.brand_name || "Studio Fit"}
        title="Rutina"
        subtitle={
          student.routines.length > 0
            ? `${student.routines.length} plan${student.routines.length === 1 ? "" : "es"} de tu coach`
            : "Planes de entrenamiento"
        }
        onLogout={onLogout}
      />

      {student.routines.length > 0 ? (
        <StudentRoutinesBrowser
          routines={student.routines}
          activeRoutineId={student.activeRoutineId}
          todayRoutineId={student.todayRoutineId}
          comments={student.comments}
        />
      ) : (
        <p className="coach-empty">Tu coach aún no ha creado rutinas para ti.</p>
      )}
    </div>
  );
}
