import { useState, useEffect } from 'react';
import { axiosInstance } from '@utils/axios';
import './CareLogRegister.css';

export default function CareLogRegister({ selectedDate, editData, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    careDate: '',
    fertilizer: '',
    pesticide: '',
    adjuvant: '',
    compost: '',
    fungicide: '',
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
        fertilizer: editData.fertilizer || '',
        pesticide: editData.pesticide || '',
        adjuvant: editData.adjuvant || '',
        compost: editData.compost || '',
        fungicide: editData.fungicide || '',
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
    try {
      if (editData) {
        await axiosInstance.put(`/api/diaries/carelogs/${editData.id}`, form);
        alert('관리 기록이 수정되었습니다.');
      } else {
        await axiosInstance.post('/api/diaries/carelogs/register', form);
        alert('관리 기록이 등록되었습니다.');
      }
      
      setForm({
        careDate: '',
        fertilizer: '',
        pesticide: '',
        adjuvant: '',
        compost: '',
        fungicide: '',
        note: ''
      });
      onSuccess?.();
    } catch (err) {
      console.error('등록/수정 실패', err);
      alert(editData ? '수정에 실패했습니다.' : '등록에 실패했습니다.');
    }
  };

  return (
    <div className="care-form-container">
      <h2 className="full-width">관리 기록 {editData ? '수정' : '등록'}</h2>
      <form onSubmit={handleSubmit} className="care-form">
        <div>
          <label>날짜</label>
          <input type="date" name="careDate" value={form.careDate} onChange={handleChange} required />
        </div>
        <div>
          <label>영양제</label>
          <input type="text" name="fertilizer" value={form.fertilizer} onChange={handleChange} />
        </div>
        <div>
          <label>살충제</label>
          <input type="text" name="pesticide" value={form.pesticide} onChange={handleChange} />
        </div>
        <div>
          <label>보조제</label>
          <input type="text" name="adjuvant" value={form.adjuvant} onChange={handleChange} />
        </div>
        <div>
          <label>살균제</label>
          <input type="text" name="fungicide" value={form.fungicide} onChange={handleChange} />
        </div>
        <div>
          <label>비료</label>
          <input type="text" name="compost" value={form.compost} onChange={handleChange} />
        </div>
        <div className="full-width">
          <label>메모</label>
          <textarea name="note" value={form.note} onChange={handleChange} />
        </div>
        <div className="form-buttons full-width">
          <button type="submit">{editData ? '수정' : '등록'}</button>
          {onCancel && <button type="button" onClick={onCancel} className="cancel-button">취소</button>}
        </div>
      </form>
    </div>
  );
}
