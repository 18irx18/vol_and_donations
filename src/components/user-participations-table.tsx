'use client';
import { Table, Tag, Button, message, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ActivityType, Participation } from '@/interfaces';
import { useState } from 'react';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

interface UserParticipationsTableProps {
  participations: Participation[];
  loading?: boolean;
  pagination?: any;
}

export default function UserParticipationsTable({ 
  participations, 
  loading = false, 
  pagination 
}: UserParticipationsTableProps) {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [actionLoading, setActionLoading] = useState(false);

  const handleCancelParticipation = async (participationId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/participate', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participationId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to cancel participation');
      }

      messageApi.success('Participation cancelled successfully');
      window.location.reload();
    } catch (error: any) {
      messageApi.error(error.message || 'Failed to cancel participation');
    } finally {
      setActionLoading(false);
    }
  };

  const columns: ColumnsType<Participation> = [
    {
      title: 'Activity',
      dataIndex: 'activity',
      key: 'activity',
      render: (activity: ActivityType) => (
        <span 
          className="text-blue-500 cursor-pointer hover:underline"
          onClick={() => router.push(`/activity/${activity._id}`)}
        >
          {activity.title}
        </span>
      ),
    },
    {
      title: 'Organizer',
      dataIndex: ['activity', 'organizer'],
      key: 'organizer',
    },
    {
      title: 'Categories',
      dataIndex: ['activity', 'category'],
      key: 'category',
      render: (categories: string[]) => (
        <>
          {categories.map(cat => (
            <Tag key={cat} color="blue">
              {cat}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusColors = {
          registered: 'blue',
          attended: 'green',
          cancelled: 'red',
        };
        const color = statusColors[status as keyof typeof statusColors] || 'gray';
        return <Tag color={color}>{status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}</Tag>;
      },
    },
    {
      title: 'Date',
      dataIndex: ['activity', 'date'],
      key: 'date',
      render: (date: string) => dayjs(date).format('MMMM DD, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Popconfirm
            title="Are you sure you want to cancel this participation?"
            onConfirm={() => handleCancelParticipation(record._id)}
            okText="Yes"
            cancelText="No"
            disabled={record.status === 'cancelled'}
          >
            <Button
              size="small"
              danger
              loading={actionLoading}
              disabled={record.status === 'cancelled' || actionLoading}
            >
              Cancel
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <Table
        columns={columns}
        dataSource={participations}
        rowKey="_id"
        loading={loading}
        pagination={pagination}
      />
    </>
  );
}