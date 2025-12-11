import React, {useState, useEffect} from 'react'
import {useTheme} from '../../ThemeContext';
import Stars from '../ratingSystem/Stars';
import axios from 'axios';

const AdminPanel = ({steamid}) => {

    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [raport1, setRaport1] = useState(true);
    const [raport2, setRaport2] = useState(false);

    const [selectedOption, setSelectedOption] = useState('option1');

    const [selectedStars, setSelectedStars] = useState(0);
    const [selectedStars2, setSelectedStars2] = useState(0);

    const [raport1Data, setRaport1Data] = useState([]);
    const [raport2Data, setRaport2Data] = useState([]);
    const [report21Data, setReport21Data] = useState([]);

    const [priceMin, setPriceMin] = useState(0);
    const [priceMax, setPriceMax] = useState(0);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [selectedCategory, setSelectedCategory] = useState('all');
 
    const handleStarChange = (stars, whichStar) => {
      if (whichStar === 1) setSelectedStars(stars);
      else setSelectedStars2(stars);
    };

    const handleRadioChange = (event) => {
        
        if(event.target.value === 'option1') {
          setRaport1(true);
          setRaport2(false);
          setSelectedStars(0);
          setSelectedStars2(0);
        } 
        if(event.target.value === 'option2') {
          setRaport2(true);
          setRaport1(false);
        }
        setSelectedOption(event.target.value);
        setShowPopup(false);
        setRaport1Data([]);
        setRaport2Data([]);
        
    };

    const handleMinPriceChange = (event) => {
      const value = event.target.value;
      setPriceMin(value);
    };
  
    const handleMaxPriceChange = (event) => {
      const value = event.target.value;   
      setPriceMax(value);   
    };

    const handleStartDateChange = (event) => {
      setStartDate(event.target.value);
    };
  
    const handleEndDateChange = (event) => {
      setEndDate(event.target.value);
    };

    const handleCategoryChange = (event) => {
      setSelectedCategory(event.target.value);
    };

    const handleRaport1Generate = () => {
      if(selectedStars === 0 || selectedStars2 === 0) {
        alert('Wybierz zakres ocen');
        return;
      }
      if(selectedStars > selectedStars2) {
        alert('Zakres ocen jest niepoprawny');
        return;
      }

        axios.get(`http://localhost:8000/reports/rating/?min_rating=${selectedStars}&max_rating=${selectedStars2}`)
       .then((response) => {
          setRaport1Data(response.data);
          setShowPopup(true);
          setIsLoading(true);
          setTimeout(() => {
            setIsLoading(false);
            
          }, 2000); 
          
       })
       .catch((error) => {
         console.error('Error fetching data:', error);
       });
    }

    const handleRaport2Generate = () => {

      if(priceMin === 0 || priceMax === 0) {
        alert('Podaj zakres cen');
        return;
      }
      if(priceMin > priceMax) {
        alert('Zakres cen jest niepoprawny, cena minimalna musi być mniejsza od ceny maksymalnej');
        return;
      }

      if(startDate === '' || endDate === '') {
        alert('Podaj zakres dat');
        return;
      }

      if (startDate > endDate) {
        alert('Zakres dat jest niepoprawny, data początkowa musi być mniejsza od daty końcowej');
        return;
      }
  
      axios.get(`http://localhost:8000/reports/transaction/?min_price=${priceMin}&max_price=${priceMax}&start_date=${startDate}&end_date=${endDate}&category=${selectedCategory}`)
      .then((response) => {
   
         setRaport2Data(response.data.transaction_reports);
         setReport21Data(response.data.total_transactions);
         setShowPopup(true);
         setIsLoading(true);
         setTimeout(() => {
           setIsLoading(false);
           
         }, 2000); 
         
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
     }

      const renderForm = () => {
        
        if (selectedOption === 'option1') {

            return (
              <div className="report-form">
                <p className="form-title">Search users with selected rating range</p>
                <div className="stars-section">
                  <div className="star-row">
                    <span className="star-label">From:</span>
                    <Stars onStarChange={(stars) => handleStarChange(stars, 1)} />
                  </div>
                  <div className="star-row">
                    <span className="star-label">To:</span>
                    <Stars onStarChange={(stars) => handleStarChange(stars, 2)} />
                  </div>
                </div>
                <button onClick={handleRaport1Generate} className="generate-btn">
                  <i className="fa-solid fa-chart-line"></i>
                  Generate Report
                </button>
              </div>
            );
          }
          else if (selectedOption === 'option2') {
          return (
            <div className="report-form">
                <p className="form-title">Transaction Report Generator</p>
                <div className="form-grid">
                    <div className="input-group">
                      <label>Min Price ($)</label>
                      <input
                        onChange={handleMinPriceChange}
                        onKeyDown={(e) => {
                          if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') {
                            e.preventDefault();
                          }
                        }}
                        type="number"
                        placeholder="0.00"
                        className="modern-input"
                      />
                    </div>
                    <div className="input-group">
                      <label>Max Price ($)</label>
                      <input 
                        onKeyDown={(e) => {
                          if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') {
                            e.preventDefault();
                          }
                        }} 
                        onChange={handleMaxPriceChange} 
                        type="number" 
                        placeholder="0.00"
                        className="modern-input"
                      />
                    </div>
                    <div className="input-group">
                      <label>Start Date</label>
                      <input 
                        onChange={handleStartDateChange} 
                        type="date" 
                        className="modern-input"
                      />
                    </div>
                    <div className="input-group">
                      <label>End Date</label>
                      <input 
                        onChange={handleEndDateChange} 
                        type="date"
                        className="modern-input"
                      />
                    </div>
                    <div className="input-group full-width">
                      <label>Category</label>
                      <select
                        className="modern-select"
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                      >
                        <option value="all">All Categories</option>
                        <option value="knives">Knives</option>
                        <option value="rifles">Rifles</option>
                        <option value="sniper_rifles">Sniper Rifles</option>
                        <option value="pistols">Pistols</option>
                        <option value="smg">SMG</option>
                        <option value="shotguns">Shotguns</option>
                        <option value="machine_guns">Machine Guns</option>
                        <option value="container">Containers</option>
                        <option value="gloves">Gloves</option>
                        <option value="agents">Agents</option>
                        <option value="inne">Other</option>
                      </select>
                    </div>
                </div>
                <button onClick={handleRaport2Generate} className="generate-btn">
                  <i className="fa-solid fa-chart-bar"></i>
                  Generate Report
                </button>
            </div>
          );
        }
      };  

    const { isDarkMode } = useTheme();

    return (
        <>
         
         <div className="admin-container">
            <div className="admin-header">
              <i className="fa-solid fa-user-shield admin-icon"></i>
              <h1>Admin Panel</h1>
            </div>

            {showPopup && raport1 && (
              <>
                <div className="modal-overlay" onClick={() => setShowPopup(false)}></div>
                <div className="modal-popup">
                  {isLoading ? (
                    <div className="loading-state">
                      <div className="spinner"></div>
                      <h2>Generating Report...</h2>
                      <p>Please wait a moment</p>
                    </div>
                  ) : (
                    <div className="report-results">
                      <h2 className="results-title">Report Results</h2>
                      <p className="results-subtitle">
                        Users with average rating between {selectedStars} and {selectedStars2} <i className="fa-solid fa-star"></i>
                      </p>
                      <div className="table-container">
                        <table className="results-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Avatar</th>
                              <th>Username</th>
                              <th>Avg Rating</th>
                              <th>No. Ratings</th>
                            </tr>
                          </thead>
                          <tbody>
                            {raport1Data.map((user, i) => (
                              <tr key={i}>
                                <td>{i+1}</td>
                                <td>
                                  <img src={user.avatar_url} alt="avatar" className="avatar-img" />
                                </td>
                                <td>{user.username}</td>
                                <td>
                                  <span className="rating-badge">{user.average_rating} <i className="fa-solid fa-star"></i></span>
                                </td>
                                <td>{user.number_of_ratings}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {showPopup && raport2 && (
              <>
                <div className="modal-overlay" onClick={() => setShowPopup(false)}></div>
                <div className="modal-popup">
                  {isLoading ? (
                    <div className="loading-state">
                      <div className="spinner"></div>
                      <h2>Generating Report...</h2>
                      <p>Please wait a moment</p>
                    </div>
                  ) : (
                    <div className="report-results">
                      <h2 className="results-title">Transaction Report</h2>
                      <p className="results-subtitle">
                        Transactions between ${priceMin} and ${priceMax} from {startDate} to {endDate}
                        <br />Category: <span className="category-badge">{selectedCategory}</span>
                      </p>
                      <div className="table-container">
                        <table className="results-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Date</th>
                              <th>Avg Price</th>
                              <th>Total Price</th>
                              <th>Quantity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {raport2Data.map((item, i) => (
                              <tr key={i}>
                                <td>{i+1}</td>
                                <td>{item.date}</td>
                                <td>${item.average_price}</td>
                                <td>${item.total_price}</td>
                                <td>{item.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <h3 className="summary-title">Total Summary</h3>
                      <div className="summary-cards">
                        <div className="summary-card">
                          <i className="fa-solid fa-money-bill-wave"></i>
                          <div className="card-content">
                            <span className="card-label">Average Price</span>
                            <span className="card-value">${report21Data.average_price}</span>
                          </div>
                        </div>
                        <div className="summary-card">
                          <i className="fa-solid fa-box"></i>
                          <div className="card-content">
                            <span className="card-label">Quantity</span>
                            <span className="card-value">{report21Data.quantity}</span>
                          </div>
                        </div>
                        <div className="summary-card">
                          <i className="fa-solid fa-dollar-sign"></i>
                          <div className="card-content">
                            <span className="card-label">Total Value</span>
                            <span className="card-value">${report21Data.total_price}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="report-selector">
                <div className="selector-option">
                    <input 
                      type="radio" 
                      checked={selectedOption === 'option1'} 
                      id="report1" 
                      onChange={handleRadioChange}  
                      name="option" 
                      value="option1" 
                    />
                    <label htmlFor="report1">
                      <i className="fa-solid fa-users"></i>
                      User Rating Report
                    </label>
                </div>
                <div className="selector-option">
                    <input 
                      type="radio" 
                      checked={selectedOption === 'option2'} 
                      id="report2" 
                      onChange={handleRadioChange} 
                      name="option" 
                      value="option2" 
                    />
                    <label htmlFor="report2">
                      <i className="fa-solid fa-chart-line"></i>
                      Transaction Report
                    </label>
                </div>                        
            </div>   
            {renderForm()}       
         </div>

         <style jsx>{`
           .admin-container {
             width: 100%;
             padding: 1.5rem;
             animation: fadeInUp 0.6s ease-out;
           }

           .admin-header {
             display: flex;
             align-items: center;
             gap: 1rem;
             margin-bottom: 2.5rem;
             padding: 2rem;
             background: rgba(255, 255, 255, 0.05);
             backdrop-filter: blur(20px);
             border: 1px solid rgba(255, 255, 255, 0.1);
             border-radius: 20px;
           }

           .admin-icon {
             font-size: 2.5rem;
             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
             -webkit-background-clip: text;
             -webkit-text-fill-color: transparent;
             background-clip: text;
           }

           .admin-header h1 {
             font-size: 2rem;
             font-weight: 700;
             color: white;
             margin: 0;
           }

           .report-selector {
             display: flex;
             gap: 1rem;
             margin-bottom: 2rem;
             padding: 0.5rem;
             background: rgba(255, 255, 255, 0.05);
             border-radius: 16px;
           }

           .selector-option {
             flex: 1;
             position: relative;
           }

           .selector-option input[type="radio"] {
             position: absolute;
             opacity: 0;
             width: 0;
             height: 0;
           }

           .selector-option label {
             display: flex;
             align-items: center;
             justify-content: center;
             gap: 0.75rem;
             padding: 1.25rem;
             background: rgba(255, 255, 255, 0.03);
             border: 2px solid rgba(255, 255, 255, 0.1);
             border-radius: 12px;
             color: rgba(255, 255, 255, 0.7);
             font-size: 1rem;
             font-weight: 600;
             cursor: pointer;
             transition: all 0.3s ease;
           }

           .selector-option input:checked + label {
             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
             border-color: transparent;
             color: white;
             box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
           }

           .selector-option label:hover {
             border-color: rgba(102, 126, 234, 0.5);
           }

           .report-form {
             background: rgba(255, 255, 255, 0.05);
             backdrop-filter: blur(20px);
             border: 1px solid rgba(255, 255, 255, 0.1);
             border-radius: 20px;
             padding: 2.5rem;
           }

           .form-title {
             font-size: 1.5rem;
             font-weight: 700;
             color: white;
             text-align: center;
             margin: 0 0 2rem 0;
           }

           .stars-section {
             display: flex;
             flex-direction: column;
             gap: 1.5rem;
             margin-bottom: 2rem;
           }

           .star-row {
             display: flex;
             align-items: center;
             gap: 1.5rem;
             padding: 1.25rem;
             background: rgba(255, 255, 255, 0.03);
             border-radius: 12px;
           }

           .star-label {
             font-size: 1.1rem;
             font-weight: 600;
             color: white;
             min-width: 60px;
           }

           .form-grid {
             display: grid;
             grid-template-columns: repeat(2, 1fr);
             gap: 1.5rem;
             margin-bottom: 2rem;
           }

           .input-group {
             display: flex;
             flex-direction: column;
             gap: 0.75rem;
           }

           .input-group.full-width {
             grid-column: 1 / -1;
           }

           .input-group label {
             font-size: 0.95rem;
             font-weight: 600;
             color: rgba(255, 255, 255, 0.8);
           }

           .modern-input, .modern-select {
             padding: 1rem 1.25rem;
             background: rgba(255, 255, 255, 0.05);
             border: 2px solid rgba(255, 255, 255, 0.1);
             border-radius: 12px;
             color: white;
             font-size: 1rem;
             transition: all 0.3s ease;
           }

           .modern-input:focus, .modern-select:focus {
             outline: none;
             border-color: #667eea;
             background: rgba(102, 126, 234, 0.1);
             box-shadow: 0 0 20px rgba(102, 126, 234, 0.2);
           }

           .modern-input::placeholder {
             color: rgba(255, 255, 255, 0.3);
           }

           .modern-select option {
             background: #1a1a2e;
             color: white;
           }

           .generate-btn {
             width: 100%;
             display: flex;
             align-items: center;
             justify-content: center;
             gap: 0.75rem;
             padding: 1.25rem 2rem;
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

           .generate-btn:hover {
             transform: translateY(-2px);
             box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
           }

           .modal-overlay {
             position: fixed;
             inset: 0;
             background: rgba(0, 0, 0, 0.75);
             backdrop-filter: blur(10px);
             z-index: 999;
             animation: fadeIn 0.3s ease-out;
           }

           .modal-popup {
             position: fixed;
             top: 50%;
             left: 50%;
             transform: translate(-50%, -50%);
             width: 90%;
             max-width: 1000px;
             max-height: 85vh;
             background: rgba(20, 20, 30, 0.98);
             backdrop-filter: blur(30px);
             border: 1px solid rgba(255, 255, 255, 0.1);
             border-radius: 24px;
             padding: 2.5rem;
             z-index: 1000;
             overflow-y: auto;
             box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
             animation: slideUp 0.4s ease-out;
           }

           .loading-state {
             display: flex;
             flex-direction: column;
             align-items: center;
             justify-content: center;
             padding: 4rem;
             text-align: center;
           }

           .spinner {
             width: 60px;
             height: 60px;
             border: 4px solid rgba(255, 255, 255, 0.1);
             border-top-color: #667eea;
             border-radius: 50%;
             animation: spin 1s linear infinite;
             margin-bottom: 2rem;
           }

           .loading-state h2 {
             font-size: 1.75rem;
             font-weight: 700;
             color: white;
             margin: 0 0 0.5rem 0;
           }

           .loading-state p {
             font-size: 1.1rem;
             color: rgba(255, 255, 255, 0.6);
             margin: 0;
           }

           .report-results {
             display: flex;
             flex-direction: column;
             gap: 2rem;
           }

           .results-title {
             font-size: 2rem;
             font-weight: 700;
             color: white;
             text-align: center;
             margin: 0;
           }

           .results-subtitle {
             font-size: 1.1rem;
             color: rgba(255, 255, 255, 0.8);
             text-align: center;
             margin: 0;
             line-height: 1.6;
           }

           .category-badge {
             display: inline-block;
             padding: 0.25rem 0.75rem;
             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
             border-radius: 8px;
             font-weight: 700;
           }

           .table-container {
             overflow-x: auto;
             border-radius: 16px;
             border: 1px solid rgba(255, 255, 255, 0.1);
           }

           .results-table {
             width: 100%;
             border-collapse: collapse;
           }

           .results-table thead {
             background: rgba(102, 126, 234, 0.2);
           }

           .results-table th {
             padding: 1rem;
             text-align: center;
             font-weight: 700;
             color: white;
             font-size: 1rem;
           }

           .results-table td {
             padding: 1rem;
             text-align: center;
             color: rgba(255, 255, 255, 0.9);
             border-top: 1px solid rgba(255, 255, 255, 0.05);
           }

           .results-table tbody tr {
             transition: background 0.2s ease;
           }

           .results-table tbody tr:hover {
             background: rgba(255, 255, 255, 0.03);
           }

           .avatar-img {
             width: 40px;
             height: 40px;
             border-radius: 50%;
             border: 2px solid rgba(102, 126, 234, 0.5);
           }

           .rating-badge {
             display: inline-flex;
             align-items: center;
             gap: 0.25rem;
             padding: 0.5rem 1rem;
             background: rgba(255, 193, 7, 0.2);
             border-radius: 8px;
             font-weight: 700;
             color: #ffc107;
           }

           .summary-title {
             font-size: 1.5rem;
             font-weight: 700;
             color: white;
             text-align: center;
             margin: 0;
           }

           .summary-cards {
             display: grid;
             grid-template-columns: repeat(3, 1fr);
             gap: 1.5rem;
           }

           .summary-card {
             display: flex;
             align-items: center;
             gap: 1.5rem;
             padding: 1.5rem;
             background: rgba(255, 255, 255, 0.05);
             border: 1px solid rgba(255, 255, 255, 0.1);
             border-radius: 16px;
             transition: transform 0.3s ease;
           }

           .summary-card:hover {
             transform: translateY(-5px);
             background: rgba(255, 255, 255, 0.08);
           }

           .summary-card i {
             font-size: 2.5rem;
             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
             -webkit-background-clip: text;
             -webkit-text-fill-color: transparent;
             background-clip: text;
           }

           .card-content {
             display: flex;
             flex-direction: column;
             gap: 0.5rem;
           }

           .card-label {
             font-size: 0.9rem;
             color: rgba(255, 255, 255, 0.7);
           }

           .card-value {
             font-size: 1.5rem;
             font-weight: 700;
             color: white;
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
               transform: translate(-50%, -40%);
             }
             to {
               opacity: 1;
               transform: translate(-50%, -50%);
             }
           }

           @keyframes spin {
             to { transform: rotate(360deg); }
           }

           @media (max-width: 1024px) {
             .summary-cards {
               grid-template-columns: 1fr;
             }

             .form-grid {
               grid-template-columns: 1fr;
             }
           }

           @media (max-width: 768px) {
             .admin-container {
               padding: 1rem;
             }

             .admin-header {
               padding: 1.5rem;
             }

             .admin-header h1 {
               font-size: 1.5rem;
             }

             .report-selector {
               flex-direction: column;
             }

             .modal-popup {
               padding: 1.5rem;
               width: 95%;
             }

             .results-table {
               font-size: 0.875rem;
             }

             .results-table th,
             .results-table td {
               padding: 0.75rem 0.5rem;
             }
           }
         `}</style>
            
        </>
    );
}
export default AdminPanel
