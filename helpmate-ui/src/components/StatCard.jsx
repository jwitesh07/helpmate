// src/components/StatCard.jsx

import React from 'react';

const StatCard = ({ number, label }) => {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold">{number}</div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  );
};

export default StatCard;