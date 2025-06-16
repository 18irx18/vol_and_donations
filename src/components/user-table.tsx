'use client'
import { Table } from 'antd'
import React from 'react'
import { UserType } from '@/interfaces'

interface UserWithStats extends UserType {
  totalDonations: number
  totalAmount: number
  totalParticipations: number
}

interface UsersTableProps {
  users: UserWithStats[]
  pagination?: any
}

function UsersTable({ users, pagination = {
  pageSize: 10,
  showSizeChanger: true,
  pageSizeOptions: ['10', '25', '50', '100']
} }: UsersTableProps) {
  const columns = [
    {
      title: 'Username',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      key: 'role',
      render: (_: any, record: UserWithStats) => (
        <span>{record.isAdmin ? 'Admin' : 'User'}</span>
      ),
    },
    {
      title: 'Total Donations',
      dataIndex: 'totalDonations',
      key: 'totalDonations',
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => <span>$ {amount}</span>
    },
    {
      title: 'Activity Participations',
      dataIndex: 'totalParticipations',
      key: 'totalParticipations',
    },
  ]

  return (
    <Table
      dataSource={users}
      columns={columns}
      rowKey="_id"
      pagination={pagination === undefined ? true : pagination}
    />
  )
}

export default UsersTable
