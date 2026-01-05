import React, { useState, useContext, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { useTheme } from '../../ThemeContext';
import AuthContext from '../../lib/AuthContext';

const stripePromise = loadStripe(
  'pk_test_51OJtcEG3HTnq0rPh32iVg1JLIgvMfJcqJ8qEVRWKQE1lOQi4tVdyqhxKrMglSjXgPyUd5lqVhQ1A6iF6FI1jJCLl00c5tlkHR7'
);

const WalletManagement = ({ ownerId }) => {
  const { user } = useContext(AuthContext);
  const { isDarkMode } = useTheme();
  const [inputValue, setinputValue] = useState('');
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        if (!user?.steam_id) return;
        const response = await axios.get(`http://localhost:8000/users/wallet/${user.steam_id}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`,
          },
        });
        console.debug('[Wallet] Raw balance response:', response.data);
        const balanceValue = response.data.balance;
        const numBalance = typeof balanceValue === 'number' ? balanceValue : (typeof balanceValue === 'string' ? parseFloat(balanceValue) : 0);
        setBalance(isNaN(numBalance) ? 0 : numBalance);
      } catch (error) {
        console.error('[Wallet] Error fetching balance:', error);
        setBalance(0);
      }
    };
    if (user?.steam_id) {
      fetchBalance();
    }
  }, [user?.steam_id]);

  // próbujemy pobrać operacje portfela jeśli endpoint kiedyś powstanie; póki co tylko log
  useEffect(() => {
    setTransactions([]);
    console.debug('[Wallet] Transactions set to empty (brak endpointu).');
  }, [user?.steam_id]);

  const inputHandler = (e) => {
    const value = e.target.value;
    if (value >= 0) {
      setinputValue(value);
    }
  };

  const makePayment = async () => {
    const stripe = await stripePromise;
    const token = localStorage.getItem('access');

    try {
      if (!inputValue || Number(inputValue) <= 0) return;
      if (!user?.steam_id) return;
      const response = await axios.get(
        `http://localhost:8000/payment/${Number(inputValue)}/${user.steam_id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.debug('[Wallet] Payment init response:', response.data);
      const { sessionId } = response.data;
      if (!sessionId) {
        console.error('[Wallet] Brak sessionId w odpowiedzi');
        return;
      }
      const result = await stripe.redirectToCheckout({ sessionId });
      if (result.error) {
        console.error('[Wallet] Stripe redirect error:', result.error.message);
      }
    } catch (error) {
      console.error('[Wallet] Payment initialization failed:', error);
    }
  };

  return (
    <>
      <div className="wallet-container">
        {/* Balance Card */}
        <div className="wallet-balance-card">
          <div className="balance-header">
            <div className="balance-icon-wrapper">
              <i className="fa-solid fa-wallet balance-icon"></i>
            </div>
            <div className="balance-info">
              <span className="balance-label">Your Balance</span>
              <h1 className="balance-amount">${typeof balance === 'number' ? balance.toFixed(2) : '0.00'}</h1>
            </div>
          </div>
          
          <div className="deposit-section">
            <h3 className="section-title">
              <i className="fa-solid fa-plus-circle"></i>
              Add Funds
            </h3>
            <div className="deposit-input-group">
              <div className="input-wrapper">
                <span className="currency-symbol">$</span>
                <input
                  className="deposit-input"
                  type="number"
                  value={inputValue}
                  onChange={inputHandler}
                  placeholder="Enter amount"
                  min="0"
                />
              </div>
              <button className="deposit-btn" onClick={makePayment} disabled={!inputValue || inputValue <= 0}>
                <i className="fa-solid fa-credit-card"></i>
                Deposit
              </button>
            </div>
            <div className="deposit-hint">
              <i className="fa-solid fa-shield-halved"></i>
              <span>Secure payment powered by Stripe</span>
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="transactions-section">
          <div className="transactions-header">
            <i className="fa-solid fa-clock-rotate-left"></i>
            <h2>Transaction History</h2>
          </div>

          {transactions.length === 0 ? (
            <div className="empty-transactions">
              <i className="fa-solid fa-receipt"></i>
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="transactions-list">
              {transactions.map((transaction, index) => (
                <div key={index} className="transaction-item">
                  <div className="transaction-icon">
                    {transaction.amount > 0 ? (
                      <i className="fa-solid fa-arrow-up income"></i>
                    ) : (
                      <i className="fa-solid fa-arrow-down expense"></i>
                    )}
                  </div>
                  <div className="transaction-details">
                    <span className="transaction-type">{transaction.operation_type || 'Transaction'}</span>
                    <span className="transaction-date">{new Date(transaction.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className={`transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount || 0).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .wallet-container {
          width: 100%;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          animation: fadeInUp 0.6s ease-out;
        }

        .wallet-balance-card {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .balance-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .balance-icon-wrapper {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .balance-icon {
          font-size: 2.5rem;
          color: white;
        }

        .balance-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .balance-label {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
        }

        .balance-amount {
          font-size: 3rem;
          font-weight: 700;
          color: white;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .deposit-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.3rem;
          font-weight: 600;
          color: white;
          margin: 0;
        }

        .section-title i {
          color: #667eea;
        }

        .deposit-input-group {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .input-wrapper {
          position: relative;
          flex: 1;
          min-width: 250px;
        }

        .currency-symbol {
          position: absolute;
          left: 1.5rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.5rem;
          font-weight: 700;
          color: #667eea;
        }

        .deposit-input {
          width: 100%;
          padding: 1.25rem 1.5rem 1.25rem 3rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          font-size: 1.25rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .deposit-input:focus {
          outline: none;
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.1);
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.2);
        }

        .deposit-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .deposit-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem 2.5rem;
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

        .deposit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .deposit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .deposit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .deposit-hint {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: rgba(16, 185, 129, 0.1);
          border-left: 4px solid #10b981;
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
        }

        .deposit-hint i {
          color: #10b981;
        }

        .transactions-section {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .transactions-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .transactions-header i {
          font-size: 1.5rem;
          color: #667eea;
        }

        .transactions-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .empty-transactions {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
        }

        .empty-transactions i {
          font-size: 4rem;
          color: rgba(255, 255, 255, 0.2);
          margin-bottom: 1rem;
        }

        .empty-transactions p {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
        }

        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .transaction-item:hover {
          background: rgba(255, 255, 255, 0.06);
          transform: translateX(5px);
        }

        .transaction-icon {
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .transaction-icon i.income {
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
          padding: 12px;
          border-radius: 12px;
          font-size: 1.2rem;
        }

        .transaction-icon i.expense {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
          padding: 12px;
          border-radius: 12px;
          font-size: 1.2rem;
        }

        .transaction-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .transaction-type {
          font-size: 1rem;
          font-weight: 600;
          color: white;
        }

        .transaction-date {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .transaction-amount {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .transaction-amount.positive {
          color: #10b981;
        }

        .transaction-amount.negative {
          color: #ef4444;
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

        @media (max-width: 768px) {
          .wallet-container {
            padding: 1rem;
          }

          .wallet-balance-card {
            padding: 1.5rem;
          }

          .balance-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .balance-amount {
            font-size: 2.5rem;
          }

          .deposit-input-group {
            flex-direction: column;
          }

          .input-wrapper {
            min-width: 100%;
          }

          .deposit-btn {
            width: 100%;
            justify-content: center;
          }

          .transactions-section {
            padding: 1.5rem;
          }

          .transaction-item {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </>
  );
};

export default WalletManagement;
