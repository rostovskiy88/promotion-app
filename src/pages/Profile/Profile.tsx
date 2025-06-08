import React, { useState, useEffect } from 'react';
import { Card, Tabs, Form, Input, Button, Row, Col, Avatar, App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { EditOutlined } from '@ant-design/icons';
import styles from './Profile.module.css';
import { updateUser } from '../../services/userService';
import { useUserDisplayInfo } from '../../hooks/useUserDisplayInfo';
import AvatarUpload from '../../components/AvatarUpload/AvatarUpload';
import { refreshFirestoreUser } from '../../store/slices/authSlice';
import { ProfileFormData, PasswordFormData } from '../../types/forms';

const EditProfile: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);
  const [avatarUploadVisible, setAvatarUploadVisible] = useState(false);
  const [avatarUploadMode, setAvatarUploadMode] = useState<'upload' | 'edit'>('upload');
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const userDisplayInfo = useUserDisplayInfo();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (userDisplayInfo.firestoreUser) {
      console.log('Fetched user data from Firestore:', userDisplayInfo.firestoreUser);
      form.setFieldsValue({
        firstName: userDisplayInfo.firstName,
        lastName: userDisplayInfo.lastName,
        age: userDisplayInfo.age || '',
      });
    }
  }, [userDisplayInfo.firestoreUser, form]);

  const isGoogleUser = user?.providerData?.some(
    (provider) => provider.providerId === 'google.com'
  );

  const handleCancel = () => {
    form.resetFields();
    navigate('/dashboard');
  };

  const handleSave = async (values: ProfileFormData) => {
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
      
      // Refresh user data to update the header immediately
      await userDisplayInfo.refresh();
      
      // Refresh the user data from Redux
      dispatch(refreshFirestoreUser(user.uid));
      
      message.success('Profile updated!');
    } catch (e) {
      console.error('Error updating profile:', e);
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSuccess = async (avatarUrl: string) => {
    if (!user?.uid) {
      message.error('User not authenticated');
      return;
    }

    try {
      await updateUser(user.uid, { avatarUrl });
      console.log('Updated user avatar in Firestore:', avatarUrl);
      
      // Refresh user data to update the header immediately
      await userDisplayInfo.refresh();
      
      message.success('Avatar updated!');
    } catch (error) {
      console.error('Failed to update avatar in database:', error);
      message.error('Failed to save avatar');
    }
  };

  const handleEditAvatar = () => {
    setAvatarUploadMode('edit');
    setAvatarUploadVisible(true);
  };

  const handleChangeAvatar = () => {
    setAvatarUploadMode('upload');
    setAvatarUploadVisible(true);
  };

  const handlePasswordCancel = () => {
    passwordForm.resetFields();
    navigate('/dashboard');
  };

  const handlePasswordSave = (values: PasswordFormData) => {
    console.log('Received values:', values);
    message.success('Password updated successfully!');
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
                  <div className={styles.coverLabel}>Upload and crop your avatar</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                    {/* Current Avatar Display */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      <div style={{ position: 'relative' }}>
                        <Avatar 
                          src={userDisplayInfo.avatarUrl} 
                          size={120} 
                          style={{ 
                            border: '3px solid #e5e6e8',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                          }} 
                        >
                          {userDisplayInfo.displayName.charAt(0)}
                        </Avatar>
                        <Button
                          type="primary"
                          shape="circle"
                          icon={<EditOutlined />}
                          size="small"
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            border: '2px solid white',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                          }}
                          onClick={handleEditAvatar}
                        />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                          {userDisplayInfo.displayName || 'User'}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          Click the edit button to change your avatar
                        </div>
                      </div>
                    </div>

                    {/* Upload Button */}
                    <Button 
                      type="primary" 
                      size="large"
                      icon={<EditOutlined />}
                      onClick={handleChangeAvatar}
                      className={`${styles.button} ${styles.saveButton}`}
                    >
                      Change Avatar
                    </Button>
                  </div>

                  <Form.Item className={styles.buttonRow} style={{ marginTop: '32px' }}>
                    <div className={styles.buttonGroup}>
                      <Button onClick={() => navigate('/dashboard')} className={`${styles.button} ${styles.cancelButton}`}>
                        Back to Dashboard
                      </Button>
                    </div>
                  </Form.Item>
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

      {/* Avatar Upload Modal */}
      <AvatarUpload
        visible={avatarUploadVisible}
        onCancel={() => setAvatarUploadVisible(false)}
        onSuccess={handleAvatarSuccess}
        userId={user?.uid || ''}
        mode={avatarUploadMode}
        currentAvatarUrl={userDisplayInfo.avatarUrl}
      />
    </Row>
  );
};

export default EditProfile; 