const express = require("express");
const router = express.Router();
const TherapySession = require("../models/TherapySession");
const User = require("../models/User");
const { sendAppointmentConfirmation } = require("../utils/whatsapp");

// For debugging
const debug = require('debug')('ayursutra:sessions');

// -------------------- GET all sessions --------------------
router.get("/", async (req, res) => {
  const { userId, role } = req.query;

  try {
    let sessions;

    if (role === "practitioner") {
      sessions = await TherapySession.find()
        .populate("patient", "name email phone")
        .sort({ date: 1, startTime: 1 });
    } else {
      // Patient sees only their sessions
      const patient = await User.findOne({ email: userId });
      if (!patient) return res.status(404).json({ msg: "Patient not found" });

      sessions = await TherapySession.find({ patient: patient._id })
        .populate("patient", "name email phone")
        .sort({ date: 1, startTime: 1 });
    }

    res.json(sessions);
  } catch (err) {
    console.error("Error fetching sessions:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// -------------------- POST: Generate full therapy schedule --------------------
router.post("/", async (req, res) => {
  const { patientId, therapyType, startDate, slotTimes } = req.body;

  if (!patientId || !therapyType || !startDate) {
    return res.status(400).json({ msg: "Please provide patientId, therapyType, and startDate" });
  }

  try {
    // Find patient by email
    const patient = await User.findOne({ email: patientId });
    if (!patient) return res.status(404).json({ msg: "Patient not found" });
    
    console.log("Found patient:", {
      id: patient._id,
      email: patient.email,
      phone: patient.phone,
      name: patient.name
    });

    // Panchakarma schedule template
    const therapyTemplate = {
      Virechana: [
        { phase: "Pre", sessionName: "Preparation 1", daysAfterStart: 0 }
      ],
      Vamana: [
        { phase: "Pre", sessionName: "Preparation 1", daysAfterStart: 0 }
      ],
    };

    const template = therapyTemplate[therapyType];
    if (!template) return res.status(400).json({ msg: "Invalid therapyType" });

    // slotTimes: optional array of start times for each session
    const sessions = await Promise.all(template.map(async (item, idx) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + item.daysAfterStart);
      const sessionDate = date.toISOString().split("T")[0];
      const startTime = slotTimes && slotTimes[idx] ? slotTimes[idx] : "10:00";

      // Skip creating sessions that would be in the past
      const sessionDateObj = new Date(sessionDate);
      if (sessionDateObj < new Date(new Date().setHours(0,0,0,0))) {
        // return null for past session entries so we can filter them out later
        return null;
      }

      // Conflict check: is there already a session at this date/time? Ignore cancelled
      const conflict = await TherapySession.findOne({
        date: sessionDate,
        startTime,
        status: { $ne: 'cancelled' }
      });
      if (conflict) {
        throw new Error(`Slot conflict on ${sessionDate} at ${startTime}`);
      }

      // Create new session with default practitioner
      let defaultPractitioner = await User.findOne({ userType: 'practitioner' });
      if (!defaultPractitioner) {
        defaultPractitioner = new User({
          name: "Default Practitioner",
          email: "default.practitioner@ayurveda.com",
          password: "defaultPass123",
          userType: "practitioner",
          status: "active"
        });
        await defaultPractitioner.save();
      }

      return {
        patient: patient._id,
        practitioner: defaultPractitioner._id,
        therapyType,
        phase: item.phase,
        sessionName: item.sessionName,
        date: sessionDate,
        startTime,
        status: 'scheduled', // Make sure this is lowercase
      };
    }));

    // Find a default practitioner
    let defaultPractitioner = await User.findOne({ userType: 'practitioner' });
    if (!defaultPractitioner) {
      // Create a default practitioner if none exists
      defaultPractitioner = new User({
        name: "Default Practitioner",
        email: "default.practitioner@ayurveda.com",
        password: "defaultPass123", // You should use proper password hashing in production
        userType: "practitioner",
        status: "active"
      });
      await defaultPractitioner.save();
    }

    // Filter out nulls (past sessions) and ensure practitioner/status are set
    const sessionsFiltered = sessions.filter(Boolean).map(session => ({
      ...session,
      practitioner: session.practitioner || defaultPractitioner._id,
      status: String(session.status || 'scheduled').toLowerCase()
    }));

    const createdSessions = await TherapySession.insertMany(sessionsFiltered);

    // Send WhatsApp notifications for each created session
    if (patient.phone) {
      for (const session of createdSessions) {
        try {
          console.log(`Sending WhatsApp notification for session ${session._id} to ${patient.phone}`);
          await sendAppointmentConfirmation({
            therapyType: session.therapyType,
            sessionName: session.sessionName,
            date: session.date,
            startTime: session.startTime
          }, patient.phone);
          console.log(`WhatsApp notification sent successfully for session ${session._id}`);
        } catch (error) {
          console.error('Error sending WhatsApp confirmation:', {
            sessionId: session._id,
            error: error.message,
            phone: patient.phone
          });
          // Continue with other sessions even if one notification fails
        }
      }
    } else {
      console.log(`No phone number found for patient: ${patient.email}`);
    }

    res.json(createdSessions);
  } catch (err) {
    console.error("Error generating therapy schedule:", err);
    res.status(500).json({ msg: err.message || "Server error" });
  }
});

// -------------------- PUT: Update session --------------------
// -------------------- PUT: Update session --------------------
router.put("/:id", async (req, res) => {
  try {
    const session = await TherapySession.findById(req.params.id);
    if (!session) return res.status(404).json({ msg: "Session not found" });

    const { feedback, ...rest } = req.body;

    // Apply all normal fields
    Object.assign(session, rest);

    // Apply feedback separately so Mongoose tracks it
    if (feedback) {
      session.feedback = {
        rating:      feedback.rating,
        comment:     feedback.comment,
        patientId:   feedback.patientId,
        submittedAt: feedback.submittedAt ? new Date(feedback.submittedAt) : new Date()
      };
    }

    await session.save();
    res.json({ msg: "Session updated", session });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});
// -------------------- DELETE: Cancel session --------------------
router.delete("/delete/:id", async (req, res) => {
  try {
    const { userId, userType } = req.query;
    const session = await TherapySession.findById(req.params.id).populate('patient');
    if (!session) return res.status(404).json({ msg: "Session not found" });

    // Authorization check
    if (userType === 'patient' && session.patient.email !== userId) {
      return res.status(403).json({ msg: "Not authorized to delete this session" });
    }

    await session.deleteOne(); // Using deleteOne() instead of remove()
    res.json({ msg: "Session cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message || "Server error" });
  }
});

module.exports = router;



