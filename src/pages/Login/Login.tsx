import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined, FacebookFilled } from '@ant-design/icons';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebookF } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styles from './Login.module.css';
import loginImage from '../../assets/login.png';

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  const onFinish = (values: LoginFormData) => {
    console.log('Success:', values);
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

            <Button type="primary" htmlType="submit" className={styles.submitButton}>
              Sign in
            </Button>

            <div className={styles.divider}>
              <span>Or do it via other accounts</span>
            </div>

            <div className={styles.socialButtons}>
              <Button className={styles.socialButton}>
                <FcGoogle size={20} />
              </Button>
              <Button className={styles.socialButton}>
                <div className={styles.facebookIcon}>
                  <FaFacebookF />
                </div>
              </Button>
            </div>

            <div className={styles.signUpText}>
              Don't have an account? 
              <a href="#signup">Sign up</a>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login; 