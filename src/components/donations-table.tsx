'use client'
import { CampaignType, DonationType, UserType } from '@/interfaces'
import { Table } from 'antd'
import dayjs from 'dayjs'
import React from 'react'
import { useRouter } from 'next/navigation'

interface DonationsTableProps {
    donations: DonationType[],
    fromAdmin: boolean,
    pagination?: any,
    fromCampaign?: boolean,
}

function DonationsTable({ donations, fromAdmin = false,
    pagination = {
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '25', '50', '100']
    },
    fromCampaign = false }: DonationsTableProps) {

    const router = useRouter();

    let columns: any[] = [
        {
            title: 'Campaign',
            dataIndex: 'campaign',
            key: 'campaign',
            render: (campaign: CampaignType) => {
                return (
                    <span 
                        className="text-blue-500 cursor-pointer hover:underline"
                        onClick={() => router.push(`/campaign/${campaign._id}`)}
                    >
                        {campaign.name}
                    </span>
                )
            }
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number) => {
                return <span>$ {amount.toLocaleString()}</span>
            }
        },
        {
            title: 'Message',
            dataIndex: 'message',
            key: 'message',
        },
        {
            title: 'Date and time',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (createdAt: Date) => {
                return <span>
                    {dayjs(createdAt).format('MMMM DD, YYYY hh:mm A')}
                </span>
            }
        },
    ]

    if (fromAdmin) {
        columns.splice(1, 0, {
            title: "User",
            dataIndex: "user",
            key: "user",
            render: (user: UserType) => {
                return <span>{user.userName}</span>
            },
        })
    }

    if (fromCampaign) {
        columns = columns.filter((column) => column.key !== "campaign")
    }

    return (
        <div>
            <Table 
                dataSource={donations} 
                columns={columns}
                rowKey="_id"
                pagination={pagination === undefined ? true : pagination} 
            />
        </div>
    )
}

export default DonationsTable