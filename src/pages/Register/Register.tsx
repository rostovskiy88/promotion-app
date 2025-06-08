import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Divider } from 'antd';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebookF } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginWithGoogle, loginWithFacebook } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { getAuthErrorMessage } from '../../utils/authErrors';
import { App } from 'antd';
import styles from './Register.module.css';
import registerImage from '../../assets/sign-up.png';
import { createOrGetUser } from '../../services/userService';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      const { name, email, password } = values;
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
      message.error(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await dispatch(loginWithGoogle()).unwrap();
      navigate('/dashboard');
    } catch (err: any) {
      if (err.includes('cancelled')) {
        message.info('Login cancelled');
      } else {
        message.error(err || 'Failed to login with Google');
      }
      dispatch({ type: 'auth/resetLoading' });
    }
  };

  const handleFacebook = async () => {
    try {
      await dispatch(loginWithFacebook()).unwrap();
      navigate('/dashboard');
    } catch (err: any) {
      if (err.includes('cancelled')) {
        message.info('Login cancelled');
      } else {
        message.error(err || 'Failed to login with Facebook');
      }
      dispatch({ type: 'auth/resetLoading' });
    }
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
            validateTrigger="onBlur"
          >
            <div className={styles.row}>
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: 'Please enter your name' }]}
                className={styles.inputHalf}
                validateTrigger="onBlur"
              >
                <Input placeholder="Name" />
              </Form.Item>
            </div>
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter your email address' },
                { type: 'email', message: 'Please enter a valid email address' }
              ]}
              validateTrigger="onBlur"
            >
              <Input placeholder="Enter your email" />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter your password' },
                { min: 8, message: 'Password must be at least 8 characters long' },
              ]}
              hasFeedback
              validateTrigger="onBlur"
            >
              <Input.Password placeholder="Enter your password" />
            </Form.Item>
            <Form.Item
              name="confirm"
              label="Confirm New Password"
              dependencies={["password"]}
              hasFeedback
              rules={[
                { required: true, message: 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
              validateTrigger="onBlur"
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