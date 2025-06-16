import React from 'react';
import PageTitle from '@/components/page-title';
import ActivityForm from '../_components/activity-form';

function NewActivityPage() {
  return (
    <div>
      <PageTitle title="New Activity" />
      <ActivityForm />
    </div>
  );
}

export default NewActivityPage;
