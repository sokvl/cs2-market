import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../ThemeContext';
import AuthContext from '../../lib/AuthContext';

const LoginButton = () => {
  const { isDarkMode } = useTheme();
  const { user, loginUser, logoutUser } = useContext(AuthContext)

    const handleClick = () => {
        console.log(user)
    }

    return (
        <div className='login-module'>
            {!user ? (
                <a href='http://localhost:8000/login' className='login-btn-modern-wrapper'>
                    <div className={`login-btn-modern ${isDarkMode ? 'login-dark' : 'login-light'}`}>
                        <span className='login-text'>Login</span>
                        <i className="fa-brands fa-steam steam-icon"></i>
                    </div>
                </a>
            ) : (
                <div className='user-auth-wrapper'>
                    <Link to="/UserDashboard/Settings" className='user-panel-link'>
                        <div className={`user-panel-modern ${isDarkMode ? 'user-dark' : 'user-light'}`}>
                            <img src={user.avatar} width={48} height={48} className='user-avatar' alt='avatar' />
                            <span className='user-nick'>{user.nickname}</span>
                        </div>
                    </Link>
                    <button onClick={logoutUser} className='logout-btn-modern' aria-label='Logout'>
                        <i className="fa-solid fa-right-from-bracket"></i>
                    </button>
                </div>
            )}
        </div>
    );
}

export default LoginButton;
