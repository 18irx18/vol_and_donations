"use client";
import React from 'react'
import { Table, Tag, Space, Button, message, Popconfirm } from 'antd'
import { CampaignType } from '@/interfaces/index';
import { useRouter } from 'next/navigation';
import { deleteCampaign } from '@/actions/campaigns';
import CampaignReportModal from './campaign-report-modal';

interface Props {
    campaigns: CampaignType[],
    pagination?: any,
}

function CampaignsTable({ campaigns,
        pagination = { 
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '25', '50', '100']
        } }: Props) {
    const router = useRouter();
    const [loading = false, setLoading] = React.useState<boolean>(false);
    const [selectedCampaign = null, setSelectedCampaign] = React.useState<CampaignType | null>(null);
    const [showReportModal = false, setShowReportModal] = React.useState<boolean>(false);

    const onDelete = async (id: string) => {
        try {
            setLoading(true);
            const result = await deleteCampaign(id);
            if (result.error) throw new Error(result.error);
            message.success("Campaign deleted succesfully")
        } catch (error: any) {
            message.error(error.message)
        } finally {
            setLoading(false);
        }
    }

    const columns = [
        { 
            title: 'Name', 
            dataIndex: 'name',
            render: (name: string, record: CampaignType) => (
                <span 
                    className="text-blue-500 cursor-pointer hover:underline"
                    onClick={() => router.push(`/campaign/${record._id}`)}
                >
                    {name}
                </span>
            )
        },
        { title: 'Organizer', dataIndex: 'organizer' },
        {
            title: 'Category',
            dataIndex: 'category',
            render: (categories: string[]) => (
                <>
                    {categories.map((cat) => (
                        <Tag key={cat} color="blue">
                            {cat}
                        </Tag>
                    ))}
                </>
            ),
        },
        { title: 'Target Amount', dataIndex: 'targetAmount' },
        { title: 'Collected Amount', dataIndex: 'collectedAmount' },
        {
            title: 'Start Date',
            dataIndex: 'startDate',
            render: (dateString: string) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A'
        },
        {
            title: 'End Date',
            dataIndex: 'endDate',
            render: (dateString: string) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A'
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'action',
            render: (record: CampaignType) => (
                <div className='flex gap-5'>
                    <Button
                        onClick={() => {
                            setSelectedCampaign(record);
                            setShowReportModal(true)
                        }}
                        size="small">
                        Report
                    </Button>
                    <Button
                        onClick={() => router.push(`/admin/campaigns/edit-campaign/${record._id}`)}
                        size="small"
                        icon={<i className='ri-pencil-line' />}
                    />
                    <Popconfirm
                        title="Are you sure you want to delete this campaign?"
                        onConfirm={() => onDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            size="small"
                            danger
                            icon={<i className="ri-delete-bin-6-line" />}
                        />
                    </Popconfirm>
                </div>
            )
        }
    ];

    return (
        <div>
            <Table
                columns={columns}
                dataSource={campaigns}
                rowKey="_id"
                loading={loading}
                pagination={pagination === undefined ? true : pagination}
            />

            {showReportModal && <CampaignReportModal
                showCampaignReportModal={showReportModal}
                setShowCampaignReportModal={setShowReportModal}
                selectedCampaign={selectedCampaign} />}
        </div>
    );
}

export default CampaignsTable;