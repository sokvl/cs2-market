import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import Auction from "../auction/Auction";
import Spinner from '../loadingScene/Spinner';
import AuthContext from '../../lib/AuthContext';

const Inventory = ({ creatorId }) => {
  const { user } = useContext(AuthContext);

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [columns, setColumns] = useState(3);
  const gridRef = useRef(null);

  const ROWS_PER_PAGE = 10; // maksymalnie 10 wierszy na stronę
  const MIN_CARD_WIDTH = 180; // px, mniejsze kafelki

  // Bezpieczny redirect — wykonaj tylko w effect, nie podczas renderu
  useEffect(() => {
    if (user === null) {
      // user jawnie null => przekieruj
      window.location.href = '/';
    }
    // jeśli user jest undefined (np. nadal ładuje), nie robimy nic
  }, [user]);

  useEffect(() => {
    const ensureArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      // jeśli to obiekt z numerowanymi kluczami lub innymi - pobierz wartości
      if (typeof val === 'object') return Object.values(val);
      return [];
    };

    const fetchData = async () => {
      if (!user?.steam_id) return;
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`http://localhost:8000/inv/${user.steam_id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` }
        });

        console.log('=== BACKEND INVENTORY RESPONSE ===');
        console.log('Full response:', response?.data);
        console.log('Response type:', typeof response?.data);
        console.log('Response JSON:', JSON.stringify(response?.data, null, 2));
        console.log('===================================');

        const payload = response.data;
        console.debug('[Inventory] Payload keys:', payload ? Object.keys(payload) : 'null');
        console.debug('[Inventory] Payload.inventory type:', typeof payload?.inventory);
        if (payload?.inventory) {
          console.debug('[Inventory] Inventory keys:', Object.keys(payload.inventory));
          console.debug('[Inventory] Sample inventory item:', payload.inventory.items?.[0] || payload.inventory[0] || 'no items');
        }

        // próbujemy różne schematy odpowiedzi
        let normalized = [];
        if (Array.isArray(payload)) {
          normalized = payload;
        } else if (payload && typeof payload === 'object') {
          // case: { inventory: [...] } lub { inventory: { items: [...] } }
          if (payload.inventory) {
            if (Array.isArray(payload.inventory)) {
              normalized = payload.inventory;
            } else if (Array.isArray(payload.inventory.items)) {
              normalized = payload.inventory.items;
            } else {
              normalized = ensureArray(payload.inventory);
            }
          } else if (Array.isArray(payload.items)) {
            normalized = payload.items;
          } else if (Array.isArray(payload.data)) {
            normalized = payload.data;
          } else {
            // fallback: spróbuj pobrać wartości obiektu
            normalized = ensureArray(payload);
          }
        } else {
          normalized = ensureArray(payload);
        }

        normalized = ensureArray(normalized);

        console.debug('[Inventory] Normalized length:', normalized.length);
        console.debug('[Inventory] First normalized item:', normalized[0]);
        setItems(normalized);
      } catch (err) {
        console.error('[Inventory] fetch error:', err);
        if (err.response && err.response.status === 404) {
          setError('Inventory endpoint not configured (404).');
        } else if (err.response && err.response.status === 401) {
          setError('Unauthorized (401). Please re-login.');
        } else {
          setError('Failed to load inventory. See console for details.');
        }
        setItems([]); // zabezpieczenie
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.steam_id]);

  // oblicz liczbę kolumn na podstawie dostępnej szerokości
  useEffect(() => {
    const computeColumns = () => {
      if (!gridRef.current) return;
      const width = gridRef.current.clientWidth || 0;
      const calculated = Math.max(1, Math.floor(width / MIN_CARD_WIDTH));
      setColumns(calculated);
    };

    computeColumns();
    window.addEventListener('resize', computeColumns);
    return () => window.removeEventListener('resize', computeColumns);
  }, []);

  // utrzymuj currentPage w granicach dostępnych stron po zmianie danych lub kolumn
  useEffect(() => {
    const itemsPerPage = Math.max(columns * ROWS_PER_PAGE, 1);
    const totalPages = Math.max(1, Math.ceil((Array.isArray(items) ? items.length : 0) / itemsPerPage));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [items, columns, currentPage]);

  // Render - prosty i czytelny flow
  if (isLoading) {
    return (
      <div className="loading-container">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <i className="fa-solid fa-exclamation-triangle error-icon"></i>
        <h2>Unable to Load Inventory</h2>
        <p>{error}</p>
        <div className="error-details">
          <p><strong>Possible solutions:</strong></p>
          <ul>
            <li>Make sure the backend has the <code>/inventory/{'{steam_id}'}</code> endpoint configured</li>
            <li>Check Steam API integration</li>
            <li>Verify your Steam inventory is public</li>
          </ul>
        </div>
        <button className="retry-btn" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // Upewnij się że items jest tablicą — nigdy nie wywołujemy .map na czymś innym
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="empty-state">
        <i className="fa-solid fa-box-open empty-icon"></i>
        <h2>No Items Yet</h2>
        <p>Your inventory is empty or could not be parsed.</p>
      </div>
    );
  }

  const itemsPerPage = Math.max(columns * ROWS_PER_PAGE, 1);
  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  return (
    <>
      <div className="inventory-container">
        <div className="inventory-header">
          <div className="inventory-title-section">
            <i className="fa-solid fa-box inventory-icon"></i>
            <h1 className="inventory-title">My Inventory</h1>
          </div>
          <div className="inventory-stats">
            <div className="stat-badge">
              <i className="fa-solid fa-cubes"></i>
              <span>{Array.isArray(items) ? items.length : 0} items</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <Spinner />
          </div>
        ) : error ? (
          <div className="error-state">
            <i className="fa-solid fa-exclamation-triangle error-icon"></i>
            <h2>Unable to Load Inventory</h2>
            <p>{error}</p>
            <div className="error-details">
              <p><strong>Possible solutions:</strong></p>
              <ul>
                <li>Make sure the backend has the <code>/inventory/{'{steam_id}'}</code> endpoint configured</li>
                <li>Check if Steam API integration is properly set up</li>
                <li>Verify your Steam inventory is public</li>
                <li>Contact support if the issue persists</li>
              </ul>
            </div>
            <button className="retry-btn" onClick={() => window.location.reload()}>
              <i className="fa-solid fa-rotate-right"></i>
              Retry
            </button>
          </div>
        ) : (Array.isArray(items) ? items.length === 0 : true) ? (
          <div className="empty-state">
            <i className="fa-solid fa-box-open empty-icon"></i>
            <h2>No Items Yet</h2>
            <p>Your inventory is empty. Start trading to add items!</p>
          </div>
        ) : (
          <>
          <div className="inventory-grid" ref={gridRef}>
            {(Array.isArray(paginatedItems) ? paginatedItems : []).map((inv, i) => {
              // Steam Web API fields vs nasze pola bazy
              const itemObj = inv.item || inv;
              
              // Nazwa: Steam API używa market_hash_name lub name
              const title = itemObj.marketname || itemObj.item_name || itemObj.name || 'Unknown Item';
              
              // Obrazek: Steam API zwraca icon_url (bez https prefix czasem)
              let image = itemObj.icon_url || itemObj.img_link || itemObj.image || '';
              if (image && !image.startsWith('http')) {
                image = `https://community.cloudflare.steamstatic.com/economy/image/${image}`;
              }
              
              // Cena: Steam API może mieć price_latest, price
              const price = itemObj.price_latest || itemObj.priceavg || inv.price || 0;
              
              // Inspect link: prefer direct, else derive from actions with placeholders
              let inspectLink = itemObj.inspect || itemObj.inspect_link || null;
              const rawActionLink = itemObj.actions && Array.isArray(itemObj.actions) ? itemObj.actions[0]?.link : null;
              if (!inspectLink && rawActionLink) {
                const assetId = itemObj.assetid || itemObj.asset_id || itemObj.id || '';
                const ownerId = user?.steam_id || '';
                inspectLink = rawActionLink
                  .replace('%assetid%', assetId)
                  .replace('%owner_steamid%', ownerId);
              }
              
              // Rarity: name_color jako hex lub rarity
              const rarity = itemObj.name_color || itemObj.rarity || 'D2D2D2';
              
              // Condition: exterior lub wear lub condition
              const condition = itemObj.exterior || itemObj.wear || itemObj.condition || 'N/A';

              const category = itemObj.type || itemObj.category || itemObj.market_type || 'Item';

              const ownerPayload = inv.owner || (user ? {
                steam_id: user.steam_id,
                username: user.username,
                avatar_url: user.avatar,
              } : null);
              
              console.debug(`[Inventory] Item ${startIndex + i}:`, { title, image, price, inspectLink, rarity, condition });
              
              return (
                <div key={itemObj.assetid || itemObj.item_id || i} className="inventory-item">
                  <Auction
                    id={itemObj.assetid || itemObj.item_id || i}
                    title={title}
                    image={image}
                    price={price}
                    owner={ownerPayload}
                    inspectLink={inspectLink || 'none'}
                    stickerElement={itemObj.stickers || itemObj.stickerstring || null}
                    isOwnOffer={true}
                    rarityColor={rarity}
                    offerActiveId={inv.offer_id}
                    condition={condition}
                    tradeable={itemObj.tradable}
                    category={category}
                  />
                </div>
              );
            })}
          </div>
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
            >
              Prev
            </button>
            <span className="page-info">Page {safePage} / {totalPages}</span>
            <button
              className="page-btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
            >
              Next
            </button>
          </div>
          </>
        )}
      </div>

      <style jsx>{`
        .inventory-container {
          width: 100%;
          padding: 1.5rem;
          animation: fadeInUp 0.6s ease-out;
        }

        .inventory-header {
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

        .inventory-title-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .inventory-icon {
          font-size: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .inventory-title {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .inventory-stats {
          display: flex;
          gap: 1rem;
        }

        .stat-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(102, 126, 234, 0.2);
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 12px;
          color: white;
          font-weight: 600;
          font-size: 1rem;
        }

        .stat-badge i {
          color: #667eea;
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

        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          padding: 3rem;
          background: rgba(239, 68, 68, 0.05);
          backdrop-filter: blur(20px);
          border: 2px solid rgba(239, 68, 68, 0.3);
          border-radius: 20px;
          text-align: center;
        }

        .error-icon {
          font-size: 5rem;
          color: #ef4444;
          margin-bottom: 1.5rem;
        }

        .error-state h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
          margin: 0 0 0.75rem 0;
        }

        .error-state p {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0 0 1.5rem 0;
        }

        .error-details {
          text-align: left;
          background: rgba(0, 0, 0, 0.3);
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          max-width: 600px;
        }

        .error-details p {
          margin: 0 0 0.75rem 0;
          font-size: 0.95rem;
        }

        .error-details strong {
          color: #fbbf24;
        }

        .error-details ul {
          margin: 0;
          padding-left: 1.5rem;
          list-style: disc;
        }

        .error-details li {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .error-details code {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          color: #a78bfa;
          font-family: 'Courier New', monospace;
        }

        .retry-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
        }

        .retry-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 30px rgba(102, 126, 234, 0.5);
        }

        .retry-btn i {
          font-size: 1.125rem;
        }

        .inventory-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
          animation: fadeIn 0.8s ease-out 0.2s both;
        }

        .pagination {
          margin-top: 1.25rem;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.75rem;
        }

        .page-btn {
          padding: 0.6rem 1.1rem;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .page-btn:not(:disabled):hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-1px);
        }

        .page-info {
          color: rgba(255, 255, 255, 0.8);
          font-weight: 600;
          font-size: 0.95rem;
        }

        .inventory-item {
          transition: transform 0.3s ease;
        }

        .inventory-item:hover {
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
          .inventory-container {
            padding: 1rem;
          }

          .inventory-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .inventory-title {
            font-size: 1.5rem;
          }

          .inventory-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 0.75rem;
          }
        }
      `}</style>
    </>
  )
}

export default Inventory;
