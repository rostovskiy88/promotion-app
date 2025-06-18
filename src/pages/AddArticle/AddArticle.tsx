import React, { useState } from 'react';
import { Card, Form, Input, Button, Upload, Col, Select, App as AntdApp } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { addArticle } from '../../services/articleService';
import { uploadImage, validateImageFile, generateImagePath } from '../../services/imageService';
import styles from './AddArticle.module.css';
import { useAuth } from '../../hooks/useRedux';

const categories = ['Productivity', 'Media', 'Business'];

interface ArticleFormValues {
  title: string;
  content: string;
  category: string;
}

const AddArticle: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { message } = AntdApp.useApp();

  const handleFinish = async (values: ArticleFormValues) => {
    if (!user) {
      message.error('You must be logged in to create an article');
      return;
    }

    try {
      setLoading(true);

      let imageUrl = '';

      // Handle image upload if image is provided
      if (imageFile) {
        try {
          console.log('Uploading image:', imageFile.name);
          // Generate a proper path for the image
          const imagePath = generateImagePath(user.uid, imageFile.name, 'articles');
          imageUrl = await uploadImage(imageFile, imagePath);
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          message.warning('Article created without image due to upload error');
        }
      }
      // Set default image if none provided
      if (!imageUrl) {
        imageUrl = '/default-article-cover.png';
      }

      // Add article to Firestore
      await addArticle({
        title: values.title,
        content: values.content,
        category: values.category,
        authorName: user.displayName || user.email || 'Unknown',
        authorId: user.uid,
        authorAvatar: user.photoURL || '',
        imageUrl,
      });

      message.success('Article created successfully!');
      navigate('/dashboard');
    } catch (error: unknown) {
      console.error('Error creating article:', error);
      message.error(error instanceof Error ? error.message : 'Failed to create article');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate the file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      message.error(validation.error);
      return false;
    }

    setImageFile(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    message.success(`${file.name} selected successfully`);
    return false; // Prevent auto upload
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    message.info('Image removed');
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customRequest = ({ onSuccess }: any) => {
    // For Ant Design Upload component - just call onSuccess immediately
    setTimeout(() => {
      onSuccess?.();
    }, 0);
  };

  return (
    <div className={styles.container}>
      <Col>
        <Card className={styles.card}>
          <div className={styles.header}>Add new article</div>

          <Form form={form} layout='vertical' requiredMark={false} onFinish={handleFinish}>
            <Form.Item
              label='Category'
              name='category'
              rules={[{ required: true, message: 'Please select a category' }]}
            >
              <Select placeholder='Select category' size='large' className={styles.select}>
                {categories.map(cat => (
                  <Select.Option key={cat} value={cat}>
                    {cat}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label='Title' name='title' rules={[{ required: true, message: 'Please enter a title' }]}>
              <Input placeholder='Enter your title' size='large' className={styles.input} />
            </Form.Item>
            <Form.Item
              label='Text'
              name='content'
              rules={[{ required: true, message: 'Please enter article content' }]}
            >
              <Input.TextArea placeholder='Enter your text copy' rows={6} className={styles.input} />
            </Form.Item>

            <div className={styles.coverLabel}>
              Add cover photo (optional)
              {imageFile && (
                <Button
                  type='link'
                  icon={<DeleteOutlined />}
                  onClick={handleRemoveImage}
                  size='small'
                  style={{ marginLeft: '10px', color: '#ff4d4f' }}
                >
                  Remove
                </Button>
              )}
            </div>

            <Form.Item>
              {/* Image Preview */}
              {imagePreview && (
                <div style={{ marginBottom: '16px' }}>
                  <img
                    src={imagePreview}
                    alt='Preview'
                    style={{
                      width: '100%',
                      maxHeight: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #d9d9d9',
                    }}
                  />
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#666',
                      marginTop: '4px',
                    }}
                  >
                    Selected: {imageFile?.name}
                  </div>
                </div>
              )}

              <Upload.Dragger
                name='cover'
                accept='.jpg,.jpeg,.png'
                showUploadList={false}
                customRequest={customRequest}
                beforeUpload={handleFileSelect}
                className={styles.uploadDragger}
              >
                <div className={styles.uploadContent}>
                  <UploadOutlined className={styles.uploadIcon} />
                  <div className={styles.uploadHint}>
                    Drag and drop file below
                    <br />
                    <span className={styles.uploadLink}>You can also upload files by clicking here</span>
                    <br />
                    <span className={styles.fileType}>.JPG .PNG (Max 5MB)</span>
                  </div>
                </div>
              </Upload.Dragger>
            </Form.Item>

            <Form.Item className={styles.formFooter}>
              <Button onClick={onCancel} className={styles.cancelButton} disabled={loading}>
                Cancel
              </Button>
              <Button type='primary' htmlType='submit' loading={loading}>
                Publish
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </div>
  );
};

export default AddArticle;
