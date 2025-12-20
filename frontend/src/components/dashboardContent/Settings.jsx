
import React, {useState, useContext, useEffect} from 'react'
import axios from 'axios';
import {useTheme} from '../../ThemeContext';
import AuthContext from '../../lib/AuthContext';


const Settings = ({tl, steamid}) => {

    const { isDarkMode } = useTheme();
    const [inputValue, setinputValue] = useState("")
    const [notifications, setNotifications] = useState([])
    const [reloadState, setreloadState] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const { user } = useContext(AuthContext);
    
        
    useEffect(() => {
        if (!user) {
            window.location.href = '/'
        }
    }, [])
    

    const inputHandler = (e) => {
        setinputValue(e.target.value);
    }



    function isValidSteamTradeLink(tradeLink) {
        // Define a regex pattern to match valid Steam trade links
        const steamTradeLinkRegex = /^(https?:\/\/)?(www\.)?steamcommunity\.com\/tradeoffer\/new\/\?partner=\d+&token=[A-Za-z0-9_-]+$/;
      
        // Use the test method to check if the tradeLink matches the regex pattern
        return steamTradeLinkRegex.test(tradeLink);
      }

    const setTradelink = () => {
        if (isValidSteamTradeLink(inputValue)) {
            axios.patch(`http://localhost:8000/users/${steamid}/`, {steam_tradelink: inputValue})
            .then((res) => 
            {
                setreloadState(prev => !prev);
                setMessage("Tradelink successfully assigned!");
                setMessageType("success");
            })
            .catch(err => {
                setMessage("Oops! Try again");
                setMessageType("error");
            });
        } else {
            setMessage("Provide correct link!");
            setMessageType("error");
        }
    }
 
    return (
        <>
            <div className="settings-container">
                <div className="settings-card">
                    <div className="settings-header">
                        <i className="fa-solid fa-gear settings-icon"></i>
                        <h1 className="settings-title">Settings</h1>
                    </div>

                    <div className="settings-content">
                        <div className="setting-section">
                            <div className="setting-label">
                                <i className="fa-solid fa-link setting-icon"></i>
                                <span>Steam Trade Link</span>
                                {inputValue && (
                                    isValidSteamTradeLink(inputValue) ? (
                                        <i className="fa-solid fa-check validation-icon valid"></i>
                                    ) : (
                                        <i className="fa-solid fa-xmark validation-icon invalid"></i>
                                    )
                                )}
                            </div>
                            
                            <div className="setting-input-group">
                                <input
                                    className="setting-input"
                                    type="text"
                                    id="tradelink"
                                    name="tradelink"
                                    value={inputValue}
                                    onChange={inputHandler}
                                    placeholder={tl ? tl : "https://steamcommunity.com/tradeoffer/new/..."}
                                />
                                <button
                                    type="button"
                                    onClick={setTradelink}
                                    className="setting-btn"
                                >
                                    <i className="fa-solid fa-save"></i>
                                    Update
                                </button>
                            </div>

                            {message && (
                                <div className={`setting-message ${messageType}`}>
                                    <i className={`fa-solid ${messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                                    <span>{message}</span>
                                </div>
                            )}

                            <div className="setting-hint">
                                <i className="fa-solid fa-info-circle"></i>
                                <span>Your trade link is required to receive items from transactions</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .settings-container {
                    width: 100%;
                    padding: 1.5rem;
                    animation: fadeInUp 0.6s ease-out;
                }

                .settings-card {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 2.5rem;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                }

                .settings-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 2.5rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
                }

                .settings-icon {
                    font-size: 2rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: spin 3s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .settings-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: white;
                    margin: 0;
                }

                .settings-content {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .setting-section {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .setting-label {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: white;
                }

                .setting-icon {
                    font-size: 1.25rem;
                    color: #667eea;
                }

                .validation-icon {
                    margin-left: auto;
                    font-size: 1.25rem;
                }

                .validation-icon.valid {
                    color: #10b981;
                }

                .validation-icon.invalid {
                    color: #ef4444;
                }

                .setting-input-group {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .setting-input {
                    flex: 1;
                    min-width: 300px;
                    padding: 1rem 1.5rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: white;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }

                .setting-input:focus {
                    outline: none;
                    border-color: #667eea;
                    background: rgba(102, 126, 234, 0.1);
                    box-shadow: 0 0 20px rgba(102, 126, 234, 0.2);
                }

                .setting-input::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }

                .setting-btn {
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
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                }

                .setting-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
                }

                .setting-btn:active {
                    transform: translateY(0);
                }

                .setting-message {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    animation: slideIn 0.3s ease-out;
                }

                .setting-message.success {
                    background: rgba(16, 185, 129, 0.1);
                    border-left: 4px solid #10b981;
                    color: #10b981;
                }

                .setting-message.error {
                    background: rgba(239, 68, 68, 0.1);
                    border-left: 4px solid #ef4444;
                    color: #ef4444;
                }

                .setting-hint {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem 1.5rem;
                    background: rgba(102, 126, 234, 0.1);
                    border-left: 4px solid #667eea;
                    border-radius: 8px;
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 0.9rem;
                }

                .setting-hint i {
                    color: #667eea;
                    font-size: 1.1rem;
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

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @media (max-width: 768px) {
                    .settings-container {
                        padding: 1rem;
                    }

                    .settings-card {
                        padding: 1.5rem;
                    }

                    .settings-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }

                    .settings-title {
                        font-size: 1.5rem;
                    }

                    .setting-input-group {
                        flex-direction: column;
                    }

                    .setting-input {
                        min-width: 100%;
                    }

                    .setting-btn {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </>
    );
}
export default Settings