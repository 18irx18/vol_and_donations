import React from "react";
import PageTitle from "@/components/page-title";
import CampaignForm from "../../_components/campaign-form";
import { connectDB } from "@/db/config";
import CampaignModel from "@/models/campaign-model";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ campaignid: string }>;  
}

export default async function EditCampaignPage({ params }: Props) {
  const resolvedParams = await params;  
  await connectDB();

  const campaignDoc = await CampaignModel.findById(resolvedParams.campaignid).lean();

  if (!campaignDoc) return notFound();

   const campaign = JSON.parse(JSON.stringify(campaignDoc));

  return (
    <div>
      <PageTitle title="Edit campaign" />
      <CampaignForm isEditForm={true} initialData={campaign} />
    </div>
  );
}