import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useToast } from "../contexts/ToastContext.jsx";
import {
  Clock, Calendar as CalIcon, Check, XCircle, User,
  Info, Star, CheckCircle, LayoutGrid, List, X, AlertCircle,
  ChevronLeft, ChevronRight, Filter
} from "lucide-react";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function toDateStr(val) {
  if (!val) return "";
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  if (typeof val === "string" && val.includes("T")) return val.slice(0, 10);
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, "0");
    const d = String(val.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(val).slice(0, 10);
}

function toTimeStr(val) {
  if (!val) return "10:00";
  const s = String(val).trim();
  if (s.includes("T")) {
    const timePart = s.split("T")[1];
    if (timePart) return timePart.slice(0, 5);
  }
  const timeMatch = s.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    return `${timeMatch[1].padStart(2, "0")}:${timeMatch[2].padStart(2, "0")}`;
  }
  return s.length >= 5 ? s.slice(0, 5) : s;
}

const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// ─── STAR RATING ──────────────────────────────────────────────────────────────
function StarRating({ value, onChange, readonly = false, size = 28 }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex justify-center gap-1">
      {[1,2,3,4,5].map(num => (
        <Star
          key={num} size={size}
          className={`transition-colors ${readonly ? "cursor-default" : "cursor-pointer"}`}
          fill={(hovered || value) >= num ? "#d97706" : "none"}
          color={(hovered || value) >= num ? "#d97706" : "#d1d5db"}
          onClick={() => !readonly && onChange && onChange(num)}
          onMouseEnter={() => !readonly && setHovered(num)}
          onMouseLeave={() => !readonly && setHovered(0)}
        />
      ))}
    </div>
  );
}

// ─── CUSTOM CALENDAR ──────────────────────────────────────────────────────────
function CustomCalendar({ sessions, onSelectSession }) {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const todayStr = toDateStr(today);

  const byDate = sessions.reduce((acc, s) => {
    const k = toDateStr(s.date);
    if (k) { acc[k] = acc[k] || []; acc[k].push(s); }
    return acc;
  }, {});

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); };

  const dotColor = (status) => {
    if (status === "completed")            return "bg-green-500";
    if (status === "cancelled")            return "bg-red-400";
    if (status === "missed")               return "bg-gray-400";
    if (status === "reschedule_requested") return "bg-purple-500";
    if (status === "cancel_requested")     return "bg-orange-400";
    return "bg-amber-500";
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-amber-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 bg-amber-50 border-b border-amber-100">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-700">
          <ChevronLeft size={18} />
        </button>
        <span className="font-bold text-amber-900 text-base">{MONTHS[month]} {year}</span>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-700">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-amber-50">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[11px] font-bold text-amber-500 py-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} className="border-b border-r border-amber-50 min-h-[80px]" />;
          const mm = String(month + 1).padStart(2, "0");
          const dd = String(day).padStart(2, "0");
          const key = `${year}-${mm}-${dd}`;
          const daily = byDate[key] || [];
          const isToday = key === todayStr;

          return (
            <div key={key} className={`border-b border-r border-amber-50 min-h-[80px] p-1.5 flex flex-col ${isToday ? "bg-amber-50" : "hover:bg-amber-50/50"}`}>
              <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mb-1 self-end ${isToday ? "bg-amber-600 text-white" : "text-amber-800"}`}>
                {day}
              </div>
              <div className="flex flex-col gap-0.5 flex-1">
                {daily.slice(0, 3).map(s => (
                  <button
                    key={s._id}
                    onClick={() => onSelectSession(s)}
                    className={`w-full text-left text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 truncate
                      ${s.status === "completed"            ? "bg-green-100 text-green-800" :
                        s.status === "cancelled"            ? "bg-red-100 text-red-700" :
                        s.status === "missed"               ? "bg-gray-100 text-gray-600" :
                        s.status === "reschedule_requested" ? "bg-purple-100 text-purple-700" :
                        "bg-amber-100 text-amber-800"}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor(s.status)}`} />
                    <span className="font-bold">{toTimeStr(s.startTime)}</span>
                    <span className="truncate opacity-80">{s.therapyType}</span>
                  </button>
                ))}
                {daily.length > 3 && (
                  <span className="text-[9px] text-amber-500 font-bold px-1">+{daily.length-3} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 px-4 py-3 bg-amber-50 border-t border-amber-100">
        {[{ label: "Scheduled", color: "bg-amber-500" }, { label: "Completed", color: "bg-green-500" }, { label: "Missed", color: "bg-gray-400" }, { label: "Cancelled", color: "bg-red-400" }, { label: "Reschedule", color: "bg-purple-500"}].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-[10px] text-amber-700 font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SESSION DETAIL MODAL ─────────────────────────────────────────────────────
function SessionDetailModal({ session, userRole, onClose, onStatusUpdate }) {
  const [updating, setUpdating] = useState("");
  const handleStatus = async (status) => {
    setUpdating(status);
    await onStatusUpdate(session._id, status, toDateStr(session.date), toTimeStr(session.startTime));
    setUpdating("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-amber-700 to-amber-500 p-5 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-white">{session.therapyType}</h2>
            <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold bg-white/20 text-white">
              {session.status}
            </span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X size={20}/></button>
        </div>

        <div className="p-5 space-y-3">
          {userRole === "practitioner" && session.patient && (
             <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                <p className="text-xs text-amber-600 font-bold mb-0.5">PATIENT</p>
                <p className="font-bold text-amber-900 text-sm">{session.patient.name || session.patient.email}</p>
             </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-amber-50 rounded-lg p-3">
              <p className="text-xs text-amber-600 font-bold mb-0.5">DATE</p>
              <p className="font-medium text-amber-900 text-sm">{toDateStr(session.date)}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3">
              <p className="text-xs text-amber-600 font-bold mb-0.5">TIME</p>
              <p className="font-medium text-amber-900 text-sm">{toTimeStr(session.startTime)}</p>
            </div>
          </div>

          {session.notes && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-800 flex items-start gap-2">
              <Info size={14} className="mt-0.5 shrink-0" />
              <p>{session.notes}</p>
            </div>
          )}

          {userRole === "practitioner" && ["scheduled","reschedule_requested","cancel_requested"].includes(session.status) && (
            <div className="flex gap-2 pt-1">
              <button onClick={() => handleStatus("completed")} disabled={!!updating} className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-1">
                <Check size={14}/>{updating === "completed" ? "Saving…" : "Mark Completed"}
              </button>
              <button onClick={() => handleStatus("missed")} disabled={!!updating} className="flex-1 py-2 bg-gray-500 text-white rounded-lg text-sm font-bold hover:bg-gray-600 disabled:opacity-60">
                {updating === "missed" ? "Saving…" : "Mark Missed"}
              </button>
            </div>
          )}

          {session.feedback && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-xs font-bold text-green-700 mb-2">PATIENT FEEDBACK</p>
              <StarRating value={session.feedback.rating} readonly size={20}/>
              {session.feedback.comment && (
                <p className="mt-2 text-sm text-green-800 italic">"{session.feedback.comment}"</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── REQUEST MODAL ────────────────────────────────────────────────────────────
function RequestModal({ session, type, timeSlots, onClose, onSubmit }) {
  const [editDate, setEditDate] = useState(new Date());
  const [editTime, setEditTime] = useState("10:00");
  const [reason,    setReason]   = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <h3 className="text-xl font-bold text-amber-900 mb-4">{type === "reschedule" ? "Request Reschedule" : "Request Cancellation"}</h3>
        <div className="space-y-4">
          {type === "reschedule" && (
            <>
              <DatePicker selected={editDate} onChange={setEditDate} minDate={new Date()} className="w-full border border-amber-200 p-2 rounded text-sm"/>
              <select className="w-full border border-amber-200 p-2 rounded text-sm" value={editTime} onChange={e => setEditTime(e.target.value)}>
                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </>
          )}
          <textarea placeholder={type === "reschedule" ? "Provide a reason…" : "Why do you want to cancel?"} className="w-full border border-amber-200 p-2 rounded text-sm min-h-[80px]" value={reason} onChange={e => setReason(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-3 bg-gray-100 rounded font-bold text-gray-600">Cancel</button>
            <button onClick={() => reason.trim() && onSubmit({ session, type, date: editDate, time: editTime, reason })} disabled={!reason.trim()} className={`flex-1 py-3 text-white rounded font-bold disabled:opacity-50 ${type === "reschedule" ? "bg-primary-600" : "bg-red-500"}`}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EDIT SESSION MODAL ───────────────────────────────────────────────────────
function EditSessionModal({ session, timeSlots, onClose, onSubmit }) {
  const [date, setDate] = useState(new Date(toDateStr(session.date)));
  const [time, setTime] = useState(toTimeStr(session.startTime) || "10:00");
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-amber-900">Edit Session</h3>
          <button onClick={onClose}><X size={18} className="text-gray-500"/></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-amber-700 block mb-1">NEW DATE</label>
            <DatePicker selected={date} onChange={setDate} minDate={new Date()} className="w-full border border-amber-200 p-2 rounded text-sm"/>
          </div>
          <div>
            <label className="text-xs font-bold text-amber-700 block mb-1">NEW TIME</label>
            <select className="w-full border border-amber-200 p-2 rounded text-sm" value={time} onChange={e => setTime(e.target.value)}>
              {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-3 bg-gray-100 rounded font-bold text-gray-600">Cancel</button>
            <button onClick={() => onSubmit(session._id, toDateStr(date), time)} className="flex-1 py-3 bg-primary-600 text-white rounded font-bold">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const TherapyScheduling = ({ userRole, user, assignedPatients = [], isAuthenticated }) => {
  const [sessions, setSessions] = useState([]);
  const [viewMode, setViewMode] = useState("list");

  // State for Assignment
  const [selectedPatientEmail, setSelectedPatientEmail] = useState("");
  const [therapyType, setTherapyType]   = useState("Virechana");
  const [startDate,   setStartDate]     = useState(new Date());
  const [assignTime,  setAssignTime]    = useState("10:00");
  const [loading,     setLoading]       = useState(false);

  // Modals
  const [detailSession,   setDetailSession]   = useState(null);
  const [editingSession,  setEditingSession]  = useState(null);
  const [requestModal,    setRequestModal]    = useState(null);
  const [feedbackSession, setFeedbackSession] = useState(null);

  // Feedback form
  const [rating,  setRating]  = useState(5);
  const [comment, setComment] = useState("");

  // Filters
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPatient, setFilterPatient] = useState("all");

  const { show } = useToast();
  const therapyOptions = ["Virechana","Vamana","Basti","Nasya","Raktamokshana"];
  const timeSlots      = ["08:00","09:00","10:00","11:00","14:00","15:00","16:00"];

  const fetchSessions = async () => {
    if (!user?.email) return;
    try {
      const res = await axios.get("http://localhost:5000/sessions", {
        params: { userId: user.email, role: userRole },
      });
      const backendSessions = res.data || [];
      const enrichedSessions = backendSessions.map((session) => {
        const localFeedback = localStorage.getItem(`feedback_${session._id}`);
        if (localFeedback) {
          return { ...session, feedback: JSON.parse(localFeedback) };
        }
        return session;
      });
      setSessions(enrichedSessions);
    } catch (err) { console.error("Fetch error:", err); }
  };

  useEffect(() => { if (isAuthenticated) fetchSessions(); }, [user, isAuthenticated]);

  const checkConflict = (dateStr, time, excludeId = null) =>
    sessions.some(s => s._id !== excludeId && toDateStr(s.date) === dateStr && toTimeStr(s.startTime) === time && s.status !== "cancelled");

  const handleGenerateSchedule = async () => {
    const target = assignedPatients.find(p => p.email === selectedPatientEmail);
    if (!target) return show({ title: "Error", message: "Please select a patient." });
    const dateStr = toDateStr(startDate);
    if (checkConflict(dateStr, assignTime)) return show({ title: "Conflict", message: "This time slot is already booked." });
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/sessions", {
        patientId: target.email, therapyType, startDate: dateStr, startTime: assignTime, status: "scheduled", practitionerId: user.email,
      });
      show({ title: "Success", message: "Therapy assigned successfully!" });
      fetchSessions();
    } catch (err) { show({ title: "Error", message: err.response?.data?.msg || "Assignment failed." }); } finally { setLoading(false); }
  };

  const handleEditSubmit = async (sessionId, date, time) => {
    if (checkConflict(date, time, sessionId)) return show({ title: "Conflict", message: "This time slot is already booked." });
    try {
      await axios.put(`http://localhost:5000/sessions/${sessionId}`, { userId: user.email, userType: userRole, date, startTime: time, status: "scheduled", notes: "Rescheduled by practitioner." });
      show({ title: "Updated", message: "Session rescheduled." });
      setEditingSession(null);
      fetchSessions();
    } catch (err) { console.error(err); }
  };

  const handleCancelSession = async (sessionId) => {
    if (!window.confirm("Cancel this session?")) return;
    try {
      await axios.put(`http://localhost:5000/sessions/${sessionId}`, { userId: user.email, userType: userRole, status: "cancelled" });
      show({ title: "Cancelled", message: "Session cancelled." });
      fetchSessions();
    } catch (err) { console.error(err); }
  };

  const handleStatusUpdate = async (sessionId, status, date, startTime) => {
    try {
      await axios.put(`http://localhost:5000/sessions/${sessionId}`, { userId: user.email, userType: userRole, status, date, startTime });
      show({ title: "Updated", message: `Session marked as ${status}.` });
      await fetchSessions();
      setDetailSession(null);
    } catch (err) { show({ title: "Error", message: err.response?.data?.msg || "Update failed." }); }
  };

  const handleDecision = async (session, decision) => {
    let payload = { userId: user.email, userType: userRole, patientId: session.patient?.email || user.email };
    if (session.status === "cancel_requested") {
      payload.status = decision === "accept" ? "cancelled" : "scheduled";
      payload.date = toDateStr(session.date);
      payload.startTime = toTimeStr(session.startTime);
      payload.notes = decision === "accept" ? "Cancellation approved." : "Cancellation declined.";
    } else {
      const match = session.notes?.match(/REQUESTED: (\d{4}-\d{2}-\d{2}) at (\d{2}:\d{2})/);
      payload.date = match ? match[1] : toDateStr(session.date);
      payload.startTime = match ? match[2] : toTimeStr(session.startTime);
      payload.status = "scheduled";
      payload.notes = decision === "accept" ? `Approved: moved to ${payload.date} at ${payload.startTime}` : "Reschedule request declined.";
    }
    try {
      await axios.put(`http://localhost:5000/sessions/${session._id}`, payload);
      show({ title: "Done", message: `Request ${decision === "accept" ? "approved" : "rejected"}.` });
      fetchSessions();
    } catch (err) { console.error(err); }
  };

  const handlePatientRequest = async ({ session, type, date, time, reason }) => {
    const newStatus = type === "reschedule" ? "reschedule_requested" : "cancel_requested";
    const notes = type === "reschedule" ? `REQUESTED: ${toDateStr(date)} at ${time}. Reason: ${reason}` : `CANCEL REQUEST: ${reason}`;
    try {
      await axios.put(`http://localhost:5000/sessions/${session._id}`, { userId: user.email, userType: userRole, patientId: user.email, status: newStatus, date: toDateStr(session.date), startTime: toTimeStr(session.startTime), notes });
      show({ title: "Sent", message: "Request sent to practitioner." });
      setRequestModal(null);
      fetchSessions();
    } catch (err) { console.error(err); }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackSession) return;
    const feedbackData = { rating, comment, patientId: user.email, submittedAt: new Date().toISOString() };
    localStorage.setItem(`feedback_${feedbackSession._id}`, JSON.stringify(feedbackData));
    try {
      await axios.put(`http://localhost:5000/sessions/${feedbackSession._id}`, { userId: user.email, userType: userRole, date: toDateStr(feedbackSession.date), startTime: toTimeStr(feedbackSession.startTime), status: feedbackSession.status, feedback: feedbackData });
    } catch (_) {}
    show({ title: "Thank you!", message: "Feedback submitted!" });
    setFeedbackSession(null);
    fetchSessions();
  };

  // Derived filtered data
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const matchStatus = filterStatus === "all" ? true : s.status === filterStatus;
      const matchPatient = filterPatient === "all" ? true : (s.patient?.email === filterPatient);
      return matchStatus && matchPatient;
    });
  }, [sessions, filterStatus, filterPatient]);

  const pendingRequests = sessions.filter(s => s.status === "reschedule_requested" || s.status === "cancel_requested");

  const badgeClass = (status) => {
    if (status === "completed") return "bg-green-100 text-green-700";
    if (status === "cancelled") return "bg-red-100 text-red-700";
    if (status === "missed") return "bg-gray-100 text-gray-600";
    if (status === "reschedule_requested") return "bg-purple-100 text-purple-700";
    if (status === "cancel_requested") return "bg-orange-100 text-orange-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-[#FDF7E9] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-amber-900">Therapy Schedule</h1>
        <div className="flex bg-white rounded-lg p-1 border border-amber-200">
          <button onClick={() => setViewMode("list")} className={`p-2 rounded ${viewMode === "list" ? "bg-amber-100" : ""}`} title="List view"><List size={20}/></button>
          <button onClick={() => setViewMode("calendar")} className={`p-2 rounded ${viewMode === "calendar" ? "bg-amber-100" : ""}`} title="Calendar view"><LayoutGrid size={20}/></button>
        </div>
      </div>

      {userRole === "practitioner" && (
        <div className="mb-8 p-6 bg-white rounded-xl border-2 border-primary-100 shadow-sm">
          <h2 className="text-lg font-bold mb-4 text-amber-900 flex items-center"><User className="mr-2 text-primary-600"/> New Assignment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="text-xs font-bold text-amber-800 mb-1 block">PATIENT</label>
              <select className="w-full p-2 border rounded bg-white" value={selectedPatientEmail} onChange={e => setSelectedPatientEmail(e.target.value)}>
                <option value="" disabled>Select Patient</option>
                {assignedPatients.map(p => <option key={p.email} value={p.email}>{p.name || p.email}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-amber-800 mb-1 block">THERAPY TYPE</label>
              <select className="w-full p-2 border rounded bg-white" value={therapyType} onChange={e => setTherapyType(e.target.value)}>
                {therapyOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-amber-800 mb-1 block">DATE</label>
              <DatePicker selected={startDate} onChange={setStartDate} className="w-full p-2 border rounded"/>
            </div>
            <div>
              <label className="text-xs font-bold text-amber-800 mb-1 block">TIME</label>
              <select className="w-full p-2 border rounded" value={assignTime} onChange={e => setAssignTime(e.target.value)}>
                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button onClick={handleGenerateSchedule} disabled={loading} className="bg-primary-600 text-white p-2.5 rounded font-bold disabled:opacity-50 hover:bg-primary-700 transition-colors">
              {loading ? "Processing…" : "Assign Session"}
            </button>
          </div>
        </div>
      )}

      {userRole === "practitioner" && pendingRequests.length > 0 && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
          <h3 className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2"><AlertCircle size={15}/> {pendingRequests.length} Pending Patient Requests</h3>
          <div className="space-y-2">
            {pendingRequests.map(s => (
              <div key={s._id} className="bg-white rounded-lg p-3 border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-amber-900 text-sm">{s.therapyType} <span className="text-xs text-amber-500">for {s.patient?.name || s.patient?.email}</span></p>
                  <p className="text-xs text-amber-600">Original: {toDateStr(s.date)} at {toTimeStr(s.startTime)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDecision(s, "accept")} className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"><Check size={15}/></button>
                  <button onClick={() => handleDecision(s, "reject")} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"><XCircle size={15}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === "list" && (
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {["all","scheduled","completed","cancelled","missed"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`text-xs font-bold px-3 py-1.5 rounded-full border capitalize ${filterStatus === s ? "bg-amber-600 text-white border-amber-600" : "bg-white text-amber-700 border-amber-200"}`}>{s}</button>
            ))}
          </div>
          
          {userRole === "practitioner" && assignedPatients.length > 0 && (
            <div className="flex items-center gap-2 bg-white border border-amber-200 px-3 py-1 rounded-lg shadow-sm">
              <Filter size={14} className="text-amber-600"/>
              <select value={filterPatient} onChange={e => setFilterPatient(e.target.value)} className="text-xs font-bold text-amber-700 bg-transparent outline-none cursor-pointer">
                <option value="all">All Patients</option>
                {assignedPatients.map(p => (
                  <option key={p.email} value={p.email}>{p.name || p.email}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {viewMode === "calendar" ? (
        <CustomCalendar sessions={filteredSessions} onSelectSession={setDetailSession} />
      ) : (
        <div className="grid gap-4">
          {filteredSessions.length === 0 && <div className="text-center py-10 text-amber-600">No sessions found.</div>}
          {filteredSessions.map(session => (
            <div key={session._id} className={`bg-white p-5 rounded-xl border shadow-sm flex flex-col md:flex-row justify-between md:items-center border-amber-100`}>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-amber-900">{session.therapyType}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${badgeClass(session.status)}`}>{session.status}</span>
                  {userRole === "practitioner" && session.patient && (
                    <span className="text-[11px] font-bold text-primary-700 px-2 bg-primary-50 rounded-md flex items-center gap-1">
                      <User size={12}/> {session.patient.name || "Patient"}
                    </span>
                  )}
                  {session.feedback && (
                    <span className="text-[10px] text-green-600 flex items-center gap-0.5 font-bold">
                      <Star size={11} fill="currentColor"/> Feedback Received
                    </span>
                  )}
                </div>
                <p className="text-sm text-amber-700 flex items-center mt-1 gap-1">
                  <CalIcon className="w-4 h-4"/> {toDateStr(session.date)}
                  <Clock className="w-4 h-4 ml-2"/> {toTimeStr(session.startTime)}
                </p>
              </div>

              <div className="flex gap-2 mt-4 md:mt-0 flex-wrap">
                <button onClick={() => setDetailSession(session)} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg font-bold">Details</button>
                {userRole === "practitioner" && session.status === "scheduled" && (
                  <>
                    <button onClick={() => setEditingSession(session)} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg font-bold">Edit</button>
                    <button onClick={() => handleStatusUpdate(session._id, "completed", toDateStr(session.date), toTimeStr(session.startTime))} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold flex items-center"><Check size={13} className="mr-1"/> Complete</button>
                  </>
                )}
                {userRole === "patient" && session.status === "scheduled" && (
                  <button onClick={() => setRequestModal({ session, type: "reschedule" })} className="text-sm bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2 rounded-lg font-bold">Reschedule</button>
                )}
                {userRole === "patient" && session.status === "completed" && !session.feedback && (
                  <button onClick={() => setFeedbackSession(session)} className="text-sm bg-primary-600 text-white px-4 py-2 rounded-lg font-bold flex items-center"><Star size={14} className="mr-2"/> Leave Feedback</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {detailSession && <SessionDetailModal session={detailSession} userRole={userRole} onClose={() => setDetailSession(null)} onStatusUpdate={handleStatusUpdate} />}
      {feedbackSession && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-amber-900 mb-2">How was your session?</h3>
            <StarRating value={rating} onChange={setRating} size={32}/>
            <textarea placeholder="Share your experience…" className="w-full border border-amber-200 p-3 rounded-xl text-sm min-h-[100px] mt-5" value={comment} onChange={e => setComment(e.target.value)} />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setFeedbackSession(null)} className="flex-1 py-3 text-gray-500 font-bold">Close</button>
              <button onClick={handleFeedbackSubmit} className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold">Submit</button>
            </div>
          </div>
        </div>
      )}
      {requestModal && <RequestModal session={requestModal.session} type={requestModal.type} timeSlots={timeSlots} onClose={() => setRequestModal(null)} onSubmit={handlePatientRequest} />}
      {editingSession && <EditSessionModal session={editingSession} timeSlots={timeSlots} onClose={() => setEditingSession(null)} onSubmit={handleEditSubmit} />}
    </div>
  );
};

export default TherapyScheduling;