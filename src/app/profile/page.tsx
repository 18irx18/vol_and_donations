import React from 'react'
import { UserButton } from '@clerk/nextjs'

function ProfilePage() {
  return (
    <div>
      <h1>Profile Page</h1>
      <UserButton />
    </div>
  )
}

export default ProfilePage