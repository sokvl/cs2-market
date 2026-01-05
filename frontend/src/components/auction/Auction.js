
import React, {useContext, useState} from 'react'
import ReactDOM from 'react-dom'
import { toast } from 'react-toastify'
import OfferDetailModal from './OfferDetailModal';
import AuthContext from '../../lib/AuthContext';
import { useLocation } from 'react-router-dom';


const Auction = ({ id, title, offerActiveId, image, price, seed, condition, inventory, rarityColor, owner, isOwnOffer, inspectLink, category, stickerElement, tradeable }) => {
  
  const { user } = useContext(AuthContext)
  const location = useLocation();

  const isOwner = user?.steam_id === owner?.steam_id;
  const isMarketPage = location.pathname === '/market';
  
  const [openModal, setopenModal] = useState(false);
  const modalStateHandler = () => {
    if (!user?.steam_id) {
      toast.info('🔐 Aby poznać szczegóły tej aukcji, zaloguj się przez Steam', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    setopenModal(prevState => !prevState);
  }

  return(
    <>
      {openModal && user?.steam_id != null && ReactDOM.createPortal(
        <OfferDetailModal 
          closerHandler={modalStateHandler}
          imageLink={image}
          inspectLink={inspectLink}
          name={title}
          steam_price={price}
          isOwner={isOwnOffer}
          stickerString={stickerElement}
          owner={owner}
          rarityColor={rarityColor}
          category={category}
          id={id}
          price={price}
          offerAciveId={offerActiveId}
          condition={condition}
          tradeable={tradeable}
          inventory={inventory}
        />,
        document.body
      )}
      
      <div className="auction-card" onClick={modalStateHandler}>
        <div className="auction-card-inner">
          {/* Glow effect based on rarity */}
          <div className="auction-glow" style={{ 
            background: `radial-gradient(circle at 50% 0%, rgba(${parseInt(rarityColor.slice(0,2), 16)}, ${parseInt(rarityColor.slice(2,4), 16)}, ${parseInt(rarityColor.slice(4,6), 16)}, 0.15), transparent 70%)`
          }}></div>
          
          {/* Owner badge */}
          {isOwner && isMarketPage && (
            <div className="owner-badge">
              <i className="fa-solid fa-crown"></i>
              <span>Your Item</span>
            </div>
          )}

          {/* Image container */}
          <div className="auction-image-wrapper" style={{ borderColor: `#${rarityColor}` }}>
            <img src={image} alt={title} className="auction-image" />
          </div>

          {/* Content */}
          <div className="auction-content">
            <h3 className="auction-title">{title}</h3>
            
            {condition && (
              <div className="auction-condition">
                <i className="fa-solid fa-certificate"></i>
                <span>{condition}</span>
              </div>
            )}

            <div className="auction-footer">
              <div className="auction-price">
                <i className={`${isOwnOffer ? 'fa-brands fa-steam-symbol' : 'fa-solid fa-coins'}`}></i>
                <span className="price-value">{price}$</span>
              </div>

              {isOwnOffer && (
                <button className="list-button" onClick={(e) => { e.stopPropagation(); modalStateHandler(); }}>
                  <i className="fa-solid fa-tag"></i>
                  <span>List</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <style jsx>{`
          .auction-card {
            position: relative;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .auction-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
            border-color: rgba(255, 255, 255, 0.2);
          }

          .auction-card-inner {
            position: relative;
            padding: 1rem;
          }

          .auction-glow {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 100%;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          .auction-card:hover .auction-glow {
            opacity: 1;
          }

          .owner-badge {
            position: absolute;
            top: 0.75rem;
            right: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.375rem;
            padding: 0.375rem 0.75rem;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 8px;
            font-size: 0.75rem;
            font-weight: 600;
            color: white;
            z-index: 10;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
          }

          .owner-badge i {
            font-size: 0.875rem;
          }

          .auction-image-wrapper {
            position: relative;
            width: 100%;
            aspect-ratio: 4/3;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
            border: 3px solid;
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 1rem;
          }

          .auction-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            transition: transform 0.3s ease;
          }

          .auction-card:hover .auction-image {
            transform: scale(1.1);
          }

          .auction-content {
            position: relative;
            z-index: 1;
          }

          .auction-title {
            font-size: 0.875rem;
            font-weight: 600;
            color: white;
            margin: 0 0 0.75rem 0;
            line-height: 1.4;
            height: 2.8em;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .auction-condition {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
            padding: 0.375rem 0.75rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            font-size: 0.75rem;
            color: rgba(255, 255, 255, 0.8);
            width: fit-content;
          }

          .auction-condition i {
            color: #fbbf24;
            font-size: 0.875rem;
          }

          .auction-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
          }

          .auction-price {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.625rem 1rem;
            background: rgba(102, 126, 234, 0.15);
            border: 1px solid rgba(102, 126, 234, 0.3);
            border-radius: 10px;
            flex: 1;
          }

          .auction-price i {
            color: #667eea;
            font-size: 1.125rem;
          }

          .price-value {
            font-size: 1rem;
            font-weight: 700;
            color: white;
          }

          .list-button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.625rem 1rem;
            background: rgba(139, 92, 246, 0.2);
            border: 1px solid rgba(139, 92, 246, 0.4);
            border-radius: 10px;
            color: #a78bfa;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .list-button:hover {
            background: rgba(139, 92, 246, 0.3);
            border-color: rgba(139, 92, 246, 0.6);
            color: #c4b5fd;
            transform: scale(1.05);
          }

          /* Responsive */
          @media (max-width: 768px) {
            .auction-card-inner {
              padding: 0.75rem;
            }

            .auction-title {
              font-size: 0.8125rem;
            }

            .auction-price {
              padding: 0.5rem 0.75rem;
            }

            .price-value {
              font-size: 0.9375rem;
            }

            .list-button {
              padding: 0.5rem 0.75rem;
              font-size: 0.8125rem;
            }
          }
        `}</style>
      </div>
    </>
  )
    
}

export default Auction
