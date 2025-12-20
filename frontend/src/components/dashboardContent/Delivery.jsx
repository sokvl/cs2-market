import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../../ThemeContext';
import Spinner from '../../components/loadingScene/Spinner';
import AuthContext from '../../lib/AuthContext';
import Stars from '../../components/ratingSystem/Stars'

const Delivery = ({ ownerId }) => {
  const { user } = useContext(AuthContext);
  const { isDarkMode } = useTheme();
  const [waiting, setWaiting] = useState([]);
  const [pending, setPending] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [stars, setStars] = useState(0);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let data = await axios.get(`http://localhost:8000/transactions/user-transactions?steam_id=${user.steam_id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`
        }
      });
      setPending(data.data.to_send);
      setWaiting(data.data.waiting_to_get);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirmClick = async (item) => {
    try {
      await axios.post(`http://localhost:8000/transactions/${item.transaction_id}/close_offer/`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      setSelectedItem(item);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error closing offer:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const rateUser = async () => {
    try {
      axios.post(`http://localhost:8000/transactions/ratings/`, {
        stars: stars,
        transaction: selectedItem.transaction_id
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      closeModal();

    } catch (error) {
      console.error('Error submitting rating:', error);
    }
    window.location.reload();
  };

  
  return (
    <>
      {isLoading ? (
        <div className="loading-wrapper">
          <Spinner />
        </div>
      ) : (
        <div className="delivery-container">
          {/* Receive Items Section */}
          <div className="delivery-section receive-section">
            <div className="section-header">
              <div className="header-content">
                <i className="fa-solid fa-inbox section-icon"></i>
                <h2>Receive Your Items</h2>
              </div>
              <div className="items-count">
                <span>{waiting.length} items</span>
              </div>
            </div>
            
            {waiting.length === 0 ? (
              <div className="empty-state">
                <i className="fa-solid fa-box-open"></i>
                <p>No items waiting to be received</p>
              </div>
            ) : (
              <div className="items-grid">
                {waiting.map((item, index) => (
                  <div key={index} className="item-card receive-card">
                    <div className="item-image-wrapper">
                      <img src={item.item_image} alt={item.item_name} className="item-image" />
                    </div>
                    <div className="item-details">
                      <p className="item-name">{item.item_name}</p>
                      <button
                        className="confirm-btn"
                        onClick={() => handleConfirmClick(item)}
                      >
                        <i className="fa-solid fa-handshake"></i>
                        Confirm Received
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Send Items Section */}
          <div className="delivery-section send-section">
            <div className="section-header">
              <div className="header-content">
                <i className="fa-solid fa-paper-plane section-icon"></i>
                <h2>Items to Send</h2>
              </div>
              <div className="items-count">
                <span>{pending.length} items</span>
              </div>
            </div>
            
            {pending.length === 0 ? (
              <div className="empty-state">
                <i className="fa-solid fa-check-circle"></i>
                <p>No items pending to send</p>
              </div>
            ) : (
              <div className="send-items-list">
                {pending.map((item, i) => (
                  <div key={i} className="send-item-card">
                    <div className="send-item-content">
                      <img src={item.item_image} className="send-item-image" alt={item.item_name} />
                      <div className="send-item-info">
                        <p className="send-item-name">{item.item_name}</p>
                        <div className="tradelink-section">
                          <label><i className="fa-solid fa-link"></i> Send to:</label>
                          <input 
                            type="text" 
                            value={item.buyer_tradelink} 
                            readOnly 
                            className="tradelink-input"
                          />
                          <button 
                            className="copy-btn"
                            onClick={() => navigator.clipboard.writeText(item.buyer_tradelink)}
                          >
                            <i className="fa-solid fa-copy"></i>
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="modal-body">
              <div className="rating-header">
                <i className="fa-solid fa-star-half-stroke rating-icon"></i>
                <h3>Rate Your Experience</h3>
              </div>
              <p className="rating-username">{selectedItem?.owner_username}</p>
              <div className="stars-container">
                <Stars onStarChange={(stars) => setStars(stars)} />
              </div>
              <button onClick={rateUser} className="submit-rating-btn">
                <i className="fa-solid fa-paper-plane"></i>
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .loading-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .delivery-container {
          width: 100%;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          animation: fadeInUp 0.6s ease-out;
        }

        .delivery-section {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .section-icon {
          font-size: 1.75rem;
          color: #667eea;
        }

        .section-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .items-count {
          padding: 0.5rem 1.25rem;
          background: rgba(102, 126, 234, 0.2);
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 20px;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
        }

        .empty-state i {
          font-size: 4rem;
          color: rgba(255, 255, 255, 0.2);
          margin-bottom: 1rem;
        }

        .empty-state p {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
        }

        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .item-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .item-card:hover {
          background: rgba(255, 255, 255, 0.06);
          transform: translateY(-5px);
        }

        .item-image-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 1rem;
          min-height: 150px;
        }

        .item-image {
          max-width: 140px;
          max-height: 140px;
          transition: transform 0.3s ease;
        }

        .item-image:hover {
          transform: scale(1.2);
        }

        .item-details {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .item-name {
          font-size: 1rem;
          font-weight: 600;
          color: white;
          text-align: center;
          margin: 0;
        }

        .confirm-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .confirm-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
        }

        .send-items-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .send-item-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .send-item-card:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .send-item-content {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
        }

        .send-item-image {
          width: 120px;
          height: 120px;
          object-fit: contain;
          flex-shrink: 0;
        }

        .send-item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .send-item-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: white;
          margin: 0;
        }

        .tradelink-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .tradelink-section label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
        }

        .tradelink-input {
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          font-size: 0.9rem;
          font-family: monospace;
        }

        .copy-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(102, 126, 234, 0.2);
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 8px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .copy-btn:hover {
          background: rgba(102, 126, 234, 0.3);
          transform: scale(1.05);
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease-out;
        }

        .modal-content {
          background: rgba(30, 30, 40, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s ease-out;
          position: relative;
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 50%;
          color: white;
          font-size: 1.25rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: rotate(90deg);
        }

        .modal-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .rating-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .rating-icon {
          font-size: 3rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .rating-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .rating-username {
          font-size: 1.25rem;
          font-weight: 600;
          color: #667eea;
          margin: 0;
        }

        .stars-container {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          border: 2px solid rgba(102, 126, 234, 0.3);
        }

        .submit-rating-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .submit-rating-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .delivery-container {
            padding: 1rem;
          }

          .delivery-section {
            padding: 1.5rem;
          }

          .items-grid {
            grid-template-columns: 1fr;
          }

          .send-item-content {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .modal-content {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default Delivery;
