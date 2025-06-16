"use client";

import React, { useState, useEffect } from "react";
import { Button, Form, Input, message, Select, Switch, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { addNewActivity, updateActivity } from "@/actions/activity";


const { TextArea } = Input;

const categories = [
  { value: "medical", label: "Medical" },
  { value: "military", label: "Military" },
  { value: "emergency", label: "Emergency" },
  { value: "environment and animals", label: "Environment and animals" },
  { value: "education and science", label: "Education and science" },
  { value: "social help", label: "Social help" },
  { value: "sport and culture", label: "Sport and culture" },
  { value: "others", label: "Others" },
];

interface Props {
  initialData?: any;
  isEditForm?: boolean;
}

function VolunteerActivityForm({ initialData, isEditForm = false }: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(initialData?.isActive || false);
  const [showParticipants, setShowParticipants] = useState(initialData?.showParticipants ?? true);
  const [messageApi, contextHolder] = message.useMessage();
  const [fileList, setFileList] = useState<any[]>(
    initialData?.imageUrls?.map((url: string, i: number) => ({
      uid: i.toString(),
      name: `image-${i}.jpg`,
      status: "done",
      url,
    })) || []
  );

  const handleUploadImages = async ({ file, onSuccess, onError }: any) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      onSuccess(null, file);

      setFileList((prev) =>
        prev.map((f) =>
          f.uid === file.uid ? { ...f, status: "done", url: data.url } : f
        )
      );
    } catch (error) {
      messageApi.error("Upload failed");
      onError(error);
    }
  };

  const handleChangeImages = ({ fileList }: any) => {
    setFileList(fileList);
  };

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        category: initialData.category || [],
        date: initialData.date
          ? new Date(initialData.date).toISOString().substring(0, 10)
          : undefined,
      });
      setIsActive(initialData.isActive || false);
      setShowParticipants(initialData.showParticipants ?? true);
    }
  }, [initialData, form]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      values.isActive = isActive;
      values.showParticipants = showParticipants;
      values.imageUrls = fileList
        .filter((f) => f.status === "done" && f.url)
        .map((f) => f.url);

      if (isEditForm) {
        const response = await updateActivity({ _id: initialData._id, ...values });
        messageApi.success(response.message);
      } else {
        const response = await addNewActivity(values);
        if (response?.error) throw new Error(response.error);
        messageApi.success(response.message);
        form.resetFields();
        setIsActive(false);
        setFileList([]);
      }
    } catch (error: any) {
      messageApi.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    form.resetFields();
    setIsActive(false);
  };

  return (
    <>
      {contextHolder}
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
          <div className="lg:col-span-3">
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: "Please input a title" }]}
            >
              <Input />
            </Form.Item>
          </div>

          <div className="lg:col-span-3">
            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: "Please input a description" }]}
            >
              <TextArea />
            </Form.Item>
          </div>

          <Form.Item
            label="Organizer"
            name="organizer"
            rules={[{ required: true, message: "Please input an organizer" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: "Please input the date" }]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item
            label="Time"
            name="time"
            rules={[{ required: true, message: "Please input the time" }]}
          >
            <Input type="time" />
          </Form.Item>

          <Form.Item
            label="Location"
            name="location"
            rules={[{ required: true, message: "Please input the location" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select mode="multiple" options={categories} />
          </Form.Item>

          <div className="col-span-1 flex justify-center items-center gap-5 rounded-xl bg-white border-3 border-c4 border-solid px-4 py-2">
            <span className="text-sm font-medium">Is active</span>
            <Switch checked={isActive} onChange={setIsActive} />
          </div>

          <div className="col-span-1 flex justify-center items-center gap-5 rounded-xl bg-white border-3 border-c4 border-solid px-4 py-2">
            <span className="text-sm font-medium">Show participants</span>
            <Switch checked={showParticipants} onChange={setShowParticipants} />
          </div>
        </div>

        <Upload
          className="mt-5"
          customRequest={handleUploadImages}
          listType="picture-card"
          fileList={fileList}
          onChange={handleChangeImages}
          multiple
          accept="image/*"
          maxCount={5}
          onRemove={(file) => {
            setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
          }}
        >
          {fileList.length >= 5 ? null : (
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          )}
        </Upload>

        <div className="flex justify-end mt-5 gap-5">
          <Button className="w-32" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="w-32" type="primary" htmlType="submit" loading={loading}>
            {isEditForm ? "Save" : "Create"}
          </Button>
        </div>
      </Form>
    </>
  );
}

export default VolunteerActivityForm;
