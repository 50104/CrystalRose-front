import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { axiosInstance } from '@utils/axios';
import './DiaryRegister.css';

export default function DiaryRegister({ onSuccess }) {
  const { roseId } = useParams();
  const [formData, setFormData] = useState({
    roseId: roseId || '', 
    note: '',
    recordedAt: '',
    imageUrl: ''
  });
  const [roseList, setRoseList] = useState([]); 
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const normalizeRecordedAt = (value) => {
    if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)) return value;
    if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) return value + ':00';
    return value;
  };

  // 필수 필드 검증 함수
  const validateForm = () => {
    const requiredFields = [
      { field: 'roseId', name: '장미 선택' },
      { field: 'note', name: '기록 내용' },
      { field: 'recordedAt', name: '기록 날짜' },
      { field: 'imageUrl', name: '사진' }
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
    return formData.roseId && formData.note && formData.recordedAt && formData.imageUrl;
  };

  // 내 장미 목록 불러오기
  useEffect(() => {
    axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/roses/list`)
      .then(res => {
        setRoseList(res.data);
        console.log('내 장미 목록:', res.data);
      })
      .catch(err => console.error("내 장미 목록 불러오기 실패", err));
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
        `${process.env.REACT_APP_API_URL}/api/diaries/image/upload`,
        uploadForm,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const url = res.data.url;
      setFormData(prev => ({ ...prev, imageUrl: url }));
      setImagePreview(url);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: '이미지 업로드 실패' });
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
    
    // 날짜 형식 변환
    const submitData = {
        ...formData,
        recordedAt: formData.recordedAt ? normalizeRecordedAt(formData.recordedAt) : null
    };
    console.log('Submitting data:', submitData);
    console.log("선택된 장미 ID:", formData.roseId);
    
    try {
      await axiosInstance.post(
        `${process.env.REACT_APP_API_URL}/api/diaries/register`,
        {
          ...submitData,
          roseId: formData.roseId 
        }
      );
      setMessage({ type: 'success', text: '성장 기록 등록 성공' });
      setFormData({
        roseId: roseId || '',
        note: '',
        recordedAt: '',
        imageUrl: ''
      });
      setImagePreview(null);
      onSuccess?.();
    } catch (err) {
      console.error('Submit error:', err.response?.data || err.message);
      setMessage({ type: 'error', text: '등록 실패' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="diary-form-container">
      <h1 className="diary-form-title">성장 기록 추가</h1>
      
      {message && (
        <div className={`diary-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="diary-form-content">
        <div className="diary-top-section">
          <div className="diary-image-upload-section">
            <div className="diary-image-upload-container">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="preview" 
                  className="diary-image-preview"
                  onClick={() => document.getElementById('diary-image-input').click()}
                />
              ) : (
                <div 
                  className="diary-image-placeholder"
                  onClick={() => document.getElementById('diary-image-input').click()}
                >
                  <div className="diary-upload-icon">📷</div>
                  <p>클릭하여 이미지 업로드</p>
                </div>
              )}
              <input
                id="diary-image-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
              {uploading && <p className="diary-upload-status">업로드 중...</p>}
            </div>
          </div>

          <div className="diary-basic-info-section">
            <div className="diary-form-group">
              <label className="diary-form-label">
                장미 선택 <span className="diary-required">*</span>
              </label>
              <select 
                name="roseId" 
                value={formData.roseId} 
                onChange={handleChange} 
                required
                disabled={!!roseId}
                className="diary-form-select"
              >
                <option value="">장미를 선택하세요</option>
                {roseList.map(rose => (
                  <option key={rose.id} value={rose.id}>
                    {rose.nickname} ({rose.varietyName || '품종 정보 없음'})
                  </option>
                ))}
              </select>
            </div>

            <div className="diary-form-group">
              <label className="diary-form-label">
                기록 날짜 <span className="diary-required">*</span>
              </label>
              <input 
                type="datetime-local" 
                name="recordedAt" 
                value={formData.recordedAt} 
                onChange={handleChange} 
                required 
                className="diary-form-input"
              />
            </div>

            <div className="diary-form-group">
              <label className="diary-form-label">
                기록 내용 <span className="diary-required">*</span>
              </label>
              <textarea 
                name="note" 
                value={formData.note} 
                onChange={handleChange} 
                placeholder="오늘의 성장 기록을 작성해주세요"
                required 
                className="diary-form-textarea"
              />
            </div>
          </div>
        </div>

        <div className="diary-form-actions">
          <button 
            onClick={handleSubmit}
            className="diary-submit-button"
            disabled={isSubmitting || uploading || !isFormValid()}
          >
            {isSubmitting ? '등록 중...' : '기록 등록하기'}
          </button>
        </div>
      </div>
    </div>
  );
}