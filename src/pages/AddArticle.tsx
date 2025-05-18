import React from 'react';
import { Card, Form, Input, Button, Upload, Row, Col, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import styles from './AddArticle.module.css';

const categories = ['Productivity', 'Media', 'Business'];

const AddArticle: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
  const [form] = Form.useForm();

  return (
    <div className={styles.container}>
      <Col>
        <Card className={styles.card} styles={{ body: { padding: 32 } }}>
          <div className={styles.header}>Add new article</div>
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item label="Category" name="category" rules={[{ required: true, message: 'Please select a category' }]}> 
              <Select placeholder="Select category" size="large" className={styles.select}>
                {categories.map(cat => (
                  <Select.Option key={cat} value={cat}>{cat}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Title" name="title">
              <Input placeholder="Enter your title" size="large" className={styles.input} />
            </Form.Item>
            <Form.Item label="Text" name="text">
              <Input.TextArea placeholder="Enter your text copy" rows={6} className={styles.input} />
            </Form.Item>
            <div className={styles.coverLabel}>Add cover photo</div>
            <Form.Item>
              <Upload.Dragger
                name="cover"
                accept=".jpg,.png"
                showUploadList={false}
                beforeUpload={() => false}
                className={styles.uploadDragger}
              >
                <div className={styles.uploadContent}>
                  <UploadOutlined style={{ fontSize: 32, color: '#b0b4ba' }} />
                  <div className={styles.uploadHint}>
                    Drag and drop file below<br />
                    <span className={styles.uploadLink}>You can also upload files by clicking here</span><br />
                    <span className={styles.fileType}>.JPG .PNG</span>
                  </div>
                </div>
              </Upload.Dragger>
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button onClick={onCancel} style={{ marginRight: 8 }}>Cancel</Button>
              <Button type="primary" htmlType="button">Publish</Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </div>
  );
};

export default AddArticle; 
