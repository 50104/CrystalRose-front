import { useState, useEffect } from 'react';
import { axiosInstance } from '@utils/axios';
import { GetUser } from '@utils/api/user';
import './RoseRegister.css';

export default function RoseRegister({ onSuccess }) {
  const { isLogin } = GetUser();
  const [formData, setFormData] = useState({
    wikiId: '',
    nickname: '',
    acquiredDate: '',
    locationNote: '',
    imageUrl: ''
  });

  const [wikiList, setWikiList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // 필수 필드 검증 함수
  const validateForm = () => {
    const requiredFields = [
      { field: 'wikiId', name: '장미 선택' },
      { field: 'nickname', name: '별명' },
      { field: 'acquiredDate', name: '획득 날짜' }
    ];

    const missingFields = requiredFields.filter(({ field }) => !formData[field]);
    
    if (missingFields.length > 0) {
      const missingFieldNames = missingFields.map(({ name }) => name).join(', ');
      alert(`다음 필수 항목을 입력해주세요: ${missingFieldNames}`);
      return false;
    }
    return true;
  };

  // 모든 필수 필드가 채워졌는지 확인
  const isFormValid = () => {
    return formData.wikiId && formData.nickname && formData.acquiredDate;
  };

  useEffect(() => {
    axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/v1/wiki/list`)
      .then(res => setWikiList(res.data))
      .catch(err => console.error("Wiki 불러오기 실패", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploadForm = new FormData();
      uploadForm.append('file', file);

      const res = await axiosInstance.post(
        `${process.env.REACT_APP_API_URL}/api/roses/image/upload`,
        uploadForm,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const url = res.data.url;
      setFormData(prev => ({ ...prev, imageUrl: url }));
      setImagePreview(url);
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
      setMessage({ type: 'error', text: '이미지 업로드에 실패했습니다.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 폼 검증
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosInstance.post(`${process.env.REACT_APP_API_URL}/api/roses/mine`, {
        ...formData
      });
      setMessage({ type: 'success', text: '등록 성공!' });
      setFormData({
        wikiId: '', nickname: '', acquiredDate: '', locationNote: '', imageUrl: ''
      });
      setImagePreview(null);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: '등록 실패!' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rose-form-container">
      <h1 className="rose-form-title">내 장미 등록</h1>

      {message && (
        <div className={`rose-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="rose-form-content">
        <div className="rose-top-section">
          <div className="rose-image-upload-section">
            <div className="rose-image-upload-container">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="preview" 
                  className="rose-image-preview"
                  onClick={() => document.getElementById('rose-image-input').click()}
                />
              ) : (
                <div 
                  className="rose-image-placeholder"
                  onClick={() => document.getElementById('rose-image-input').click()}
                >
                  <div className="rose-upload-icon">📷</div>
                  <p>클릭하여 이미지 업로드</p>
                </div>
              )}
              <input
                id="rose-image-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
              {uploading && <p className="rose-upload-status">업로드 중...</p>}
            </div>
          </div>

          <div className="rose-basic-info-section">
            <div className="rose-form-group">
              <label className="rose-form-label">
                장미 선택 <span className="rose-required">*</span>
              </label>
              <select 
                name="wikiId" 
                value={formData.wikiId} 
                onChange={handleChange} 
                required
                className="rose-form-select"
              >
                <option value="">장미를 선택하세요</option>
                {wikiList.map(wiki => (
                  <option key={wiki.id} value={wiki.id}>{wiki.name}</option>
                ))}
              </select>
            </div>

            <div className="rose-form-group">
              <label className="rose-form-label">
                별명 <span className="rose-required">*</span>
              </label>
              <input 
                type="text" 
                name="nickname" 
                value={formData.nickname} 
                onChange={handleChange} 
                placeholder="장미의 별명을 입력하세요"
                required
                className="rose-form-input"
              />
            </div>

            <div className="rose-form-group">
              <label className="rose-form-label">
                획득 날짜 <span className="rose-required">*</span>
              </label>
              <input 
                type="date" 
                name="acquiredDate" 
                value={formData.acquiredDate} 
                onChange={handleChange} 
                required
                className="rose-form-input"
              />
            </div>

            <div className="rose-form-group">
              <label className="rose-form-label">메모</label>
              <textarea 
                name="locationNote" 
                value={formData.locationNote} 
                onChange={handleChange}
                placeholder="기억하고 싶은 내용을 메모하세요"
                required 
                className="rose-form-textarea"
              />
            </div>
          </div>
        </div>

        <div className="rose-form-actions">
          <button 
            onClick={handleSubmit}
            className="rose-submit-button"
            disabled={isSubmitting || !isLogin || uploading || !isFormValid()}
          >
            {isSubmitting ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  );
}