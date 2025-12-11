import { Route, Navigate, Routes } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../lib/AuthContext';

const PrivateRoute = ({children, ...rest}) => {
    const { user } = useContext(AuthContext);
    const authenticated = user ? true : false;
    return (
        <Routes >
            <Route {...rest} element={authenticated ? <></> :<Navigate to="/login" replace={true} />}>
                {children}
            </Route>
        </Routes>
    )
}

export default PrivateRoute;