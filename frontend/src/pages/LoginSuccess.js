import React, {useEffect, useState, useContext} from 'react'
import axios from 'axios';
import AuthContext from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";

const LoginSuccess = () => {

    const [logged, setLogged] = useState(false);
    const { loginUser } = useContext(AuthContext);
    let navigate = useNavigate();

    useEffect( () => {
      loginUser()
      setLogged(logged => !logged)
      navigate("/");
    }, [])

  return (
    <div>
        {logged ?  <h2>Cool</h2>:<h1>Logging in</h1>}
    </div>
  )
}

export default LoginSuccess
