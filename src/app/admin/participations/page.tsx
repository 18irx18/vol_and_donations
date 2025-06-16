import LinkButton from '@/components/link-button';
import ParticipantsTable from '../activities/_components/participants-table';
import PageTitle from '@/components/page-title';
import { connectDB } from '@/db/config';
import ParticipationModel from '@/models/participation-model';

connectDB();

async function ParticipationsPage() {
  const participations = await ParticipationModel.find({})
    .populate("user")
    .populate({
      path: "activity",
      // This ensures the query still works if activity is deleted
      options: { allowNull: true } 
    })
    .sort({ createdAt: -1 });

  return (
    <div>
      <PageTitle title="All Participations" />
      <LinkButton title="Back to homepage" path="/" />
      <ParticipantsTable 
        participants={JSON.parse(JSON.stringify(participations))}
        isAdmin={true}
      />
    </div>
  );
}

export default ParticipationsPage;