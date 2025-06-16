import CampaignModel from '@/models/campaign-model';
import ActivityModel from '@/models/activity-model';
import { FilterQuery } from 'mongoose';

type SearchParams = Record<string, string | string[] | undefined>;

const getParam = (param: string | string[] | undefined): string | undefined => {
  if (!param) return undefined;
  return Array.isArray(param) ? param[0] : param;
};

export async function getFilteredCampaigns(searchParams: Promise<SearchParams> | SearchParams) {
  const resolvedParams = searchParams instanceof Promise ? await searchParams : searchParams;
  
  const filters: FilterQuery<any> = { isActive: true };

  const category = getParam(resolvedParams.camp_category);
  if (category) filters.category = category;

  const organizer = getParam(resolvedParams.camp_organizer);
  if (organizer) filters.organizer = { $regex: organizer, $options: 'i' };

  const name = getParam(resolvedParams.camp_name);
  if (name) filters.name = { $regex: name, $options: 'i' };

  return CampaignModel.find(filters).sort({ createdAt: -1 });
}

export async function getFilteredActivities(searchParams: Promise<SearchParams> | SearchParams) {
  const resolvedParams = searchParams instanceof Promise ? await searchParams : searchParams;
  
  const filters: FilterQuery<any> = { isActive: true };

  const category = getParam(resolvedParams.act_category);
  if (category) filters.category = category;

  const organizer = getParam(resolvedParams.act_organizer);
  if (organizer) filters.organizer = { $regex: organizer, $options: 'i' };

  const title = getParam(resolvedParams.act_title);
  if (title) filters.title = { $regex: title, $options: 'i' };

  return ActivityModel.find(filters).sort({ createdAt: -1 });
}