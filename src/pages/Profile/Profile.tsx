import React, { useState, useEffect } from 'react';
import { Card, Tabs, Form, Input, Button, Row, Col, Upload, message, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { UploadOutlined } from '@ant-design/icons';
import styles from './Profile.module.css';
import { getUserById, updateUser } from '../../services/userService';

const EditProfile: React.FC = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [avatarForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user?.uid) {
      getUserById(user.uid).then((userData) => {
        console.log('Fetched user data from Firestore:', userData);
        if (userData) {
          form.setFieldsValue({
            firstName: userData.firstName,
            lastName: userData.lastName,
            age: userData.age || '',
          });
          setAvatarPreview(userData.avatarUrl);
        }
      });
    }
  }, [user, form]);

  const isGoogleUser = user?.providerData?.some(
    (provider) => provider.providerId === 'google.com'
  );

  const handleCancel = () => {
    form.resetFields();
    navigate('/dashboard');
  };

  const handleSave = async (values: any) => {
    if (!user?.uid) {
      message.error('User not authenticated');
      return;
    }

    setLoading(true);
    try {
      await updateUser(user.uid, {
        firstName: values.firstName,
        lastName: values.lastName,
        age: values.age,
      });
      console.log('Updated user profile in Firestore:', values);
      message.success('Profile updated!');
    } catch (e) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarCancel = () => {
    avatarForm.resetFields();
    navigate('/dashboard');
  };

  const handleAvatarSave = async (values: any) => {
    if (values.avatar && values.avatar[0]) {
      const file = values.avatar[0].originFileObj;
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      if (!user?.uid) {
        message.error('User not authenticated');
        return;
      }
      await updateUser(user.uid, { avatarUrl: url });
      console.log('Updated user avatar in Firestore:', url);
      message.success('Avatar updated!');
    }
  };

  const handlePasswordCancel = () => {
    passwordForm.resetFields();
    navigate('/dashboard');
  };

  const handlePasswordSave = (values: any) => {
    // Change password logic here
    console.log('Password change:', values);
  };

  return (
    <Row justify="center" align="middle" className={styles.container}>
      <Col>
        <Card className={styles.card} styles={{ body: { padding: 32 } }}>
          <div className={styles.header}>Manage your account</div>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className={styles.tabs}
            items={[
              {
                key: '1',
                label: <span className={activeTab === '1' ? styles.activeTab : styles.inactiveTab}>Edit Information</span>,
                children: <>
                  <div className={styles.sectionTitle}>Change your information</div>
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    requiredMark={false}
                  >
                    <Form.Item label="First Name" name="firstName">
                      <Input placeholder="Enter your first name" size="large" className={styles.input} />
                    </Form.Item>
                    <Form.Item label="Last Name" name="lastName">
                      <Input placeholder="Enter your last name" size="large" className={styles.input} />
                    </Form.Item>
                    <Form.Item label="Age" name="age" rules={[{ required: true, message: 'Please enter your age' }, { type: 'number', min: 1, message: 'Age must be a natural number' }]} getValueFromEvent={e => e && e.target ? Number(e.target.value) : e}
                    >
                      <Input
                        placeholder="Enter your age"
                        size="large"
                        className={styles.input}
                        type="number"
                        min={1}
                        step={1}
                        onKeyDown={e => {
                          if (e.key === '-' || e.key === 'e' || e.key === '.' || e.key === '+') {
                            e.preventDefault();
                          }
                        }}
                      />
                    </Form.Item>
                    <Form.Item className={styles.buttonRow}>
                      <div className={styles.buttonGroup}>
                        <Button onClick={handleCancel} className={`${styles.button} ${styles.cancelButton}`}>Cancel</Button>
                        <Button type="primary" htmlType="submit" className={`${styles.button} ${styles.saveButton}`} loading={loading}>Save</Button>
                      </div>
                    </Form.Item>
                  </Form>
                </>,
              },
              {
                key: '2',
                label: <span className={activeTab === '2' ? styles.activeTab : styles.inactiveTab}>User Avatar</span>,
                children: <>
                  <div className={styles.sectionTitle}>Change your photo</div>
                  <div className={styles.coverLabel}>Drag and drop file below</div>
                  {avatarPreview && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                      <Avatar src={avatarPreview} size={80} style={{ border: '2px solid #e5e6e8' }} />
                    </div>
                  )}
                  <Form
                    form={avatarForm}
                    layout="vertical"
                    onFinish={handleAvatarSave}
                    requiredMark={false}
                  >
                    <Form.Item
                      name="avatar"
                      valuePropName="fileList"
                      getValueFromEvent={e => Array.isArray(e) ? e : e && e.fileList}
                    >
                      <Upload.Dragger
                        name="avatar"
                        accept=".jpg,.png"
                        showUploadList={false}
                        beforeUpload={() => false}
                        className={styles.uploadDragger}
                      >
                        <div className={styles.uploadContent}>
                          <UploadOutlined style={{ fontSize: 32, color: '#b0b4ba' }} />
                          <div className={styles.uploadHint}>
                            .JPG .PNG<br />
                            <span className={styles.uploadLink}>You can also upload files by <span>clicking here</span></span>
                          </div>
                        </div>
                      </Upload.Dragger>
                    </Form.Item>
                    <Form.Item className={styles.buttonRow}>
                      <div className={styles.buttonGroup}>
                        <Button onClick={handleAvatarCancel} className={`${styles.button} ${styles.cancelButton}`}>Cancel</Button>
                        <Button type="primary" htmlType="submit" className={`${styles.button} ${styles.saveButton}`}>Save</Button>
                      </div>
                    </Form.Item>
                  </Form>
                </>,
              },
              {
                key: '3',
                label: <span className={activeTab === '3' ? styles.activeTab : styles.inactiveTab}>Change Password</span>,
                children: <>
                  {isGoogleUser && (
                    <div className={styles.googleInfo}>
                      You signed in with Google. To change your password, visit your Google Account settings.
                    </div>
                  )}
                  <div className={styles.sectionTitle}>Change your password</div>
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handlePasswordSave}
                    requiredMark={false}
                  >
                    <Form.Item label="Old Password" name="oldPassword">
                      <Input.Password placeholder="Enter your current password" size="large" className={styles.input} disabled={isGoogleUser} />
                    </Form.Item>
                    <Form.Item label="New Password" name="newPassword">
                      <Input.Password placeholder="Enter your new password" size="large" className={styles.input} disabled={isGoogleUser} />
                    </Form.Item>
                    <Form.Item label="Confirm New Password" name="confirmPassword">
                      <Input.Password placeholder="Enter your new password again" size="large" className={styles.input} disabled={isGoogleUser} />
                    </Form.Item>
                    <Form.Item className={styles.buttonRow}>
                      <div className={styles.buttonGroup}>
                        <Button onClick={handlePasswordCancel} className={`${styles.button} ${styles.cancelButton}`}>Cancel</Button>
                        <Button type="primary" htmlType="submit" className={`${styles.button} ${styles.saveButton}`} disabled={isGoogleUser}>Save</Button>
                      </div>
                    </Form.Item>
                  </Form>
                </>,
              },
            ]}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default EditProfile; 