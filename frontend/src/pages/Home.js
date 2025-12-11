import React, { useContext, useEffect, useState } from 'react';
import '../styles/home.css';
import { useTheme } from '../ThemeContext';
import '../styles/carousel.css';
import axios from 'axios';
import AuthContext from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [offers, setOffers] = useState([]);
    const [selectedCard, setSelectedCard] = useState(1);
    const [scrollY, setScrollY] = useState(0);

    const { isDarkMode } = useTheme();
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleCardChange = (cardIndex) => {
        setSelectedCard(cardIndex);
    };

    const fetchOffers = async () => {
        try {
            const response = await axios.get("http://localhost:8000/offers/");
            const shuffledOffers = response.data.sort(() => 0.5 - Math.random());
            setOffers(shuffledOffers.slice(0, 4));
        } catch (error) {
            console.log("Error fetching offers:", error);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    return (
        <>
            {/* Hero Section */}
            <div className={`hero-section ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
                <div className="hero-background">
                    <div className="gradient-orb orb-1"></div>
                    <div className="gradient-orb orb-2"></div>
                    <div className="gradient-orb orb-3"></div>
                </div>
                
                <div className="hero-content" style={{ transform: `translateY(${scrollY * 0.3}px)` }}>
                    <div className="hero-badge">
                        <span className="badge-icon">🔒</span>
                        <span>Secure Trading Platform</span>
                    </div>
                    
                    <h1 className="hero-title">
                        Your <span className="gradient-text">Premium</span>
                        <br />
                        CS2 Marketplace
                    </h1>
                    
                    <p className="hero-subtitle">
                        Experience seamless trading with advanced security, instant transactions, and competitive prices
                    </p>
                    
                    <div className="hero-buttons">
                        <button className="btn-primary" onClick={() => navigate('/market')}>
                            <span>Explore Market</span>
                            <i className="fa-solid fa-arrow-right"></i>
                        </button>
                        <button className="btn-secondary" onClick={() => navigate('/contact')}>
                            <span>Learn More</span>
                        </button>
                    </div>

                    <div className="hero-stats">
                        <div className="stat-item">
                            <h3>50K+</h3>
                            <p>Active Users</p>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <h3>$2M+</h3>
                            <p>Trading Volume</p>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <h3>99.9%</h3>
                            <p>Uptime</p>
                        </div>
                    </div>
                </div>

                <div className="scroll-indicator">
                    <div className="mouse">
                        <div className="wheel"></div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className={`features-section ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
                <div className="section-header">
                    <span className="section-tag">Why Choose Us</span>
                    <h2 className="section-title">
                        Built for <span className="gradient-text">Traders</span>
                    </h2>
                    <p className="section-subtitle">
                        We provide the most secure and efficient platform for CS2 skin trading
                    </p>
                </div>

                <div className="features-grid">
                    <div className="feature-card" style={{ transform: `translateY(${Math.max(0, scrollY - 300) * 0.1}px)` }}>
                        <div className="feature-icon">
                            <i className="fa-solid fa-shield-halved"></i>
                        </div>
                        <h3>Bank-Level Security</h3>
                        <p>Advanced encryption and multi-layer authentication to protect your assets</p>
                    </div>

                    <div className="feature-card" style={{ transform: `translateY(${Math.max(0, scrollY - 300) * 0.15}px)` }}>
                        <div className="feature-icon">
                            <i className="fa-solid fa-bolt"></i>
                        </div>
                        <h3>Instant Transactions</h3>
                        <p>Lightning-fast trades with automated processing and instant confirmations</p>
                    </div>

                    <div className="feature-card" style={{ transform: `translateY(${Math.max(0, scrollY - 300) * 0.2}px)` }}>
                        <div className="feature-icon">
                            <i className="fa-solid fa-chart-line"></i>
                        </div>
                        <h3>Best Prices</h3>
                        <p>Competitive rates with real-time market analysis and price matching</p>
                    </div>

                    <div className="feature-card" style={{ transform: `translateY(${Math.max(0, scrollY - 300) * 0.25}px)` }}>
                        <div className="feature-icon">
                            <i className="fa-solid fa-headset"></i>
                        </div>
                        <h3>24/7 Support</h3>
                        <p>Dedicated support team available around the clock to assist you</p>
                    </div>
                </div>
            </div>

            {/* Offers Carousel Section */}
            <div className={`carousel-section ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
                <div className="section-header">
                    <span className="section-tag">Featured</span>
                    <h2 className="section-title">
                        Hot <span className="gradient-text">Deals</span>
                    </h2>
                </div>

                <div className="carousel">
                    <div className="wrapper">
                        <div className="container">
                            {offers.length > 0 && (
                                <>
                                    {offers[0] && (
                                        <>
                                            <input 
                                                type="radio" 
                                                className="xD" 
                                                name="slide" 
                                                id="c1" 
                                                checked={selectedCard === 1} 
                                                onChange={() => handleCardChange(1)} 
                                            />                     
                                            <label 
                                                htmlFor="c1" 
                                                className="card" 
                                                style={{ 
                                                    backgroundImage: `url(${offers[0].item?.img_link})`, 
                                                    backgroundSize: '70%', 
                                                    backgroundRepeat: 'no-repeat', 
                                                    backgroundPosition: 'center'
                                                }}
                                            >    
                                                <div className="row">                  
                                                    <div className="icon">1</div>
                                                    <div className="description">
                                                        <h4>{offers[0].item?.item_name}</h4>
                                                        <p>{offers[0].item?.description}</p>
                                                    </div>
                                                </div>
                                            </label>
                                        </>
                                    )}

                                    {offers[1] && (
                                        <>
                                            <input 
                                                type="radio" 
                                                name="slide" 
                                                className="xD" 
                                                id="c2" 
                                                checked={selectedCard === 2} 
                                                onChange={() => handleCardChange(2)} 
                                            />
                                            <label 
                                                htmlFor="c2" 
                                                className="card" 
                                                style={{ 
                                                    backgroundImage: `url(${offers[1].item?.img_link})`, 
                                                    backgroundSize: '70%', 
                                                    backgroundRepeat: 'no-repeat', 
                                                    backgroundPosition: 'center'
                                                }}
                                            >    
                                                <div className="row">
                                                    <div className="icon">2</div>
                                                    <div className="description">
                                                        <h4>{offers[1].item?.item_name}</h4>
                                                        <p>{offers[1].item?.description}</p>
                                                    </div>
                                                </div>
                                            </label>
                                        </>
                                    )}

                                    {offers[2] && (
                                        <>
                                            <input 
                                                type="radio" 
                                                name="slide" 
                                                className="xD" 
                                                id="c3" 
                                                checked={selectedCard === 3} 
                                                onChange={() => handleCardChange(3)} 
                                            />
                                            <label 
                                                htmlFor="c3" 
                                                className="card" 
                                                style={{ 
                                                    backgroundImage: `url(${offers[2].item?.img_link})`, 
                                                    backgroundSize: '70%', 
                                                    backgroundRepeat: 'no-repeat', 
                                                    backgroundPosition: 'center'
                                                }}
                                            >    
                                                <div className="row">
                                                    <div className="icon">3</div>
                                                    <div className="description">
                                                        <h4>{offers[2].item?.item_name}</h4>
                                                        <p>{offers[2].item?.description}</p>
                                                    </div>
                                                </div>
                                            </label>
                                        </>
                                    )}

                                    {offers[3] && (
                                        <>
                                            <input 
                                                type="radio" 
                                                name="slide" 
                                                className="xD" 
                                                id="c4" 
                                                checked={selectedCard === 4} 
                                                onChange={() => handleCardChange(4)} 
                                            />
                                            <label 
                                                htmlFor="c4" 
                                                className="card" 
                                                style={{ 
                                                    backgroundImage: `url(${offers[3].item?.img_link})`, 
                                                    backgroundSize: '70%', 
                                                    backgroundRepeat: 'no-repeat', 
                                                    backgroundPosition: 'center'
                                                }}
                                            >    
                                                <div className="row">
                                                    <div className="icon">4</div>
                                                    <div className="description">
                                                        <h4>{offers[3].item?.item_name}</h4>
                                                        <p>{offers[3].item?.description}</p>
                                                    </div>
                                                </div>
                                            </label>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className={`cta-section ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
                <div className="cta-content">
                    <h2>Ready to Start Trading?</h2>
                    <p>Join thousands of satisfied traders on the most trusted CS2 marketplace</p>
                    <button className="btn-cta" onClick={() => navigate('/market')}>
                        <span>Get Started Now</span>
                        <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
                <div className="cta-background">
                    <div className="cta-orb cta-orb-1"></div>
                    <div className="cta-orb cta-orb-2"></div>
                </div>
            </div>
        </>
    );
}

export default Home;
