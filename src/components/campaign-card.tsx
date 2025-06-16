"use client"
import React from 'react'
import { CampaignType } from '@/interfaces';
import { Progress, ProgressProps } from 'antd';
import { useRouter } from 'next/navigation';

interface CampaignCardProps {
    campaign: CampaignType
}

const twoColors: ProgressProps['strokeColor'] = {
    '0%': '#FA5053',
    '100%': '#5CE65C',
};


function CampaignCard({ campaign }: CampaignCardProps) {
    const router = useRouter();
    const collectedPercentage = Math.round(
        (campaign.collectedAmount / campaign.targetAmount) * 100
    );
    return (
        <div className='border-3 rounded-lg border-c4 max-w-md min-w-48
        border-solid h-88 hover:border-primary border-4 cursor-pointer'
            onClick={() => router.push(`/campaign/${campaign._id}`)}>
            <div className='p-3 flex flex-col'>
                <h1 className='text-lg font-semibold text-primary'>
                    {campaign.name}
                </h1>
                {campaign.images && campaign.images.length > 0 ? (
                    <div className="w-full h-40 rounded-md overflow-hidden flex items-center justify-center bg-gray-200 mb-2">
                        <img
                            src={campaign.images[0]}
                            alt={campaign.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-full h-40 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 mb-2">
                        No image
                    </div>
                )}
                <Progress percent={collectedPercentage} strokeColor={twoColors} />
                <span className="text-sm text-c2 mt-4">
                    $ {campaign.collectedAmount} raised of $ {campaign.targetAmount}
                </span>
                <span className="text-xs text-primary mt-3 font-semibold">
                    Organized by {campaign.organizer}
                </span>
            </div>
        </div>
    )
}

export default CampaignCard