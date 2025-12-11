
import React, {useState, useEffect} from 'react'
import {Link} from 'react-router-dom'
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '../../ThemeContext';
import './navbar.css'
import logo from "../../assets/pngs/logo_cs2market.png";
import LoginButton from '../loginbutton/LoginButton';


function Navbar() {
  const { isDarkMode, toggleTheme } = useTheme();

  const [sidebar, setSidebar] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const showSidebar = () => setSidebar (!sidebar);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <>
    <div className={`navbar ${scrolled ? 'scrolled' : ''} ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className='leftSide'>
            <Link to="/" className="flex items-center text-gray-200 brand-link">
              <img src={logo} width={86} height={86} className='brand-logo' /> 
              <h1 className="text-gray-500 brand-title"> CS2Market</h1>
            </Link>
        </div>   
        <div className="rightSide"> 
            <Link className='menuLink' to="/market"> Market </Link>
            <LoginButton />
            <Link>
              <button onClick={toggleTheme} className='theme-toggle-btn' aria-label='Toggle theme'>
                { isDarkMode ? <i className="fa-solid fa-sun text-grey-200"></i> : <i className="fa-solid fa-moon"></i>}
              </button>
            </Link>
            <div className='hiddenLinks'>                 
              <button onClick ={showSidebar}>
                <MenuIcon/>
              </button>
            </div>
        </div>       
    </div>

      <nav className={`mobile-nav ${sidebar ? 'active' : ''} ${isDarkMode ? 'dark-mode' : 'light-mode'}`} aria-hidden={!sidebar}>
        <div className='mobile-nav-overlay' onClick={showSidebar} />
        <div className='mobile-nav-panel'>
          <div className='mobile-nav-header'>
            <div className='mobile-brand'>
              <img src={logo} width={70} height={70} className='mobile-brand-logo' />
              <span className='mobile-brand-title'>CS2Market</span>
            </div>
            <button className='close-mobile-nav' onClick={showSidebar} aria-label='Close menu'>&times;</button>
          </div>
          <div className='mobile-nav-content'>
            <ul className='mobile-nav-items' onClick={showSidebar}>
              <li className='mobile-nav-item fade-in-delay-1'>
                <Link to='/' className='mobile-link'>Home</Link>
              </li>
              <li className='mobile-nav-item fade-in-delay-2'>
                <Link to='/market' className='mobile-link'>Market</Link>
              </li>
              <li className='mobile-nav-item fade-in-delay-3'>
                <Link to='/contact' className='mobile-link'>Contact</Link>
              </li>
              <li className='mobile-nav-item fade-in-delay-4'>
                <LoginButton />
              </li>
            </ul>
            <div className='mobile-actions'>
              <button onClick={toggleTheme} className='theme-toggle-btn mobile-theme-btn' aria-label='Toggle theme'>
                { isDarkMode ? <i className="fa-solid fa-sun"></i> : <i className="fa-solid fa-moon"></i>}
              </button>
              <div className='notifications-wrapper'>
              </div>
            </div>
          </div>
        </div>
      </nav>


    </>
  )
}

export default Navbar
