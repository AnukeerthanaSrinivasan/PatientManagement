const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://malaranu79:Mithun%401910@patientmanagement.pjswded.mongodb.net/ayursutra?retryWrites=true&w=majority"); // local MongoDB
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
