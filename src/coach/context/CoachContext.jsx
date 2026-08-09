import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getCoachForUser } from "../../lib/auth.js";
import {
  addCoachComment,
  addScheduleEntry,
  createStudent,
  inviteStudent,
  deleteScheduleEntry,
  fetchScheduleForCoach,
  fetchStudentsForCoach,
  markPaymentPaid,
  publishVideoFeedback,
  requestReceipt,
  sendPaymentReminder,
  updateScheduleEntry,
  updateStudentProfile,
  updateStudentRoutine,
  updateStudentRoutines,
} from "../../lib/coachDataApi.js";
import { applyCoachTheme, DEFAULT_COACH_THEME } from "../../lib/coachTheme.js";
import { supabase } from "../../lib/supabase.js";
import { useAuth } from "../../portal/context/AuthContext.jsx";

const CoachContext = createContext(null);

export function CoachProvider({ children }) {
  const { session } = useAuth();
  const [ready, setReady] = useState(false);
  const [coach, setCoach] = useState(null);
  const [students, setStudents] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [actionMessage, setActionMessage] = useState(null);

  const showAction = useCallback((message, isError = false) => {
    setActionMessage({ text: message, isError });
    window.setTimeout(() => setActionMessage(null), 3500);
  }, []);

  const refresh = async () => {
    if (!supabase || !session) {
      setCoach(null);
      setStudents([]);
      setSchedule([]);
      setReady(true);
      return;
    }

    try {
      const c = await getCoachForUser();
      setCoach(c);
      if (c?.theme) applyCoachTheme(c.theme);
      else applyCoachTheme(DEFAULT_COACH_THEME);

      if (c?.id) {
        const [studentRows, scheduleRows] = await Promise.all([
          fetchStudentsForCoach(c.id),
          fetchScheduleForCoach(c.id),
        ]);
        setStudents(studentRows);
        setSchedule(scheduleRows);
      } else {
        setStudents([]);
        setSchedule([]);
      }
    } catch (err) {
      console.error("CoachContext refresh:", err);
      setStudents([]);
      setSchedule([]);
    } finally {
      setReady(true);
    }
  };

  const runAction = async (fn, successMsg) => {
    try {
      await fn();
      await refresh();
      showAction(successMsg);
    } catch (err) {
      console.error(err);
      showAction(err.message || "No se pudo completar la acción", true);
      throw err;
    }
  };

  const postComment = (studentId, body, exercise = null) =>
    runAction(() => addCoachComment(studentId, body, exercise), "Comentario enviado");

  const publishVideo = (studentId, videoId, body, exercise) =>
    runAction(
      () => publishVideoFeedback(studentId, videoId, body, exercise),
      "Feedback publicado",
    );

  const markPaid = (studentId) =>
    runAction(() => markPaymentPaid(studentId), "Pago confirmado");

  const askReceipt = (studentId) =>
    runAction(() => requestReceipt(studentId), "Solicitud de comprobante enviada");

  const sendReminder = (studentId) =>
    runAction(() => sendPaymentReminder(studentId), "Recordatorio enviado al alumno");

  const saveRoutine = (studentId, routine) =>
    runAction(() => updateStudentRoutine(studentId, routine), "Rutina actualizada");

  const saveRoutines = (studentId, routines, activeRoutineId) =>
    runAction(
      () => updateStudentRoutines(studentId, routines, activeRoutineId),
      "Rutinas guardadas",
    );

  const saveStudentProfile = (studentId, profile) =>
    runAction(
      () => updateStudentProfile(studentId, profile),
      "Datos del alumno actualizados",
    );

  const inviteStudentAccount = async (payload) => {
    try {
      const result = await inviteStudent(payload);
      await refresh();
      showAction("Link de invitación generado");
      return result;
    } catch (err) {
      console.error(err);
      showAction(err.message || "No se pudo generar la invitación", true);
      throw err;
    }
  };

  const addStudent = (payload) => inviteStudentAccount(payload);

  const scheduleSession = (studentId, payload) =>
    runAction(() => addScheduleEntry(studentId, payload), "Sesión agendada");

  const updateSession = (scheduleId, patch) =>
    runAction(() => updateScheduleEntry(scheduleId, patch), "Sesión actualizada");

  const cancelSession = (scheduleId) =>
    runAction(() => deleteScheduleEntry(scheduleId), "Sesión desagendada");

  useEffect(() => {
    refresh();
  }, [session]);

  return (
    <CoachContext.Provider
      value={{
        ready,
        coach,
        students,
        schedule,
        refresh,
        actionMessage,
        postComment,
        publishVideo,
        markPaid,
        askReceipt,
        sendReminder,
        saveRoutine,
        saveRoutines,
        saveStudentProfile,
        addStudent,
        scheduleSession,
        updateSession,
        cancelSession,
      }}
    >
      {children}
    </CoachContext.Provider>
  );
}

export function useCoach() {
  return useContext(CoachContext);
}
