import PageTitle from '@/components/page-title';
import LinkButton from '@/components/link-button';
import React from 'react';
import ActivityModel from '@/models/activity-model'; 
import { connectDB } from '@/db/config';
import { ActivityType } from '@/interfaces/index';
import ActivityTable from './_components/activity-table';

export default async function ActivitiesPage() {
  await connectDB();
  const rawActivities = await ActivityModel.find().sort({ createdAt: -1 });

  const activities: ActivityType[] = JSON.parse(JSON.stringify(rawActivities));

  return (
    <div>
      <div className="flex justify-between items-center">
        <PageTitle title="Activities" />
        <LinkButton title="Create activity" path="/admin/activities/new-activity" />
      </div>
      <LinkButton title="Back to homepage" path="/" />
      <ActivityTable activities={activities} />
    </div>
  );
}
