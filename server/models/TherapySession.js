const mongoose = require("mongoose");

const TherapySessionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  practitioner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  therapyType: { type: String, required: true },
  phase: { type: String, required: true },
  sessionName: { type: String, required: true },
  date: {
    type: Date,
    required: true,
    validate: {
      validator: function (v) {
        if (
          this.status === 'cancelled' ||
          this.status === 'reschedule_requested' ||
          this.status === 'cancel_requested' ||
          this.status === 'completed' ||
          this.status === 'missed'
        ) return true;
        return v >= new Date(new Date().setHours(0, 0, 0, 0));
      },
      message: 'Session date cannot be in the past'
    }
  },
  status: {
    type: String,
    enum: [
      'scheduled', 'completed', 'cancelled',
      'in-progress', 'reschedule_requested',
      'missed', 'cancel_requested'          // ← added cancel_requested
    ],
    default: 'scheduled',
    lowercase: true,
    trim: true
  },
  notes: { type: String },
  feedback: {                               // ← added feedback field
    rating:      { type: Number, min: 1, max: 5 },
    comment:     { type: String },
    patientId:   { type: String },
    submittedAt: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model("TherapySession", TherapySessionSchema);