"use client";

import React, { useState } from 'react';
import { Button, DatePicker, Form, Input, message, Select, Switch, Upload } from 'antd';
import { addNewCampaign, updateCampaign } from '@/actions/campaigns';
import { PlusOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';

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

function CampaignForm({ initialData, isEditForm = false }: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const [isActive, setIsActive] = React.useState(initialData?.isActive || false);
  const [showDonors, setShowDonors] = React.useState(initialData?.showDonors || false);
  const [messageApi, contextHolder] = message.useMessage();
  const [fileList, setFileList] = useState<any[]>(initialData?.images?.map((url: string, i: number) => ({
    uid: i.toString(),
    name: `image-${i}.jpg`,
    status: "done",
    url,
  })) || []);


  const validateDates = (_: any, value: string) => {
    const startDate = form.getFieldValue('startDate');
    const endDate = form.getFieldValue('endDate');

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return Promise.reject('End date must be after start date');
    }

    return Promise.resolve();
  };

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
          f.uid === file.uid
            ? { ...f, status: "done", url: data.url }
            : f
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


  React.useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        targetAmount: initialData.targetAmount?.toString(),
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().substring(0, 10) : undefined,
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().substring(0, 10) : undefined,
        category: initialData.category || [],
      });
      setIsActive(initialData.isActive || false);
      setShowDonors(initialData.showDonors || false);
    }
  }, [initialData, form]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      values.isActive = isActive;
      values.showDonors = showDonors;
      values.targetAmount = Number(values.targetAmount);
      values.images = fileList
        .filter(f => f.status === "done" && f.url)
        .map(f => f.url);

      if (isEditForm) {
        const response = await updateCampaign({ _id: initialData._id, ...values });
        messageApi.success(response.message);
      } else {
        const response = await addNewCampaign(values);
        if (response?.error) throw new Error(response.error);
        messageApi.success(response.message);
        form.resetFields();
        setIsActive(false);
        setShowDonors(false);
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
    setShowDonors(false);
  };

  return (
    <>
      {contextHolder}
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
          <div className="lg:col-span-3">
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please, input a name" }]}
            >
              <Input />
            </Form.Item>
          </div>

          <div className="lg:col-span-3">
            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: "Please, input a description" }]}
            >
              <TextArea
                rows={4}
                style={{ whiteSpace: 'pre-wrap' }} />
            </Form.Item>
          </div>

          <Form.Item
            label="Organizer"
            name="organizer"
            rules={[{ required: true, message: "Please, input an organizer" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Target amount"
            name="targetAmount"
            rules={[{ required: true, message: "Please, input the target amount" }]}
          >
            <Input type="number" min={0} />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: "Please, select a category" },
            { validator: validateDates }
            ]}
          >
            <Select mode="multiple" options={categories} />
          </Form.Item>

          <Form.Item
            label="Start date"
            name="startDate"
            rules={[{ required: true, message: "Please, input the start date" }]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item label="End date" name="endDate">
            <Input type="date" />
          </Form.Item>

          <div className="col-span-1" />

          <div className="col-span-1 flex justify-center items-center gap-5 rounded-xl bg-white border-3 border-c4 border-solid px-4 py-2">
            <span className="text-sm font-medium">Is active</span>
            <Switch checked={isActive} onChange={setIsActive} />
          </div>

          <div className="col-span-1 flex justify-center items-center gap-5 rounded-xl bg-white border-3 border-c4 border-solid px-4 py-2">
            <span className="text-sm font-medium">Show donors of campaign</span>
            <Switch checked={showDonors} onChange={setShowDonors} />
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
            setFileList((prev) => prev.filter(f => f.uid !== file.uid));
          }}
        >
          {fileList.length >= 5 ? null : <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>}
        </Upload>


        <div className="flex justify-end mt-5 gap-5">
          <Button className="w-32" onClick={onCancel}>Cancel</Button>
          <Button className="w-32" type="primary" htmlType="submit" loading={loading}>
            {isEditForm ? "Save" : "Create"}
          </Button>
        </div>
      </Form>
    </>
  );
}

export default CampaignForm;
