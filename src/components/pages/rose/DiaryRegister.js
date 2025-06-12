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
    setIsSubmitting(true);
    
    // 날짜 형식 변환
    const submitData = {
        ...formData,
        recordedAt: formData.recordedAt ? new Date(formData.recordedAt).toISOString() : null
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
      <h3>성장 기록 추가</h3>
      
      {message && (
        <div className={`diary-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="diary-form">
        <label>장미 선택</label>
        <select 
          name="roseId" 
          value={formData.roseId} 
          onChange={handleChange} 
          required
        >
          <option value="">장미를 선택하세요</option>
          {roseList.map(rose => (
            <option key={rose.id} value={rose.id}>
              {rose.nickname} ({rose.varietyName || '품종 정보 없음'})
            </option>
          ))}
        </select>

        <label>기록 내용</label>
        <textarea 
          name="note" 
          value={formData.note} 
          onChange={handleChange} 
          placeholder="오늘의 성장 기록을 작성해주세요"
          required 
        />

        <label>기록 날짜</label>
        <input 
          type="datetime-local" 
          name="recordedAt" 
          value={formData.recordedAt} 
          onChange={handleChange} 
          required 
        />

        <label>이미지</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageUpload} 
          disabled={uploading} 
        />
        
        {uploading && <p className="upload-status">업로드 중</p>}
        
        {imagePreview && (
          <img 
            src={imagePreview} 
            alt="preview" 
            className="image-preview"
          />
        )}

        <button 
          type="submit" 
          className="diary-submit-btn"
          disabled={isSubmitting || uploading || !formData.roseId}
        >
          {isSubmitting ? '등록 중' : '등록하기'}
        </button>
      </form>
    </div>
  );
}