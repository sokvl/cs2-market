
import React, {useState, useEffect} from 'react'
import {useTheme} from '../../ThemeContext';
import Stars from '../ratingSystem/Stars';
import axios from 'axios';
import '../../styles/adminPanel.css';

const AdminPanel = ({steamid}) => {

    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [raport1, setRaport1] = useState(true);
    const [raport2, setRaport2] = useState(false);

    const [selectedOption, setSelectedOption] = useState('option1');

    const [selectedStars, setSelectedStars] = useState(0);
    const [selectedStars2, setSelectedStars2] = useState(0);

    const [raport1Data, setRaport1Data] = useState([]);
    const [raport2Data, setRaport2Data] = useState([]);
    const [report21Data, setReport21Data] = useState([]);

    const [priceMin, setPriceMin] = useState(0);
    const [priceMax, setPriceMax] = useState(0);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [selectedCategory, setSelectedCategory] = useState('all');
 
    const handleStarChange = (stars, whichStar) => {
      if (whichStar === 1) setSelectedStars(stars);
      else setSelectedStars2(stars);
    };

    const handleRadioChange = (event) => {
        
        if(event.target.value === 'option1') {
          setRaport1(true);
          setRaport2(false);
          setSelectedStars(0);
          setSelectedStars2(0);
        } 
        if(event.target.value === 'option2') {
          setRaport2(true);
          setRaport1(false);
        }
        setSelectedOption(event.target.value);
        setShowPopup(false);
        setRaport1Data([]);
        setRaport2Data([]);
        
    };

    const handleMinPriceChange = (event) => {
      const value = event.target.value;
      setPriceMin(value);
    
    };
  
    const handleMaxPriceChange = (event) => {
      const value = event.target.value;   
      setPriceMax(value);   
    };

    const handleStartDateChange = (event) => {
      setStartDate(event.target.value);
    };
  
    const handleEndDateChange = (event) => {
      setEndDate(event.target.value);
    };

    const handleCategoryChange = (event) => {
      setSelectedCategory(event.target.value);
    };

    const handleRaport1Generate = () => {
      if(selectedStars === 0 || selectedStars2 === 0) {
        alert('Wybierz zakres ocen');
        return;
      }
      if(selectedStars > selectedStars2) {
        alert('Zakres ocen jest niepoprawny');
        return;
      }

        axios.get(`http://localhost:8000/reports/rating/?min_rating=${selectedStars}&max_rating=${selectedStars2}`)
       .then((response) => {
          setRaport1Data(response.data);
          setShowPopup(true);
          setIsLoading(true);
          setTimeout(() => {
            setIsLoading(false);
            
          }, 2000); 
          
       })
       .catch((error) => {
         console.error('Error fetching data:', error);
       });
    }

    const handleRaport2Generate = () => {

      if(priceMin === 0 || priceMax === 0) {
        alert('Podaj zakres cen');
        return;
      }
      if(priceMin > priceMax) {
        alert('Zakres cen jest niepoprawny, cena minimalna musi być mniejsza od ceny maksymalnej');
        return;
      }

      if(startDate === '' || endDate === '') {
        alert('Podaj zakres dat');
        return;
      }

      if (startDate > endDate) {
        alert('Zakres dat jest niepoprawny, data początkowa musi być mniejsza od daty końcowej');
        return;
      }
  
      axios.get(`http://localhost:8000/reports/transaction/?min_price=${priceMin}&max_price=${priceMax}&start_date=${startDate}&end_date=${endDate}&category=${selectedCategory}`)
      .then((response) => {
   
         setRaport2Data(response.data.transaction_reports);
         setReport21Data(response.data.total_transactions);
         setShowPopup(true);
         setIsLoading(true);
         setTimeout(() => {
           setIsLoading(false);
           
         }, 2000); 
         
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
     }

      const renderForm = () => {
        
        if (selectedOption === 'option1') {

            return (
              <div className="flex flex-col items-center justify-center">
                <p className="mt-8 text-2xl text-center">Wyszukaj użytkowników z wybranego zakresu ocen</p><br/>
                <div className="flex items-center justify-center">
                  <p>Od: </p>
                  <Stars onStarChange={(stars) => handleStarChange(stars, 1)} />
                </div>
                <div className="flex items-center justify-center">
                  <p>Do: </p>
                  <Stars onStarChange={(stars) => handleStarChange(stars, 2)} />
                </div>
                <button onClick={handleRaport1Generate} className={`font-bold py-2 px-4 rounded mt-4 ${isDarkMode ? 'bg-[#242633]' : 'bg-blue-500 text-white hover:bg-blue-700'}`}>
                  Wygeneruj raport
                </button>
              </div>
            );
          }
          else if (selectedOption === 'option2') {
          return (
            <div className="flex flex-col items-center justify-center">
                <p className="mt-8 text-2xl text-center">Raport 2</p><br/>
                <form class="block w-96 items-center justify-center shadow-lg p-4 rounded-xl">
                    <div class="grid grid-cols-2 gap-4">
                    <div class="relative z-0 w-full mb-5">
                      <input
                        onChange={handleMinPriceChange}
                        onKeyDown={(e) => {
                          if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') {
                            e.preventDefault();
                          }
                        }}
                        type="number"
                        name="dd"
                        placeholder="price min:"
                        class="pt-3 pb-2 block w-full px-0 mt-0 bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 focus:border-indigo-600 border-gray-200 font-sans"
                      />
                      <label for="dd" class="absolute duration-200 top-3 -z-1 origin-0 text-gray-500 text-base"></label>
                    </div>
                        <div class="relative z-0 w-full mb-5">
                        <input onKeyDown={(e) => {
                          if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') {
                            e.preventDefault();
                          }
                        }} onChange={handleMaxPriceChange} type="number" name="mm" placeholder="price max:" class="pt-3 pb-2 block w-full px-0 mt-0 bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 focus:border-indigo-600 border-gray-200 font-sans" />
                        <label for="mm" class="absolute duration-200 top-3 -z-1 origin-0 text-gray-500 text-base"></label>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="relative z-0 w-full mb-5">
                        <input onChange={handleStartDateChange} type="date" name="dd" placeholder="od: " class="pt-3 pb-2 block w-full px-0 mt-0 bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 focus:border-indigo-600 border-gray-200 font-sans" />
                        <label for="dd" class="absolute duration-200 top-3 -z-1 origin-0 text-gray-500 text-base"></label>
                        </div>
                        <div class="relative z-0 w-full mb-5">
                        <input onChange={handleEndDateChange} type="date" name="mm" placeholder="do: " class="pt-3 pb-2 block w-full px-0 mt-0 bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 focus:border-indigo-600 border-gray-200 font-sans" />
                        <label for="mm" class="absolute duration-200 top-3 -z-1 origin-0 text-gray-500 text-base"></label>
                        </div>
                    </div>
                    
                    <div class="relative z-0 w-full mb-5">
                    <select
                      id="category"
                      name="category"
                      className="pt-3 pb-2 block w-full px-0 mt-0 bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 focus:bg-transparent focus:border-indigo-600 border-gray-200 font-sans"
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                    >
                      <option className="text-black" value="all" defaultChecked>All</option>
                      <option className="text-black" value="knives">Knives</option>
                      <option className="text-black" value="rifles">Rifles</option>
                      <option className="text-black" value="sniper_rifles">Sniper Rifles</option>
                      <option className="text-black" value="pistols">Pistols</option>
                      <option className="text-black" value="smg">SMG</option>
                      <option className="text-black" value="shotguns">Shotguns</option>
                      <option className="text-black" value="machine_guns">Machine Guns</option>
                      <option className="text-black" value="container">Containers</option>
                      <option className="text-black" value="gloves">Gloves</option>
                      <option className="text-black" value="agents">Agents</option>
                      <option className="text-black" value="inne">Inne</option>
                    </select>
                    </div>              
                </form>
                <button onClick={handleRaport2Generate} className={` font-bold py-2 px-4 rounded mt-4 ${isDarkMode ? 'bg-[#242633]' : 'bg-blue-500 text-white hover:bg-blue-700'}`}>
                  Wygeneruj raport
                </button>
            </div>
          );
        }
      };  

    const { isDarkMode } = useTheme();

    return (
        <>
     
         <div className={`${isDarkMode ? 'bg-[#1f1d24]' : 'bg-gradient-to-r from-blue-800 to-blue-900 text-white' } p-6 rounded-xl mt-2 h-full md:w-2/2 md:ml-6'`}>
            <p className='mb-4 text-3xl text-center'> Admin Panel </p>

            {showPopup && raport1 ? (
              <>
                <div className="overlay" onClick={() => setShowPopup(false)}></div>
                <div className="popUp">
                  {isLoading ? (
                    <>
                      <h1 className='text-3xl text-center'> Raport is generating, wait a second please ... </h1>
                      <div className="loading">Loading&#8230;</div>
                    </>
                  ) : (
                    <>
                      <h1 className='text-3xl text-center mb-4'> Raport results</h1>
                      <p className='text-xl text-center'>Users with average rating between {selectedStars} and {selectedStars2} <i className="fa-solid fa-star "></i></p>
                      <table className="mt-8 w-full min-w-max table-auto text-left">
                        <thead>
                          <tr className='text-xl'>
                            <th className="text-center">#</th>
                            <th className="text-center">avatar</th>
                            <th className="text-center">username</th>
                            <th className="text-center">avg rating</th>
                            <th className="text-center">no rates</th>
                          </tr>
                        </thead>
                        <tbody>
                          {raport1Data.map((user, i) => (
                            <tr className='border-b' key={i}>
                              <td className="text-center">{i+1}</td>
                              <td className="text-center"><img src={user.avatar_url} alt="avatar" className="w-10 h-10 rounded-full mx-auto" /></td>
                              <td className="text-center">{user.username}</td>
                              <td className="text-center">{user.average_rating}</td>
                              <td className="text-center">{user.number_of_ratings}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                </div>
              </>
            ) : (
              <></>
            )}

                          {showPopup && raport2 ? (
                            <>
                              <div className="overlay" onClick={() => setShowPopup(false)}></div>
                              <div className="popUp">
                                {isLoading ? (
                                  <>
                                    <h1 className='text-3xl text-center'> Raport2 is generating, wait a second please ... </h1>
                                    <div className="loading">Loading&#8230;</div>
                                  </>
                                ) : (
                                  <>
                                    <p className='text-3xl text-center mb-4'> Raport2 results</p>
                                    <p className='text-xl text-center'>Transactions between {priceMin} and {priceMax} $ from {startDate} to {endDate} in category: {selectedCategory}</p>
                                    <table className="mt-8 w-full min-w-max table-auto text-left">
                                      <thead>
                                        <tr className='text-x borderl'>
                                          <th className="text-center">#</th>
                                          <th className="text-center">date</th>
                                          <th className="text-center">avg price</th>
                                          <th className="text-center">total_price</th>
                                          <th className="text-center">quantity</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                          {raport2Data.map((user, i) => (
                                            <tr className='border' key={i}>
                                              <td className="text-center">{i+1}</td>
                                              <td className="text-center">{user.date}</td>
                                              <td className="text-center">{user.average_price}$</td>
                                              <td className="text-center">{user.total_price}$</td>
                                              <td className="text-center">{user.quantity}</td>
                                            </tr>
                                          ))}
                                      </tbody>
                                    </table>
                                    <p className='text-3xl text-center mt-8'>Total results: </p>
                                      <div className='mx-auto space-x-4 flex justify-center mt-4'>
                                        <div className='p-2 text-center border rounded-xl w-28 h-28'> Average price: <p className='mt-2'> {report21Data.average_price}$ </p> </div>
                                        <div className='p-2 text-center border rounded-xl w-28 h-28'> Quantity: <p className='mt-2'>{report21Data.quantity} transactions </p> </div>
                                        <div className='p-2 text-center border rounded-xl w-28 h-28'> Money spent: <p className='mt-2'>{report21Data.total_price} $</p> </div>
                                      </div>
                                  </>
                                )}
                              </div>
                            </>
                          ) : (
                            <></>
                          )}


            <div className="grid w-[20rem] grid-cols-2 gap-2 rounded-xl text-black bg-gray-200 p-2 mx-auto items-center justify-center">
                <div>
                    <input type="radio" checked={selectedOption === 'option1'} id="1" onChange={handleRadioChange}  name="option" value="option1" className="peer hidden" />
                    <label htmlFor="1" className="block cursor-pointer select-none rounded-xl p-2 text-center peer-checked:bg-blue-500 peer-checked:font-bold peer-checked:text-white">Raport 1</label>
                </div>

                <div>
                    <input type="radio" checked={selectedOption === 'option2'} id="2" onChange={handleRadioChange} name="option" value="option2" className="peer hidden" />
                    <label htmlFor="2" className="block cursor-pointer select-none rounded-xl p-2 text-center peer-checked:bg-blue-500 peer-checked:font-bold peer-checked:text-white">Raport 2</label>
                </div>                        
            </div>   
            {renderForm()}       
         </div>
            
        </>
    );
}
export default AdminPanel