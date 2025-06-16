'use client';
import { Table, Tag, Button, message, Popconfirm, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Participation, ActivityType } from '@/interfaces';
import { useState } from 'react';
import { UserOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

interface ParticipantsTableProps {
  participants: Participation[];
  pagination?: any,
  isAdmin: boolean;
}

export default function ParticipantsTable({ participants, isAdmin, pagination = {
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '25', '50', '100']
    } }: ParticipantsTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleStatusChange = async (participationId: string, newStatus: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/participate/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participationId, status: newStatus }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to update status');
      }

      messageApi.success('Status updated successfully');
      window.location.reload();
    } catch (error: any) {
      const errorMessage = error.message || error.toString();
      messageApi.error(`Error: ${errorMessage}`);
      console.error('Status change error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivityClick = (activityId: string | undefined) => {
    if (!activityId) {
      messageApi.warning('Activity not found');
      return;
    }
    router.push(`/activity/${activityId}`);
  };

  const columns: ColumnsType<Participation> = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (user: any) => (
        <div className="flex items-center gap-2">
          <UserOutlined />
          <span>{user?.userName || 'Unknown'}</span>
        </div>
      ),
    },
    {
      title: 'Activity',
      dataIndex: 'activity',
      key: 'activity',
      render: (activity: ActivityType | undefined) => (
        <span 
          className={`${activity?._id ? 'text-blue-500 cursor-pointer hover:underline' : 'text-gray-500'}`}
          onClick={() => handleActivityClick(activity?._id)}
        >
          {activity?.title || 'Deleted Activity'}
        </span>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div className="flex flex-col">
          <span>{record.user?.email}</span>
          <span className="text-xs text-gray-500">
            {record.phoneNumber?.startsWith('+') ? record.phoneNumber : `+${record.phoneNumber}`}
          </span>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
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
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('MMMM D, YYYY h:mm A')}>
          <div className="flex items-center gap-1">
            <CalendarOutlined />
            <span>{dayjs(date).format('MMM D, YYYY')}</span>
          </div>
        </Tooltip>
      ),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
  ];

  if (isAdmin) {
    columns.push({
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            size="small"
            type={record.status === 'registered' ? 'primary' : 'default'}
            disabled={record.status === 'registered'}
            onClick={() => handleStatusChange(record._id, 'registered')}
          >
            Registered
          </Button>
          <Button
            size="small"
            type={record.status === 'attended' ? 'primary' : 'default'}
            disabled={record.status === 'attended'}
            onClick={() => handleStatusChange(record._id, 'attended')}
          >
            Attended
          </Button>
          <Popconfirm
            title="Are you sure to cancel this participation?"
            onConfirm={() => handleStatusChange(record._id, 'cancelled')}
            okText="Yes"
            cancelText="No"
          >
            <Button
              size="small"
              danger
              disabled={record.status === 'cancelled'}
            >
              Cancel
            </Button>
          </Popconfirm>
        </div>
      ),
    });
  }

  return (
    <>
      {contextHolder}
      <Table
        columns={columns}
        dataSource={participants}
        rowKey="_id"
        loading={loading}
        pagination={pagination === undefined ? true : pagination}
        scroll={{ x: 1300 }}
      />
    </>
  );
}