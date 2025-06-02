import React, { useState } from 'react';
import { Card, Form, Input, Button, Upload, Col, Select, message, Progress } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUserDisplayInfo } from '../../hooks/useUserDisplayInfo';
import { addArticle } from '../../services/articleService';
import { uploadImage, validateImageFile, generateImagePath } from '../../services/imageService';
import styles from './AddArticle.module.css';

const categories = ['Productivity', 'Media', 'Business'];

const AddArticle: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const userDisplayInfo = useUserDisplayInfo();

  const handleFinish = async (values: any) => {
    if (!userDisplayInfo.isAuthenticated || !userDisplayInfo.firestoreUser?.uid) {
      message.error('User information not found');
      return;
    }

    // Validate required form values
    if (!values.title || !values.text || !values.category) {
      message.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const articleData = {
        title: values.title as string,
        content: values.text as string,
        category: values.category as string,
        authorId: userDisplayInfo.firestoreUser.uid,
        authorName: userDisplayInfo.displayName || 'Unknown Author',
        authorAvatar: userDisplayInfo.avatarUrl || '',
        imageUrl: '/default-article-cover.png', // Default image
      };

      // Upload image if one was selected
      if (imageFile) {
        setIsUploading(true);
        try {
          console.log('Starting image upload process...');
          const imagePath = generateImagePath(userDisplayInfo.firestoreUser.uid, imageFile.name);
          const imageUrl = await uploadImage(imageFile, imagePath);
          articleData.imageUrl = imageUrl;
          message.success('Image uploaded successfully!');
        } catch (error: any) {
          console.error('Image upload failed:', error);
          message.error(`Failed to upload image: ${error.message}`);
          return; // Don't proceed with article creation if image upload fails
        } finally {
          setIsUploading(false);
        }
      }

      console.log('Creating article with data:', articleData);
      await addArticle(articleData);
      message.success('Article created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Article creation failed:', error);
      message.error(`Failed to create article: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
      setIsUploading(false); // Ensure uploading state is reset
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

  const customRequest = ({ file, onSuccess }: any) => {
    // Handle the file selection
    const isValid = handleFileSelect(file);
    if (isValid === false) {
      onSuccess();
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
            
            <div className={styles.coverLabel}>
              Add cover photo (optional)
              {imageFile && (
                <Button 
                  type="link" 
                  icon={<DeleteOutlined />} 
                  onClick={handleRemoveImage}
                  size="small"
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
                    alt="Preview" 
                    style={{ 
                      width: '100%', 
                      maxHeight: '200px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      border: '1px solid #d9d9d9'
                    }} 
                  />
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Selected: {imageFile?.name}
                  </div>
                </div>
              )}
              
              {/* Upload Progress */}
              {isUploading && (
                <div style={{ marginBottom: '16px' }}>
                  <Progress percent={100} status="active" />
                  <div style={{ fontSize: '12px', color: '#666' }}>Uploading image...</div>
                </div>
              )}

              <Upload.Dragger
                name="cover"
                accept=".jpg,.jpeg,.png"
                showUploadList={false}
                customRequest={customRequest}
                beforeUpload={handleFileSelect}
                className={styles.uploadDragger}
                disabled={isUploading}
              >
                <div className={styles.uploadContent}>
                  <UploadOutlined className={styles.uploadIcon} />
                  <div className={styles.uploadHint}>
                    Drag and drop file below<br />
                    <span className={styles.uploadLink}>You can also upload files by clicking here</span><br />
                    <span className={styles.fileType}>.JPG .PNG (Max 5MB)</span>
                  </div>
                </div>
              </Upload.Dragger>
            </Form.Item>
            
            <Form.Item className={styles.formFooter}>
              <Button onClick={onCancel} className={styles.cancelButton} disabled={loading || isUploading}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading || isUploading}
                disabled={isUploading}
              >
                {isUploading ? 'Publishing...' : 'Publish'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </div>
  );
};

export default AddArticle; 
