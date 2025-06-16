'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Modal, message, Tag, Avatar, Form, Input } from 'antd';
import { UserOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { ActivityType, Participation } from '@/interfaces';
import { useUser } from '@clerk/nextjs';

interface JoinActivityCardProps {
  activity: ActivityType;
  recentParticipants: Participation[];
  currentUserId?: string;
  isAdmin: boolean;
}

export default function JoinActivityCard({
  activity,
  recentParticipants,
  currentUserId,
  isAdmin
}: JoinActivityCardProps) {
  const { user, isLoaded } = useUser();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [userParticipationId, setUserParticipationId] = useState<string | null>(null);
  const [checkingParticipation, setCheckingParticipation] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [showAllParticipants, setShowAllParticipants] = useState(false);

  useEffect(() => {
    const fetchParticipationStatus = async () => {
      if (!user || !isLoaded || !currentUserId) {
        setCheckingParticipation(false);
        return;
      }

      try {
        const res = await fetch(`/api/participate/check?activityId=${activity._id}&userId=${currentUserId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to check participation');

        setHasJoined(data.hasJoined);
        setUserParticipationId(data.participationId || null);
      } catch (error: any) {
        console.error('Error checking participation:', error);
        messageApi.error('Failed to load participation status');
      } finally {
        setCheckingParticipation(false);
      }
    };

    fetchParticipationStatus();
  }, [user, isLoaded, activity._id, currentUserId]);

  const handleJoin = async () => {
    try {
      const values = await form.validateFields();
      if (!currentUserId) {
        messageApi.error('Please sign in to join activities');
        return;
      }

      setLoading(true);

      const rawPhone = values.phoneNumber;
      const sanitizedPhone = rawPhone.startsWith('+')
        ? '+' + rawPhone.replace(/\D/g, '')
        : rawPhone.replace(/\D/g, '');
      const res = await fetch('/api/participate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId: activity._id,
          userId: currentUserId,
          phoneNumber: sanitizedPhone
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Something went wrong');
      }

      messageApi.success('You have successfully joined the activity!');
      setHasJoined(true);
      setUserParticipationId(data._id);
      setIsModalVisible(false);
      window.location.reload();
    } catch (error: any) {
      const errorMessage = error.message || error.toString();
      messageApi.error(`Error: ${errorMessage}`);
      console.error('Join error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelParticipation = async () => {
    if (!userParticipationId) {
      messageApi.error('Cannot cancel: participation ID not found. Please refresh the page.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/participate', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participationId: userParticipationId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel participation');

      messageApi.success('Your participation has been canceled.');
      setHasJoined(false);
      setUserParticipationId(null);
      window.location.reload();
    } catch (error: any) {
      messageApi.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (participationId: string, newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/participate/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participationId,
          status: newStatus,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      messageApi.success('Status updated successfully');
      window.location.reload();
    } catch (error) {
      messageApi.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Card
        title="Join this activity"
        className="shadow-md rounded-xl"
        extra={<span className="text-xs text-c3">{new Date(activity.date).toLocaleDateString()}</span>}
      >
        <div className="mb-4 text-c2">{activity.location}</div>

        {!isLoaded || checkingParticipation ? (
          <div>Loading...</div>
        ) : hasJoined ? (
          <div className="mb-6">
            <span className="text-primary mb-2">You have joined this activity.</span>
            <Button
              className="mt-6"
              danger
              block
              loading={loading}
              onClick={handleCancelParticipation}
            >
              Cancel Participation
            </Button>
          </div>
        ) : (
          <Button
            type="primary"
            block
            className="mb-6"
            onClick={() => setIsModalVisible(true)}
            disabled={!currentUserId}
          >
            {currentUserId ? 'Join as Volunteer' : 'Sign in to Join'}
          </Button>
        )}

        {activity.showParticipants && (
          <>
            <h3 className="text-base font-semibold mb-2">Recent Volunteers:</h3>
            <div className="flex flex-col gap-2">
              {recentParticipants.length > 0 ? (
                recentParticipants.slice(0, showAllParticipants ? undefined : 5).map((p) => (
                  <div key={p._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-c3">
                      <Avatar src={p.user.profilePic} icon={<UserOutlined />} size="small" />
                      <span>{p.user.userName}</span>
                      <Tag
                        color={
                          p.status === 'attended'
                            ? 'green'
                            : p.status === 'cancelled'
                              ? 'red'
                              : 'blue'
                        }
                        className="text-xs"
                      >
                        {p.status}
                      </Tag>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1">
                        <Button
                          size="small"
                          icon={<CheckOutlined />}
                          onClick={() => handleStatusChange(p._id, 'attended')}
                        />
                        <Button
                          size="small"
                          danger
                          icon={<CloseOutlined />}
                          onClick={() => handleStatusChange(p._id, 'cancelled')}
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-c3 text-sm">No volunteers yet.</div>
              )}
            </div>
            
            {recentParticipants.length > 5 && (
              <Button
                type="link"
                className="p-0 mt-2"
                onClick={() => setShowAllParticipants(!showAllParticipants)}
              >
                {showAllParticipants ? 'Show less' : 'View all'}
              </Button>
            )}
          </>
        )}
      </Card>

      <Modal
        title="Confirm Participation"
        open={isModalVisible}
        onOk={handleJoin}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={loading}
        okText="Confirm"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <p>Do you want to join this activity as a volunteer?</p>
          <p><strong>Activity:</strong> {activity.title}</p>
          <p><strong>Date:</strong> {new Date(activity.date).toLocaleDateString()}</p>
          <p><strong>Location:</strong> {activity.location}</p>

          <Form.Item
            name="phoneNumber"
            label="Phone Number"
            rules={[
              { required: true, message: 'Please input your phone number!' },
              { pattern: /^\+?[0-9]{10,15}$/, message: 'Please enter a valid phone number!' }
            ]}
          >
            <Input placeholder="Enter your phone number"
              type="tel" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}