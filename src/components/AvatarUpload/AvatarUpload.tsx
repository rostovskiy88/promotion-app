import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Upload, message, Slider, Space } from 'antd';
import { UploadOutlined, RotateLeftOutlined, RotateRightOutlined } from '@ant-design/icons';
import AvatarEditor from 'react-avatar-editor';
import { validateAvatarFile, uploadAvatar } from '../../services/avatarService';
import './AvatarUpload.css';

interface AvatarUploadProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (avatarUrl: string) => void;
  userId: string;
  mode: 'upload' | 'edit';
  currentAvatarUrl?: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  visible,
  onCancel,
  onSuccess,
  userId,
  mode,
  currentAvatarUrl
}) => {
  const [image, setImage] = useState<File | string | null>(null);
  const [scale, setScale] = useState(1.2);
  const [rotate, setRotate] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const editorRef = useRef<AvatarEditor>(null);

  // Load current avatar when in edit mode
  useEffect(() => {
    if (visible && mode === 'edit' && currentAvatarUrl) {
      setLoadingImage(true);
      console.log('Loading avatar for editing:', currentAvatarUrl);
      
      // Simply use the URL directly and let AvatarEditor handle it
      // Remove crossOrigin to avoid CORS preflight issues
      setImage(currentAvatarUrl);
      setScale(1.2);
      setRotate(0);
      setLoadingImage(false);
      console.log('Avatar set for editing');
      
    } else if (visible && mode === 'upload') {
      setImage(null);
      setScale(1.2);
      setRotate(0);
      setLoadingImage(false);
    }
  }, [visible, mode, currentAvatarUrl]);

  const handleFileSelect = (file: File) => {
    const validation = validateAvatarFile(file);
    if (!validation.isValid) {
      message.error(validation.error);
      return false;
    }

    setImage(file);
    return false; // Prevent auto upload
  };

  const handleSave = async () => {
    if (!editorRef.current || !image) {
      message.error('Please select an image first');
      return;
    }

    setUploading(true);
    try {
      // Get the cropped image as canvas
      const canvas = editorRef.current.getImageScaledToCanvas();
      
      // Upload the avatar
      const avatarUrl = await uploadAvatar(canvas, userId);
      
      message.success(mode === 'edit' ? 'Avatar adjusted successfully!' : 'Avatar uploaded successfully!');
      onSuccess(avatarUrl);
      handleClose();
    } catch (error: any) {
      console.error('Avatar upload failed:', error);
      
      // Handle the tainted canvas error specifically
      if (error.message?.includes('tainted') || error.message?.includes('CORS') || error.message?.includes('toBlob')) {
        if (mode === 'edit') {
          // Show a friendly message and switch to upload mode
          message.warning({
            content: (
              <div>
                <div style={{ fontWeight: 'bold' }}>Can't save edits in development mode</div>
                <div style={{ marginTop: '4px', fontSize: '12px' }}>
                  Browser security prevents editing cloud images locally. Switching to upload mode...
                </div>
              </div>
            ),
            duration: 4,
          });
          
          // Automatically switch to upload mode after a short delay
          setTimeout(() => {
            setImage(null);
            setLoadingImage(false);
            message.info('You can now upload a new avatar image to replace the current one.');
          }, 1500);
        } else {
          message.error('Unable to process image due to browser security restrictions. Please try a different image.');
        }
      } else if (error.message?.includes('storage')) {
        message.error('Failed to save avatar to storage. Please check your connection and try again.');
      } else {
        message.error(`Failed to ${mode === 'edit' ? 'adjust' : 'upload'} avatar: ${error.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    // Clean up blob URLs to prevent memory leaks
    if (image && typeof image === 'string' && image.startsWith('blob:')) {
      URL.revokeObjectURL(image);
    }
    setImage(null);
    setScale(1.2);
    setRotate(0);
    setLoadingImage(false);
    onCancel();
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (image && typeof image === 'string' && image.startsWith('blob:')) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  const handleRotateLeft = () => {
    setRotate(prev => prev - 90);
  };

  const handleRotateRight = () => {
    setRotate(prev => prev + 90);
  };

  const getModalTitle = () => {
    if (mode === 'edit') {
      if (loadingImage) {
        return 'Loading Avatar...';
      } else if (!image) {
        return 'Upload New Avatar';
      } else {
        return 'Adjust Avatar';
      }
    }
    return 'Upload Avatar';
  };

  const getButtonText = () => {
    if (uploading) {
      return mode === 'edit' ? 'Saving...' : 'Uploading...';
    }
    
    if (mode === 'edit') {
      return !image ? 'Save Avatar' : 'Save Changes';
    }
    return 'Save Avatar';
  };

  return (
    <Modal
      title={getModalTitle()}
      open={visible}
      onCancel={handleClose}
      width={500}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={uploading}
          onClick={handleSave}
          disabled={!image}
        >
          {getButtonText()}
        </Button>,
      ]}
    >
      <div className="avatar-upload-container">
        {loadingImage ? (
          <div className="upload-area" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', marginBottom: '12px' }}>Loading your avatar...</div>
              <div className="loading-spinner" style={{ 
                width: '40px', 
                height: '40px', 
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #1890ff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }}></div>
            </div>
          </div>
        ) : !image ? (
          <div className="upload-area">
            <Upload.Dragger
              accept=".jpg,.jpeg,.png"
              showUploadList={false}
              beforeUpload={handleFileSelect}
              className="avatar-upload-dragger"
            >
              <div className="upload-content">
                <UploadOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {mode === 'edit' ? 'Upload New Avatar' : 'Select Avatar Image'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                    Click or drag image to upload<br />
                    JPG, PNG up to 10MB
                  </div>
                </div>
              </div>
            </Upload.Dragger>
          </div>
        ) : (
          <div className="editor-area">
            <div className="editor-container">
              <AvatarEditor
                ref={editorRef}
                image={image}
                width={300}
                height={300}
                border={20}
                borderRadius={150} // Circular crop
                color={[255, 255, 255, 0.6]} // RGBA
                scale={scale}
                rotate={rotate}
                style={{ 
                  border: '2px solid #d9d9d9',
                  borderRadius: '50%'
                }}
              />
            </div>
            
            <div className="editor-controls">
              <div className="control-row">
                <span>Zoom:</span>
                <Slider
                  min={0.5}
                  max={3}
                  step={0.1}
                  value={scale}
                  onChange={setScale}
                  style={{ flex: 1, marginLeft: '12px' }}
                />
              </div>
              
              <div className="control-row">
                <span>Rotate:</span>
                <Space>
                  <Button
                    icon={<RotateLeftOutlined />}
                    onClick={handleRotateLeft}
                    size="small"
                  >
                    Left
                  </Button>
                  <Button
                    icon={<RotateRightOutlined />}
                    onClick={handleRotateRight}
                    size="small"
                  >
                    Right
                  </Button>
                </Space>
              </div>
              
              {mode === 'upload' && (
                <div className="control-row">
                  <Button 
                    type="link" 
                    onClick={() => setImage(null)}
                    style={{ padding: 0 }}
                  >
                    Choose Different Image
                  </Button>
                </div>
              )}
              
              {mode === 'edit' && (
                <div className="control-row">
                  <Button 
                    type="link" 
                    onClick={() => setImage(null)}
                    style={{ padding: 0 }}
                  >
                    Upload New Image Instead
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AvatarUpload; 