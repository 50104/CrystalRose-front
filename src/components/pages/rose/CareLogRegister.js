import { useState } from 'react';
import { axiosInstance } from '@utils/axios';
import './CareLogRegister.css';

export default function CareLogRegister({ onSuccess }) {
  const [form, setForm] = useState({
    careDate: '',
    fertilizer: '',
    pesticide: '',
    adjuvant: '',
    compost: '',
    fungicide: '',
    note: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/diaries/carelogs/register', form);
      alert('관리 기록이 등록되었습니다.');
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
      console.error('등록 실패', err);
      alert('등록에 실패했습니다.');
    }
  };

  return (
    <div className="care-form-container">
      <h2>🌿 관리 기록 등록</h2>
      <form onSubmit={handleSubmit} className="care-form">
        <label>날짜</label>
        <input type="date" name="careDate" value={form.careDate} onChange={handleChange} required />
        <label>영양제</label>
        <input type="text" name="fertilizer" value={form.fertilizer} onChange={handleChange} />
        <label>살충제</label>
        <input type="text" name="pesticide" value={form.pesticide} onChange={handleChange} />
        <label>보조제</label>
        <input type="text" name="adjuvant" value={form.adjuvant} onChange={handleChange} />
        <label>살균제</label>
        <input type="text" name="fungicide" value={form.fungicide} onChange={handleChange} />
        <label>비료</label>
        <input type="text" name="compost" value={form.compost} onChange={handleChange} />
        <label>메모</label>
        <textarea name="note" value={form.note} onChange={handleChange} />
        <button type="submit">등록</button>
      </form>
    </div>
  );
}
