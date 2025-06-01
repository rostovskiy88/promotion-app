import React, { useState } from 'react';
import { Card, Form, Input, Button, Upload, Col, Select, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useFirestoreUser } from '../../hooks/useFirestoreUser';
import { addArticle } from '../../services/articleService';
import styles from './AddArticle.module.css';

const categories = ['Productivity', 'Media', 'Business'];

const AddArticle: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const firestoreUser = useFirestoreUser();

  const handleFinish = async (values: any) => {
    if (!firestoreUser) {
      message.error('User information not found');
      return;
    }

    setLoading(true);
    try {
      const articleData = {
        title: values.title,
        content: values.text,
        category: values.category,
        authorId: firestoreUser.uid,
        authorName: `${firestoreUser.firstName} ${firestoreUser.lastName}`,
        authorAvatar: firestoreUser.avatarUrl || '',
        imageUrl: imageFile ? URL.createObjectURL(imageFile) : '/default-article-cover.png',
      };

      await addArticle(articleData);
      message.success('Article created successfully!');
      navigate('/dashboard');
    } catch (error) {
      message.error('Failed to create article');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (info: any) => {
    if (info.file.status === 'done') {
      setImageFile(info.file.originFileObj);
    }
  };

  return (
    <div className={styles.container}>
      <Col>
        <Card className={styles.card}>
          <div className={styles.header}>Add new article</div>
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={handleFinish}
          >
            <Form.Item label="Category" name="category" rules={[{ required: true, message: 'Please select a category' }]}> 
              <Select placeholder="Select category" size="large" className={styles.select}>
                {categories.map(cat => (
                  <Select.Option key={cat} value={cat}>{cat}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Please enter a title' }]}>
              <Input placeholder="Enter your title" size="large" className={styles.input} />
            </Form.Item>
            <Form.Item label="Text" name="text" rules={[{ required: true, message: 'Please enter article content' }]}>
              <Input.TextArea placeholder="Enter your text copy" rows={6} className={styles.input} />
            </Form.Item>
            <div className={styles.coverLabel}>Add cover photo</div>
            <Form.Item>
              <Upload.Dragger
                name="cover"
                accept=".jpg,.png"
                showUploadList={false}
                beforeUpload={file => {
                  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                  if (!isJpgOrPng) {
                    message.error('You can only upload JPG/PNG files!');
                    return Upload.LIST_IGNORE;
                  }
                  return false; // Prevent auto upload
                }}
                onChange={handleImageChange}
                className={styles.uploadDragger}
              >
                <div className={styles.uploadContent}>
                  <UploadOutlined className={styles.uploadIcon} />
                  <div className={styles.uploadHint}>
                    Drag and drop file below<br />
                    <span className={styles.uploadLink}>You can also upload files by clicking here</span><br />
                    <span className={styles.fileType}>.JPG .PNG</span>
                  </div>
                </div>
              </Upload.Dragger>
            </Form.Item>
            <Form.Item className={styles.formFooter}>
              <Button onClick={onCancel} className={styles.cancelButton}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>Publish</Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </div>
  );
};

export default AddArticle; 
