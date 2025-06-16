import { NextResponse } from 'next/server';
import { connectDB } from '@/db/config';
import { getCurrentUserFromDB } from '@/actions/users';
import ParticipationModel from '@/models/participation-model';

export async function GET(req: Request) {
  await connectDB();

  const mongoUser = await getCurrentUserFromDB();
  if (!mongoUser?.data?._id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const activityId = searchParams.get('activityId');

  if (!activityId) {
    return NextResponse.json({ error: 'Activity ID is required' }, { status: 400 });
  }

  const existing = await ParticipationModel.findOne({
    user: mongoUser.data._id,
    activity: activityId,
    status: { $ne: 'cancelled' }
  });

  return NextResponse.json({ 
    hasJoined: Boolean(existing),
    participationId: existing ? existing._id : null 
  });
}