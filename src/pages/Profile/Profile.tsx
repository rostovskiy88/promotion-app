import React, { useState } from 'react';
import { Card, Tabs, Form, Input, Button, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const EditProfile: React.FC = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const isGoogleUser = user?.providerData?.some(
    (provider) => provider.providerId === 'google.com'
  );

  const handleCancel = () => {
    form.resetFields();
    navigate('/dashboard');
  };

  const handleSave = (values: any) => {
    // Save logic here
    console.log('Saved values:', values);
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
    <Row justify="center" align="middle" style={{ minHeight: '80vh' }}>
      <Col>
        <Card
          style={{ width: 500, boxShadow: '0 8px 32px 0 rgba(16,30,54,0.08)' }}
          styles={{ body: { padding: 32 } }}
        >
          <h2 style={{ marginBottom: 24 }}>Manage your account</h2>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            style={{ marginBottom: 24 }}
            items={[
              {
                key: '1',
                label: <span style={{ fontWeight: activeTab === '1' ? 500 : 400, color: activeTab === '1' ? '#1557ff' : '#b0b4ba' }}>Edit Information</span>,
                children: <>
                  <div style={{ marginBottom: 24, fontWeight: 500 }}>Change your information</div>
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    requiredMark={false}
                  >
                    <Form.Item label="First Name" name="firstName">
                      <Input placeholder="Enter your first name" size="large" style={{ background: '#f7f8fa' }} />
                    </Form.Item>
                    <Form.Item label="Last Name" name="lastName">
                      <Input placeholder="Enter your last name" size="large" style={{ background: '#f7f8fa' }} />
                    </Form.Item>
                    <Form.Item label="Age" name="age">
                      <Input placeholder="Enter your age" size="large" style={{ background: '#f7f8fa' }} />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                      <Button onClick={handleCancel} style={{ marginRight: 8 }}>Cancel</Button>
                      <Button type="primary" htmlType="submit" style={{ background: '#1557ff', borderColor: '#1557ff' }}>Save</Button>
                    </Form.Item>
                  </Form>
                </>,
              },
              {
                key: '2',
                label: <span style={{ color: '#b0b4ba' }}>User Avatar</span>,
                disabled: true,
                children: null,
              },
              {
                key: '3',
                label: <span style={{ fontWeight: activeTab === '3' ? 500 : 400, color: activeTab === '3' ? '#1557ff' : '#b0b4ba' }}>Change Password</span>,
                children: <>
                  {isGoogleUser && (
                    <div style={{ color: '#b0b4ba', marginBottom: 16, textAlign: 'center', fontSize: 15 }}>
                      You signed in with Google. To change your password, visit your Google Account settings.
                    </div>
                  )}
                  <div style={{ marginBottom: 24, fontWeight: 500 }}>Change your password</div>
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handlePasswordSave}
                    requiredMark={false}
                  >
                    <Form.Item label="Old Password" name="oldPassword">
                      <Input.Password placeholder="Enter your current password" size="large" style={{ background: '#f7f8fa' }} disabled={isGoogleUser} />
                    </Form.Item>
                    <Form.Item label="New Password" name="newPassword">
                      <Input.Password placeholder="Enter your new password" size="large" style={{ background: '#f7f8fa' }} disabled={isGoogleUser} />
                    </Form.Item>
                    <Form.Item label="Confirm New Password" name="confirmPassword">
                      <Input.Password placeholder="Enter your new password again" size="large" style={{ background: '#f7f8fa' }} disabled={isGoogleUser} />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                      <Button onClick={handlePasswordCancel} style={{ marginRight: 8 }}>Cancel</Button>
                      <Button type="primary" htmlType="submit" style={{ background: '#1557ff', borderColor: '#1557ff' }} disabled={isGoogleUser}>Save</Button>
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