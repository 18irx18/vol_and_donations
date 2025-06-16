"use server";

import CampaignModel from "@/models/campaign-model";
import DonationModel from "@/models/donation-model";
import { getCurrentUserFromDB } from "./users";
import { connectDB } from "@/db/config";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

connectDB();

export const updateCampaign = async (data: any) => {
  if (!data._id) {
    throw new Error("Campaign ID (_id) is required");
  }

  if (data.startDate && typeof data.startDate === "string") {
    data.startDate = new Date(data.startDate);
  }

  if (data.endDate && typeof data.endDate === "string") {
    data.endDate = new Date(data.endDate);
  }

  const campaign = await CampaignModel.findById(data._id);
  if (!campaign) {
    throw new Error("Campaign not found");
  }

  Object.assign(campaign, data);
  await campaign.save();

  return { message: "Campaign updated successfully" };
};

export const addNewCampaign = async (reqBody: any) => {
  try {
    console.log("Received campaign data:", reqBody);

    const currentUser = await getCurrentUserFromDB();
    console.log("Current user:", currentUser);

    if (!currentUser?.data?._id) {
      throw new Error("User not authenticated");
    }

    reqBody.createdBy = currentUser.data._id;

    if (reqBody.startDate && typeof reqBody.startDate === "string") {
      reqBody.startDate = new Date(reqBody.startDate);
    }
    if (reqBody.endDate && typeof reqBody.endDate === "string") {
      reqBody.endDate = new Date(reqBody.endDate);
    }

    const campaign = new CampaignModel(reqBody);
    await campaign.save();
    revalidatePath('/admin/campaigns')

    console.log("Campaign saved:", campaign);

    return {
      message: "Campaign added successfully",
    };
  } catch (error: any) {
    console.error("Error adding campaign:", error);
    return {
      error: error.message || "An error occurred while adding campaign",
    };
  }
};

export const deleteCampaign = async (id: string) => {
  try {
    await CampaignModel.findByIdAndDelete(id);
    revalidatePath('/admin/campaigns');
    return {
      message: "Campaign deleted succefully"
    }
  } catch (error: any) {
    return {
      error: error.message,
    }
  }

};

export const getCampaignReportsById = async (id: string) => {
  try {
    const campaignIdInObjectFormat = new mongoose.Types.ObjectId(id);
    let [
      donationsCount, totalAmountRaised, donations
    ] = await Promise.all([
      DonationModel.countDocuments({ campaign: id }),
      DonationModel.aggregate([
        {
          $match: {
            campaign: campaignIdInObjectFormat
          }
        },
        {
          $group: {
            _id: null,
            totalAmountRaised: {
              $sum: "$amount"
            }
          }
        }
      ]),
      DonationModel.find({ campaign: id })
        .populate("user").sort({ createdAt: -1 })
    ])

    totalAmountRaised = totalAmountRaised[0]?.totalAmountRaised || 0;

    return {
      data:
      {
        donationsCount,
        totalAmountRaised,
        donations : JSON.parse(JSON.stringify(donations))
      }
    }
  } catch (error: any) {
    return {
      error: error.message
    }
  }
};
