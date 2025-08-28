import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { axiosInstance } from '@utils/axios';
import ImageUploader from '../../common/ImageUploader';
import './DiaryRegister.css';

export default function DiaryRegister({ onSuccess, mode = 'register', initialData = null }) {
  const { diaryId, roseId: paramRoseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [roseList, setRoseList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    roseId: '',
    note: '',
    recordedAt: '',
    imageUrl: ''
  });

  const isEditMode = mode === 'edit' || location.pathname.includes('/edit/');

  useEffect(() => {
    const loadData = async () => {
      if (isEditMode && diaryId) {
        try {
          const res = await axiosInstance.get(`/api/diaries/${diaryId}`);
          const data = res.data;
          setFormData({
            roseId: data.roseId,
            note: data.note || '',
            recordedAt: data.recordedAt?.slice(0, 10) || '',
            imageUrl: data.imageUrl || ''
          });
        } catch (err) {
          console.error("수정 데이터 불러오기 실패", err);
          alert("수정할 데이터를 불러오지 못했습니다.");
          navigate(-1);
        }
      } else if (paramRoseId) {
        setFormData(prev => ({ ...prev, roseId: paramRoseId }));
      }
    };

    loadData();
  }, [isEditMode, diaryId, paramRoseId, navigate]);

  useEffect(() => {
    axiosInstance.get(`/api/roses/list`)
      .then(res => setRoseList(res.data))
      .catch(err => console.error("장미 목록 불러오기 실패", err));
  }, []);

  const validateForm = () => {
    const requiredFields = [
      { field: 'roseId', name: '장미 선택' },
      { field: 'note', name: '기록 내용' },
      { field: 'recordedAt', name: '기록 날짜' },
      { field: 'imageUrl', name: '사진' }
    ];
    const missingFields = requiredFields.filter(({ field }) => !formData[field]);
    if (missingFields.length > 0) {
      const missingNames = missingFields.map(({ name }) => name).join(', ');
      alert(`다음 항목을 입력해주세요: ${missingNames}`);
      return false;
    }
    return true;
  };

  const isFormValid = () => {
    return formData.roseId && formData.note && formData.recordedAt && formData.imageUrl;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUploadSuccess = (imageUrl) => {
    setFormData(prev => ({ ...prev, imageUrl }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    const payload = {
      ...formData,
      recordedAt: formData.recordedAt.trim()
    };

    try {
      if (isEditMode && diaryId) {
        await axiosInstance.put(`/api/diaries/update/${diaryId}`, payload);
        setMessage({ type: 'success', text: '기록이 수정되었습니다.' });
      } else {
        await axiosInstance.post(`/api/diaries/register`, payload);
        setMessage({ type: 'success', text: '기록이 등록되었습니다.' });
      }

      setTimeout(() => {
        if (formData.roseId) {
          navigate(`/diaries/${formData.roseId}/timeline`);
        } else {
          navigate('/diaries/list');
        }
        onSuccess?.();
      }, 800);

    } catch (err) {
      console.error('제출 실패', err);
      setMessage({ type: 'error', text: '제출에 실패했습니다.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (formData.roseId) {
      navigate(`/diaries/${formData.roseId}/timeline`);
    } else {
      navigate('/diaries/list');
    }
  };

  return (
    <div className="diary-form-container">
      <h1 className="diary-form-title">{isEditMode ? '성장 기록 수정' : '성장 기록 추가'}</h1>

      {message && (
        <div className={`diary-message ${message.type}`}>{message.text}</div>
      )}

      <div className="diary-form-content">
        <div className="diary-top-section">
          <div className="diary-image-upload-section">
            <div className="diary-image-upload-container">
              <ImageUploader
                currentImageUrl={formData.imageUrl}
                onUploadSuccess={handleImageUploadSuccess}
                domainType="DIARY"
                folderName="diaries"
                multipartEndpoint="/api/diaries/image/upload"
                multipartData={{}}
                required={true}
                placeholder="클릭하여 이미지 업로드"
              />
            </div>
          </div>

          <div className="diary-basic-info-section">
            <div className="diary-form-group">
              <label className="diary-form-label">장미 선택 <span className="diary-required">*</span></label>
              <select
                name="roseId"
                value={formData.roseId}
                onChange={handleChange}
                required
                disabled={!!paramRoseId}
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
              <label className="diary-form-label">기록 날짜 <span className="diary-required">*</span></label>
              <input
                type="date"
                name="recordedAt"
                value={formData.recordedAt}
                onChange={handleChange}
                required
                className="diary-form-input"
              />
            </div>

            <div className="diary-form-group">
              <label className="diary-form-label">기록 내용 <span className="diary-required">*</span></label>
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
            disabled={isSubmitting || !isFormValid()}
          >
            {isSubmitting ? (isEditMode ? '수정 중' : '등록 중') : (isEditMode ? '기록 수정' : '기록 등록')}
          </button>
          <button
            onClick={handleCancel}
            className="diary-cancel-button"
            disabled={isSubmitting}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
