import { User } from "@clerk/nextjs/server";

export interface CampaignType {
    _id: string;
    name: string;
    description: string;
    organizer: string;
    targetAmount: number;
    collectedAmount: number;
    category: string[];
    startDate: string;
    endDate: string;
    isActive: boolean;
    showDonors: boolean;
    createdBy: UserType;
    createdAt: string;
    updatedAt: string;
    images?: string[];
    __v?: number;
}

export interface ActivityType {
    _id: string;
    title: string;
    description: string;
    organizer: string;
    category: string[];
    date: string;         
    time: string;         
    location: string;
    imageUrls?: string[];
    isActive: boolean;
    showParticipants: boolean;
    createdBy: UserType;
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

export interface Participation {
  _id: string;
  user: UserType;
  activity: string | ActivityType;
  phoneNumber: string;
  status: 'registered' | 'attended' | 'cancelled';
  registeredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserType {
    _id: string;
    userName: string;
    email: string;
    profilePic: string;
    isActive: boolean;
    isAdmin: boolean;
    clerkUserId: string;

}

export interface DonationType {
    _id: string;
    amount: number;
    paymentId: string;
    campaign: CampaignType;
    user: UserType;
    message: string;
}