import mongoose from "mongoose";

const participationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "users",   
    required: true 
  },
  activity: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "volunteeractivities",  
    required: true 
  },
  status: {
    type: String,
    enum: ["registered", "attended", "cancelled"],
    default: "registered"
  },
  phoneNumber: { 
    type: String,
    required: true
  },
  registeredAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

if (mongoose.models && mongoose.models.participations) {
  delete mongoose.models.participations;
}

const ParticipationModel = mongoose.model("participations", participationSchema);

export default ParticipationModel;
