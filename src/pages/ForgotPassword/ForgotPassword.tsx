import { Form, Input, Button, message } from 'antd';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { getAuthErrorMessage } from '../../utils/authErrors';
import styles from './ForgotPassword.module.css';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPassword = () => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: ForgotPasswordFormData) => {
    try {
      await sendPasswordResetEmail(auth, values.email);
      message.success('Password reset email sent! Please check your inbox.');
      form.resetFields();
    } catch (error: any) {
      message.error(getAuthErrorMessage(error));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.imageSection} />
      <div className={styles.formSection}>
        <div className={styles.formContent}>
          <h1 className={styles.title}>Forgot Password?</h1>
          <p className={styles.subtitle}>
            Enter your email address and we'll send you instructions to reset your password.
          </p>

          <Form
            form={form}
            name="forgotPassword"
            onFinish={handleSubmit}
            layout="vertical"
            className={styles.form}
            validateTrigger="onBlur"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter your email address' },
                { type: 'email', message: 'Please enter a valid email address' }
              ]}
              validateTrigger="onBlur"
            >
              <Input size="large" placeholder="Enter your email" />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              className={styles.submitButton}
              size="large"
            >
              Reset
            </Button>

            <div className={styles.backToLogin}>
              Remember your password? <Link to="/login">Back to Login</Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 