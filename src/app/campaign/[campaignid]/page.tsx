import CampaignImagesCarousel from '@/components/campaign-images-carousel';
import React from "react";
import { connectDB } from "@/db/config";
import CampaignModel from "@/models/campaign-model";
import LinkButton from "@/components/link-button";
import type { CampaignType } from "@/interfaces";
import { notFound } from "next/navigation";
import DonationCard from "@/components/donation-card";
import DonationModel from "@/models/donation-model";

interface SingleCampaignPageProps {
    params: {
        campaignid: string; // 
    };
}

export default async function SingleCampaignPage({ params }: SingleCampaignPageProps) {
    await connectDB();

    const { campaignid: campaignId } = await params;

    const campaign = (await CampaignModel.findById(campaignId).lean()) as CampaignType | null;

    if (!campaign) {
        notFound();
    }

    const recent5Donations = await DonationModel.find({
        campaign: campaignId,
    })
        .populate("user", "userName")
        .sort({ createdAt: -1 })
        .limit(5);

    const getProperty = (key: string, value: any) => {
        return (
            <div className="flex flex-col">
                <span className="font-bold text-c2">
                    {key}
                </span>
                <span className="font-bold text-c3">
                    {value}
                </span>
            </div>
        );
    }


    return (
        <div className="flex flex-col gap-5">
            <LinkButton title="Back to homepage" path="/" />
            <div className="flex flex-col space-y-1">
                <div className="flex flex-col space-y-4">
                    <h1 className="text-2xl font-bold text-primary">{campaign.name}</h1>
                    <h2 className="text-xl font-semibold text-c2">Organizer: {campaign.organizer}</h2>

                    <CampaignImagesCarousel images={campaign.images} />
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5 grid-cols-1 mt-2">
                <div className="col-span-2 flex flex-col gap-7">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {getProperty("Organizer", campaign.organizer)}
                        {getProperty("Start date", new Date(campaign.startDate).toLocaleDateString())}
                        {getProperty("End date", new Date(campaign.endDate).toLocaleDateString())}
                        {getProperty("Target Amount", `$ ${campaign.targetAmount}`)}
                        {getProperty("Collected Amount", `$ ${campaign.collectedAmount}`)}
                    </div>


                    <div className="text-sm text-c2 whitespace-pre-wrap">
                        {campaign.description}
                    </div>

                </div>
                <div className="col-span-1">
                    <DonationCard
                        donations={JSON.parse(JSON.stringify(recent5Donations))}
                        campaign={JSON.parse(JSON.stringify(campaign))}
                    />
                </div>
            </div>
        </div>
    );
}