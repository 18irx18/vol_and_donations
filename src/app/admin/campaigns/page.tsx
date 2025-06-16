import PageTitle from '@/components/page-title'
import LinkButton from '@/components/link-button'
import React from 'react'
import CampaignModel from '@/models/campaign-model'
import { connectDB } from '@/db/config'
import CampaignsTable from './_components/campaigns-table'
import { CampaignType, UserType } from '@/interfaces/index'; 

export default async function CampaignsPage() {
    await connectDB(); 
    const rawCampaigns = await CampaignModel.find().sort({ createdAt: -1 });

    const campaigns: CampaignType[] = JSON.parse(JSON.stringify(rawCampaigns));

    return (
        <div>
            <div className="flex justify-between items-center">
                <PageTitle title="Campaigns" />
                <LinkButton title="Create campaign" path="/admin/campaigns/new-campaign" />                         
            </div>
            <LinkButton title="Back to homepage" path="/" />
            <CampaignsTable campaigns={campaigns} />
        </div>
    );
}