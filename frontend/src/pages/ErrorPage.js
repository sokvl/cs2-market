import React from 'react';
import { Link } from 'react-router-dom';

const ErrorPage = () => {
    return (
      <>
        <div className="error-page">
          {/* Animated Background */}
          <div className="error-background">
            <div className="gradient-orb orb-1"></div>
            <div className="gradient-orb orb-2"></div>
            <div className="gradient-orb orb-3"></div>
          </div>

          <div className="error-content">
            <div className="error-icon-wrapper">
              <div className="error-icon-bg">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
            </div>

            <h1 className="error-title">404</h1>
            <h2 className="error-subtitle">Page Not Found</h2>
            <p className="error-description">
              The page you're looking for doesn't exist or has been moved.
            </p>

            <div className="error-actions">
              <Link to="/" className="error-btn primary">
                <i className="fa-solid fa-home"></i>
                Go Home
              </Link>
              <Link to="/market" className="error-btn secondary">
                <i className="fa-solid fa-store"></i>
                Browse Market
              </Link>
            </div>

            <div className="helpful-links">
              <h3>Quick Links</h3>
              <div className="links-grid">
                <Link to="/market" className="quick-link">
                  <i className="fa-solid fa-shopping-cart"></i>
                  <span>Marketplace</span>
                </Link>
                <Link to="/contact" className="quick-link">
                  <i className="fa-solid fa-envelope"></i>
                  <span>Contact Us</span>
                </Link>
                <Link to="/UserDashboard" className="quick-link">
                  <i className="fa-solid fa-user"></i>
                  <span>Dashboard</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          .error-page {
            position: relative;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            overflow: hidden;
            background: linear-gradient(135deg, #0a0e27 0%, #1a1535 50%, #0f1419 100%);
          }

          /* Animated Background */
          .error-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 0;
          }

          .gradient-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.4;
            animation: float 20s ease-in-out infinite;
          }

          .gradient-orb.orb-1 {
            width: 500px;
            height: 500px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            top: -250px;
            left: -250px;
            animation-delay: 0s;
          }

          .gradient-orb.orb-2 {
            width: 400px;
            height: 400px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            bottom: -200px;
            right: -200px;
            animation-delay: 7s;
          }

          .gradient-orb.orb-3 {
            width: 350px;
            height: 350px;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation-delay: 14s;
          }

          @keyframes float {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(50px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-50px, 50px) scale(0.9);
            }
          }

          /* Content */
          .error-content {
            position: relative;
            z-index: 1;
            text-align: center;
            max-width: 700px;
            padding: 3rem;
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            animation: fadeInUp 0.8s ease;
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

          .error-icon-wrapper {
            margin-bottom: 2rem;
            animation: pulse 2s ease infinite;
          }

          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }

          .error-icon-bg {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 140px;
            height: 140px;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%);
            border: 2px solid rgba(239, 68, 68, 0.3);
            border-radius: 50%;
            box-shadow: 0 0 40px rgba(239, 68, 68, 0.2);
          }

          .error-icon-bg i {
            font-size: 4.5rem;
            color: #ef4444;
          }

          .error-title {
            font-size: 8rem;
            font-weight: 900;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 0 0 1rem 0;
            line-height: 1;
            text-shadow: 0 0 80px rgba(239, 68, 68, 0.3);
          }

          .error-subtitle {
            font-size: 2rem;
            font-weight: 700;
            color: white;
            margin: 0 0 1rem 0;
          }

          .error-description {
            font-size: 1.125rem;
            color: rgba(255, 255, 255, 0.6);
            margin: 0 0 3rem 0;
            line-height: 1.6;
          }

          /* Buttons */
          .error-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 3rem;
          }

          .error-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 2rem;
            font-size: 1rem;
            font-weight: 600;
            border-radius: 12px;
            text-decoration: none;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
          }

          .error-btn.primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
          }

          .error-btn.primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 30px rgba(102, 126, 234, 0.5);
          }

          .error-btn.secondary {
            background: rgba(255, 255, 255, 0.05);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .error-btn.secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
          }

          .error-btn i {
            font-size: 1.125rem;
          }

          /* Helpful Links */
          .helpful-links {
            padding-top: 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }

          .helpful-links h3 {
            font-size: 1rem;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.6);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 1.5rem;
          }

          .links-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
          }

          .quick-link {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
            padding: 1.5rem 1rem;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            text-decoration: none;
            transition: all 0.3s ease;
          }

          .quick-link:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(102, 126, 234, 0.5);
            transform: translateY(-3px);
          }

          .quick-link i {
            font-size: 1.75rem;
            color: #667eea;
          }

          .quick-link span {
            font-size: 0.875rem;
            font-weight: 500;
            color: white;
          }

          /* Responsive */
          @media (max-width: 768px) {
            .error-content {
              padding: 2rem 1.5rem;
            }

            .error-title {
              font-size: 5rem;
            }

            .error-subtitle {
              font-size: 1.5rem;
            }

            .error-description {
              font-size: 1rem;
            }

            .error-icon-bg {
              width: 100px;
              height: 100px;
            }

            .error-icon-bg i {
              font-size: 3rem;
            }

            .error-actions {
              flex-direction: column;
            }

            .error-btn {
              width: 100%;
              justify-content: center;
            }

            .links-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 480px) {
            .error-page {
              padding: 1rem;
            }

            .error-title {
              font-size: 4rem;
            }

            .gradient-orb {
              filter: blur(60px);
            }
          }
        `}</style>
      </>
    );
};

export default ErrorPage;