import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, FacebookFilled } from '@ant-design/icons';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebookF } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginWithEmail, loginWithGoogle, loginWithFacebook } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store';
import styles from './Login.module.css';
import loginImage from '../../assets/login.png';

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  // Get the redirect path from location state, or default to dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleEmailLogin = async (values: LoginFormData) => {
    try {
      console.log('Attempting email login...', values.email);
      const result = await dispatch(loginWithEmail(values)).unwrap();
      if (result) {
        console.log('Login successful:', result);
        message.success('Successfully logged in!');
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Login failed:', err);
      message.error(error || 'Failed to login');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      console.log('Starting Google login process...');
      const result = await dispatch(loginWithGoogle()).unwrap();
      if (result) {
        console.log('Google login successful, user:', result);
        message.success('Successfully logged in with Google!');
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error('Google login error:', {
        message: err.message,
        code: err.code,
        fullError: err
      });
      // Check if the error is due to popup being closed
      if (err.code === 'auth/popup-closed-by-user') {
        message.info('Login cancelled');
      } else {
        message.error(err.message || 'Failed to login with Google');
      }
      // Reset loading state in Redux
      dispatch({ type: 'auth/resetLoading' });
    }
  };

  const handleFacebookLogin = async () => {
    try {
      console.log('Starting Facebook login process...');
      const result = await dispatch(loginWithFacebook()).unwrap();
      if (result) {
        console.log('Facebook login successful, user:', result);
        message.success('Successfully logged in with Facebook!');
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error('Facebook login error:', {
        message: err.message,
        code: err.code,
        fullError: err
      });
      // Check if the error is due to popup being closed
      if (err.code === 'auth/popup-closed-by-user') {
        message.info('Login cancelled');
      } else {
        message.error(err.message || 'Failed to login with Facebook');
      }
      // Reset loading state in Redux
      dispatch({ type: 'auth/resetLoading' });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.imageSection} />
      <div className={styles.formSection}>
        <div className={styles.formContent}>
          <h1 className={styles.title}>👋 Welcome back!</h1>
          <p className={styles.subtitle}>Please enter your details to sign in</p>

          <Form
            name="login"
            onFinish={handleEmailLogin}
            layout="vertical"
            className={styles.form}
          >
            <Form.Item
              name="email"
              label="Email"
              required
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input 
                placeholder="Enter your email" 
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              required
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                placeholder="Enter your password"
              />
            </Form.Item>

            <div className={styles.forgotPassword}>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <Button 
              type="primary" 
              htmlType="submit" 
              className={styles.submitButton}
              loading={loading}
            >
              Sign in
            </Button>

            <div className={styles.divider}>
              <span>Or do it via other accounts</span>
            </div>

            <div className={styles.socialButtons}>
              <Button 
                className={styles.socialButton} 
                onClick={handleGoogleLogin}
                loading={loading}
              >
                <FcGoogle size={20} />
              </Button>
              <Button 
                className={styles.socialButton}
                onClick={handleFacebookLogin}
                loading={loading}
              >
                <div className={styles.facebookIcon}>
                  <FaFacebookF />
                </div>
              </Button>
            </div>

            <div className={styles.signUpText}>
              Don't have an account? 
              <Link to="/register">Sign up</Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login; 