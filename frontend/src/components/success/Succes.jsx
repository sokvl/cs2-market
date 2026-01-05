import React, { useEffect } from 'react'

const Success = (target) => {

  return (
    

    <div className='flex text-white flex-col h-screen justify-center bg-[#1f1d24] items-center'>
      <i class="fa-regular fa-circle-check animate-bounce text-green-800 font-bold text-[9rem] pb-4"></i>
      <h1 className="font-bold text-[2rem]">Transaction successful!</h1>
    </div>
  )
}

export default Success
