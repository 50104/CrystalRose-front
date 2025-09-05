import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './WikiRegister.css';
import { axiosInstance } from '@utils/axios';
import RatingSelector from './WikiSelector';
import { getAccess } from '../../../utils/tokenStore';
import ImageUploader from '../../common/ImageUploader';

const initialFormData = {
  name: '',
  category: '',
  cultivarCode: '',
  flowerSize: '',
  petalCount: '',
  fragrance: '',
  diseaseResistance: '',
  growthType: '',
  usageType: [],
  recommendedPosition: [],
  imageUrl: '',
  continuousBlooming: '',
  multiBlooming: '',
  growthPower: '',
  coldResistance: '',
  description: ''
};

export default function WikiRegisterPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isEditMode = location.pathname.includes('/edit/');
  const isResubmitMode = location.pathname.includes('/resubmit/');

  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getAccess();
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const loadWikiData = useCallback(async (wikiId) => {
    setLoading(true);
    try {
      const endpoint = isResubmitMode
        ? `/api/v1/wiki/user/modification/${wikiId}`
        : `/api/v1/wiki/detail/${wikiId}`;

      const response = await axiosInstance.get(endpoint);
      const wikiData = response.data;

      setFormData({
        name: wikiData.name || '',
        category: wikiData.category || '',
        cultivarCode: wikiData.cultivarCode || '',
        flowerSize: wikiData.flowerSize || '',
        petalCount: wikiData.petalCount || '',
        fragrance: wikiData.fragrance || '',
        diseaseResistance: wikiData.diseaseResistance || '',
        growthType: wikiData.growthType || '',
        usageType: wikiData.usageType?.split(',').map(v => v.trim()) || [],
        recommendedPosition: wikiData.recommendedPosition?.split(',').map(v => v.trim()) || [],
        imageUrl: wikiData.imageUrl || '',
        continuousBlooming: wikiData.continuousBlooming || '',
        multiBlooming: wikiData.multiBlooming || '',
        growthPower: wikiData.growthPower || '',
        coldResistance: wikiData.coldResistance || '',
        description: ''
      });

      // 기존 이미지 URL이 있다면 formData에 설정
      if (wikiData.imageUrl) {
        setFormData(prev => ({ ...prev, imageUrl: wikiData.imageUrl }));
      }
    } catch (err) {
      console.error('보완 제출 데이터 로딩 실패:', err);
      setMessage({ type: 'error', text: '보완 데이터를 불러오는데 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  }, [isResubmitMode]);

  useEffect(() => {
    if ((isEditMode || isResubmitMode) && id) {
      loadWikiData(id);
    }
  }, [id, isEditMode, isResubmitMode, loadWikiData]);

  // ImageUploader 성공 콜백
  const handleImageUploadSuccess = (imageUrl) => {
    setFormData(prev => ({ ...prev, imageUrl }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.imageUrl.trim()) return "사진을 업로드해주세요.";
    if (!formData.name.trim()) return "품종명을 입력해주세요.";
    if (!formData.category.trim()) return "카테고리를 선택해주세요.";
    if ((isEditMode || isResubmitMode) && !formData.description.trim()) return isResubmitMode ? "보완한 내용을 입력해주세요." : "수정 사유를 입력해주세요.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) return alert(validationError);

    const dataToSubmit = {
      ...formData,
      usageType: formData.usageType.join(', '),
      recommendedPosition: formData.recommendedPosition.join(', ')
    };

    setIsSubmitting(true);
    try {
      let response;
      if (isEditMode) {
        response = await axiosInstance.put(`/api/v1/wiki/modify/${id}`, dataToSubmit);
      } else if (isResubmitMode) {
        response = await axiosInstance.patch(`/api/v1/wiki/user/modification/${id}/resubmit`, dataToSubmit);
      } else {
        response = await axiosInstance.post(`/api/v1/wiki/register`, dataToSubmit);
      }

      if ([200, 201].includes(response.status)) {
        alert(isEditMode
          ? '장미 도감 수정 요청이 제출되었습니다. 관리자 승인 후 반영됩니다.'
          : isResubmitMode
            ? '장미 도감 보완 제출이 완료되었습니다. 관리자 재검토 후 반영됩니다.'
            : '장미 도감이 성공적으로 등록되었습니다. 관리자 승인 후 게시됩니다.');

        if (!isEditMode && !isResubmitMode) {
          setFormData(initialFormData);
        }

        navigate('/wiki/list');
      } else {
        setMessage({ type: 'error', text: '제출 중 오류가 발생했습니다.' });
      }
    } catch (error) {
      const status = error.response?.status;
      const code = error.response?.data?.code;
      const msg = error.response?.data?.message || '서버 연결 오류가 발생했습니다.';

      if (status === 409 && (
          code === 'WIKI_MODIFICATION_IN_PROGRESS' ||
          code === 'WIKI_CONCURRENT_MODIFICATION' ||
          code === 'OPTIMISTIC_LOCK_FAILURE'
      )) {
        alert(msg);
        setIsSubmitting(false);
        return;
      }

      setMessage({ type: 'error', text: msg });
      console.error('제출 오류:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prevState => {
      const currentValues = Array.isArray(prevState[field]) ? prevState[field] : [];
      const updatedValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return {
        ...prevState,
        [field]: updatedValues
      };
    });
  };

  const handleCancel = () => {
    if (isEditMode && id) {
      navigate(`/wiki/detail/${id}`);
    } else if (isResubmitMode) {
      navigate('/mypage/wiki/rejected');
    } else {
      navigate('/wiki/list');
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">
        {isEditMode ? '장미 도감 수정' : isResubmitMode ? '장미 도감 보완 제출' : '장미 도감 등록'}
      </h1>

      {loading && (
        <div className="message info">
          도감 정보를 불러오는 중
        </div>
      )}

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="form-content">
        <div className="top-section">
          <div className="image-upload-section">
            <div className="image-upload-container">
              <ImageUploader
                currentImageUrl={formData.imageUrl}
                onUploadSuccess={handleImageUploadSuccess}
                domainType="WIKI"
                folderName="wikis"
                multipartEndpoint="/api/v1/wiki/image/upload"
                multipartData={{}}
                required={true}
                placeholder="클릭하여 이미지 업로드"
              />
            </div>
          </div>

          <div className="basic-info-section">
            <div className="basic-info-container">
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
                  <option value="오스틴">오스틴</option>
                  <option value="에버로즈">에버로즈</option>
                  <option value="가와모토">가와모토</option>
                  <option value="델바">델바</option>
                  <option value="와바라">와바라</option>
                  <option value="로사오리엔티스">로사오리엔티스</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>

            <div className="basic-info-container">
              <div className="form-group">
                <label className="form-label">
                  품종 코드
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
                  생장 습성
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

            <div className="form-grid-3x3">
              <div className="form-group">
                <label className="form-label">
                  꽃잎 수
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
              <RatingSelector
                label="꽃 크기"
                name="flowerSize"
                value={formData.flowerSize}
                onChange={(val) => setFormData((prev) => ({ ...prev, flowerSize: val }))}
              />
              <RatingSelector
                label="연속개화성"
                name="continuousBlooming"
                value={formData.continuousBlooming}
                onChange={(val) => setFormData((prev) => ({ ...prev, continuousBlooming: val }))}
              />
              <RatingSelector
                label="향기"
                name="fragrance"
                value={formData.fragrance}
                onChange={(val) => setFormData((prev) => ({ ...prev, fragrance: val }))}
              />
              <RatingSelector
                label="다화성"
                name="multiBlooming"
                value={formData.multiBlooming}
                onChange={(val) => setFormData((prev) => ({ ...prev, multiBlooming: val }))}
              />
              <RatingSelector
                label="수세"
                name="growthPower"
                value={formData.growthPower}
                onChange={(val) => setFormData((prev) => ({ ...prev, growthPower: val }))}
              />
              <RatingSelector
                label="내한성"
                name="coldResistance"
                value={formData.coldResistance}
                onChange={(val) => setFormData((prev) => ({ ...prev, coldResistance: val }))}
              />
              <RatingSelector
                label="내병성"
                name="diseaseResistance"
                value={formData.diseaseResistance}
                onChange={(val) => setFormData((prev) => ({ ...prev, diseaseResistance: val }))}
              />
            </div>
          </div>
        </div>
        
        <div className="basic-info-container">
          <div className="form-group">
            <label className="form-label">
              사용 용도
            </label>
            <div className="checkbox-group">
              {['화분', '장미보더', '화단', '울타리', '조경'].map(option => (
                <label key={option} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={Array.isArray(formData.usageType) && formData.usageType.includes(option)}
                    onChange={() => handleCheckboxChange('usageType', option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">
              추천 위치
            </label>
            <div className="checkbox-group">
              {['일부 그늘진 위치', '트인 공간 어디나', '양지'].map(option => (
                <label key={option} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={Array.isArray(formData.recommendedPosition) && formData.recommendedPosition.includes(option)}
                    onChange={() => handleCheckboxChange('recommendedPosition', option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        </div>

        {(isEditMode || isResubmitMode) && (
          <div className="modification-reason-section">
            <div className="form-group">
              <label className="form-label">
                {isResubmitMode ? '보완 내용' : '수정 사유'} <span className="required">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
                placeholder={isResubmitMode ? '보완한 내용을 입력해주세요' : '수정 사유를 입력해주세요'}
                rows="4"
                required
              />
            </div>
          </div>
        )}

        <div className="form-actions">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || loading}
            className="submit-button"
          >
            {isSubmitting 
              ? (isEditMode ? '수정 중' : isResubmitMode ? '보완 제출 중' : '등록 중') 
              : (isEditMode ? '도감 수정' : isResubmitMode ? '보완 제출' : '도감 등록')
            }
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting || loading}
            className="wiki-cancel-button"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}