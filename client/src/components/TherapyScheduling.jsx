import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useToast } from "../contexts/ToastContext.jsx";
import { Clock, Calendar, Check, XCircle, User, Info, AlertCircle } from "lucide-react";

const TherapyScheduling = ({ userRole, user, assignedPatients = [], isAuthenticated }) => {
  const [sessions, setSessions] = useState([]);
  const [selectedPatientEmail, setSelectedPatientEmail] = useState("");
  const [therapyType, setTherapyType] = useState("Virechana");
  const [startDate, setStartDate] = useState(new Date());
  const [assignTime, setAssignTime] = useState("10:00");
  
  const [loading, setLoading] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [editDate, setEditDate] = useState(new Date());
  const [editTime, setEditTime] = useState("10:00");
  
  const { show } = useToast();
  const therapyOptions = ["Virechana", "Vamana", "Basti", "Nasya", "Raktamokshana"];
  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

  const fetchSessions = async () => {
    if (!user?.email) return;
    try {
      const res = await axios.get("http://localhost:5000/sessions", {
        params: { userId: user.email, role: userRole },
      });
      setSessions(res.data || []);
    } catch (err) { console.error("Fetch error:", err); }
  };

  useEffect(() => { if (isAuthenticated) fetchSessions(); }, [user, isAuthenticated]);

  // -------------------- Practitioner: Assign Therapy --------------------
  const handleGenerateSchedule = async () => {
    const targetPatient = assignedPatients.find(p => p.email === selectedPatientEmail);
    if (!targetPatient) return show({ title: "Error", message: "Please select a patient." });

    setLoading(true);
    try {
      // FIX: Changed 'patient' to 'patientId' to match your backend requirement
      await axios.post("http://localhost:5000/sessions", {
        patientId: targetPatient.email, 
        therapyType,
        startDate: startDate.toISOString().split("T")[0],
        startTime: assignTime,
        status: "scheduled",
        phase: "Purvakarma", 
        sessionName: `${therapyType} Session`
      });
      show({ title: "Success", message: "Therapy assigned successfully!" });
      fetchSessions();
    } catch (err) {
      show({ title: "Error", message: err.response?.data?.msg || "Assignment failed." });
    }
    setLoading(false);
  };

  // -------------------- Practitioner: Decision Logic --------------------
  const handleDecision = async (session, decision) => {
    try {
      let payload = { 
        userId: user.email, 
        userType: userRole, 
        status: "scheduled",
        patientId: session.patient?.email || user.email // Ensure patientId is present
      };
      
      if (decision === "accept") {
        const match = session.notes.match(/REQUESTED: (\d{4}-\d{2}-\d{2}) at (\d{2}:\d{2})/);
        payload.date = match ? match[1] : session.date;
        payload.startTime = match ? match[2] : session.startTime;
        payload.notes = `Approved: Rescheduled to ${payload.date}`;
      } else {
        payload.notes = "Reschedule request declined.";
      }

      await axios.put(`http://localhost:5000/sessions/${session._id}`, payload);
      show({ title: "Updated", message: `Request ${decision}ed.` });
      fetchSessions();
    } catch (err) { console.error("Update error:", err); }
  };

  // -------------------- Patient: Request Reschedule --------------------
  const handleRequestChange = async () => {
    if (!rescheduleReason) return show({ title: "Error", message: "Please provide a reason." });
    try {
      const formattedDate = editDate.toISOString().split("T")[0];
      await axios.put(`http://localhost:5000/sessions/${editingSession._id}`, {
        userId: user.email,
        userType: userRole,
        patientId: user.email,
        status: "reschedule_requested",
        date: editingSession.date, 
        startTime: editingSession.startTime,
        notes: `REQUESTED: ${formattedDate} at ${editTime}. Reason: ${rescheduleReason}`,
      });
      show({ title: "Sent", message: "Request sent to practitioner." });
      setEditingSession(null);
      setRescheduleReason("");
      fetchSessions();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-[#FDF7E9] rounded-xl shadow-lg border border-amber-100">
      
      {/* 1. PRACTITIONER ASSIGNMENT PANEL */}
      {userRole === "practitioner" && (
        <div className="mb-10 p-6 bg-white/60 rounded-xl border-2 border-primary-100">
          <h2 className="text-xl font-bold mb-6 text-amber-900 flex items-center">
            <User className="mr-2 text-primary-600" /> Assign Therapy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-xs font-bold text-amber-800 mb-1 block">PATIENT NAME</label>
              <select className="w-full p-2 border rounded bg-white text-amber-900" value={selectedPatientEmail} onChange={(e) => setSelectedPatientEmail(e.target.value)}>
                <option value="">Select...</option>
                {assignedPatients.map(p => <option key={p._id} value={p.email}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-amber-800 mb-1 block">DATE</label>
              <DatePicker selected={startDate} onChange={setStartDate} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="text-xs font-bold text-amber-800 mb-1 block">TIME</label>
              <select className="w-full p-2 border rounded bg-white" value={assignTime} onChange={(e) => setAssignTime(e.target.value)}>
                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button onClick={handleGenerateSchedule} className="bg-primary-600 text-white p-2.5 rounded font-bold hover:bg-primary-700">Assign</button>
          </div>
        </div>
      )}

      {/* 2. SESSIONS LIST */}
      <div className="space-y-4">
        {sessions.map(session => (
          <div key={session._id} className={`bg-white p-5 rounded-xl border flex justify-between items-center ${session.status === 'reschedule_requested' ? 'border-purple-400 bg-purple-50/40 shadow-md' : 'border-amber-100'}`}>
            <div className="flex-1">
              <h3 className="font-bold text-amber-900">{session.therapyType}</h3>
              <p className="text-sm text-amber-700 flex items-center">
                <Calendar className="w-4 h-4 mr-1" /> {session.date} | <Clock className="w-4 h-4 mx-1" /> {session.startTime}
              </p>
              {session.status === "reschedule_requested" && (
                <div className="mt-2 p-2 bg-purple-100 rounded text-xs flex items-start text-purple-900">
                  <Info className="w-3 h-3 mr-2 mt-0.5" /> {session.notes}
                </div>
              )}
            </div>

            <div className="ml-4">
              {userRole === "practitioner" && session.status === "reschedule_requested" ? (
                <div className="flex gap-2">
                  <button onClick={() => handleDecision(session, "accept")} className="p-2 bg-green-600 text-white rounded hover:bg-green-700 shadow-md" title="Accept"><Check /></button>
                  <button onClick={() => handleDecision(session, "reject")} className="p-2 bg-red-500 text-white rounded hover:bg-red-600 shadow-md" title="Reject"><XCircle /></button>
                </div>
              ) : userRole === "patient" && session.status === "scheduled" ? (
                <button onClick={() => setEditingSession(session)} className="text-sm bg-amber-100 text-amber-700 px-4 py-2 rounded-lg font-bold">Reschedule</button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* 3. MODAL (With Time and Reason) */}
      {editingSession && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-amber-900 mb-4">Request Change</h3>
            <div className="space-y-4">
              <DatePicker selected={editDate} onChange={setEditDate} minDate={new Date()} className="w-full border p-2 rounded" />
              <select className="w-full border p-2 rounded" value={editTime} onChange={(e) => setEditTime(e.target.value)}>
                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <textarea placeholder="Provide a reason..." className="w-full border p-2 rounded text-sm min-h-[80px]" value={rescheduleReason} onChange={(e) => setRescheduleReason(e.target.value)} />
              <div className="flex gap-2">
                <button onClick={() => setEditingSession(null)} className="flex-1 py-3 bg-gray-100 rounded">Cancel</button>
                <button onClick={handleRequestChange} className="flex-1 py-3 bg-primary-600 text-white rounded">Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapyScheduling;