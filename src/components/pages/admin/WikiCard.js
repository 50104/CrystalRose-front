import React from 'react';
import ApproveButton from './ApproveButton';

const WikiCard = ({ wiki }) => {
  return (
    <div className="border p-4 rounded shadow bg-white">
      <div className="text-lg font-semibold">{wiki.name}</div>
      <div className="text-gray-500 text-sm">카테고리: {wiki.category}</div>
      <div className="text-gray-400 text-xs mb-2">등록일: {wiki.createdDate}</div>
      <ApproveButton id={wiki.id} />
    </div>
  );
};

export default WikiCard;
