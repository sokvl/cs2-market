import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import { useTheme } from '../../ThemeContext';
import InfoModal from '../modals/InfoModal';
import { 
  HowItWorksContent, 
  FAQContent, 
  PrivacyPolicyContent, 
  TermsOfServiceContent,
  CookiePolicyContent,
  SecurityContent,
  SupportContent
} from '../modals/ModalContents';
import './footer.css'
import logo from "../../assets/pngs/logo_cs2market.png";

function Footer() {
  const { isDarkMode } = useTheme();
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (modalName) => {
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const modalConfig = {
    'how-it-works': {
      title: 'How It Works',
      icon: 'fa-solid fa-circle-info',
      content: <HowItWorksContent />
    },
    'faq': {
      title: 'Frequently Asked Questions',
      icon: 'fa-solid fa-circle-question',
      content: <FAQContent />
    },
    'support': {
      title: 'Customer Support',
      icon: 'fa-solid fa-headset',
      content: <SupportContent />
    },
    'privacy': {
      title: 'Privacy Policy',
      icon: 'fa-solid fa-shield-halved',
      content: <PrivacyPolicyContent />
    },
    'terms': {
      title: 'Terms of Service',
      icon: 'fa-solid fa-file-contract',
      content: <TermsOfServiceContent />
    },
    'cookies': {
      title: 'Cookie Policy',
      icon: 'fa-solid fa-cookie-bite',
      content: <CookiePolicyContent />
    },
    'security': {
      title: 'Security & Safety',
      icon: 'fa-solid fa-lock',
      content: <SecurityContent />
    }
  };

  const currentModal = activeModal ? modalConfig[activeModal] : null;

  return (
    <footer className={`modern-footer ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="footer-content">
        {/* Brand Section */}
        <div className="footer-section brand-section">
          <div className="footer-brand">
            <img src={logo} width={70} height={70} alt="CS2Market Logo" className="footer-logo" />
            <h3 className="footer-brand-title">CS2Market</h3>
          </div>
          <p className="footer-description">
            Your trusted marketplace for CS2 skins. Trade safely with advanced security and instant transactions.
          </p>
          <div className="footer-social">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
              <FacebookIcon />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter">
              <TwitterIcon />
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Discord">
              <i className="fa-brands fa-discord"></i>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4 className="footer-title">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/market">Market</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/UserDashboard/Settings">Dashboard</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div className="footer-section">
          <h4 className="footer-title">Resources</h4>
          <ul className="footer-links">
            <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); openModal('how-it-works'); }}>How It Works</a></li>
            <li><a href="#faq" onClick={(e) => { e.preventDefault(); openModal('faq'); }}>FAQ</a></li>
            <li><a href="#support" onClick={(e) => { e.preventDefault(); openModal('support'); }}>Support</a></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div className="footer-section">
          <h4 className="footer-title">Legal</h4>
          <ul className="footer-links">
            <li><a href="#privacy" onClick={(e) => { e.preventDefault(); openModal('privacy'); }}>Privacy Policy</a></li>
            <li><a href="#terms" onClick={(e) => { e.preventDefault(); openModal('terms'); }}>Terms of Service</a></li>
            <li><a href="#cookies" onClick={(e) => { e.preventDefault(); openModal('cookies'); }}>Cookie Policy</a></li>
            <li><a href="#security" onClick={(e) => { e.preventDefault(); openModal('security'); }}>Security</a></li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="copyright">
            &copy; {new Date().getFullYear()} CS2Market. All rights reserved.
          </p>
          <div className="footer-badges">
            <span className="badge">
              <i className="fa-solid fa-shield-halved"></i> Secure
            </span>
            <span className="badge">
              <i className="fa-solid fa-bolt"></i> Fast
            </span>
            <span className="badge">
              <i className="fa-solid fa-star"></i> Trusted
            </span>
          </div>
        </div>
      </div>

      {/* Gradient Overlay */}
      <div className="footer-gradient-overlay"></div>

      {/* Modals */}
      {currentModal && (
        <InfoModal
          isOpen={!!activeModal}
          onClose={closeModal}
          title={currentModal.title}
          icon={currentModal.icon}
        >
          {currentModal.content}
        </InfoModal>
      )}
    </footer>
  )
}

export default Footer
