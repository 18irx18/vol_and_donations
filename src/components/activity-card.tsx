"use client"
import React from 'react'
import { ActivityType } from '@/interfaces';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

interface ActivityCardProps {
    activity: ActivityType
}

function ActivityCard({ activity }: ActivityCardProps) {
    const router = useRouter();
    const formattedDate = dayjs(activity.date).format('MMMM D, YYYY');

    return (
        <div className='border-3 rounded-lg border-c4 max-w-md min-w-48
        border-solid h-88 hover:border-primary border-4 cursor-pointer'
            onClick={() => router.push(`/activity/${activity._id}`)}>
            <div className='p-3 flex flex-col'>
                <h1 className='text-lg font-semibold text-primary'>
                    {activity.title}
                </h1>
                {activity.imageUrls && activity.imageUrls.length > 0 ? (
                    <div className="w-full h-40 rounded-md overflow-hidden flex items-center justify-center bg-gray-200 mb-2">
                        <img
                            src={activity.imageUrls[0]}
                            alt={activity.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-full h-40 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 mb-2">
                        No image
                    </div>
                )}
                <span className="text-sm text-c2 mt-2 font-semibold">
                    {formattedDate}
                </span>
                <span className="text-sm text-c2">
                    {activity.time}
                </span>
                <span className="text-sm text-c2">
                    {activity.location}
                </span>
                <span className="text-xs text-primary mt-3 font-semibold">
                    Organized by {activity.organizer}
                </span>
            </div>
        </div>
    )
}

export default ActivityCard;
