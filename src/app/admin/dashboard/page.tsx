import DashboardCard from '@/components/dashboard-card'
import PageTitle from '@/components/page-title'
import { connectDB } from '@/db/config';
import CampaignModel from '@/models/campaign-model';
import DonationModel from '@/models/donation-model';
import ParticipationModel from '@/models/participation-model';
import React from 'react'
import CampaignsTable from '../campaigns/_components/campaigns-table';
import DonationsTable from '@/components/donations-table';
import LinkButton from '@/components/link-button';
import ParticipantsTable from '../activities/_components/participants-table';


connectDB();

async function DashboardPage() {

  let [campaignsCount, donationsCount, amountRaised, participationsCount] =
    await Promise.all([
      CampaignModel.countDocuments([]),
      DonationModel.countDocuments([]),
      DonationModel.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" }
          },
        },
      ]),
      ParticipationModel.countDocuments([]), 
    ]);

  amountRaised = amountRaised[0]?.totalAmount || 0;

  const [recentCampaigns, recentDonations, recentParticipations] = await Promise.all([
    CampaignModel.find({}).sort({ createdAt: -1 }).limit(5),
    DonationModel.find({}).sort({ createdAt: -1 }).limit(5)
      .populate("user").populate("campaign"),
    ParticipationModel.find({}).sort({ createdAt: -1 }).limit(5)
      .populate("user").populate("activity"), // Get recent participations
  ]);

  return (
    <div>
      <PageTitle title='Dashboard' />
      <span className="my-5">
        <LinkButton title="Back to homepage" path="/" />
      </span>
      <div className="grid mt-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <DashboardCard cardTitle='Campaigns'
          description='Total number of campaigns'
          value={campaignsCount.toString()}
          onClickPath="/admin/campaigns"
        />
        <DashboardCard cardTitle='Donations'
          description='Total number of donations done by users'
          value={donationsCount.toString()}
          onClickPath="/admin/donations"
        />
        <DashboardCard cardTitle='Raised amount'
          description='Total amount raised by all campaigns'
          value={`$ ${amountRaised}`}
        />
        <DashboardCard cardTitle='Participations'
          description='Total number of activity participations'
          value={participationsCount.toString()}
          onClickPath="/admin/participations"
        />
      </div>

      <div className='mt-10'>
        <h1 className='text-xl font-semibold text-primary'>
          Recent Campaigns
          <CampaignsTable campaigns={
            JSON.parse(JSON.stringify(recentCampaigns))}
            pagination={false}
          />
        </h1>
      </div>

      <div className='mt-10'>
        <h1 className='text-xl font-semibold text-primary'>
          Recent Donations
          <DonationsTable donations={
            JSON.parse(JSON.stringify(recentDonations))}
            pagination={false}
            fromAdmin
          />
        </h1>
      </div>

      <div className='mt-10'>
        <h1 className='text-xl font-semibold text-primary'>
          Recent Participations
          <ParticipantsTable 
            participants={JSON.parse(JSON.stringify(recentParticipations))}
            pagination={false}
            isAdmin={true}
          />
        </h1>
      </div>
    </div>
  )
}

export default DashboardPage