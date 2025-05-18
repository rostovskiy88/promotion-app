import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Divider, message, InputNumber } from 'antd';
import { GoogleOutlined, FacebookFilled } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginWithGoogle, loginWithFacebook } from '../../store/slices/authSlice';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../config/firebase';
import styles from './Register.module.css';
import registerImage from '../../assets/sign-up.png';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebookF } from 'react-icons/fa';
import { createOrGetUser } from '../../services/userService';

const Register: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      const { name, age, email, password } = values;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      // Create user in Firestore
      await createOrGetUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        displayName: name,
        photoURL: userCredential.user.photoURL || '',
      });
      message.success('Registration successful!');
      navigate('/dashboard');
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await dispatch(loginWithGoogle()).unwrap();
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        message.info('Login cancelled');
      } else {
        message.error(err.message || 'Failed to login with Google');
      }
      dispatch({ type: 'auth/resetLoading' });
    }
  };

  const handleFacebook = async () => {
    await dispatch(loginWithFacebook());
    navigate('/dashboard');
  };

  return (
    <div className={styles.container}>
      <div className={styles.imageSection}>
        <img src={registerImage} alt="Register visual" className={styles.image} />
      </div>
      <div className={styles.formSection}>
        <div className={styles.formContent}>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Get started today</h1>
          <p style={{ fontSize: 14, color: '#667085', marginBottom: 32 }}>Enter your details to create super account.</p>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            requiredMark={false}
            className={styles.form}
          >
            <div className={styles.row}>
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: 'Please enter your name' }]}
                className={styles.inputHalf}
              >
                <Input placeholder="Name" />
              </Form.Item>
              <Form.Item
                name="age"
                label="Age"
                className={styles.inputHalf}
                rules={[
                  { required: true, message: 'Enter your age' },
                  {
                    validator: (_, value) => {
                      if (value === undefined || value === null || value === '') {
                        return Promise.resolve(); // Let required rule handle empty
                      }
                      if (value < 1) {
                        return Promise.reject('Age must be at least 1');
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  placeholder="Enter your age"
                  type="number"
                  min={1}
                  step={1}
                  onKeyDown={e => {
                    if (e.key === '-' || e.key === 'e') {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>
            </div>
            <Form.Item
              name="email"
              label="Email Address"
              rules={[{ required: true, type: 'email', message: 'Enter your email' }]}
            >
              <Input placeholder="Enter your email" />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Enter your password' },
                { min: 8, message: 'Must be 8 characters long at least' },
              ]}
              hasFeedback
            >
              <Input.Password placeholder="Enter your password" />
            </Form.Item>
            <Form.Item
              name="confirm"
              label="Confirm New Password"
              dependencies={["password"]}
              hasFeedback
              rules={[
                { required: true, message: 'Enter your new password again' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Enter your new password again" />
            </Form.Item>
            <Form.Item name="agreement" valuePropName="checked" rules={[{ validator:(_, value) => value ? Promise.resolve() : Promise.reject('You must agree to Terms and Policy') }]}
              style={{ marginBottom: 0 }}
            >
              <Checkbox checked={agree} onChange={e => setAgree(e.target.checked)}>
                I agree to Product <Link to="/terms">Terms and Policy</Link>.
              </Checkbox>
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                disabled={!agree}
              >
                Get started now
              </Button>
            </Form.Item>
          </Form>
          <Divider>Or sign up with</Divider>
          <div className={styles.socialButtons}>
            <Button
              className={styles.socialButton}
              onClick={handleGoogle}
            >
              <FcGoogle size={20} />
            </Button>
            <Button
                className={styles.socialButton}
                onClick={handleFacebook}
            >
              <div className={styles.facebookIcon}>
                <FaFacebookF />
              </div>
            </Button>
          </div>
          <div className={styles.loginLink}>
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;