import { useState, useEffect } from 'react';
import { axiosInstance, noAuthAxios } from '@utils/axios';
import { GetUser } from '@utils/api/user';
import { useLocation, useNavigate } from 'react-router-dom';
import { safeConvertToWebP } from '../../../utils/imageUtils';
import './RoseRegister.css';

export default function RoseRegister({ onSuccess }) {
  const { isLogin } = GetUser();
  const navigate = useNavigate();
  const location = useLocation();
  const roseData = location.state?.roseData;

  const [formData, setFormData] = useState({
    wikiId: roseData?.wikiId || '',
    nickname: roseData?.nickname || '',
    acquiredDate: roseData?.acquiredDate || '',
    locationNote: roseData?.locationNote || '',
    imageUrl: roseData?.imageUrl || ''
  });

  const [wikiList, setWikiList] = useState([]);
  const [disabledWikiIds, setDisabledWikiIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(roseData?.imageUrl || null);
  const wikiName = roseData?.varietyName || '';

  const validateForm = () => {
    const requiredFields = [
      { field: 'wikiId', name: '장미 선택' },
      { field: 'nickname', name: '별명' },
      { field: 'acquiredDate', name: '획득 날짜' }
    ];

    const missingFields = requiredFields.filter(({ field }) => !formData[field]);

    if (missingFields.length > 0) {
      const missingNames = missingFields.map(({ name }) => name).join(', ');
      alert(`다음 필수 항목을 입력해주세요: ${missingNames}`);
      return false;
    }
    return true;
  };

  const isFormValid = () => {
    return formData.wikiId && formData.nickname && formData.acquiredDate;
  };

  useEffect(() => {
    noAuthAxios.get(`/api/v1/wiki/list`)
      .then(res => {
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
            ? res.data.data
            : [];
        setWikiList(data);
      })
      .catch(err => console.error("Wiki 불러오기 실패", err));

    if (isLogin) {
      axiosInstance.get(`/api/roses/mine/wiki-ids`)
        .then(res => setDisabledWikiIds(res.data))
        .catch(err => console.error("등록된 장미 Wiki ID 조회 실패", err));
    }
    if (roseData?.wikiId && !roseData.id) {
      setFormData(prev => ({ ...prev, imageUrl: '' }));
      setImagePreview(null);
    }
  }, [isLogin, roseData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'wikiId') {
      const selectedId = parseInt(value);
      if (disabledWikiIds.includes(selectedId)) {
        alert('이미 등록한 장미입니다.');
        return;
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const finalFile = await safeConvertToWebP(file);

    setUploading(true);
    try {
      const uploadForm = new FormData();
      uploadForm.append('file', finalFile);

      const res = await axiosInstance.post(
        `/api/roses/image/upload`,
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

    if (!validateForm()) return;

    try {
      // 중복 체크 (이중 확인)
      const checkRes = await axiosInstance.get(`/api/roses/check-duplicate`, {
        params: { wikiId: formData.wikiId }
      });

      if (checkRes.data?.exists) {
        alert('해당 품종의 장미는 이미 등록되어 있습니다.');
        return;
      }

      setIsSubmitting(true);

      if (roseData?.id) {
        await axiosInstance.put(`/api/roses/modify/${roseData.id}`, formData);
        setMessage({ type: 'success', text: '수정 완료!' });
      } else {
        await axiosInstance.post(`/api/roses/mine`, formData);
        setMessage({ type: 'success', text: '등록 성공!' });
      }

      setFormData({
        wikiId: '', nickname: '', acquiredDate: '', locationNote: '', imageUrl: ''
      });
      setImagePreview(null);
      onSuccess?.();
      navigate("/roses/list");
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: '등록 실패!' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedWikiList = [...wikiList].sort((a, b) => {
    const aRegistered = disabledWikiIds.includes(a.id);
    const bRegistered = disabledWikiIds.includes(b.id);
    return aRegistered - bRegistered;
  });

  return (
    <div className="rose-form-container">
      <h1 className="rose-form-title">내 장미 추가</h1>

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
              {roseData?.wikiId ? (
                <>
                  <input
                    type="text"
                    value={wikiName}
                    disabled
                    className="rose-form-input"
                  />
                  <input type="hidden" name="wikiId" value={formData.wikiId} />
                </>
              ) : (
                <select
                  name="wikiId"
                  value={formData.wikiId}
                  onChange={handleChange}
                  required
                  className="rose-form-select"
                >
                  <option value="">장미를 선택하세요</option>
                  {sortedWikiList.map(wiki => {
                    const isDisabled = disabledWikiIds.includes(wiki.id);
                    return (
                      <option
                        key={wiki.id}
                        value={wiki.id}
                        disabled={isDisabled}
                      >
                        {wiki.name} {isDisabled ? '(등록됨)' : ''}
                      </option>
                    );
                  })}
                </select>
              )}
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
            {isSubmitting ? '처리 중...' : roseData ? '수정' : '장미 등록'}
          </button>
          <button
            type="button"
            className="rose-cancel-button"
            onClick={() => {
              if (roseData?.wikiId && !roseData.id) {
                navigate('/wiki/list');
              } else {
                navigate('/roses/list');
              }
            }}
            disabled={isSubmitting || uploading}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
