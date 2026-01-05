
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Home from './pages/Home'
import Contact from './pages/Contact'
import Market from './pages/Market'
import { Footer, Navbar } from './components/index';
import { ThemeProvider } from '../src/ThemeContext';
import UserDashboard from './pages/UserDashboard';
import { AppStateProvider } from './lib/AppStateManager';
import { AuthProvider } from './lib/AuthContext';
import UserProfile from '../src/pages/UserProfile';
import ErrorPage from './pages/ErrorPage';

import PrivateRoute from './utils/PrivateRoute'
import LoginSuccess from './pages/LoginSuccess';
import PaymentSuccess from '../src/components/success/Succes';

function App() {

  return ( 
    
    <div className='App'>
        <scripts>
            <script src="https://js.stripe.com/v3/"></script>
        </scripts>
        <AppStateProvider>
            <AuthProvider>
                <ThemeProvider>
                    <Router>   
                        <Navbar />
                        <PrivateRoute path='/UserDashboard' exact element={<UserDashboard />} />
                        <PrivateRoute path='/UserProfile' exact element={<UserProfile />} />
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path='/market'  exact element = {<Market />}/>
                            <Route path='/contact' exact element={<Contact />} />
                            <Route path='/auth_success' exact element={<LoginSuccess />} />
                            <Route path='/success' exact element={<PaymentSuccess />} />
                            <Route path='/UserDashboard/:section' exact element={<UserDashboard />} />
                            <Route path='/UserProfile/:steam_id' exact element={<UserProfile />} />
                            <Route path='*' element={<ErrorPage />} />
                        </Routes>
                        <Footer/>
                    </Router>
                    <ToastContainer
                        position="top-right"
                        autoClose={4000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="dark"
                    />
                </ThemeProvider>
            </AuthProvider>
        </AppStateProvider>
    </div>
    
);
}


export default App;
