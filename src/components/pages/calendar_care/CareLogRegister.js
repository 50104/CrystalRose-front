import { useState, useEffect } from 'react';
import { axiosInstance } from '@utils/axios';
import './CareLogRegister.css';

export default function CareLogRegister({ selectedDate, editData, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    careDate: '',
    watering: '',
    fertilizer: '',
    pesticide: '',
    adjuvant: '',
    fungicide: '',
    compost: '',
    note: ''
  });

  useEffect(() => {
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setForm(prev => ({
        ...prev,
        careDate: `${year}-${month}-${day}`
      }));
    }
    if (editData) {
      setForm({
        careDate: editData.careDate || '',
        watering: editData.watering || '',
        fertilizer: editData.fertilizer || '',
        pesticide: editData.pesticide || '',
        adjuvant: editData.adjuvant || '',
        fungicide: editData.fungicide || '',
        compost: editData.compost || '',
        note: editData.note || ''
      });
    }
  }, [selectedDate, editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 모바일에서 키보드 숨기기
    if (e.target.querySelector('input:focus, textarea:focus')) {
      e.target.querySelector('input:focus, textarea:focus').blur();
    }
    
    try {
      if (editData) {
        const { data } = await axiosInstance.put(`/api/diaries/carelogs/${editData.id}`, form);
        alert('관리 기록이 수정되었습니다.');
        onSuccess?.(data);
      } else {
        const { data } = await axiosInstance.post('/api/diaries/carelogs/register', form);
        alert('관리 기록이 등록되었습니다.');
        onSuccess?.(data);
      }
      
      setForm({
        careDate: '',
        watering: '',
        fertilizer: '',
        pesticide: '',
        adjuvant: '',
        fungicide: '',
        compost: '',
        note: ''
      });
      onSuccess?.();
    } catch (err) {
      console.error('등록/수정 실패', err);
      alert(editData ? '수정에 실패했습니다.' : '등록에 실패했습니다.');
    }
  };

  return (
    <div>
      <h2 className="full-width">관리 기록 {editData ? '수정' : '등록'}</h2>
      <form onSubmit={handleSubmit} className="care-form">
        <input type="hidden" name="careDate" value={form.careDate} onChange={handleChange} required />
        <div>
          <label>💧 관수</label>
          <input 
            type="text" 
            name="watering" 
            value={form.watering} 
            onChange={handleChange}
            placeholder="물주기 완료"
            autoComplete="off"
          />
        </div>
        <div>
          <label>💊 영양제</label>
          <input 
            type="text" 
            name="fertilizer" 
            value={form.fertilizer} 
            onChange={handleChange}
            placeholder="액체비료 10ml"
            autoComplete="off"
          />
        </div>
        <div>
          <label>🪰 살충제</label>
          <input 
            type="text" 
            name="pesticide" 
            value={form.pesticide} 
            onChange={handleChange}
            placeholder="진딧물 방제"
            autoComplete="off"
          />
        </div>
        <div>
          <label>🧪 보조제</label>
          <input 
            type="text" 
            name="adjuvant" 
            value={form.adjuvant} 
            onChange={handleChange}
            placeholder="활력제 사용"
            autoComplete="off"
          />
        </div>
        <div>
          <label>🧼 살균제</label>
          <input 
            type="text" 
            name="fungicide" 
            value={form.fungicide} 
            onChange={handleChange}
            placeholder="흰가루병 예방"
            autoComplete="off"
          />
        </div>
        <div>
          <label>💩 비료</label>
          <input 
            type="text" 
            name="compost" 
            value={form.compost} 
            onChange={handleChange}
            placeholder="유기질 비료"
            autoComplete="off"
          />
        </div>
        <div className="full-width">
          <label>📝 메모</label>
          <textarea 
            name="note" 
            value={form.note} 
            onChange={handleChange}
            placeholder="오늘의 관리 내용을 자세히 기록해보세요"
            rows="4"
          />
        </div>
        <div className="form-buttons full-width">
          <button type="submit">{editData ? '수정' : '등록'}</button>
          {onCancel && <button type="button" onClick={onCancel} className="cancel-button">취소</button>}
        </div>
      </form>
    </div>
  );
}
