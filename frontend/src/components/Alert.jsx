import React from 'react';

const Alert = ({ type = 'error', message }) => {
  if (!message) return null;
  return <div className={`alert alert-${type}`}>{message}</div>;
};

export default Alert;
