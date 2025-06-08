// Form interface types to replace 'any' usage
import { UploadFile } from './firebase';

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  age: number;
  email: string;
  password: string;
  confirm: string;
  agreement: boolean;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  age: number;
}

export interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ArticleFormData {
  title: string;
  text: string;
  category: string;
}

export interface AvatarFormData {
  avatar: UploadFile[]; // Properly typed file upload array from AntD
}

export interface ForgotPasswordFormData {
  email: string;
} 