'use client'
import React, { useEffect } from 'react'
import { message, Modal, Spin } from 'antd'
import { CampaignType } from '@/interfaces'
import { getCampaignReportsById } from '@/actions/campaigns';
import DashboardCard from '@/components/dashboard-card';
import DonationsTable from '@/components/donations-table';

interface Props {
    showCampaignReportModal: boolean,
    setShowCampaignReportModal: (show: boolean) => void,
    selectedCampaign: CampaignType | null
}

function CampaignReportModal({
    showCampaignReportModal,
    setShowCampaignReportModal,
    selectedCampaign, }: Props) {
    const [data = [], setData] = React.useState<any>(null);
    const [loading = false, setLoading] = React.useState<boolean>(false);
    const getData = async () => {
        try {
            setLoading(true);
            const result = await getCampaignReportsById(selectedCampaign?._id!);
            if (result.error) throw new Error(result.error);
            console.log(result.data)
            setData(result.data)
        } catch (error: any) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getData()
    }, [])

    return (
        <Modal
            open={showCampaignReportModal}
            onCancel={() => setShowCampaignReportModal(false)}
            title=""
            footer={null}
            width={1200}
        >
            <div className='flex flex-col'>
                <span
                    className='font-semibold text-c2'>
                    Campaign
                </span>
                <span
                    className='text-lg font-semibold text-primary'>
                    {selectedCampaign?.name}
                </span>
            </div>
            <hr className='my-5 border-c2 border-t' />
            <div className='flex justify-center'>
                {loading && <Spin />}
            </div>

            {data && (
                <div>
                    <div className="grid grid-cols-3 gap-5">
                        <DashboardCard cardTitle='Total donations'
                            description='Total number of donations done by users for this campaign'
                            value={data.donationsCount}
                        />

                        <DashboardCard cardTitle='Total amount raised'
                            description='Total amount raised by this campaign'
                            value={`$ ${data.totalAmountRaised}`}
                        />
                    </div>

                    <div className="mt-5">
                        <h1 className="h1 text-sm font-semibold text-primary">
                            Donations
                        </h1>

                        <DonationsTable donations={data.donations}
                        fromCampaign = {true}
                        fromAdmin={true} />
                    </div>

                </div>
            )

            }
        </Modal>
    );
}

export default CampaignReportModal