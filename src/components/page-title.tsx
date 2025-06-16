import React from 'react'

function PageTitle({ title }: { title: string }) {
    return (
        <h1
            className='text-3xl font-semibold text-primary'>
            {title}
        </h1>
    )
}

export default PageTitle