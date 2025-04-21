import { Form, Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import styles from './ForgotPassword.module.css';
import loginImage from '../../assets/login.png';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPassword = () => {
  const onFinish = (values: ForgotPasswordFormData) => {
    console.log('Success:', values);
  };

  return (
    <div className={styles.container}>
      <div className={styles.imageSection} />
      <div className={styles.formSection}>
        <div className={styles.formContent}>
          <h1 className={styles.title}>Forgot Password?</h1>
          <p className={styles.subtitle}>Enter the email you're using for your account.</p>

          <Form
            name="forgotPassword"
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

            <Button type="primary" htmlType="submit" className={styles.submitButton}>
              Reset
            </Button>

            <div className={styles.backToLogin}>
              <Link to="/login">← Back to login</Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 