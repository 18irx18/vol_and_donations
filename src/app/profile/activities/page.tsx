import { connectDB } from '@/db/config';
import ParticipationModel from '@/models/participation-model';
import { getCurrentUserFromDB } from '@/actions/users';
import PageTitle from '@/components/page-title';
import UserParticipationsTable from '@/components/user-participations-table';
import LinkButton from '@/components/link-button';

export default async function UserParticipationsPage() {
  await connectDB();
  
  const mongoUser = await getCurrentUserFromDB();
  if (!mongoUser?.data?._id) {
    return <div>Please sign in to view your participations</div>;
  }

  const participations = await ParticipationModel.find({ 
    user: mongoUser.data._id 
  })
  .populate("activity")
  .sort({ createdAt: -1 });

  return (
    <div className="p-4">
      <PageTitle title="My Activity Participations" />
      <LinkButton title="Back to homepage" path="/" />
      <UserParticipationsTable
        participations={JSON.parse(JSON.stringify(participations))}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '25', '50', '100']
        }}
      />
    </div>
  );
}