import { useState } from 'react';
import './WikiRegister.css';
import { axiosInstance } from '@utils/axios';

export default function WikiRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    cultivarCode: '',
    description: '',
    flowerSize: '',
    petalCount: '',
    fragrance: '',
    diseaseResistance: '',
    growthType: '',
    usageType: '',
    recommendedPosition: '',
    imageUrl: ''
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
          description: '',
          flowerSize: '',
          petalCount: '',
          fragrance: '',
          diseaseResistance: '',
          growthType: '',
          usageType: '',
          recommendedPosition: '',
          imageUrl: ''
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

  return (
    <div className="form-container">
      <h1 className="form-title">장미 도감 등록</h1>
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="form-content">
        <div className="form-grid">
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
              <option value="하이브리드 티">하이브리드 티</option>
              <option value="플로리분다">플로리분다</option>
              <option value="그랜디플로라">그랜디플로라</option>
              <option value="클라이밍">클라이밍</option>
              <option value="미니어처">미니어처</option>
              <option value="올드 가든 로즈">올드 가든 로즈</option>
              <option value="영국 로즈">영국 로즈</option>
              <option value="기타">기타</option>
            </select>
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
              <option value="소형">소형</option>
              <option value="중형">중형</option>
              <option value="대형">대형</option>
            </select>
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
              <option value="약함">약함</option>
              <option value="중간">중간</option>
              <option value="강함">강함</option>
              <option value="없음">없음</option>
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
              <option value="약함">약함</option>
              <option value="중간">중간</option>
              <option value="강함">강함</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              생장 형태 <span className="required">*</span>
            </label>
            <select
              name="growthType" 
              value={formData.growthType}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">선택하세요</option>
              <option value="직립형">직립형</option>
              <option value="덩굴형">덩굴형</option>
              <option value="관목형">관목형</option>
              <option value="포복형">포복형</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              사용 용도 <span className="required">*</span>
            </label>
            <select
              name="usageType" 
              value={formData.usageType}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">선택하세요</option>
              <option value="정원용">정원용</option>
              <option value="절화용">절화용</option>
              <option value="화단용">화단용</option>
              <option value="지피용">지피용</option>
              <option value="다목적">다목적</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              추천 위치 <span className="required">*</span>
            </label>
            <select
              name="recommendedPosition"
              value={formData.recommendedPosition}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">선택하세요</option>
              <option value="양지">양지</option>
              <option value="반음지">반음지</option>
              <option value="음지">음지</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              대표 이미지 업로드 <span className="required">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            {uploading && <p>업로드 중...</p>}
            {imagePreview && (
              <img src={imagePreview} alt="preview" style={{ marginTop: '0.5rem', maxWidth: '100%' }} />
            )}
          </div>
        </div>

        <div className="description-group">
          <label className="form-label">
            설명 <span className="required">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="form-textarea"
            required
          ></textarea>
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