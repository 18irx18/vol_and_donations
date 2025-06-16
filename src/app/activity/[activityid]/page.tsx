import { connectDB } from '@/db/config';
import ActivityModel from '@/models/activity-model';
import LinkButton from '@/components/link-button';
import { notFound } from 'next/navigation';
import ActivityImagesCarousel from '@/components/activity-image-carousel';
import JoinActivityCard from '@/components/join-activity-card';
import ParticipationModel from '@/models/participation-model';
import ParticipantsTable from '@/app/admin/activities/_components/participants-table';
import { getCurrentUserFromDB } from '@/actions/users';
import { isDataView } from 'util/types';

interface SingleActivityPageProps {
  params: {
    activityid: string;
  };
}

export default async function SingleActivityPage({ params }: SingleActivityPageProps) {
  await connectDB();

  const { activityid } = await params;

  const activity = await ActivityModel.findById(activityid)
    .populate('createdBy', 'userName')
    .lean();

  if (!activity) {
    notFound();
  }

  const currentUser = await getCurrentUserFromDB();
  const isAdmin = currentUser?.data?.isAdmin;


  const recentParticipants = await ParticipationModel.find({
    activity: activityid,
    status: { $ne: 'cancelled' },
  })
    .populate('user', 'userName email profilePic')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const allParticipants = await ParticipationModel.find({
    activity: activityid,
  })
    .populate('user', 'userName email profilePic')
    .sort({ createdAt: -1 })
    .lean();

  const getProperty = (key: string, value: any) => (
    <div className="flex flex-col">
      <span className="font-bold text-c2">{key}</span>
      <span className="font-bold text-c3">{value}</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <LinkButton title="Back to homepage" path="/" />

      <div className="flex flex-col space-y-1">
        <div className="flex flex-col space-y-4">
          <h1 className="text-2xl font-bold text-primary">{activity.title}</h1>
          <h2 className="text-xl font-semibold text-c2">
            Organizer: {activity.organizer}
          </h2>
          <ActivityImagesCarousel images={activity.imageUrls || []} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5 grid-cols-1 mt-2">
        <div className="col-span-2 flex flex-col gap-7">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {getProperty("Organizer", activity.organizer)}
            {getProperty("Date", new Date(activity.date).toLocaleDateString())}
            {getProperty("Time", activity.time)}
            {getProperty("Location", activity.location)}
            {getProperty("Categories", activity.category.join(", "))}
          </div>
          <p className="text-sm text-c2">{activity.description}</p>
        </div>

        <div className="col-span-1">
          <JoinActivityCard
            activity={JSON.parse(JSON.stringify(activity))}
            recentParticipants={JSON.parse(JSON.stringify(recentParticipants))}
            isAdmin={currentUser?.data?.isAdmin || false}
            currentUserId={currentUser?.data?._id.toString()}
          />
        </div>
      </div>

      {isAdmin && (
        <div className="mt-10">
          <h2 className="text-xl text-primary font-semibold mb-4">All Participants</h2>
          <ParticipantsTable
            participants={JSON.parse(JSON.stringify(allParticipants))}
            isAdmin={isAdmin
            }
          />
        </div>
      )}
    </div>
  );
}