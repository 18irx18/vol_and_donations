'use server'

import { connectDB } from "@/db/config"
import { getCurrentUserFromDB } from "./users"
import DonationModel from "@/models/donation-model";
import CampaignModel from "@/models/campaign-model";
import { revalidatePath } from "next/cache";

connectDB();

export const addNewDonation = async (reqBody: any) => {
    try {
        const mongoUser = await getCurrentUserFromDB()
        reqBody.user = mongoUser.data._id;
        const newDonation = new DonationModel(reqBody);
        await newDonation.save();

        const campaign = (await CampaignModel.findById(reqBody.campaign)) as any;
        campaign.collectedAmount += reqBody.amount;
        await campaign.save();
        revalidatePath(`/campaigns/${campaign._id}`);
        revalidatePath(`/profile/donations`);

        return {
            success: true,
            message: "Donation added successfully"
        }
    } catch (error: any) {
        return { error: error.message, }
    }
};

export const getDonationsByCampaignId = async (campaignId: string) => {
    try {
        const donations = await DonationModel.find({ campaign: campaignId }).populate("user");
        return {
            success: true,
            data: JSON.parse(JSON.stringify(donations)),
        }
    } catch (error: any) {
        return {
            error: error.message,
        };
    }
}