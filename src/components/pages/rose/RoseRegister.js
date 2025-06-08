import { useState, useEffect } from 'react';
import { axiosInstance } from '@utils/axios';
import { GetUser } from '@utils/api/user';
import './Rose.css';

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
        `${process.env.REACT_APP_API_URL}/api/roses/upload`,
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
      <h2>내 장미 등록</h2>

      {message && <div className={`message ${message.type}`}>{message.text}</div>}

      <form onSubmit={handleSubmit} className="rose-form">
        <label>장미 선택</label>
        <select name="wikiId" value={formData.wikiId} onChange={handleChange} required>
          <option value="">선택</option>
          {wikiList.map(wiki => (
            <option key={wiki.id} value={wiki.id}>{wiki.name}</option>
          ))}
        </select>

        <label>별명</label>
        <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} required />

        <label>획득 날짜</label>
        <input type="date" name="acquiredDate" value={formData.acquiredDate} onChange={handleChange} required />

        <label>장소 메모</label>
        <input type="text" name="locationNote" value={formData.locationNote} onChange={handleChange} />

        <label>대표 이미지</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
        {uploading && <p>업로드 중...</p>}
        {imagePreview && (
          <img src={imagePreview} alt="preview" style={{ marginTop: '0.5rem', maxWidth: '100%' }} />
        )}

        <button type="submit" disabled={isSubmitting || !isLogin || uploading}>
          {isSubmitting ? '등록 중...' : '등록하기'}
        </button>
      </form>
    </div>
  );
}
