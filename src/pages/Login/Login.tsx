import { Form, Input, Button, message } from 'antd';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebookF } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginWithEmail, loginWithGoogle, loginWithFacebook } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store';
import { getAuthErrorMessage } from '../../utils/authErrors';
import styles from './Login.module.css';

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
    } catch (err: any) {
      console.error('Login failed:', err);
      // The error from the thunk is already processed by getAuthErrorMessage
      message.error(err || 'Failed to login');
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
        message: err,
        fullError: err
      });
      // The error is already processed by getAuthErrorMessage, but handle specific cases
      if (err.includes('cancelled')) {
        message.info('Login cancelled');
      } else {
        message.error(err || 'Failed to login with Google');
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
        message: err,
        fullError: err
      });
      // The error is already processed by getAuthErrorMessage, but handle specific cases
      if (err.includes('cancelled')) {
        message.info('Login cancelled');
      } else {
        message.error(err || 'Failed to login with Facebook');
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
            validateTrigger="onBlur"
          >
            <Form.Item
              name="email"
              label="Email"
              required
              rules={[
                { required: true, message: 'Please enter your email address' },
                { type: 'email', message: 'Please enter a valid email address' }
              ]}
              validateTrigger="onBlur"
            >
              <Input 
                placeholder="Enter your email" 
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              required
              rules={[{ required: true, message: 'Please enter your password' }]}
              validateTrigger="onBlur"
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