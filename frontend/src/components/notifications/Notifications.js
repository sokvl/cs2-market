import React, {useState,useContext,useEffect } from 'react'
import AuthContext from '../../lib/AuthContext';
import { useTheme } from '../../ThemeContext';
import axios from 'axios';
import './notifications.css';


const Notifications = () => {

  const { user } = useContext(AuthContext)

  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([]);

  const handleDeleteNotification = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/transactions/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`
        }
      });
      fetchNotifications(); 
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      let data = await axios.get(`http://localhost:8000/transactions/notifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`
        }
      });
      setNotifications(data.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);
  
  const handleTogglePanel = async () => { 
    await fetchNotifications();
    setIsOpen(prev => !prev);
  };

  const handleClosePanel = () => {
    setIsOpen(false);
  };

    return (
      <>    
      {user ? 
        <>
          <div className="notification-trigger">
            <button 
              className="notification-bell-btn" 
              onClick={handleTogglePanel}
              aria-label="Notifications"
            >
              <i className={`fa-solid fa-bell ${notifications.length > 0 ? 'has-notifications' : ''}`}></i>
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </button>
          </div>

          {/* Notification Panel */}
          <div className={`notification-panel ${isOpen ? 'active' : ''} ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
            <div className="notification-overlay" onClick={handleClosePanel}></div>
            
            <div className="notification-content">
              <div className="notification-header">
                <h2 className="notification-title">
                  <i className="fa-solid fa-bell"></i>
                  Notifications
                </h2>
                <button 
                  className="notification-close-btn" 
                  onClick={handleClosePanel}
                  aria-label="Close notifications"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="notification-body">
                {notifications.length === 0 ? (
                  <div className="notification-empty">
                    <i className="fa-regular fa-bell-slash"></i>
                    <p>No notifications yet</p>
                    <span>You're all caught up!</span>
                  </div>
                ) : (
                  <div className="notification-list">
                    {notifications.map((item, index) => (
                      <div 
                        key={item.notification_id} 
                        className="notification-item"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="notification-icon">
                          <i className="fa-solid fa-circle-info"></i>
                        </div>
                        <div className="notification-text">
                          <p className="notification-message">{item.message}</p>
                          <span className="notification-time">Just now</span>
                        </div>
                        <button
                          className="notification-delete-btn"
                          onClick={() => handleDeleteNotification(item.notification_id)}
                          aria-label="Delete notification"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="notification-footer">
                  <button className="notification-clear-all">
                    <i className="fa-solid fa-check-double"></i>
                    Mark all as read
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
        :
        null
      }
      </>
  )
}

export default Notifications
