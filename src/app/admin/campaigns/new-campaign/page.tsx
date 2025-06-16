import PageTitle from '@/components/page-title'
import React from 'react'
import CampaignForm from '../_components/campaign-form'

function NewCampaignPage() {
    return (
        <div>
            <PageTitle title="New campaign" />
            <CampaignForm />
        </div>
    )
}

export default NewCampaignPage