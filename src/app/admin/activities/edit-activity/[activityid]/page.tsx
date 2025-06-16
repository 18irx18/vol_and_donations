import React from "react";
import PageTitle from "@/components/page-title";
import VolunteerActivityForm from "../../_components/activity-form";
import { connectDB } from "@/db/config";
import ActivityModel from "@/models/activity-model";
import { notFound } from "next/navigation";
import { ActivityType } from "@/interfaces";

interface Props {
  params: Promise<{ activityid: string }>;
}

export default async function EditActivityPage({ params }: Props) {
  const resolvedParams = await params;  
  await connectDB();

  const activityDoc = await ActivityModel.findById(resolvedParams.activityid).lean();

  if (!activityDoc) return notFound();

  const activity = JSON.parse(JSON.stringify(activityDoc));

  return (
    <div>
      <PageTitle title="Edit Activity" />
      <VolunteerActivityForm isEditForm={true} initialData={activity} />
    </div>
  );
}
