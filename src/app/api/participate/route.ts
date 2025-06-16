import { NextResponse } from 'next/server';
import { connectDB } from '@/db/config';
import { getCurrentUserFromDB } from '@/actions/users';
import ParticipationModel from '@/models/participation-model';
import mongoose from 'mongoose';

type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

const createResponse = <T>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> => {
  return NextResponse.json({ success, data, error, message }, { status });
};

const processPhoneNumber = (phone: string): { valid: boolean; processed: string; error?: string } => {
  let processed = phone.startsWith('+')
    ? '+' + phone.replace(/[^\d]/g, '')
    : phone.replace(/[^\d]/g, '');


  const digitLength = processed.startsWith('+')
    ? processed.length - 1
    : processed.length;

  if (digitLength < 10 || digitLength > 15) {
    return {
      valid: false,
      processed,
      error: 'Phone number must be 10-15 digits (excluding + prefix)'
    };
  }

  return {
    valid: true,
    processed
  };
};

export async function POST(req: Request) {
  try {
    await connectDB();

    const mongoUser = await getCurrentUserFromDB();
    if (!mongoUser?.data?._id) {
      return createResponse(
        false,
        null,
        'UNAUTHORIZED',
        'User authentication required',
        401
      );
    }

    const userId = new mongoose.Types.ObjectId(mongoUser.data._id);
    const { activityId, phoneNumber: rawPhoneNumber } = await req.json();

    if (!activityId) {
      return createResponse(
        false,
        null,
        'MISSING_ACTIVITY_ID',
        'Activity ID is required',
        400
      );
    }

    if (!rawPhoneNumber) {
      return createResponse(
        false,
        null,
        'MISSING_PHONE_NUMBER',
        'Phone number is required',
        400
      );
    }

    const { valid, processed: phoneNumber, error } = processPhoneNumber(rawPhoneNumber);
    if (!valid) {
      return createResponse(
        false,
        null,
        'INVALID_PHONE_NUMBER',
        error || 'Invalid phone number format',
        400
      );
    }

    const existing = await ParticipationModel.findOne({
      user: userId,
      activity: activityId,
    });

    if (existing) {
      if (existing.status === 'cancelled') {
        existing.status = 'registered';
        existing.phoneNumber = phoneNumber;
        await existing.save();
        return createResponse(
          true,
          existing,
          undefined,
          'Participation reactivated'
        );
      }
      return createResponse(
        false,
        null,
        'ALREADY_PARTICIPATING',
        'User has already joined this activity',
        409
      );
    }

    const participation = await ParticipationModel.create({
      user: userId,
      activity: activityId,
      phoneNumber,
      status: 'registered',
    });

    return createResponse(
      true,
      participation,
      undefined,
      'Participation created successfully'
    );
  } catch (error) {
    console.error('Participation creation error:', error);
    return createResponse(
      false,
      null,
      'SERVER_ERROR',
      'An unexpected error occurred',
      500
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();

    const mongoUser = await getCurrentUserFromDB();
    if (!mongoUser?.data?._id) {
      return createResponse(
        false,
        null,
        'UNAUTHORIZED',
        'User authentication required',
        401
      );
    }

    const { participationId } = await req.json();

    if (!participationId) {
      return createResponse(
        false,
        null,
        'MISSING_PARTICIPATION_ID',
        'Participation ID is required',
        400
      );
    }

    const result = await ParticipationModel.findOneAndUpdate(
      { _id: participationId, user: mongoUser.data._id },
      { status: 'cancelled' },
      { new: true }
    );

    if (!result) {
      return createResponse(
        false,
        null,
        'NOT_FOUND',
        'Participation not found or unauthorized',
        404
      );
    }

    return createResponse(
      true,
      result,
      undefined,
      'Participation cancelled successfully'
    );
  } catch (error) {
    console.error('Participation cancellation error:', error);
    return createResponse(
      false,
      null,
      'SERVER_ERROR',
      'An unexpected error occurred',
      500
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();

    const mongoUser = await getCurrentUserFromDB();
    if (!mongoUser?.data?._id) {
      return createResponse(
        false,
        null,
        'UNAUTHORIZED',
        'User authentication required',
        401
      );
    }

    const { participationId, status } = await req.json();

    if (!participationId || !status) {
      return createResponse(
        false,
        null,
        'MISSING_PARAMETERS',
        'Participation ID and status are required',
        400
      );
    }

    if (!['registered', 'attended', 'cancelled'].includes(status)) {
      return createResponse(
        false,
        null,
        'INVALID_STATUS',
        'Invalid participation status',
        400
      );
    }

    const updatedParticipation = await ParticipationModel.findOneAndUpdate(
      { _id: participationId },
      { status },
      { new: true }
    );

    if (!updatedParticipation) {
      return createResponse(
        false,
        null,
        'NOT_FOUND',
        'Participation not found',
        404
      );
    }

    return createResponse(
      true,
      updatedParticipation,
      undefined,
      'Participation status updated successfully'
    );
  } catch (error) {
    console.error('Status update error:', error);
    return createResponse(
      false,
      null,
      'SERVER_ERROR',
      'An unexpected error occurred',
      500
    );
  }
}