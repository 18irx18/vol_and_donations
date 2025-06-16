'use client';
import React from 'react';
import { Table, Tag, Button, message, App, Popconfirm } from 'antd';
import { useRouter } from 'next/navigation';
import { deleteActivity } from '@/actions/activity';
import ActivityReportModal from './activity-report-modal';
import { ActivityType } from '@/interfaces';

interface Props {
  activities: ActivityType[];
  loading?: boolean;
  pagination?: any;
}

const ActivityTable = ({ activities, pagination = {
  pageSize: 10,
  showSizeChanger: true,
  pageSizeOptions: ['10', '25', '50', '100']
}, }: Props) => {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading = false, setLoading] = React.useState<boolean>(false);
  const [selectedActivity = null, setSelectedActivity] = React.useState<ActivityType | null>(null);
  const [showActivityReportModal = false, setShowActivityReportModal] = React.useState<boolean>(false);

  const onDelete = async (id: string) => {
    try {
      setLoading(true);
      const result = await deleteActivity(id);
      messageApi.success('Activity deleted successfully');
    } catch (error: any) {
      messageApi.error(error.message || 'Failed to delete activity');
    } finally { setLoading(false) }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: ActivityType) => (
        <span
          className="text-blue-500 cursor-pointer hover:underline"
          onClick={() => router.push(`/activity/${record._id}`)}
        >
          {title}
        </span>
      ),
    },
    {
      title: 'Organizer',
      dataIndex: 'organizer',
      key: 'organizer',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (categories: string[]) =>
        categories.map(cat => (
          <Tag key={cat} color="blue">
            {cat}
          </Tag>
        )),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => (date ? new Date(date).toLocaleDateString() : 'N/A'),
      sorter: (a: ActivityType, b: ActivityType) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Inactive'}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: ActivityType) => (
        <div className="flex gap-3">
          <Button
            onClick={() => {
              setSelectedActivity(record);
              setShowActivityReportModal(true)
            }}
            size="small">
            Report
          </Button>
          <Button
            size="small"
            onClick={() => router.push(`/admin/activities/edit-activity/${record._id}`)}
            icon={<i className="ri-pencil-line" />}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this activity?"
            onConfirm={() => onDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              size="small"
              danger
              icon={<i className="ri-delete-bin-6-line" />}
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <App>
      {contextHolder}
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={activities}
        loading={loading}
        pagination={pagination === undefined ? true : pagination}
      />

      {showActivityReportModal && <ActivityReportModal
        showActivityReportModal={showActivityReportModal}
        setShowActivityReportModal={setShowActivityReportModal}
        selectedActivity={selectedActivity} />}
    </App>
  );
};

export default ActivityTable;