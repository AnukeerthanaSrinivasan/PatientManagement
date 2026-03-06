const express = require("express");
const router = express.Router();
const TherapySession = require("../models/TherapySession");
const User = require("../models/User");

// -------------------- PATIENT DASHBOARD --------------------
router.get("/patient/:id", async (req, res) => {
  try {
    const patientId = req.params.id;

    // Get patient with assigned practitioner
    const patient = await User.findById(patientId).populate('assignedPractitioner', 'name email practiceLocation practiceAreas consultationFee bio experience');

    // Find sessions booked by this patient
    const sessions = await TherapySession.find({ patient: patientId });

    const completed = sessions.filter((s) => s.isBooked).length;
    const total = sessions.length;

    // Get upcoming sessions
    const upcomingSessions = sessions
      .filter(s => new Date(s.date) > new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      completed,
      total,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      wellnessScore: 8.2, // fake static value for now
      nextSession: upcomingSessions.length > 0
        ? `${upcomingSessions[0].date} ${upcomingSessions[0].time}`
        : "No upcoming session",
      nextMilestone: "Mid-therapy Assessment",
      assignedPractitioner: patient.assignedPractitioner,
      hasPractitioner: !!patient.assignedPractitioner,
      notifications: [
        { id: 1, message: "Your next session is coming up!" },
        { id: 2, message: "Don't forget to track your wellness." },
        ...(patient.assignedPractitioner ? [] : [{ id: 3, message: "Find and assign a practitioner to get started with treatment." }])
      ],
    });
  } catch (err) {
    console.error("Patient dashboard error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------- PRACTITIONER DASHBOARD --------------------
router.get("/practitioner/:id", async (req, res) => {
  try {
    const practitionerId = req.params.id;

    // Find all patients assigned to this practitioner
    const assignedPatients = await User.find({ 
      assignedPractitioner: practitionerId,
      userType: 'patient'
    }).select('name email phone address personalDetails progress currentStage status');

    // Find all sessions for assigned patients
    const patientIds = assignedPatients.map(p => p._id);
    const appointments = await TherapySession.find({
      patient: { $in: patientIds }
    }).populate("patient", 'name email');

    // Upcoming sessions (future dates)
    const upcomingSessions = appointments.filter(
      (a) => new Date(a.date) > new Date()
    ).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate statistics
    const totalSessions = appointments.length;
    const completedSessions = appointments.filter(s => s.isBooked).length;
    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    res.json({
      totalPatients: assignedPatients.length,
      assignedPatients: assignedPatients,
      upcomingSessions,
      totalSessions,
      completedSessions,
      completionRate,
      hasAssignedPatients: assignedPatients.length > 0,
      notifications: [
        { id: 1, message: `You have ${assignedPatients.length} assigned patients` },
        { id: 2, message: `${upcomingSessions.length} upcoming sessions` },
        ...(assignedPatients.length === 0 ? [{ id: 3, message: "No patients assigned yet. Patients will appear here once they assign themselves to you." }] : [])
      ],
    });
  } catch (err) {
    console.error("Practitioner dashboard error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;