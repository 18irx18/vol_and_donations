import { Suspense } from 'react';
import Filters from '@/components/filters';
import ActivityFilters from '@/components/activity-filters';
import CampaignCardsCarousel from '@/components/campaign-cards-carousel';
import ActivityCardsCarousel from '@/components/activity-cards-carousel';
import { getFilteredCampaigns, getFilteredActivities } from '@/utils/fetch-data';

export const dynamic = 'force-dynamic';

export default async function Home(
  props: { searchParams: Promise<Record<string, string | string[] | undefined>> }
) {
  const searchParams = await props.searchParams;
  const [campaigns, activities] = await Promise.all([
    getFilteredCampaigns(searchParams),
    getFilteredActivities(searchParams),
  ]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        <Filters />
        <CampaignCardsCarousel campaigns={JSON.parse(JSON.stringify(campaigns))} />
        <ActivityFilters />
        <ActivityCardsCarousel activities={JSON.parse(JSON.stringify(activities))} />
      </div>
    </Suspense>
  );
}