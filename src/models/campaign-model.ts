import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    organizer: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    collectedAmount: { type: Number, required: true, default: 0 },
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
    images: {
        type: [String],
        default: [],
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isActive: { type: Boolean, required: true },
    showDonors: { type: Boolean, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
}, { timestamps: true });

if (mongoose.models && mongoose.models.campaigns) {
    delete mongoose.models.campaigns;
}

const CampaignModel = mongoose.model("campaigns", campaignSchema);

export default CampaignModel;