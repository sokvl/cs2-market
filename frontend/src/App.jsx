
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Home from './pages/Home'
import { ThemeProvider } from '../src/ThemeContext';
import { AppStateProvider } from './lib/AppStateManager';
import { AuthProvider } from './lib/AuthContext';
import PrivateRoute from './utils/PrivateRoute'
import { Navbar } from './components/index';
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

                        <Routes>
                           <Route path="/" element={<Home />} />
                           
                        </Routes>
                        
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
