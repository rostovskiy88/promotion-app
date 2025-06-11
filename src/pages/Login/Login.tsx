import { Form, Input, Button } from 'antd';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebookF } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginWithEmail, loginWithGoogle, loginWithFacebook } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store';
import { App } from 'antd';
import styles from './Login.module.css';
import { LoginFormData } from '../../types/forms';
import { AppError } from '../../types/firebase';
import { getAuthErrorMessage } from '../../utils/authErrors';

const Login = () => {
  const { message } = App.useApp();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector((state: RootState) => state.auth);

  // Get the redirect path from location state, or default to dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const onFinish = async (values: LoginFormData) => {
    try {
      await dispatch(loginWithEmail({ email: values.email, password: values.password })).unwrap();
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const typedError = err as AppError;
      console.error('Login error:', typedError);
      message.error(getAuthErrorMessage(typedError));
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await dispatch(loginWithGoogle()).unwrap();
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const typedError = err as AppError;
      console.error('Google login error:', typedError);
      message.error(getAuthErrorMessage(typedError));
    }
  };

  const handleFacebookLogin = async () => {
    try {
      await dispatch(loginWithFacebook()).unwrap();
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const typedError = err as AppError;
      console.error('Facebook login error:', typedError);
      message.error(getAuthErrorMessage(typedError));
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
            onFinish={onFinish}
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
                data-testid="email-input"
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
                data-testid="password-input"
              />
            </Form.Item>

            <div className={styles.forgotPassword}>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className={styles.submitButton}
              size="large"
              data-testid="login-button"
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