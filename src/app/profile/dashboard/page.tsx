import DashboardCard from '@/components/dashboard-card'
import PageTitle from '@/components/page-title'
import { connectDB } from '@/db/config';
import DonationModel from '@/models/donation-model';
import ParticipationModel from '@/models/participation-model';
import React from 'react'
import DonationsTable from '@/components/donations-table';
import UserParticipationsTable from '@/components/user-participations-table';
import { getCurrentUserFromDB } from '@/actions/users';
import mongoose from 'mongoose';
import LinkButton from '@/components/link-button';

connectDB();

async function DashboardPage() {
  const mongoUser = await getCurrentUserFromDB();
  const userId = new mongoose.Types.ObjectId(mongoUser.data._id);

  let [donationsCount, amountRaised, participationsCount] = await Promise.all([
    DonationModel.countDocuments({ user: userId }),
    DonationModel.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
    ]),
    ParticipationModel.countDocuments({
      user: userId,
      status: { $ne: 'cancelled' }
    })
  ]);

  amountRaised = amountRaised[0]?.totalAmount || 0;

  const [recentDonations, recentParticipations] = await Promise.all([
    DonationModel.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("campaign"),
    ParticipationModel.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("activity")
  ]);

  return (
    <div className="p-4">
      <PageTitle title='Dashboard' />
      <span className="my-5">
        <LinkButton title="Back to homepage" path="/" />
      </span>
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <DashboardCard
          cardTitle='Donations'
          description='Total number of donations'
          value={donationsCount.toString()}
          onClickPath="/profile/donations"
        />
        <DashboardCard
          cardTitle='Donated Amount'
          description='Total amount donated'
          value={`$${amountRaised.toLocaleString()}`}
        />
        <DashboardCard
          cardTitle='Activities'
          description='Activities participated in'
          value={participationsCount.toString()}
          onClickPath="/profile/activities"
        />
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold text-primary mb-4">Recent Donations</h2>
        <DonationsTable
          donations={JSON.parse(JSON.stringify(recentDonations))}
          pagination={false}
          fromAdmin={false}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-primary mb-4">Recent Activity Participations</h2>
        <UserParticipationsTable
          participations={JSON.parse(JSON.stringify(recentParticipations))}
          pagination={false}
        />
      </div>
    </div>
  )
}

export default DashboardPage