import React, {useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';


function ContactField() {
  
    const toastifySuccess = () => {
        toast.success('Message send sucessfully', {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          });
      };

      return (
        <>
          <div className='flex w-full min-h-screen justify-center items-center bg-gradient-to-r from-blue-800 via-indigo-600 to-violet-900'>

          </div>
          
        </>
      );
       
}

export default ContactField
