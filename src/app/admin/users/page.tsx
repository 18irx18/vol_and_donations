import React from 'react'
import { connectDB } from '@/db/config'
import UserModel from '@/models/user-model'
import DonationModel from '@/models/donation-model'
import ParticipationModel from '@/models/participation-model'
import UsersTable from '@/components/user-table'
import PageTitle from '@/components/page-title'
import LinkButton from '@/components/link-button'

connectDB()

async function UsersPage() {
  const users = await UserModel.find()

  const [donationStats, participationStats] = await Promise.all([
    DonationModel.aggregate([
      {
        $group: {
          _id: '$user',
          totalDonations: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]),
    ParticipationModel.aggregate([
      {
        $group: {
          _id: '$user',
          totalParticipations: { $sum: 1 }
        }
      }
    ])
  ])

  const donationMap = new Map()
  donationStats.forEach(stat => {
    donationMap.set(stat._id.toString(), {
      totalDonations: stat.totalDonations,
      totalAmount: stat.totalAmount
    })
  })

  const participationMap = new Map()
  participationStats.forEach(stat => {
    participationMap.set(stat._id.toString(), stat.totalParticipations)
  })

  const usersWithStats = users.map(user => {
    const donations = donationMap.get(user._id.toString()) || {
      totalDonations: 0,
      totalAmount: 0
    }

    const participations = participationMap.get(user._id.toString()) || 0

    return {
      ...user.toObject(),
      _id: user._id.toString(),
      totalDonations: donations.totalDonations,
      totalAmount: donations.totalAmount,
      totalParticipations: participations
    }
  })

  return (
    <div>
      <PageTitle title="Users" />
      <LinkButton title="Back to homepage" path="/" />
      <UsersTable users={usersWithStats} />
    </div>
  )
}

export default UsersPage