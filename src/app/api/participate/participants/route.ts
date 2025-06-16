import { NextResponse } from "next/server";
import { connectDB } from "@/db/config";
import ParticipationModel from "@/models/participation-model";
import { getCurrentUserFromDB } from "@/actions/users";

export async function GET(req: Request) {
  await connectDB();

  const mongoUser = await getCurrentUserFromDB();
  if (!mongoUser?.data?._id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const activityId = searchParams.get("activityId");

  if (!activityId) {
    return NextResponse.json({ error: "Activity ID is required" }, { status: 400 });
  }

  const recentParticipants = await ParticipationModel.find({
    activity: activityId,
    status: { $ne: "cancelled" },
  })
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return NextResponse.json(recentParticipants);
}
