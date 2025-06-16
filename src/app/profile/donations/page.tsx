import { getCurrentUserFromDB } from '@/actions/users'
import DonationsTable from '@/components/donations-table'
import LinkButton from '@/components/link-button'
import PageTitle from '@/components/page-title'
import { connectDB } from '@/db/config'
import '@/models'
import CampaignModel from '@/models/campaign-model';
import DonationModel from '@/models/donation-model'
import React from 'react'


connectDB()

async function DonationsPage() {
  const mongoUser = await getCurrentUserFromDB();
  const donations = await DonationModel.find({ user: mongoUser.data._id })
  .populate("campaign").populate("user").sort({createdAt : -1});
  return (
    <div>
      <PageTitle title="Donations" />
      <LinkButton title="Back to homepage" path="/" />
      <DonationsTable
        donations={JSON.parse(JSON.stringify(donations))}
        fromAdmin={false} />
    </div>
  )
}

export default DonationsPage