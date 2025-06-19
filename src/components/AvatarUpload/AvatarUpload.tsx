import { RotateLeftOutlined, RotateRightOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, message, Modal, Slider, Space, Upload } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { uploadAvatar, validateAvatarFile } from '../../services/avatarService';
import './AvatarUpload.css';

interface AvatarUploadProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (avatarUrl: string) => void;
  userId: string;
  initialFile?: File | null;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ visible, onCancel, onSuccess, userId, initialFile }) => {
  const [image, setImage] = useState<File | null>(null);
  const [scale, setScale] = useState(1.2);
  const [rotate, setRotate] = useState(0);
  const [uploading, setUploading] = useState(false);
  const editorRef = useRef<AvatarEditor>(null);

  useEffect(() => {
    if (visible) {
      if (initialFile) {
        setImage(initialFile);
      } else {
        setImage(null);
      }
      setScale(1.2);
      setRotate(0);
    }
  }, [visible, initialFile]);

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

      const avatarUrl = await uploadAvatar(canvas, userId);

      onSuccess(avatarUrl);
      handleClose();
    } catch (error: any) {
      console.error('Avatar upload failed:', error);

      if (error.message?.includes('storage')) {
        message.error('Failed to save avatar to storage. Please check your connection and try again.');
      } else {
        message.error(`Failed to upload avatar: ${error.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setImage(null);
    setScale(1.2);
    setRotate(0);
    onCancel();
  };

  const handleRotateLeft = () => {
    setRotate(prev => prev - 90);
  };

  const handleRotateRight = () => {
    setRotate(prev => prev + 90);
  };

  return (
    <Modal
      title='Upload Avatar'
      open={visible}
      onCancel={handleClose}
      width={520}
      centered
      footer={[
        <Button key='cancel' onClick={handleClose}>
          Cancel
        </Button>,
        <Button key='save' type='primary' loading={uploading} onClick={handleSave} disabled={!image}>
          {uploading ? 'Uploading...' : 'Save Avatar'}
        </Button>,
      ]}
      styles={{
        body: {
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
        },
        mask: {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        },
      }}
      style={{
        marginLeft: '200px',
      }}
    >
      <div className='avatar-upload-container'>
        {!image ? (
          <div className='upload-area'>
            <Upload.Dragger
              accept='.jpg,.jpeg,.png'
              showUploadList={false}
              beforeUpload={handleFileSelect}
              className='avatar-upload-dragger'
            >
              <div className='upload-content'>
                <UploadOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Select Avatar Image</div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#666',
                      marginTop: '8px',
                    }}
                  >
                    Click or drag image to upload
                    <br />
                    JPG, PNG up to 10MB
                  </div>
                </div>
              </div>
            </Upload.Dragger>
          </div>
        ) : (
          <div className='editor-area'>
            <div className='editor-container'>
              <AvatarEditor
                ref={editorRef}
                image={image}
                width={300}
                height={300}
                border={20}
                borderRadius={150}
                color={[255, 255, 255, 0.6]}
                scale={scale}
                rotate={rotate}
                style={{
                  border: '2px solid #d9d9d9',
                  borderRadius: '50%',
                }}
              />
            </div>

            <div className='editor-controls' style={{ width: '100%', maxWidth: '340px' }}>
              <div className='control-row'>
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

              <div className='control-row'>
                <span>Rotate:</span>
                <Space>
                  <Button icon={<RotateLeftOutlined />} onClick={handleRotateLeft} size='small'>
                    Left
                  </Button>
                  <Button icon={<RotateRightOutlined />} onClick={handleRotateRight} size='small'>
                    Right
                  </Button>
                </Space>
              </div>

              <div className='control-row' style={{ justifyContent: 'center' }}>
                <Button type='link' onClick={() => setImage(null)} style={{ padding: 0 }}>
                  Choose Different Image
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AvatarUpload;
