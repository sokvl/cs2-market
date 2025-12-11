import React, { useEffect, useState, useContext } from 'react';
import '../styles/contact.css';
import axios from 'axios';
import { useTheme } from '../ThemeContext';
import AuthContext from '../lib/AuthContext';
import { Link, useLocation, useParams  } from 'react-router-dom';
import Spinner from '../components/loadingScene/Spinner';
import Auction from '../components/auction/Auction'

const UserProfile = () => {

    const { user, dispatch } = useContext(AuthContext)
    const { steam_id } = useParams();
    const { isDarkMode } = useTheme();

    const [profileData, setProfileData] = useState({});
    const [ratingData, setRatingData] = useState([])
    const [offersData, setOffersData] = useState([])
    
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const profileDataRequest = await axios.get(`http://localhost:8000/users/${steam_id}`);
          const ratingData = await axios.get(`http://localhost:8000/users/rating?steam_id=${steam_id}`)
          const offersData = await axios.get(`http://localhost:8000/offers/user-active?steam_id=${steam_id}`)
          setProfileData(profileDataRequest.data);
          setRatingData(ratingData.data)
          setOffersData(offersData.data)

        } catch (error) {
          console.error('Error fetching data:', error);
        }
        setIsLoading(false);
      }
      fetchData();
    }, [user.steam_id]);
  
    return (
        <>
          <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-r from-[#121212] via-[#04101A] to-[#1a1625]' : 'bg-gradient-to-r from-blue-800 via-indigo-600 to-violet-900'}`}>
            <div className={`w-full rounded-xl max-w-6xl mx-auto p-8 ${isDarkMode ? 'bg-[#18181b] text-white' : 'bg-white text-white'}`}>
              <div className='flex items-center justify-center flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0 mt-8'>
                <div className={`${isDarkMode ? 'bg-[#242633]' : 'bg-gradient-to-r from-blue-800 to-blue-900 text-white'} w-4/5 p-16 rounded-xl`}>
                  {isLoading ? <Spinner /> :
                  <>
                  <div className="flex text-sm bg-[#1a1625] p-4 rounded-xl">          
                    <img src={profileData.avatar_url} className="mx-8 rounded-full border bg-black" width={128} height={128} alt="User Avatar" />
                    <div className='flex flex-col justify-center '>
                      <p className="text-3xl text-zinc-200 w-full">{profileData.username}</p> 
                      <p className='text-3xl mt-2 text-zinc-200'> {ratingData.average_rating}  <i className="fa-solid fa-star "></i></p>                 
                    </div>
                  </div>
                  <p className='text-2xl mt-8 text-zinc-200 border-t-2 border-black py-2'>User's offers</p>
                  <div className='flex flex-wrap '>      
                      {offersData.map((auction, i) => (
                        <div key={i} className='min-w-fit'>
                          <Auction 
                            id={auction.item.item_id} 
                            title={auction.item.item_name} 
                            image={auction.item.img_link} 
                            price={auction.price}  
                            owner={auction.owner} 
                            inspectLink={auction.item.inspect == null ? "none" : auction.item.inspect}
                            stickerElement={auction.item.stickerstring}
                            isOwnOffer={false}
                            rarityColor={auction.item.rarity}
                            offerActiveId={auction.offer_id}
                            condition={auction.item.condition}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                  }                 
                </div>         
              </div>
            </div>
          </div>
         
        </>
      );
    };
    
    export default UserProfile;