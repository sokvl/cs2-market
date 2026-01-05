import React from 'react';
import ReactDOM from 'react-dom';

const InfoModal = ({ isOpen, onClose, title, icon, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      <div className="info-modal-overlay" onClick={onClose}>
        <div className="info-modal-container" onClick={(e) => e.stopPropagation()}>
          <button className="info-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>

          <div className="info-modal-header">
            <div className="info-modal-icon">
              <i className={icon}></i>
            </div>
            <h2 className="info-modal-title">{title}</h2>
          </div>

          <div className="info-modal-content">
            {children}
          </div>
        </div>
      </div>

      <style jsx>{`
        .info-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(12px);
          z-index: 150;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          animation: fadeIn 0.3s ease-out;
          overflow-y: auto;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .info-modal-container {
          position: relative;
          background: linear-gradient(135deg, rgba(26, 10, 46, 0.98) 0%, rgba(15, 10, 26, 0.98) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 3rem;
          width: 100%;
          max-width: 900px;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .info-modal-close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.25rem;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .info-modal-close:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.4);
          color: #ef4444;
          transform: rotate(90deg);
        }

        .info-modal-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .info-modal-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .info-modal-icon i {
          font-size: 2.5rem;
          color: white;
        }

        .info-modal-title {
          font-size: 2.25rem;
          font-weight: 700;
          color: white;
          text-align: center;
          margin: 0;
        }

        .info-modal-content {
          color: rgba(255, 255, 255, 0.85);
          font-size: 1rem;
          line-height: 1.8;
        }

        /* Scrollbar */
        .info-modal-container::-webkit-scrollbar {
          width: 8px;
        }

        .info-modal-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        .info-modal-container::-webkit-scrollbar-thumb {
          background: rgba(102, 126, 234, 0.5);
          border-radius: 10px;
        }

        .info-modal-container::-webkit-scrollbar-thumb:hover {
          background: rgba(102, 126, 234, 0.7);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .info-modal-overlay {
            padding: 1rem;
          }

          .info-modal-container {
            padding: 2rem;
          }

          .info-modal-close {
            top: 1rem;
            right: 1rem;
            width: 36px;
            height: 36px;
          }

          .info-modal-icon {
            width: 64px;
            height: 64px;
          }

          .info-modal-icon i {
            font-size: 2rem;
          }

          .info-modal-title {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </>,
    document.body
  );
};

export default InfoModal;
