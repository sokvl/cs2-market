import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import Success from '../success/Succes';
import AuthContext from '../../lib/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Spinner from '../../components/loadingScene/Spinner';

const OfferDetailModal = ({closerHandler, category, rarityColor, 
    imageLink, inspectLink, name, isOwner,
    steam_price, price , id, stickerString, inventory, owner, offerAciveId, condition,tradeable}) => 
    {
    
        const { user } = useContext(AuthContext)

        const location = useLocation()
        const pathname = location.pathname || '';
        const isMarketPage = pathname === '/market';
        const isInventoryPage = pathname === '/UserDashboard/Inventory';
        const isActiveOffers = pathname === '/UserDashboard/ActiveOffers';
        const isOwn = owner?.steam_id && user?.steam_id ? owner.steam_id === user.steam_id : false;

        // logika przycisku:
        // - na Inventory zawsze wystawiamy (createOffer)
        // - na Market kupujemy jeśli nie nasze; jeśli nasze, blokujemy przycisk i zaznaczamy kartę
        // - na ActiveOffers edycja ma własne przyciski
        const canList = isInventoryPage || (!isMarketPage && isOwn);
        const canBuy = isMarketPage && !isOwn;
        const shouldDisableBuy = isMarketPage && isOwn;

        let navigate = useNavigate()
        const [itemDetails, setItemDetails] = useState([])
        const [ownerData, setOwnerData] = useState([])
        const [stickerInfo, setStickerInfo] = useState([])
        const [stickerLabels, setStickerLabels] = useState([])
        const [inputValue, setinputValue] = useState("")
        const [newPrice, setNewPrice] = useState("")

        const [sellerData, setSellerData] = useState([]);
        const [buySuccess, setbuySuccess] = useState(false);

        const [isLoading, setIsLoading] = useState(false)
    
    useEffect(() => {
        const fetchItemDetails = async () =>  {
            setIsLoading(true);
            try {
                axios.post(`http://localhost:8000/inv/item/`, { "inspect_link": inspectLink})
                .then((response) => setItemDetails(response.data.item_details))
                .catch((err) => console.log(err))
            
        } catch (err) {
            console.log(err);
        }
        
    }
    
    fetchItemDetails()

    if (stickerString) {
        const srcRegex = /<img[^>]+src="([^">]+)"/g;

        // Array to hold extracted src values
        let srcValues = [];

    // Find and store all src values
        let match;
        while ((match = srcRegex.exec(stickerString)) !== null) {
            srcValues.push(match[1]);
        }
        let stickerNames = [];
        const stickerTextMatch = stickerString.match(/Sticker: ([\s\S]*?)(?=<\/center>)/);
        if (stickerTextMatch && stickerTextMatch[1]) {
            stickerNames = stickerTextMatch[1].trim().split(',').map(name => name.trim());
        }
    
        setStickerInfo(srcValues);
        setStickerLabels(stickerNames);

    }
    setIsLoading(false);
 }, [])

 const handleInputChange = (e) => {
    const value = parseFloat(e.target.value);

    if (!isNaN(value) && value > 0) {
      setinputValue(value.toFixed(2)); // Ograniczenie do dwóch miejsc po przecinku
    } else if (e.target.value === '') {
      setinputValue(''); // Pozwól na wyczyszczenie pola
    }
  };

  const handleInput = (e) => {
    const value = e.target.value;
    const regex = /^[0-9]*\.?[0-9]{0,2}$/;

    if (regex.test(value)) {
      e.target.value = value;
    } else {
      e.preventDefault();
    }
  };

const handleNewPriceChange = (e) => {
    const value = parseFloat(e.target.value, 10); // Przekształcenie wartości wejściowej na liczbę
    if(value > 0) {
        setNewPrice(value);
    }
}

const createOffer = async () => {
    try {
        console.log('[CreateOffer] payload check:', { name, imageLink, condition, stickerString, inspectLink, rarityColor, category, inputValue });

        if (!name || !imageLink) {
            alert('Brak wymaganych danych przedmiotu (nazwa/obrazek).');
            return;
        }

        if (!inputValue || Number(inputValue) <= 0) {
            alert('Podaj cenę przed wystawieniem.');
            return;
        }
        const itemCondition = category === 'Item' ? null : (condition === 'N/A' ? null : condition);
        
        const payload = {
            "item": {
                "item_name": name,
                "img_link": imageLink,
                "condition": itemCondition,
                "stickerstring": stickerString,
                "inspect": inspectLink || 'none',
                "rarity": rarityColor,
                "category": category,
                "listed": true,
                "tradeable": true
            },
            "price": parseFloat(inputValue),
            "quantity": 1,
            "steam_id": user.steam_id.toString()
        };
        
        console.log('[CreateOffer] Full payload:', JSON.stringify(payload, null, 2));
        
        const res = await axios.post("http://localhost:8000/offers/", payload, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("access")}`
            }
        });

        if (res.status === 201) {
            navigate("/market");
        } else {
            alert(`Unexpected response status: ${res.status} - ${res.statusText}`);
        }
    } catch (err) {
        if (err.response) {
            if (err.response.status === 400) {
                alert("This item is already in the market.");
            } else {
                alert(`Error: ${err.response.status} - ${err.response.data}`);
            }
        } else if (err.request) {
            alert('Error: No response received from the server');
        } else {
            alert(`Error: ${err.message}`);
        }
        console.log("error:", err);
    }
}


  
const buyItem = () => {
    axios.post("http://localhost:8000/transactions/", {
        buyer: user.steam_id.toString(),
        offer: offerAciveId,
    }, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`
        }
    }).then(res => {
        if (res.status === 200) {
            setbuySuccess(true);
            setTimeout(function() {
                closerHandler(prev => !prev);
            }, 5000);
        } else {
            alert(`Unexpected response status: ${res.status} - ${res.statusText}`);
        }
    }).catch(err => {
        if (err.response) {
            // Server responded with a status other than 2xx
            alert(`Error: ${err.response.status} - ${err.response.data}`);
        } else if (err.request) {
            // Request was made but no response received
            alert('Error: No response received from the server');
        } else {
            // Something else caused the error
            alert(`Error: ${err.message}`);
        }
        console.log(err);
    });
}


    const editPrice = () => {
        try {
            axios.patch(`http://localhost:8000/offers/${offerAciveId}/`,{price: newPrice}, {
            headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`
          }})
      
        } catch (error) {
          console.error('Error fetching data:', error);
        } 
        closerHandler(prev => !prev);
        navigate("/UserDashboard/ActiveOffers")

    }

    const deleteOffer = () => {
        try {
            axios.delete(`http://localhost:8000/offers/${offerAciveId}/`, {
            headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`
            }})
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        closerHandler(prev => !prev);
        navigate("/UserDashboard/ActiveOffers")
    }

  return (
    <>
        <div className='modal-overlay'>
            <div className='modal-container'>
            { buySuccess ? <Success/> 
            : 
            <> 
                <button className='modal-close-btn' onClick={closerHandler}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
                
                <div className='modal-content'>    
                        <div className={`item-showcase ${shouldDisableBuy ? 'own-offer' : ''}`}>                     
                        <div className="item-image-section">
                            <img 
                                src={`${imageLink}`}
                                alt={name}
                                className="item-image"    
                            />
                            
                            <a href={`${inspectLink}`} className="inspect-link">
                                <i className="fa-solid fa-magnifying-glass"></i>
                                <span>Inspect in game</span>
                            </a>
                        </div>
                        
                        <div className={`sticker-info ${stickerString ? '' : 'hidden'}`}>
                            {stickerInfo.map((item, i) => (
                               <div className='sticker-item' key={i}>
                                   <img width={64} height={48} src={item} alt={stickerLabels[i]} />
                                   <label>{stickerLabels[i]}</label>
                               </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="item-details">
                        <h1 className="item-name">{name}</h1>
                        
                        <div className="details-section">
                            <h2 className="section-title">
                                <i className="fa-solid fa-chart-line"></i>
                                Technical Details
                            </h2>
                            <div className="details-grid">
                                <div className="detail-row">
                                    <span className="detail-label">Float</span>
                                    <span className="detail-value">{itemDetails.float || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Pattern ID</span>
                                    <span className="detail-value">{itemDetails.paintseed || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Finish Catalog</span>
                                    <span className="detail-value">{itemDetails.paintindex || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="details-section">
                            <h2 className="section-title">
                                <i className="fa-solid fa-dollar-sign"></i>
                                Price Details
                            </h2>
                            <div className="details-grid">
                                <div className="detail-row">
                                    <span className="detail-label">Steam price</span>
                                    <span className="detail-value price-highlight">{steam_price} $</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">{id ? "Item price" : "Suggested price"}</span>
                                    <span className="detail-value price-highlight">{price ? price : (steam_price * 0.8).toFixed(2)} $</span>
                                </div>
                            </div>
                        </div>

                        {isActiveOffers ? 
                        <div className="action-section">
                            <input
                                type="number"
                                placeholder="New price"
                                className="price-input"
                                onChange={handleNewPriceChange}
                            /> 
                            <button onClick={editPrice} className="action-btn edit-btn">
                                <i className="fa-solid fa-pen"></i>
                                <span>Edit Price</span>
                            </button>
                            <button onClick={deleteOffer} className="action-btn delete-btn">
                                <i className="fa-solid fa-trash"></i>
                                <span>Delete Auction</span>
                            </button>
                        </div>
                        : 
                        <>
                            {!isOwner && (
                                <div className="details-section">
                                    <h2 className="section-title">
                                        <i className="fa-solid fa-user"></i>
                                        Seller
                                    </h2>
                                    <div className="seller-card">
                                        <Link to={owner.steam_id === user.steam_id ? '/UserDashboard/Settings' : `/UserProfile/${owner.steam_id}`}>
                                            <img 
                                                src={owner.avatar_url}
                                                alt={owner.username}
                                                className="seller-avatar"
                                            />
                                        </Link>
                                        <div className="seller-info">
                                            <p className="seller-name">{owner.username}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="action-section">
                                {canList && (
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        className="price-input"
                                        onChange={handleInputChange}
                                        onInput={handleInput}
                                    />
                                )}
                                <button
                                    className={`action-btn primary-btn ${shouldDisableBuy ? 'disabled-own' : ''}`}
                                    onClick={canList ? createOffer : buyItem}
                                    disabled={shouldDisableBuy}
                                >
                                    {canList ? (
                                        <>
                                            <i className="fa-solid fa-tag"></i>
                                            <span>List Item</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-cart-shopping"></i>
                                            <span>{shouldDisableBuy ? 'Your offer' : 'Buy Now'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                        }
                    </div>
                </div>
            </> }
            </div>
        </div>

        <style jsx>{`
            .modal-overlay {
                position: fixed;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(12px);
                z-index: 120;
                padding: 1rem;
                animation: fadeIn 0.3s ease-out;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .modal-container {
                position: relative;
                background: linear-gradient(135deg, rgba(26, 10, 46, 0.98) 0%, rgba(15, 10, 26, 0.98) 100%);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 24px;
                padding: 2.5rem;
                width: 66%;
                max-width: 1100px;
                max-height: 90vh;
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

            .modal-close-btn {
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

            .modal-close-btn:hover {
                background: rgba(239, 68, 68, 0.2);
                border-color: rgba(239, 68, 68, 0.4);
                color: #ef4444;
                transform: rotate(90deg);
            }

            .modal-content {
                display: flex;
                flex-direction: column;
                gap: 2rem;
            }

            .item-showcase {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .item-showcase.own-offer {
                border: 1px solid rgba(16, 185, 129, 0.6);
                box-shadow: 0 0 18px rgba(16, 185, 129, 0.3);
                background: linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02));
                border-radius: 16px;
                padding: 0.5rem;
            }

            .item-image-section {
                position: relative;
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
                border: 2px solid rgba(102, 126, 234, 0.3);
                border-radius: 20px;
                padding: 2rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1.5rem;
            }

            .item-image {
                width: 100%;
                max-width: 400px;
                height: auto;
                transition: transform 0.3s ease;
            }

            .item-image:hover {
                transform: scale(1.05);
            }

            .inspect-link {
                display: flex;
                align-items: center;
                gap: 0.625rem;
                padding: 0.75rem 1.5rem;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                color: rgba(255, 255, 255, 0.8);
                font-size: 0.9375rem;
                text-decoration: none;
                transition: all 0.3s ease;
            }

            .inspect-link:hover {
                background: rgba(102, 126, 234, 0.15);
                border-color: rgba(102, 126, 234, 0.4);
                color: #667eea;
                transform: translateY(-2px);
            }

            .inspect-link i {
                font-size: 1.125rem;
            }

            .sticker-info {
                display: flex;
                gap: 1rem;
                padding: 1rem;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 16px;
                flex-wrap: wrap;
                justify-content: center;
            }

            .sticker-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;
                max-width: 80px;
            }

            .sticker-item img {
                border-radius: 8px;
                transition: transform 0.3s ease;
            }

            .sticker-item:hover img {
                transform: scale(1.1);
            }

            .sticker-item label {
                font-size: 0.75rem;
                color: rgba(255, 255, 255, 0.7);
                text-align: center;
                line-height: 1.3;
            }

            .hidden {
                display: none;
            }

            .item-details {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }

            .item-name {
                font-size: 1.75rem;
                font-weight: 700;
                color: white;
                margin: 0;
                padding-bottom: 1rem;
                border-bottom: 2px solid rgba(255, 255, 255, 0.1);
            }

            .details-section {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .section-title {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                font-size: 1.125rem;
                font-weight: 600;
                color: white;
                margin: 0;
            }

            .section-title i {
                color: #667eea;
                font-size: 1.25rem;
            }

            .details-grid {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                padding: 1rem;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 12px;
            }

            .detail-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.625rem 0;
            }

            .detail-label {
                font-size: 0.9375rem;
                color: rgba(255, 255, 255, 0.6);
            }

            .detail-value {
                font-size: 0.9375rem;
                font-weight: 600;
                color: white;
            }

            .price-highlight {
                color: #10b981;
                font-size: 1.125rem;
            }

            .seller-card {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                transition: all 0.3s ease;
            }

            .seller-card:hover {
                background: rgba(255, 255, 255, 0.08);
                border-color: rgba(102, 126, 234, 0.3);
            }

            .seller-avatar {
                width: 64px;
                height: 64px;
                border-radius: 12px;
                border: 2px solid rgba(102, 126, 234, 0.5);
            }

            .seller-info {
                flex: 1;
            }

            .seller-name {
                font-size: 1.125rem;
                font-weight: 600;
                color: white;
                margin: 0;
            }

            .action-section {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                margin-top: 1rem;
            }

            .price-input {
                width: 100%;
                padding: 1rem;
                background: rgba(255, 255, 255, 0.05);
                border: 2px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                color: white;
                font-size: 1rem;
                transition: all 0.3s ease;
            }

            .price-input:focus {
                outline: none;
                border-color: #667eea;
                background: rgba(102, 126, 234, 0.1);
            }

            .price-input::placeholder {
                color: rgba(255, 255, 255, 0.4);
            }

            .action-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.75rem;
                padding: 1rem 2rem;
                border: none;
                border-radius: 12px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .primary-btn {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
            }

            .primary-btn.disabled-own {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                border: 1px solid rgba(16,185,129,0.6);
                cursor: not-allowed;
                opacity: 0.8;
                box-shadow: 0 0 12px rgba(16, 185, 129, 0.35);
            }

            .primary-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
            }

            .edit-btn {
                background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                color: white;
                box-shadow: 0 4px 15px rgba(251, 191, 36, 0.4);
            }

            .edit-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(251, 191, 36, 0.6);
            }

            .delete-btn {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
                box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
            }

            .delete-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6);
            }

            /* Scrollbar */
            .modal-container::-webkit-scrollbar {
                width: 8px;
            }

            .modal-container::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
            }

            .modal-container::-webkit-scrollbar-thumb {
                background: rgba(102, 126, 234, 0.5);
                border-radius: 10px;
            }

            .modal-container::-webkit-scrollbar-thumb:hover {
                background: rgba(102, 126, 234, 0.7);
            }

            /* Responsive */
            @media (max-width: 768px) {
                .modal-container {
                    padding: 1.5rem;
                    max-height: 95vh;
                    width: 95%;
                }

                .modal-close-btn {
                    top: 1rem;
                    right: 1rem;
                    width: 36px;
                    height: 36px;
                }

                .item-name {
                    font-size: 1.5rem;
                }

                .section-title {
                    font-size: 1rem;
                }

                .item-image-section {
                    padding: 1.5rem;
                }

                .action-btn {
                    padding: 0.875rem 1.5rem;
                    font-size: 0.9375rem;
                }
            }
        `}</style>
    </>
  )
}

export default OfferDetailModal
