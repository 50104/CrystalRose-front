import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './WikiRegister.css';
import { axiosInstance } from '@utils/axios';
import { safeConvertToWebP } from '../../../utils/imageUtils';

export default function WikiRegisterPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [formData, setFormData] = useState({
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
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
    }
  }, [navigate]);

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (isEditMode && id) {
      loadWikiData(id);
    }
  }, [isEditMode, id]);

  const loadWikiData = async (wikiId) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/api/v1/wiki/detail/${wikiId}`
      );
      
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
        usageType: wikiData.usageType ? wikiData.usageType.split(',') : [],
        recommendedPosition: wikiData.recommendedPosition ? wikiData.recommendedPosition.split(',') : [],
        imageUrl: wikiData.imageUrl || '',
        continuousBlooming: wikiData.continuousBlooming || '',
        multiBlooming: wikiData.multiBlooming || '',
        growthPower: wikiData.growthPower || '',
        coldResistance: wikiData.coldResistance || '',
        description: '' // 수정 시에는 새로운 사유를 입력받음
      });

      if (wikiData.imageUrl) {
        setImagePreview(wikiData.imageUrl);
      }
    } catch (error) {
      console.error('도감 데이터 로딩 실패:', error);
      setMessage({ 
        type: 'error', 
        text: '도감 정보를 불러오는데 실패했습니다.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const finalFile = await safeConvertToWebP(file);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', finalFile);

      const response = await axiosInstance.post(`/api/v1/wiki/image/upload`, formData, {
        headers: {'Content-Type': undefined}
      });

      const url = response.data.url;
      setFormData(prev => ({ ...prev, imageUrl: url }));
      setImagePreview(url);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
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

  const dataToSubmit = {
    ...formData,
    usageType: formData.usageType.join(', '),
    recommendedPosition: formData.recommendedPosition.join(', ')
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.imageUrl.trim()) {
      alert("사진을 업로드해주세요.");
      return;
    }

    if (!formData.name.trim()) {
      alert("품종명을 입력해주세요.");
      document.querySelector('input[name="name"]')?.focus();
      return;
    }

    if (!formData.category.trim()) {
      alert("카테고리를 선택해주세요.");
      document.querySelector('select[name="category"]')?.focus();
      return;
    }

    if (isEditMode && !formData.description.trim()) {
      alert("수정 사유를 입력해주세요.");
      document.querySelector('textarea[name="description"]')?.focus();
      return;
    }

    setIsSubmitting(true);
    
    try {
      let response;
      
      if (isEditMode) { // 수정
        response = await axiosInstance.put(
          `/api/v1/wiki/modify/${id}`, 
          dataToSubmit,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      } else { // 등록
        response = await axiosInstance.post(
          `/api/v1/wiki/register`, 
          dataToSubmit,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      if (response.status === 200 || response.status === 201) {
        alert(isEditMode 
          ? '장미 도감 수정 요청이 제출되었습니다. 관리자 승인 후 반영됩니다.'
          : '장미 도감이 성공적으로 등록되었습니다. 관리자 승인 후 게시됩니다.'
        );

        if (!isEditMode) { // 등록모드 폼 초기화
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
            coldResistance: '',
            description: ''
          });
          setImagePreview(null);
        } else {
          setTimeout(() => {
            navigate(`/wiki/detail/${id}`);
          }, 2000);
        }

        navigate('/wiki/list');
        return;
      } else {
        const errorMessage = isEditMode 
          ? '수정 중 오류가 발생했습니다. 다시 시도해주세요.'
          : '등록 중 오류가 발생했습니다. 다시 시도해주세요.';
        
        setMessage({
          type: 'error',
          text: errorMessage
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
    } else {
      navigate('/wiki/list');
    }
  };

  // 인증 확인이 완료되지 않았거나 로그인하지 않은 경우
  if (!localStorage.getItem('access')) {
    return (
      <div className="form-container">
        <div className="message info">
          로그인이 필요한 서비스입니다.
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h1 className="form-title">
        {isEditMode ? '장미 도감 수정' : '장미 도감 등록'}
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
                  <p>클릭하여 이미지 업로드 <span className="required">*</span></p>
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
              {uploading && <p className="upload-status">업로드 중</p>}
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

            <div className="form-group">
              <label className="form-label">
                사용 용도
              </label>
              <div className="checkbox-group">
                {['울타리', '화분', '화단', '조경', '장미보더'].map(option => (
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
                {['양지', '일부 그늘진 위치', '트인 공간 어디나'].map(option => (
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
              꽃 크기
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
              향기
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
              내병성
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
              내한성
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
              연속개화성
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
              다화성
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
              수세
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

        {isEditMode && (
          <div className="modification-reason-section">
            <div className="form-group">
              <label className="form-label">
                수정 사유 <span className="required">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
                placeholder="수정 사유를 입력해주세요"
                rows="4"
                required
              />
            </div>
          </div>
        )}

        <div className="form-actions">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || uploading || loading}
            className="submit-button"
          >
            {isSubmitting 
              ? (isEditMode ? '수정 중' : '등록 중') 
              : (isEditMode ? '도감 수정' : '도감 등록')
            }
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting || uploading || loading}
            className="cancel-button"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}