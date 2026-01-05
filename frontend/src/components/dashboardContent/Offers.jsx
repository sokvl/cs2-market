import React, { useEffect, useState,useContext  } from "react";
import axios from "axios";
import Auction from "../auction/Auction";
import Spinner from '../loadingScene/Spinner';
import AuthContext from '../../lib/AuthContext';

const UserOffers = ({creatorId}) => {
 
  const [offers, setOffers] = useState([])
  const [isLoading, setIsLoading] = useState(false); 

  const { user } = useContext(AuthContext)

  if (!user) {
    window.location.href = '/'
  }

  useEffect(() => {
    const fetchData = async () => {  
      setIsLoading(true);  
        try {
          let data = await axios.get(`http://localhost:8000/offers/user-active?steam_id=${user?.steam_id}`, {headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`
          }})
          
          setOffers(data.data)
          
        } catch (error) {
          console.error('Error fetching data:', error);
        }  
        setIsLoading(false);
    };

    fetchData();

  }, []);

  return (
    <>
      <div className="offers-container">
        <div className="offers-header">
          <div className="offers-title-section">
            <i className="fa-solid fa-tags offers-icon"></i>
            <h1 className="offers-title">My Active Offers</h1>
          </div>
          <div className="offers-stats">
            <div className="stat-badge">
              <i className="fa-solid fa-fire"></i>
              <span>{offers.length} active</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <Spinner />
          </div>
        ) : offers.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-store-slash empty-icon"></i>
            <h2>No Active Offers</h2>
            <p>You don't have any active offers. Start selling items from your inventory!</p>
          </div>
        ) : (
          <div className="offers-grid">      
            {offers.map((auction, i) => (
              <div key={i} className="offer-item">
                <Auction 
                  id={auction.item.item_id} 
                  title={auction.item.item_name} 
                  image={auction.item.img_link} 
                  price={auction.price}  
                  owner={auction.owner} 
                  inspectLink={auction.item.inspect == null ? "none" : auction.item.inspect}
                  stickerElement={auction.item.stickerstring}
                  isOwnOffer={false}
                  rarityColor={auction.item.rarity}
                  offerActiveId={auction.offer_id}
                  condition={auction.item.condition}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .offers-container {
          width: 100%;
          padding: 1.5rem;
          animation: fadeInUp 0.6s ease-out;
        }

        .offers-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
        }

        .offers-title-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .offers-icon {
          font-size: 2rem;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .offers-title {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .offers-stats {
          display: flex;
          gap: 1rem;
        }

        .stat-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(245, 87, 108, 0.2);
          border: 1px solid rgba(245, 87, 108, 0.3);
          border-radius: 12px;
          color: white;
          font-weight: 600;
          font-size: 1rem;
        }

        .stat-badge i {
          color: #f5576c;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          padding: 3rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 2px dashed rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          text-align: center;
        }

        .empty-icon {
          font-size: 5rem;
          color: rgba(255, 255, 255, 0.2);
          margin-bottom: 1.5rem;
        }

        .empty-state h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
          margin: 0 0 0.75rem 0;
        }

        .empty-state p {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
        }

        .offers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
          animation: fadeIn 0.8s ease-out 0.2s both;
        }

        .offer-item {
          transition: transform 0.3s ease;
        }

        .offer-item:hover {
          transform: translateY(-8px);
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
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .offers-container {
            padding: 1rem;
          }

          .offers-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .offers-title {
            font-size: 1.5rem;
          }

          .offers-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 1rem;
          }
        }
      `}</style>
    </>
  )
}

export default UserOffers;
