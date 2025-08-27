import React, { useState, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { uploadImage } from '../../utils/imageUploadUtils';
import { safeConvertToWebP } from '../../utils/imageUtils';
import './ImageUploader.css';

// 크롭 헬퍼 함수
const getCroppedImg = async (imageSrc, crop, mimeType = "image/png") => {
  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = url;
    });

  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    image,
    crop.x, crop.y, crop.width, crop.height,
    0, 0, crop.width, crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas toBlob failed"));
        return;
      }
      resolve(blob);
    }, mimeType);
  });
};

const ImageUploader = ({ 
  onUploadSuccess, 
  onUploadError, 
  currentImageUrl,
  domainType = null,
  folderName = null,
  subFolder = null,
  multipartEndpoint = null,
  multipartData = {},
  usePreSignedUrl = true,
  disabled = false,
  required = false,
  placeholder = "클릭하여 이미지 업로드",
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl || '');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cropFile, setCropFile] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // currentImageUrl이 변경될 때 imageUrl 업데이트
  useEffect(() => {
    setImageUrl(currentImageUrl || '');
  }, [currentImageUrl]);

  const validateFile = (file) => {
    if (!file) {
      return { valid: false, error: '파일이 선택되지 않았습니다.' };
    }

    if (!acceptedTypes.includes(file.type)) {
      return { valid: false, error: '지원하지 않는 파일 형식입니다.' };
    }

    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return { valid: false, error: `파일 크기가 너무 큽니다. (최대 ${maxSizeMB}MB)` };
    }

    return { valid: true };
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 파일 유효성 검증
    const validation = validateFile(file);
    if (!validation.valid) {
      onUploadError?.(validation.error);
      return;
    }

    // 크롭 모드로 전환
    setCropFile(file);
    setShowCropper(true);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleCropComplete = (_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  };

  const handleCropConfirm = async () => {
    if (!croppedAreaPixels || !cropFile) return;

    setUploading(true);
    setUploadProgress(0);
    setShowCropper(false);
    
    try {
      // 크롭된 이미지 생성
      const croppedBlob = await getCroppedImg(URL.createObjectURL(cropFile), croppedAreaPixels);
      
      const mimeType = croppedBlob.type || "image/png";
      const extension = mimeType.split("/")[1] || "png";
      const croppedFile = new File([croppedBlob], `cropped.${extension}`, { type: mimeType });

      // WebP 변환
      const convertedFile = await safeConvertToWebP(croppedFile);
      setUploadProgress(30);

      // 업로드 실행
      const result = await uploadImage(
        convertedFile, 
        usePreSignedUrl, 
        { 
          domainType: domainType.toUpperCase(), 
          folderName: folderName || subFolder || null,
          multipartEndpoint,
          multipartData
        }
      );
      
      setUploadProgress(90);

      if (result.success) {
        setImageUrl(result.fileUrl);
        setUploadProgress(100);
        onUploadSuccess?.(result.fileUrl, result.key);
        
        // 성공 메시지 표시 후 진행률 초기화
        setTimeout(() => setUploadProgress(0), 1000);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('업로드 실패:', error);
      onUploadError?.(error.message || '업로드 중 오류가 발생했습니다.');
      setUploadProgress(0);
    } finally {
      setUploading(false);
      setCropFile(null);
    }
  };

  const handleCropCancel = () => {
    setCropFile(null);
    setShowCropper(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const resetUploader = () => {
    setImageUrl('');
    setUploadProgress(0);
    setCropFile(null);
    setShowCropper(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    
    const fileInput = document.getElementById('image-upload-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="image-uploader">
      <div className="upload-area">
        <input
          type="file"
          id="image-upload-input"
          accept={acceptedTypes.join(',')}
          onChange={handleFileUpload}
          disabled={uploading || disabled}
          style={{ display: 'none' }}
        />
        
        <label 
          htmlFor="image-upload-input" 
          className={`upload-label ${uploading ? 'uploading' : ''} ${disabled ? 'disabled' : ''}`}
        >
          {uploading ? (
            <div className="upload-status">
              <div className="spinner"></div>
              <span>업로드 중... {uploadProgress}%</span>
              {uploadProgress > 0 && (
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          ) : showCropper && cropFile ? (
            <div className="crop-container">
              <Cropper
                image={URL.createObjectURL(cropFile)}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>
          ) : (
            <div className="upload-placeholder">
              <div className="upload-icon">📷</div>
              <p>{placeholder} {required && <span style={{ color: '#ef4444' }}>*</span>}</p>
              {/* <small>
                지원 형식: {acceptedTypes.join(', ')} 
                (최대 {Math.round(maxSize / (1024 * 1024))}MB)
              </small> */}
            </div>
          )}
        </label>

        {showCropper && cropFile && (
          <div className="crop-controls">
            <div className="crop-controls-row">
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="zoom-slider"
              />
              <div className="crop-actions">
                <button 
                  type="button" 
                  onClick={handleCropConfirm}
                  className="crop-confirm-button"
                >
                  확인
                </button>
                <button 
                  type="button" 
                  onClick={handleCropCancel}
                  className="crop-cancel-button"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {imageUrl && (
        <div className="upload-result">
          <img src={imageUrl} alt="업로드된 이미지" className="uploaded-image" />
          <div className="upload-actions">
            <button 
              type="button" 
              onClick={resetUploader}
              className="reset-button"
            >
              다시 업로드
            </button>
            <a 
              href={imageUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="view-button"
            >
              원본 보기
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
