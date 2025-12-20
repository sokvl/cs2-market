import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../lib/AuthContext';
import { useParams, Link } from 'react-router-dom';
import Spinner from '../components/loadingScene/Spinner';
import Auction from '../components/auction/Auction';

const UserProfile = () => {
    const { user } = useContext(AuthContext);
    const { steam_id } = useParams();

    const [profileData, setProfileData] = useState({});
    const [ratingData, setRatingData] = useState([]);
    const [offersData, setOffersData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('offers');
    const [userNotFound, setUserNotFound] = useState(false);

    useEffect(() => {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          setUserNotFound(false);
          const [profileResponse, ratingResponse, offersResponse] = await Promise.all([
            axios.get(`http://localhost:8000/users/${steam_id}`),
            axios.get(`http://localhost:8000/users/rating?steam_id=${steam_id}`),
            axios.get(`http://localhost:8000/offers/user-active?steam_id=${steam_id}`)
          ]);
          
          setProfileData(profileResponse.data);
          setRatingData(ratingResponse.data);
          setOffersData(offersResponse.data);
        } catch (error) {
          console.error('Error fetching data:', error);
          if (error.response && error.response.status === 404) {
            setUserNotFound(true);
          }
        }
        setIsLoading(false);
      };
      fetchData();
    }, [steam_id]);

    const isOwnProfile = user?.steam_id === steam_id;

    return (
      <>
        <div className="profile-page">
          {/* Animated Background */}
          <div className="profile-background">
            <div className="gradient-orb orb-1"></div>
            <div className="gradient-orb orb-2"></div>
            <div className="gradient-orb orb-3"></div>
          </div>

          {isLoading ? (
            <div className="loading-container">
              <Spinner />
              <p>Loading profile...</p>
            </div>
          ) : userNotFound ? (
            <div className="user-not-found">
              <div className="not-found-icon">
                <i className="fa-solid fa-user-slash"></i>
              </div>
              <h2>User Not Found</h2>
              <p>The user with this Steam ID does not exist in our database.</p>
              <Link to="/market" className="back-to-market-btn">
                <i className="fa-solid fa-arrow-left"></i>
                Back to Market
              </Link>
            </div>
          ) : (
            <div className="profile-container">
              {/* Profile Header */}
              <div className="profile-header">
                <div className="profile-header-content">
                  <div className="avatar-section">
                    <div className="avatar-wrapper">
                      <img src={profileData.avatar_url} alt={profileData.username} className="profile-avatar" />
                      <div className="avatar-glow"></div>
                      {isOwnProfile && (
                        <div className="own-profile-badge">
                          <i className="fa-solid fa-crown"></i>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="profile-info">
                    <div className="username-section">
                      <h1 className="profile-username">{profileData.username}</h1>
                      {isOwnProfile && <span className="you-badge">You</span>}
                    </div>
                    
                    <div className="profile-stats">
                      <div className="stat-card">
                        <div className="stat-icon">
                          <i className="fa-solid fa-star"></i>
                        </div>
                        <div className="stat-content">
                          <div className="stat-value">{ratingData.average_rating || '5.0'}</div>
                          <div className="stat-label">Rating</div>
                        </div>
                      </div>

                      <div className="stat-card">
                        <div className="stat-icon">
                          <i className="fa-solid fa-box"></i>
                        </div>
                        <div className="stat-content">
                          <div className="stat-value">{offersData.length}</div>
                          <div className="stat-label">Active Offers</div>
                        </div>
                      </div>

                      <div className="stat-card">
                        <div className="stat-icon">
                          <i className="fa-solid fa-check-circle"></i>
                        </div>
                        <div className="stat-content">
                          <div className="stat-value">{ratingData.total_ratings || '0'}</div>
                          <div className="stat-label">Total Trades</div>
                        </div>
                      </div>
                    </div>

                    {isOwnProfile && (
                      <Link to="/UserDashboard/Settings" className="edit-profile-btn">
                        <i className="fa-solid fa-gear"></i>
                        <span>Edit Profile</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="profile-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'offers' ? 'active' : ''}`}
                  onClick={() => setActiveTab('offers')}
                >
                  <i className="fa-solid fa-store"></i>
                  <span>Active Offers</span>
                  <span className="tab-count">{offersData.length}</span>
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
                  onClick={() => setActiveTab('about')}
                >
                  <i className="fa-solid fa-user"></i>
                  <span>About</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="profile-content">
                {activeTab === 'offers' && (
                  <div className="offers-section">
                    {offersData.length === 0 ? (
                      <div className="empty-offers">
                        <i className="fa-solid fa-box-open"></i>
                        <h3>No Active Offers</h3>
                        <p>{isOwnProfile ? "You don't have any active offers yet." : "This user doesn't have any active offers."}</p>
                        {isOwnProfile && (
                          <Link to="/market" className="browse-market-btn">
                            <i className="fa-solid fa-store"></i>
                            Browse Market
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="offers-grid">
                        {offersData.map((auction, i) => (
                          <div key={i} className="offer-item" style={{ animationDelay: `${i * 0.05}s` }}>
                            <Auction 
                              id={auction.item.item_id} 
                              title={auction.item.item_name} 
                              image={auction.item.img_link} 
                              price={auction.price}  
                              owner={auction.owner} 
                              inspectLink={auction.item.inspect == null ? "none" : auction.item.inspect}
                              stickerElement={auction.item.stickerstring}
                              isOwnOffer={isOwnProfile}
                              rarityColor={auction.item.rarity}
                              offerActiveId={auction.offer_id}
                              condition={auction.item.condition}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'about' && (
                  <div className="about-section">
                    <div className="about-card">
                      <h3><i className="fa-solid fa-info-circle"></i> Profile Information</h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Username</span>
                          <span className="info-value">{profileData.username}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Steam ID</span>
                          <span className="info-value">{steam_id}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Member Since</span>
                          <span className="info-value">November 2025</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Average Rating</span>
                          <span className="info-value rating">
                            <i className="fa-solid fa-star"></i>
                            {ratingData.average_rating || '5.0'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="about-card">
                      <h3><i className="fa-solid fa-chart-line"></i> Trading Statistics</h3>
                      <div className="stats-list">
                        <div className="stats-item">
                          <div className="stats-icon">
                            <i className="fa-solid fa-handshake"></i>
                          </div>
                          <div className="stats-details">
                            <span className="stats-label">Total Trades</span>
                            <span className="stats-value">{ratingData.total_ratings || '0'}</span>
                          </div>
                        </div>
                        <div className="stats-item">
                          <div className="stats-icon">
                            <i className="fa-solid fa-box"></i>
                          </div>
                          <div className="stats-details">
                            <span className="stats-label">Active Listings</span>
                            <span className="stats-value">{offersData.length}</span>
                          </div>
                        </div>
                        <div className="stats-item">
                          <div className="stats-icon">
                            <i className="fa-solid fa-shield-halved"></i>
                          </div>
                          <div className="stats-details">
                            <span className="stats-label">Trust Score</span>
                            <span className="stats-value trust-high">Excellent</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          .profile-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0f0a1a 100%);
            position: relative;
            overflow-x: hidden;
            padding: 6rem 2rem 4rem;
          }

          .profile-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            pointer-events: none;
          }

          .gradient-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.3;
            animation: float 20s ease-in-out infinite;
          }

          .orb-1 {
            width: 500px;
            height: 500px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            top: -10%;
            right: -10%;
            animation-delay: 0s;
          }

          .orb-2 {
            width: 400px;
            height: 400px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            bottom: -5%;
            left: -5%;
            animation-delay: -7s;
          }

          .orb-3 {
            width: 350px;
            height: 350px;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            top: 40%;
            left: 50%;
            animation-delay: -14s;
          }

          @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(30px, -30px) scale(1.1); }
            50% { transform: translate(-20px, 20px) scale(0.9); }
            75% { transform: translate(40px, 10px) scale(1.05); }
          }

          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            position: relative;
            z-index: 1;
          }

          .loading-container p {
            margin-top: 2rem;
            font-size: 1.25rem;
            color: rgba(255, 255, 255, 0.7);
          }

          .profile-container {
            position: relative;
            z-index: 1;
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 2rem;
            animation: fadeInUp 0.8s ease-out;
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .profile-header {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 3rem;
            animation: slideIn 0.6s ease-out;
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          .profile-header-content {
            display: flex;
            align-items: center;
            gap: 3rem;
          }

          .avatar-section {
            flex-shrink: 0;
          }

          .avatar-wrapper {
            position: relative;
            width: 180px;
            height: 180px;
          }

          .profile-avatar {
            width: 100%;
            height: 100%;
            border-radius: 24px;
            border: 3px solid rgba(102, 126, 234, 0.5);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            transition: transform 0.3s ease;
          }

          .avatar-wrapper:hover .profile-avatar {
            transform: scale(1.05);
          }

          .avatar-glow {
            position: absolute;
            inset: -10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 24px;
            opacity: 0;
            filter: blur(20px);
            transition: opacity 0.3s ease;
            z-index: -1;
          }

          .avatar-wrapper:hover .avatar-glow {
            opacity: 0.6;
          }

          .own-profile-badge {
            position: absolute;
            top: -10px;
            right: -10px;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(251, 191, 36, 0.5);
            animation: pulse 2s ease-in-out infinite;
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }

          .own-profile-badge i {
            font-size: 1.5rem;
            color: white;
          }

          .profile-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          .username-section {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .profile-username {
            font-size: 2.5rem;
            font-weight: 700;
            color: white;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .you-badge {
            padding: 0.5rem 1rem;
            background: rgba(16, 185, 129, 0.2);
            border: 1px solid rgba(16, 185, 129, 0.4);
            border-radius: 8px;
            color: #10b981;
            font-size: 0.875rem;
            font-weight: 600;
          }

          .profile-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
          }

          .stat-card {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.5rem;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            transition: all 0.3s ease;
          }

          .stat-card:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(102, 126, 234, 0.3);
            transform: translateY(-3px);
          }

          .stat-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
            border: 1px solid rgba(102, 126, 234, 0.3);
            border-radius: 14px;
            flex-shrink: 0;
          }

          .stat-icon i {
            font-size: 1.5rem;
            color: #667eea;
          }

          .stat-content {
            display: flex;
            flex-direction: column;
          }

          .stat-value {
            font-size: 1.75rem;
            font-weight: 700;
            color: white;
          }

          .stat-label {
            font-size: 0.875rem;
            color: rgba(255, 255, 255, 0.6);
          }

          .edit-profile-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 12px;
            color: white;
            font-size: 1rem;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            width: fit-content;
          }

          .edit-profile-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
          }

          .profile-tabs {
            display: flex;
            gap: 1rem;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 0.75rem;
          }

          .tab-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 1rem 1.5rem;
            background: transparent;
            border: none;
            border-radius: 10px;
            color: rgba(255, 255, 255, 0.6);
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
          }

          .tab-btn:hover {
            background: rgba(255, 255, 255, 0.05);
            color: rgba(255, 255, 255, 0.9);
          }

          .tab-btn.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          }

          .tab-count {
            padding: 0.25rem 0.75rem;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            font-size: 0.875rem;
          }

          .tab-btn.active .tab-count {
            background: rgba(255, 255, 255, 0.3);
          }

          .profile-content {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 2.5rem;
            animation: fadeIn 0.5s ease-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .offers-section {
            min-height: 400px;
          }

          .empty-offers {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            text-align: center;
          }

          .empty-offers i {
            font-size: 5rem;
            color: rgba(255, 255, 255, 0.2);
            margin-bottom: 1.5rem;
          }

          .empty-offers h3 {
            font-size: 1.75rem;
            font-weight: 700;
            color: white;
            margin: 0 0 1rem 0;
          }

          .empty-offers p {
            font-size: 1.125rem;
            color: rgba(255, 255, 255, 0.6);
            margin: 0 0 2rem 0;
          }

          .browse-market-btn {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 12px;
            color: white;
            font-size: 1rem;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .browse-market-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
          }

          .offers-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
          }

          .offer-item {
            animation: fadeInUp 0.6s ease-out both;
          }

          .about-section {
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          .about-card {
            padding: 2rem;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
          }

          .about-card h3 {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 1.5rem;
            font-weight: 700;
            color: white;
            margin: 0 0 2rem 0;
          }

          .about-card h3 i {
            color: #667eea;
          }

          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }

          .info-item {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            padding: 1.25rem;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 12px;
          }

          .info-label {
            font-size: 0.875rem;
            color: rgba(255, 255, 255, 0.6);
          }

          .info-value {
            font-size: 1.125rem;
            font-weight: 600;
            color: white;
          }

          .info-value.rating {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #fbbf24;
          }

          .stats-list {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }

          .stats-item {
            display: flex;
            align-items: center;
            gap: 1.25rem;
            padding: 1.5rem;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 12px;
            transition: all 0.3s ease;
          }

          .stats-item:hover {
            background: rgba(255, 255, 255, 0.05);
            transform: translateX(5px);
          }

          .stats-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
            border: 1px solid rgba(102, 126, 234, 0.3);
            border-radius: 14px;
            flex-shrink: 0;
          }

          .stats-icon i {
            font-size: 1.5rem;
            color: #667eea;
          }

          .stats-details {
            flex: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .stats-label {
            font-size: 1rem;
            color: rgba(255, 255, 255, 0.7);
          }

          .stats-value {
            font-size: 1.25rem;
            font-weight: 700;
            color: white;
          }

          .trust-high {
            color: #10b981;
          }

          /* User Not Found Styles */
          .user-not-found {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 70vh;
            padding: 3rem 2rem;
            text-align: center;
            animation: fadeInUp 0.6s ease;
          }

          .not-found-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 140px;
            height: 140px;
            margin-bottom: 2.5rem;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%);
            border: 2px solid rgba(239, 68, 68, 0.3);
            border-radius: 50%;
            animation: pulse 2s ease infinite;
          }

          .not-found-icon i {
            font-size: 4rem;
            color: #ef4444;
          }

          .user-not-found h2 {
            font-size: 2.5rem;
            font-weight: 800;
            color: white;
            margin: 0 0 1rem 0;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .user-not-found p {
            font-size: 1.125rem;
            color: rgba(255, 255, 255, 0.6);
            margin: 0 0 2.5rem 0;
            max-width: 500px;
          }

          .back-to-market-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-size: 1rem;
            font-weight: 600;
            border: none;
            border-radius: 12px;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
          }

          .back-to-market-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 30px rgba(102, 126, 234, 0.5);
          }

          .back-to-market-btn i {
            font-size: 1rem;
          }

          /* Responsive */
          @media (max-width: 1024px) {
            .profile-header-content {
              flex-direction: column;
              text-align: center;
            }

            .profile-info {
              align-items: center;
            }

            .username-section {
              flex-direction: column;
            }

            .edit-profile-btn {
              width: 100%;
            }
          }

          @media (max-width: 768px) {
            .profile-page {
              padding: 5rem 1rem 3rem;
            }

            .profile-header {
              padding: 2rem;
            }

            .avatar-wrapper {
              width: 140px;
              height: 140px;
            }

            .profile-username {
              font-size: 1.75rem;
            }

            .profile-stats {
              grid-template-columns: 1fr;
            }

            .profile-tabs {
              flex-direction: column;
            }

            .profile-content {
              padding: 1.5rem;
            }

            .offers-grid {
              grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            }

            .info-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 480px) {
            .offers-grid {
              grid-template-columns: 1fr;
            }

            .stat-card {
              flex-direction: column;
              text-align: center;
            }
          }
        `}</style>
      </>
    );
};

export default UserProfile;
