'use client'
import { Button, Input, Select } from 'antd'
import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const options = [
  { label: "All", value: "" },
  { value: "medical", label: "Medical" },
  { value: "military", label: "Military" },
  { value: "emergency", label: "Emergency" },
  { value: "environment and animals", label: "Environment and animals" },
  { value: "education and science", label: "Education and Science" },
  { value: "social help", label: "Social Help" },
  { value: "sport and culture", label: "Sport and Culture" },
  { value: "others", label: "Others" },
]

function Filters() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [category, setCategory] = React.useState<string>(searchParams.get("camp_category") || "")
  const [organizer, setOrganizer] = React.useState<string>(searchParams.get("camp_organizer") || "")
  const [name, setName] = React.useState<string>(searchParams.get("camp_name") || "")

  const updateURL = () => {
    const params = new URLSearchParams(Array.from(searchParams.entries()))

    params.set("camp_category", category)
    params.set("camp_organizer", organizer)
    params.set("camp_name", name)

    router.push("?" + params.toString())
  }

  const resetFilters = () => {
    const params = new URLSearchParams(Array.from(searchParams.entries()))
    params.delete("camp_category")
    params.delete("camp_organizer")
    params.delete("camp_name")

    setCategory("")
    setOrganizer("")
    setName("")
    router.push("?" + params.toString())
  }

  return (
    <div className="w-full px-4 lg:px-12 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-end">
        <div className="flex flex-col">
          <label className="text-base font-medium text-primary mb-2">Campaign Category</label>
          <Select
            value={category}
            options={options}
            onChange={setCategory}
            placeholder="Select category"
            allowClear
          />
        </div>

        <div className="flex flex-col">
          <label className="text-base font-medium text-primary mb-2">Campaign Name</label>
          <Input
            placeholder="Search by name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-base font-medium text-primary mb-2">Organizer</label>
          <Input
            placeholder="Search by organizer"
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
          />
        </div>

        <div className="flex gap-3 mt-2 lg:mt-6">
          <Button type="primary" onClick={updateURL}>Search</Button>
          <Button onClick={resetFilters}>Reset</Button>
        </div>
      </div>
    </div>
  )
}

export default Filters
