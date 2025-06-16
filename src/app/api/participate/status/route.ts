import { NextResponse } from 'next/server';
import { connectDB } from '@/db/config';
import ParticipationModel from '@/models/participation-model';
import { getCurrentUserFromDB } from '@/actions/users';
import ActivityModel from '@/models/activity-model';

export async function PUT(req: Request) {
  await connectDB();

  try {
    const mongoUser = await getCurrentUserFromDB();
    if (!mongoUser?.data?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { participationId, status } = await req.json();

    if (!participationId || !status) {
      return NextResponse.json(
        { error: 'Participation ID and status are required' },
        { status: 400 }
      );
    }

    const participation = await ParticipationModel.findById(participationId)
      .populate('activity')
      .exec();

    if (!participation) {
      return NextResponse.json(
        { error: 'Participation not found' },
        { status: 404 }
      );
    }

    const activity = await ActivityModel.findById(participation.activity);
    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    if (
      activity.createdBy.toString() !== mongoUser.data._id.toString() &&
      !mongoUser.data.isAdmin
    ) {
      return NextResponse.json(
        { error: 'Only organizer or admin can update status' },
        { status: 403 }
      );
    }

    const updatedParticipation = await ParticipationModel.findByIdAndUpdate(
      participationId,
      { status },
      { new: true }
    ).populate('user', 'userName email');

    return NextResponse.json(updatedParticipation);
  } catch (error) {
    console.error('Error updating participation status:', error);
    return NextResponse.json(
      { error: 'Failed to update participation status' },
      { status: 500 }
    );
  }
}