import mongoose from "mongoose";

const volunteerActivitySchema = new mongoose.Schema({
    title: { type: String, required: true },            
    description: { type: String, required: true },      
    organizer: { type: String, required: true },        
    category: {
        type: [String],
        required: true,
        validate: {
            validator: function (value: string[]) {
                return Array.isArray(value) && value.length > 0;
            },
            message: "At least one category must be selected",
        },
    },
    imageUrls: {
        type: [String],
        default: [],
    },
    date: { type: Date, required: true },                
    time: { type: String, required: true },              
    location: { type: String, required: true },          
    isActive: { type: Boolean, required: true, default: true },
    showParticipants: { type: Boolean, required: true, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
}, { timestamps: true });

if (mongoose.models && mongoose.models.volunteeractivities) {
    delete mongoose.models.volunteeractivities;
}

const ActivityModel = mongoose.model("volunteeractivities", volunteerActivitySchema);

export default ActivityModel;
