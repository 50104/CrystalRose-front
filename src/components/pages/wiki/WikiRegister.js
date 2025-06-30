import { useState } from 'react';
import './WikiRegister.css';
import { axiosInstance } from '@utils/axios';

export default function WikiRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    cultivarCode: '',
    flowerSize: '',
    petalCount: '',
    fragrance: '',
    diseaseResistance: '',
    growthType: '',
    usageType: '',
    recommendedPosition: '',
    imageUrl: '',
    continuousBlooming: '', 
    multiBlooming: '',      
    growthPower: '',        
    coldResistance: ''     
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post(
        `${process.env.REACT_APP_API_URL}/api/v1/wiki/image/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const url = response.data.url;
      setFormData(prev => ({ ...prev, imageUrl: url }));
      setImagePreview(url);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      console.log('imageUrl:', formData.imageUrl);
      setMessage({ type: 'error', text: '이미지 업로드에 실패했습니다.' });
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await axiosInstance.post(
        `${process.env.REACT_APP_API_URL}/api/v1/wiki/register`, 
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        setMessage({
          type: 'success',
          text: '장미 도감이 성공적으로 등록되었습니다. 관리자 승인 후 게시됩니다.'
        });
        setFormData({
          name: '',
          category: '',
          cultivarCode: '',
          flowerSize: '',
          petalCount: '',
          fragrance: '',
          diseaseResistance: '',
          growthType: '',
          usageType: '',
          recommendedPosition: '',
          imageUrl: '',
          continuousBlooming: '',
          multiBlooming: '',
          growthPower: '',
          coldResistance: ''
        });
        setImagePreview(null);
      } else {
        setMessage({
          type: 'error',
          text: '등록 중 오류가 발생했습니다. 다시 시도해주세요.'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: '서버 연결 오류가 발생했습니다.'
      });
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prevState => {
      const rawValue = prevState[field];
      const currentValues = typeof rawValue === 'string' 
        ? rawValue.split(',') 
        : [];

      const updatedValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];

      return {
        ...prevState,
        [field]: updatedValues.join(',')
      };
    });
  };

  return (
    <div className="form-container">
      <h1 className="form-title">장미 도감 등록</h1>
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="form-content">
        <div className="top-section">
          <div className="image-upload-section">
            <div className="image-upload-container">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="preview" 
                  className="image-preview"
                  onClick={() => document.getElementById('image-input').click()}
                />
              ) : (
                <div 
                  className="image-placeholder"
                  onClick={() => document.getElementById('image-input').click()}
                >
                  <div className="upload-icon">📷</div>
                  <p>클릭하여 이미지 업로드</p>
                </div>
              )}
              <input
                id="image-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
              {uploading && <p className="upload-status">업로드 중...</p>}
            </div>
          </div>

          <div className="basic-info-section">
            <div className="form-group">
              <label className="form-label">
                품종명 <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                품종 코드 <span className="required">*</span>
              </label>
              <input
                type="text"
                name="cultivarCode"  
                value={formData.cultivarCode}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                꽃잎 수 <span className="required">*</span>
              </label>
              <input
                type="text"
                name="petalCount"
                value={formData.petalCount}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                사용 용도 <span className="required">*</span>
              </label>
              <div className="checkbox-group">
                {['울타리', '화분', '화단', '조경', '장미보더'].map(option => (
                  <label key={option} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.usageType.split(',').includes(option)}
                      onChange={() => handleCheckboxChange('usageType', option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                추천 위치 <span className="required">*</span>
              </label>
              <div className="checkbox-group">
                {['양지', '일부 그늘진 위치', '트인 공간 어디나'].map(option => (
                  <label key={option} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.recommendedPosition.split(',').includes(option)}
                      onChange={() => handleCheckboxChange('recommendedPosition', option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="form-grid-3x3">
          <div className="form-group">
            <label className="form-label">
              카테고리 <span className="required">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">선택하세요</option>
              <option value="오스틴">오스틴</option>
              <option value="에버로즈">에버로즈</option>
              <option value="가와모토">가와모토</option>
              <option value="델바">델바</option>
              <option value="와바라">와바라</option>
              <option value="로사오리엔티스">로사오리엔티스</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              꽃 크기 <span className="required">*</span>
            </label>
            <select
              name="flowerSize"
              value={formData.flowerSize}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">선택하세요</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              향기 <span className="required">*</span>
            </label>
            <select
              name="fragrance"
              value={formData.fragrance}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">선택하세요</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              내병성 <span className="required">*</span>
            </label>
            <select
              name="diseaseResistance" 
              value={formData.diseaseResistance}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">선택하세요</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              내한성 <span className="required">*</span>
            </label>
            <select
              name="coldResistance"
              value={formData.coldResistance}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">선택하세요</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              연속개화성 <span className="required">*</span>
            </label>
            <select
              name="continuousBlooming"
              value={formData.continuousBlooming}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">선택하세요</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              다화성 <span className="required">*</span>
            </label>
            <select
              name="multiBlooming"
              value={formData.multiBlooming}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">선택하세요</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              수세 <span className="required">*</span>
            </label>
            <select
              name="growthPower"
              value={formData.growthPower}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">선택하세요</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              생장 습성 <span className="required">*</span>
            </label>
            <select
              name="growthType" 
              value={formData.growthType}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">선택하세요</option>
              <option value="직립성 관목형">직립성 관목형</option>
              <option value="약하게 퍼지는 관목형">약하게 퍼지는 관목형</option>
              <option value="반직립성 관목형">반직립성 관목형</option>
              <option value="포복형">포복형</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || uploading}
            className="submit-button"
          >
            {isSubmitting ? '등록 중...' : '도감 등록하기'}
          </button>
        </div>
      </div>
    </div>
  );
}