import React from 'react';

const SimpleModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-[9999]" 
         style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full" 
           style={{ margin: '10vh auto', maxHeight: '80vh', overflowY: 'auto' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-gray-900">{title}</h2>
          <button 
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default SimpleModal; 