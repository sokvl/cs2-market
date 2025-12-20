import React, {useState} from 'react'
import { useTheme } from '../../ThemeContext';
import Modal from 'react-modal';
import axios from 'axios';

Modal.setAppElement('#root'); 

const Auction = ({ id, title, image, price,seed, condition, target, rarityColor, ownerId }) => {
  
  

  const [selectedAuction, setSelectedAuction] = useState(null);
  const [selectedAuctionAdd, setSelectedAuctionAdd] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [inputValue, setinputValue] = useState("")
  const { isDarkMode } = useTheme();
  const cw = rarityColor;

  const handleInputChange = (e) => {
    setinputValue(e.target.value)
  }

  const openModal = (auction) => {
    setSelectedAuction(auction);
  };

  const openModalAdd = (auction) => {
    setSelectedAuctionAdd(auction);
  };

  const closeModal = () => {
    setSelectedAuction(null);
    setSelectedAuctionAdd(null);
    setDeleteModalOpen(false); 
  };

  const openDeleteModal = () => {
    setDeleteModalOpen(true);
  };

  const handleDelete = () => {
    
    closeModal();
  };
  const createOffer = () => {
    axios.post("http://localhost:8001/offers/newOffer", {
      item: {
        id: id,
        name: title,
        imageLink: image,
        condition: condition
      },
      price: inputValue,
      owner: ownerId
    }).then((res) => window.location.reload()).catch((err) => console.log(err))
  }

    if(target=='market.js'){
      return (
        <>

          <div className="scale-75 max-w-sm rounded overflow-hidden shadow-lg bg-[#1f1d24] text-white max-w-[20rem] p-4 pb-2 shadow-xl scale-[0.9]">
            <div className="bg-[#282828]">
              <img className="w-full border border double border-black" src={image} alt={title+id} />
            </div>
            <div className="px-4 pt-4">
              <div className="font-bold text-l mb-2">{title}</div>
              <span className="inline-block bg-gray-900 rounded-full px-3 py-1 text-sm font-semibold text-gray-200 mr-2 mb-2">{condition}</span>
            </div>
            <div className="px-4 pb-2 mt-4">
              <div className="flex items-center justify-between mt-4 pb-4">
                <span className="text-xl">{price} $</span>
                <button className="bg-[#76737e] hover:bg-[#46424f] text-white font-bold py-2 px-4 rounded">
                <i class="fa-solid fa-cart-shopping"></i>
                </button>
              </div>
            </div>
        </div>
        </>
      );
    }

    else if(target=='addItem'){
      return (
        <>
          <div onClick={() => openModalAdd({ id, title, image, price,seed, condition })} className='w-[100px] h-[100px] border-4 border-red-800'>
            <img src={image}/>
          </div>
          <Modal isOpen={!!selectedAuctionAdd} onRequestClose={closeModal}style={{overlay: { backdropFilter: 'blur(8px)', zIndex: 1000, backgroundColor: 'rgba(0, 0, 0, 0.3)', }, content: {margin:'auto', width: '50%',border:'none' ,height: '600px',top:'100px',backgroundColor: 'rgba(0, 0, 0, 0.0001)'} }}>
                  {selectedAuctionAdd && (
                  <div className={`flex w-full h-full ${isDarkMode ? '' : ''}`}>
                        <div className="container mx-auto">
                            <div className={`text-center p-4 text-3xl ${isDarkMode ? 'text-white bg-zinc-800' : 'bg-white text-blue-800'}`}>
                                <h1><b>Add an auction</b></h1>
                            </div>
                            <div className={`lg:flex ${isDarkMode ? 'bg-neutral-700 text-white' : 'bg-gradient-to-r from-blue-800 via-indigo-600 to-violet-900 text-white'}`}>

                                <div className="flex flex-col w-full lg:w-1/2 p-4 items-center justify-center mb-20">
                                    <img src = {selectedAuctionAdd.image} className='w-[180px] h-[180px]'/>
                                    <p className='text-2xl text-zinc-200'><b>{selectedAuctionAdd.title}</b> </p>
                                    <div class="mt-8">
                                      <input
                                        type="text"
                                        placeholder="Price"
                                        class="bg-transparent border-0 border-b-2 border-white text-white focus:outline-none focus:border-green-300 block mb-4 focus:ring-0"
                                      />
                                      <input
                                        type="text"
                                        placeholder="Time (in days)"
                                        class="bg-transparent border-0 border-b-2 border-white text-white focus:outline-none focus:border-green-300 focus:ring-0 "
                                      />
                                    </div>                                 
                                </div>

                                <div className="flex flex-col w-full lg:w-1/2 items-center justify-center ">  
                                    <p> You cant change these details</p>
                                      <a href="#" className="group relative transform hover: scale-110 transition-transform duration-100 ease-in-out">
                                        <u>check why</u>
                                      <div className="hidden group-hover:block absolute top-10 left-0 bg-white p-4 rounded shadow-md text-gray-800 w-[200px]">
                                        Item details are provided from Steam API. You can't change them. 
                                      </div>
                                    </a><br/>                              
                                    <input disabled value={selectedAuctionAdd.condition} className='bg-transparent border-0 border-b-2 border-grey-500'/>
                                    <input disabled value={selectedAuctionAdd.seed} className='bg-transparent mt-4 border-0 border-b-2 border-grey-500'/>
                                    <input disabled className='bg-transparent mt-4 border-0 border-b-2 border-grey-500'/> 
                                    <input disabled className='bg-transparent mt-4 border-0 border-b-2 border-grey-500'/> 
                                </div>
                            </div>
                            <div className={`text-center p-4 text-3xl ${isDarkMode ? 'bg-zinc-800 text-white hover:text-green-300' : 'bg-white text-blue-800 hover:text-green-500'}`}>
                                    <a href="#_" class="inline-flex hover:-translate-y-1 items-center justify-center h-16 px-10 py-0 text-xl font-semibold text-center no-underline align-middle transition-all duration-300 ease-in-out bg-transparent rounded-full cursor-pointer select-none focus:no-underline">
                                        Confirm
                                    </a>
                            </div>
                        </div>
                  </div>
                )}
          </Modal>

        </>
      );
    }

    else if(target=='usersItems'){
      return (
        <>
          <div className="group max-w-sm rounded overflow-hidden shadow-lg bg-[#1f1d24] text-white max-w-[20rem] p-4 pb-2 shadow-xl transform scale-90 transition-transform duration-300 ease-in-out min-h-[394px]">
            <div className={`bg-[#282828] group-hover:opacity-75 transition-opacity duration-300 `}>
              <img className={`w-full border-4 border-[#${cw}] w-[256px] h-[192px] `} src={image} alt={title + id} />
            </div>
            <div className="px-4 pt-4">
              <div className="font-bold text-l mb-2 overflow-hidden max-w-4">{title}</div>
              <span className={`inline-block bg-gray-900 rounded-full px-3 py-1 text-sm font-semibold text-gray-200 mr-2 mb-2 ${condition ? '' : ' hidden'}`}>{condition?.toUpperCase()}</span>
            </div>
            <div className="px-4 pb-2 mt-4">
              <div className="flex items-center justify-between mt-4 pb-4">
                <span className="text-xl pr-2">{price}$</span>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button onClick={() => openModal({ id, title, image, price,seed, condition })} className="hover:bg-blue-400 px-3 py-1 border border-white rounded-full text-sm font-semibold text-gray-200 transition-colors duration-300">Sell</button>
                  {/*<button onClick={openDeleteModal} className="hover:bg-red-600 px-3 py-1 border border-white rounded-full text-sm font-semibold text-gray-200 transition-colors duration-300">USUŃ</button>*/}
                </div>
              </div>
            </div>
          </div>
          
          <Modal isOpen={!!selectedAuction} onRequestClose={closeModal}style={{overlay: { backdropFilter: 'blur(8px)', zIndex: 1000, backgroundColor: 'rgba(0, 0, 0, 0.3)', }, content: {margin:'auto', width: '50%',border:'none' ,height: '600px',top:'100px',backgroundColor: 'rgba(0, 0, 0, 0.0001)'} }}>
                  {selectedAuction && (
                  <div className={`flex w-full h-full ${isDarkMode ? '' : ''}`}>
                        <div className="container mx-auto">
                            <div className={`text-center p-4 text-3xl ${isDarkMode ? 'text-white bg-zinc-800' : 'bg-white text-blue-800'}`}>
                                <h1><b>Change auction details</b></h1>
                            </div>
                            <div className={`lg:flex ${isDarkMode ? 'bg-neutral-700 text-white' : 'bg-gradient-to-r from-blue-800 via-indigo-600 to-violet-900 text-white'}`}>

                                <div className="flex flex-col w-full lg:w-1/2 p-4 items-center justify-center mb-20">
                                    <img src = {selectedAuction.image} className='w-[102px] h-[77px]'/>
                                    <p className='text-2xl text-zinc-200'><b>{selectedAuction.title}</b> </p>
                                      <div class="relative mt-12">
                                        <input id="" name="price" class="peer bg-transparent h-10 w-full border-0 border-b-2 text-white placeholder-transparent focus:outline-none focus:ring-0 focus:border-white" placeholder={price} onChange={handleInputChange} type="number"/>
                                        <label for="price" class="absolute left-0 -top-3.5 text-white text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Price</label>
                                      </div>                                   
                                </div>

                                <div className="flex flex-col w-full lg:w-1/2 items-center justify-center ">  
                                    <p> You cant change these details</p>
                                      <a href="#" className="group relative transform hover: scale-110 transition-transform duration-100 ease-in-out">
                                        <u>check why</u>
                                      <div className="hidden group-hover:block absolute top-10 left-0 bg-white p-4 rounded shadow-md text-gray-800">
                                        This fields are generated automaticly based on selected item.
                                      </div>
                                    </a><br/>                              
                                    <input disabled value={selectedAuction.condition} className='bg-transparent border-0 border-b-2 border-white'/>
                                    <input disabled value={"example_seed"} className='bg-transparent mt-4 border-0 border-b-2 border-white'/>
                                    <input disabled value={"collection"} className='bg-transparent mt-4 border-0 border-b-2 border-white'/> 
                                    <input disabled value={"pattern_id"} className='bg-transparent mt-4 border-0 border-b-2 border-white'/> 
                                </div>
                            </div>
                            <div className={`text-center p-4 text-3xl ${isDarkMode ? 'bg-zinc-800 text-white hover:text-green-300' : 'bg-white text-blue-800 hover:text-green-500'}`}>
                                    <a onClick={() => createOffer()} class="inline-flex hover:-translate-y-1 items-center justify-center h-16 px-10 py-0 text-xl font-semibold text-center no-underline align-middle transition-all duration-300 ease-in-out bg-transparent rounded-full cursor-pointer select-none focus:no-underline">
                                        Create offer
                                    </a>
                                    <button onClick={createOffer}>
                                      Create offer
                                    </button>
                            </div>
                        </div>
                  </div>
                )}
          </Modal>

          <Modal
          isOpen={isDeleteModalOpen}
          onRequestClose={closeModal}
          style={{
            overlay: {
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            },
            content: {              
              margin: 'auto',
              width: '50%',
              border: 'none',
              height: '150px', 
              top: '40%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgb(0,0,0,0.00001)',
            },
          }}
        >
          <div className={`flex flex-col items-center justify-center h-full ${isDarkMode ? 'bg-neutral-700 text-white' : 'bg-white text-blue-800'}`}>
            <p className="mb-4 text-xl">Czy na pewno chcesz usunąć aukcję?</p>
            <div className="flex space-x-2">
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-800 px-3 py-1 text-white rounded"
              >
                Tak, usuń
              </button>
              <button
                onClick={closeModal}
                className="bg-[#76737e] hover:bg-[#46424f] px-3 py-1 text-white rounded"
              >
                Anuluj
              </button>
            </div>
          </div>
        </Modal>
        </>
      );
      
      
    }
    
}

export default Auction
