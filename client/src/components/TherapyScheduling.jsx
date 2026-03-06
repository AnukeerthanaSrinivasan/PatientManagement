import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useToast } from "../contexts/ToastContext.jsx";
import {
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Sun,
  Moon,
} from "lucide-react";

// Import background patterns
const lotusPattern = "/patterns/lotus-bg.svg";
const mandalaPattern = "/patterns/mandala-bg.svg";
const herbsPattern = "/patterns/herbs-bg.svg";

const TherapyScheduling = ({ userRole, user }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [therapyType, setTherapyType] = useState("Virechana");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [editDate, setEditDate] = useState(new Date());
  const [editTime, setEditTime] = useState("10:00");
  const [error, setError] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancellingSession, setCancellingSession] = useState(null);

  const therapyOptions = ["Virechana", "Vamana"];

  // -------------------- Session Management --------------------
  const { show } = useToast();

  const handleEditSession = (session) => {
    if (session.status !== "scheduled") {
      show({
        title: "Cannot Reschedule",
        message: "Only scheduled sessions can be rescheduled.",
        duration: 4000,
      });
      return;
    }
    setEditingSession(session);
    setEditDate(new Date(session.date));
    setEditTime(session.startTime);
    setError("");
  };

  const handleReschedule = async () => {
    if (!editingSession || !user?.email) return;

    // Additional validation
    if (editingSession.status !== "scheduled") {
      setError("Only scheduled sessions can be rescheduled.");
      return;
    }

    // Validate the selected date is in the future
    if (editDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      setError("Cannot reschedule to a past date.");
      return;
    }

    try {
      const formattedDate = editDate.toISOString().split("T")[0];
      await axios.put(`http://localhost:5000/sessions/${editingSession._id}`, {
        date: formattedDate,
        startTime: editTime,
        userId: user.email,
        userType: userRole,
        role: user.role || "patient",
        status: "scheduled",
        // Preserve existing session data
        sessionName: editingSession.sessionName,
        phase: editingSession.phase,
        therapyType: editingSession.therapyType,
      });

      await fetchSessions();
      setEditingSession(null);
      setError("");
      // Close the modal
      setEditingSession(null);
      // Show success message
      show({
        title: "Success",
        message: "Session rescheduled successfully!",
        duration: 4000,
      });
    } catch (err) {
      console.error("Error rescheduling session:", err);
      show({
        title: "Error",
        message:
          err.response?.data?.msg ||
          err.message ||
          "Failed to reschedule session",
        duration: 4000,
      });
      // Keep the modal open on error
    }
  };

  const handleCancelSession = (session) => {
    setCancellingSession(session);
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingSession || !user?.email) return;

    try {
      console.log("Sending cancel request with status:", "cancelled");
      await axios.put(
        `http://localhost:5000/sessions/${cancellingSession._id}`,
        {
          status: "cancelled",
          userId: user.email,
          userType: userRole,
          role: user.role || "patient",
          // Preserve existing session data without modifying it
          sessionName: cancellingSession.sessionName,
          phase: cancellingSession.phase,
          therapyType: cancellingSession.therapyType,
          // Keep the original date and time
          date: new Date(cancellingSession.date).toISOString().split("T")[0],
          startTime: cancellingSession.startTime,
        }
      );

      await fetchSessions();
      setShowCancelConfirm(false);
      setCancellingSession(null);
    } catch (err) {
      console.error("Error cancelling session:", err);
      show({
        title: "Error",
        message: `Failed to cancel session: ${
          err.response?.data?.msg || "Unknown error"
        }`,
        duration: 4000,
      });
    }
  };

  // -------------------- Fetch User's Sessions --------------------
  const fetchSessions = async () => {
    if (!user || !user.email) return;
    try {
      const res = await axios.get("http://localhost:5000/sessions", {
        params: { userId: user.email, role: userRole },
      });
      setSessions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setSessions([]);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  // -------------------- Generate Therapy Schedule --------------------
  const handleGenerateSchedule = async () => {
    if (!therapyType || !startDate) {
      show({
        title: "Missing Information",
        message: "Please select therapy type and start date",
        duration: 4000,
      });
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/sessions", {
        patientId: user.email,
        therapyType,
        startDate: startDate.toISOString().split("T")[0],
        status: "scheduled", // Explicitly set lowercase status
      });
      show({
        title: "Success",
        message: "Therapy schedule generated successfully!",
        duration: 4000,
      });
      fetchSessions();
    } catch (err) {
      console.error("Error generating schedule:", err);
      show({
        title: "Error",
        message: "Failed to generate schedule",
        duration: 4000,
      });
    }
    setLoading(false);
  };

  // -------------------- Render --------------------
  if (!user || !user.email) {
    return <div className="p-6 text-gray-600">Loading user info...</div>;
  }

  const safeSessions = Array.isArray(sessions) ? sessions : [];

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-elevation-2 border border-amber-100 relative overflow-hidden">
      {/* Background Patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
        <img src={mandalaPattern} alt="" className="w-full h-full" />
      </div>
      <div className="absolute bottom-0 left-0 w-48 h-48 opacity-5 pointer-events-none">
        <img src={lotusPattern} alt="" className="w-full h-full" />
      </div>

      {/* -------------------- Generate Schedule -------------------- */}
      {userRole === "patient" && (
        <div className="mb-12 relative">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-2xl font-decorative text-amber-900">
              Plan Your Panchakarma Journey
            </h2>
          </div>

          <div className="bg-white/40 backdrop-blur-sm p-6 rounded-xl border border-amber-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
              <img src={herbsPattern} alt="" className="w-full h-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  Select Therapy Type
                </label>
                <select
                  value={therapyType}
                  onChange={(e) => setTherapyType(e.target.value)}
                  className="w-full bg-white border border-amber-200 text-amber-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  {therapyOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  Choose Start Date
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={(d) => setStartDate(d)}
                  dateFormat="yyyy-MM-dd"
                  className="w-full bg-white border border-amber-200 text-amber-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  withPortal
                  portalId="date-picker-portal"
                  popperProps={{
                    positionFixed: true,
                    strategy: "fixed",
                  }}
                  popperClassName="react-datepicker-popper-custom"
                />
              </div>

              <button
                onClick={handleGenerateSchedule}
                disabled={loading}
                className="h-[calc(100%-8px)] mt-8 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg px-6 py-3 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Sun className="w-5 h-5 mr-2" />
                    Generate Schedule
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- My Sessions -------------------- */}
      <div className="relative">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-4">
            <Clock className="w-6 h-6 text-amber-700" />
          </div>
          <h2 className="text-2xl font-decorative text-amber-900">
            Your Healing Journey
          </h2>
        </div>

        {safeSessions.length === 0 ? (
          <div className="text-center py-12 bg-white/40 backdrop-blur-sm rounded-xl border border-amber-100">
            <div className="w-20 h-20 mx-auto mb-4 bg-amber-50 rounded-full flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-amber-400" />
            </div>
            <p className="text-amber-800 font-medium">
              No sessions scheduled yet.
            </p>
            <p className="text-amber-600 text-sm mt-2">
              Begin your wellness journey by generating a schedule above.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {safeSessions.map((session) => (
              <div
                key={session._id}
                className="group bg-white/40 backdrop-blur-sm p-6 rounded-xl border border-amber-100 hover:shadow-elevation-2 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-5 transition-opacity">
                  <img src={lotusPattern} alt="" className="w-full h-full" />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3">
                        {session.status === "completed" ? (
                          <CheckCircle className="h-6 w-6 text-primary-500" />
                        ) : session.status === "cancelled" ? (
                          <XCircle className="h-6 w-6 text-red-500" />
                        ) : (
                          <Clock className="h-6 w-6 text-amber-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-amber-900">
                          {session.sessionName}
                        </h3>
                        <span className="inline-block mt-1 px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                          {session.phase}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center text-amber-800">
                        <Calendar className="h-4 w-4 mr-2 text-amber-600" />
                        {session.date}
                      </div>
                      <div className="flex items-center text-amber-800">
                        <Clock className="h-4 w-4 mr-2 text-amber-600" />
                        {session.startTime}
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          session.status === "completed"
                            ? "bg-primary-100 text-primary-800"
                            : session.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : session.status === "scheduled"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {session.status.charAt(0).toUpperCase() +
                          session.status.slice(1)}
                      </div>
                    </div>

                    {session.notes && (
                      <div className="mt-3 p-3 bg-amber-50/50 rounded-lg">
                        <p className="text-sm text-amber-800">
                          <span className="font-medium text-amber-900">
                            Notes:
                          </span>{" "}
                          {session.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {session.status === "scheduled" && (
                    <div className="flex items-center mt-4 md:mt-0 space-x-3">
                      <button
                        onClick={() => handleEditSession(session)}
                        className="flex items-center px-4 py-2 text-sm font-medium text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancelSession(session)}
                        className="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {editingSession && (
        <div className="fixed inset-0 bg-amber-900/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 w-full max-w-md shadow-elevation-3 border border-amber-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
              <img src={mandalaPattern} alt="" className="w-full h-full" />
            </div>

            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                <Calendar className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-xl font-decorative text-amber-900">
                Reschedule Session
              </h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  Choose New Date
                </label>
                <DatePicker
                  selected={editDate}
                  onChange={setEditDate}
                  dateFormat="yyyy-MM-dd"
                  minDate={new Date()}
                  className="w-full bg-white border border-amber-200 text-amber-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  withPortal
                  portalId="date-picker-portal-modal"
                  popperProps={{
                    positionFixed: true,
                    strategy: "fixed",
                  }}
                  popperClassName="react-datepicker-popper-custom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  Select New Time
                </label>
                <select
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full bg-white border border-amber-200 text-amber-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].map(
                    (time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    )
                  )}
                </select>
              </div>
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setEditingSession(null)}
                  className="px-4 py-2 text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReschedule}
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transform hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-amber-900/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 w-full max-w-md shadow-elevation-3 border border-amber-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
              <img src={mandalaPattern} alt="" className="w-full h-full" />
            </div>

            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-xl font-decorative text-amber-900">
                Cancel Session
              </h3>
            </div>

            <p className="text-amber-800 mb-6 bg-amber-50/50 p-4 rounded-lg border border-amber-100">
              Are you sure you want to cancel this therapy session? This action
              cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg font-medium transition-colors"
              >
                No, Keep Session
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transform hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Yes, Cancel Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapyScheduling;