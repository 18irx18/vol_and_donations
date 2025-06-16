'use client'
import React, { useEffect } from 'react'
import { message, Modal, Spin } from 'antd'
import { ActivityType } from '@/interfaces'
import { getActivityReportsById } from '@/actions/activity';
import DashboardCard from '@/components/dashboard-card';
import ParticipantsTable from './participants-table';

interface Props {
    showActivityReportModal: boolean,
    setShowActivityReportModal: (show: boolean) => void,
    selectedActivity: ActivityType | null
}

function ActivityReportModal({
    showActivityReportModal,
    setShowActivityReportModal,
    selectedActivity,
}: Props) {
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState<boolean>(false);

    const getData = async () => {
        try {
            setLoading(true);
            const result = await getActivityReportsById(selectedActivity?._id!);
            if (result.error) throw new Error(result.error);
            setData(result.data);
        } catch (error: any) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (showActivityReportModal && selectedActivity) {
            getData();
        }
    }, [showActivityReportModal, selectedActivity]);

    return (
        <Modal
            open={showActivityReportModal}
            onCancel={() => setShowActivityReportModal(false)}
            title=""
            footer={null}
            width={1200}
            style={{ top: 20 }}
        >
            <div className='flex flex-col'>
                <span className='font-semibold text-c2'>Activity</span>
                <span className='text-lg font-semibold text-primary'>
                    {selectedActivity?.title}
                </span>
            </div>
            <hr className='my-5 border-c2 border-t' />
            <div className='flex justify-center'>
                {loading && <Spin />}
            </div>

            {data && (
                <div>
                    <div className="grid grid-cols-3 gap-5">
                        <DashboardCard
                            cardTitle='Total Participants'
                            description='Total number of participants registered for this activity'
                            value={data.participantsCount}
                        />
                    </div>

                    <div className="mt-5">
                        <h1 className="h1 text-sm font-semibold text-primary">
                            Participants
                        </h1>

                        <ParticipantsTable
                            participants={data.participations}
                            isAdmin={true}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                pageSizeOptions: ['10', '25', '50', '100'],}}
                        />
                    </div>
                </div>
            )}
        </Modal>
    );
}

export default ActivityReportModal;
