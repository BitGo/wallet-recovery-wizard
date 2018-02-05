import React from 'react';

const Input = ({ label, onUpdate, password }) => (
  <div>
    {label && <label className='input-label'>{label}</label>}
    <div className='input-text'>
      <input
        type={password ? 'password' : 'text'}
        onChange={onUpdate}
      />
    </div>
  </div>
);


export default Input;