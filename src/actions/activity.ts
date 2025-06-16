"use server";

import ActivityModel from "@/models/activity-model";
import { getCurrentUserFromDB } from "./users";
import { connectDB } from "@/db/config";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import ParticipationModel from "@/models/participation-model";

connectDB();

export interface Activity {
  id: string;
  title: string;
  description?: string | Date;
  date: string;
  createdBy?: string;
}

export const updateActivity = async (data: any) => {
  if (!data._id) {
    throw new Error("Activity ID (_id) is required");
  }

  if (data.date && typeof data.date === "string") {
    data.date = new Date(data.date);
  }

  const activity = await ActivityModel.findById(data._id);
  if (!activity) {
    throw new Error("Activity not found");
  }

  Object.assign(activity, data);
  await activity.save();

  return { message: "Activity updated successfully" };
};

export const addNewActivity = async (reqBody: any) => {
  try {
    console.log("Received activity data:", reqBody);
    const currentUser = await getCurrentUserFromDB();
    console.log("Current user:", currentUser);

    if (!currentUser?.data?._id) {
      throw new Error("User not authenticated");
    }

    reqBody.createdBy = currentUser.data._id;

    if (reqBody.date && typeof reqBody.date === "string") {
      reqBody.date = new Date(reqBody.date);
    }

    const activity = new ActivityModel(reqBody);
    await activity.save();
    revalidatePath('/admin/activities');

    return {
      message: "Activity added successfully",
    };
  } catch (error: any) {
    return {
      error: error.message || "An error occurred while adding activity",
    };
  }
};

export const deleteActivity = async (id: string) => {
  try {
    await ActivityModel.findByIdAndDelete(id);
    revalidatePath('/admin/activities');
    return {
      message: "Activity deleted successfully"
    };
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};

export const getUserParticipationsCount = async (userId: string) => {
  try {
    const count = await ParticipationModel.countDocuments({ 
      user: new mongoose.Types.ObjectId(userId) 
    });
    return count;
  } catch (error: any) {
    console.error("Error getting participations count:", error);
    return 0;
  }
};

export const getUsersParticipationsCounts = async () => {
  try {
    const result = await ParticipationModel.aggregate([
      {
        $group: {
          _id: "$user",
          count: { $sum: 1 }
        }
      }
    ]);
    return result.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {} as Record<string, number>);
  } catch (error: any) {
    console.error("Error getting users participations:", error);
    return {};
  }
};

export const getActivityReportsById = async (id: string) => {
  try {
    const activityIdInObjectFormat = new mongoose.Types.ObjectId(id);
    let [
      participantsCount, totalParticipantsAgg, participations
    ] = await Promise.all([
      ParticipationModel.countDocuments({ activity: id }),
      ParticipationModel.aggregate([
        { $match: { activity: activityIdInObjectFormat } },
        { $group: { _id: null, totalParticipants: { $sum: 1 } } }
      ]),
      ParticipationModel.find({ activity: id })
        .populate("user")
        .sort({ createdAt: -1 })
    ]);

    const totalParticipants = totalParticipantsAgg[0]?.totalParticipants || 0;

    return {
      data: {
        participantsCount,
        totalParticipants,
        participations: JSON.parse(JSON.stringify(participations))
      }
    };
  } catch (error: any) {
    return {
      error: error.message
    };
  }

  
};
