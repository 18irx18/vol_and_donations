'use client'
import React from 'react'
import { useRouter } from 'next/navigation'

interface DashboardCardProps {
    cardTitle: string,
    description: string,
    value: string,
    onClickPath?: string;
}

function DashboardCard({ cardTitle, description, value, onClickPath }: DashboardCardProps) {
    const router = useRouter();
    return (
        <div className='flex flex-col gap-3 p-5 border-3 rounded-lg 
        border-c4 border-solid hover:border-primary cursor-pointer border-4 '
            onClick={()=>{
                if(onClickPath){router.push(onClickPath)}
            }}>
            <span className="text-primary font-semibold">
                {cardTitle}
            </span>
            <span className='text-sm text-c2'>
                {description}
            </span>
            <span className='text-6xl font-semibold text-primary'>
                {value}
            </span>
        </div>
    )
}

export default DashboardCard