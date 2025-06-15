import React, { useState, useEffect } from 'react';
import { Card, Tabs, Form, Input, Button, Row, Col, App, Upload } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { RootState, AppDispatch } from '../../store';
import styles from './Profile.module.css';
import { updateUser } from '../../services/userService';
import { useUserDisplayInfo } from '../../hooks/useUserDisplayInfo';
import AvatarUpload from '../../components/AvatarUpload/AvatarUpload';
import { refreshFirestoreUser } from '../../store/slices/authSlice';
import { ProfileFormData, PasswordFormData } from '../../types/forms';
import { getAuthErrorMessage } from '../../utils/authErrors';

const EditProfile: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarUploadVisible, setAvatarUploadVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const isFacebookUser = user?.providerData?.some(
    (provider) => provider.providerId === 'facebook.com'
  );

  const isSocialUser = isGoogleUser || isFacebookUser;

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
      
      // Clear the selected file and close modal
      setSelectedFile(null);
      setAvatarUploadVisible(false);
    } catch (error) {
      console.error('Failed to update avatar in database:', error);
      message.error('Failed to save avatar');
    }
  };

  const handleChangeAvatar = (file?: File) => {
    if (file) {
      setSelectedFile(file);
    }
    setAvatarUploadVisible(true);
  };

  const handlePasswordCancel = () => {
    passwordForm.resetFields();
    navigate('/dashboard');
  };

  const handlePasswordSave = async (values: PasswordFormData) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      message.error('User not authenticated');
      return;
    }

    // Validate that new passwords match
    if (values.newPassword !== values.confirmPassword) {
      message.error('New passwords do not match');
      return;
    }

    // Validate password strength
    if (values.newPassword.length < 6) {
      message.error('New password must be at least 6 characters long');
      return;
    }

    setPasswordLoading(true);
    try {
      // First, reauthenticate the user with their current password
      const credential = EmailAuthProvider.credential(currentUser.email!, values.oldPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // If reauthentication succeeds, update the password
      await updatePassword(currentUser, values.newPassword);

      // Reset the form and show success message
      passwordForm.resetFields();
      message.success('Password updated successfully!');
      
      console.log('Password updated successfully for user:', currentUser.uid);
    } catch (error: any) {
      console.error('Password update failed:', error);
      
      // Use the auth error utility to get user-friendly messages
      const errorMessage = getAuthErrorMessage(error);
      message.error(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
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
                  
                  <div style={{ marginTop: '20px' }}>
                    <Upload.Dragger
                      accept=".jpg,.jpeg,.png"
                      showUploadList={false}
                      beforeUpload={(file: File) => {
                        handleChangeAvatar(file);
                        return false;
                      }}
                      style={{
                        padding: '60px 20px',
                        border: '2px dashed #d9d9d9',
                        borderRadius: '8px',
                        backgroundColor: '#fafafa'
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }}>
                          ☁️
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                          JPG, PNG
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          You can also upload files by{' '}
                          <span style={{ color: '#1890ff', cursor: 'pointer' }}>
                            clicking here
                          </span>
                        </div>
                      </div>
                    </Upload.Dragger>
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
                  {isSocialUser && (
                    <div className={styles.googleInfo}>
                      You signed in with {isGoogleUser ? 'Google' : 'Facebook'}. Password changes are not available for social login accounts.
                    </div>
                  )}
                  <div className={styles.sectionTitle}>Change your password</div>
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handlePasswordSave}
                    requiredMark={false}
                  >
                    <Form.Item 
                      label="Old Password" 
                      name="oldPassword"
                      rules={[
                        { required: true, message: 'Please enter your current password' }
                      ]}
                    >
                      <Input.Password placeholder="Enter your current password" size="large" className={styles.input} disabled={isSocialUser} />
                    </Form.Item>
                    <Form.Item 
                      label="New Password" 
                      name="newPassword"
                      rules={[
                        { required: true, message: 'Please enter your new password' },
                        { min: 6, message: 'Password must be at least 6 characters long' }
                      ]}
                    >
                      <Input.Password placeholder="Enter your new password" size="large" className={styles.input} disabled={isSocialUser} />
                    </Form.Item>
                    <Form.Item 
                      label="Confirm New Password" 
                      name="confirmPassword"
                      dependencies={['newPassword']}
                      rules={[
                        { required: true, message: 'Please confirm your new password' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('The two passwords do not match!'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password placeholder="Enter your new password again" size="large" className={styles.input} disabled={isSocialUser} />
                    </Form.Item>
                    <Form.Item className={styles.buttonRow}>
                      <div className={styles.buttonGroup}>
                        <Button onClick={handlePasswordCancel} className={`${styles.button} ${styles.cancelButton}`}>Cancel</Button>
                        <Button 
                          type="primary" 
                          htmlType="submit" 
                          className={`${styles.button} ${styles.saveButton}`} 
                          disabled={isSocialUser}
                          loading={passwordLoading}
                        >
                          Save
                        </Button>
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
        onCancel={() => {
          setAvatarUploadVisible(false);
          setSelectedFile(null);
        }}
        onSuccess={handleAvatarSuccess}
        userId={user?.uid || ''}
        initialFile={selectedFile}
      />
    </Row>
  );
};

export default EditProfile; 