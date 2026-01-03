import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import {HiMenuAlt3} from 'react-icons/hi';
import '../styles/market.css';
import axios from 'axios';
import { useTheme } from '../ThemeContext';
import { Auction } from '../components/index';
import Spinner from '../components/loadingScene/Spinner';

Modal.setAppElement('#root'); 

export default function Market() {
  const { isDarkMode } = useTheme();
  const [items, setItems] = useState([]);
  const [displayItems, setdisplayItems] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [itemName, setItemName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const categories = [ 
    { value: 'pistol', label: 'Pistols', icon: 'fa-gun' },
    { value: 'rifle', label: 'Rifles', icon: 'fa-crosshairs' },
    { value: 'smg', label: 'SMGs', icon: 'fa-burst' },
    { value: 'sniper rifle', label: 'Sniper Rifles', icon: 'fa-bullseye' },
    { value: 'shotgun', label: 'Shotguns', icon: 'fa-explosion' },
    { value: 'knife', label: 'Knives', icon: 'fa-khanda' },
    { value: 'gloves', label: 'Gloves', icon: 'fa-hand-fist' },
    { value: 'agent', label: 'Agents', icon: 'fa-user-secret' },
    { value: 'sticker', label: 'Stickers', icon: 'fa-star' },
    { value: 'container', label: 'Containers', icon: 'fa-box' }
  ];

  const conditions = [ 
    { value: 'fn', label: 'Factory New', color: '#4ade80' },
    { value: 'mw', label: 'Minimal Wear', color: '#34d399' },
    { value: 'ft', label: 'Field-Tested', color: '#fbbf24' },
    { value: 'ww', label: 'Well-Worn', color: '#fb923c' },
    { value: 'bs', label: 'Battle-Scarred', color: '#ef4444' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'name_asc', label: 'Name: A to Z' },
    { value: 'name_desc', label: 'Name: Z to A' }
  ];

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const categoriesParam = selectedCategories.join(',');
      const conditionsParam = selectedConditions.join(',');
      const dataResponse = await axios.get(
        `http://localhost:8000/offers/?item_category=${categoriesParam}&price_min=${minPrice}&price_max=${maxPrice}&item_condition=${conditionsParam}&item_name=${itemName}`
      );
      let auctionsData = dataResponse.data;

      // Client-side sorting
      auctionsData = sortItems(auctionsData, sortBy);

      setItems(auctionsData);
      setdisplayItems(auctionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setIsLoading(false);
  };

  const sortItems = (itemsToSort, sortType) => {
    const sorted = [...itemsToSort];
    switch(sortType) {
      case 'price_low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name_asc':
        return sorted.sort((a, b) => a.item.item_name.localeCompare(b.item.item_name));
      case 'name_desc':
        return sorted.sort((a, b) => b.item.item_name.localeCompare(a.item.item_name));
      case 'newest':
      default:
        return sorted;
    }
  };

  const handleFilter = () => {
    fetchData();
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    const sorted = sortItems(displayItems, newSort);
    setdisplayItems(sorted);
  };

  const handleClearFilters = () => {
    setItemName('');
    setSelectedCategories([]);
    setSelectedConditions([]);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    // Reset to all items
    setdisplayItems(sortItems(items, 'newest'));
  };

  const handleMinPriceChange = (event) => {
    const value = event.target.value;
    if (value === '' || parseFloat(value) >= 0) {
      setMinPrice(value);
    }
  };

  const handleMaxPriceChange = (event) => {
    const value = event.target.value;
    if (value === '' || parseFloat(value) >= 0) {
      setMaxPrice(value);
    }
  };

  const handleItemNameChange = (event) => {
    setItemName(event.target.value);
  };

  const openModal = (auction) => {
    setSelectedAuction(auction);
  };

  const closeModal = () => {
    setSelectedAuction(null);
  };

  const handleCategoryChange = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((cat) => cat !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleConditionChange = (condition) => {
    if (selectedConditions.includes(condition)) {
      setSelectedConditions(selectedConditions.filter((con) => con !== condition));
    } else {
      setSelectedConditions([...selectedConditions, condition]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeFiltersCount = selectedCategories.length + selectedConditions.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (itemName ? 1 : 0);

  return (
    <>
      <div className="market-page">
        {/* Animated Background */}
        <div className="market-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>

        {/* Market Header */}
        <div className="market-header">
          <div className="header-content">
            <div className="header-title-section">
              <i className="fa-solid fa-store header-icon"></i>
              <div>
                <h1 className="header-title">Marketplace</h1>
                <p className="header-subtitle">{displayItems.length} items available</p>
              </div>
            </div>
            
            <div className="header-actions">
              {/* Sort Dropdown */}
              <div className="sort-dropdown">
                <i className="fa-solid fa-arrow-down-wide-short"></i>
                <select 
                  value={sortBy} 
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="sort-select"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Toggle Sidebar Button */}
              <button 
                className="toggle-sidebar-btn"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <i className={`fa-solid ${isSidebarOpen ? 'fa-xmark' : 'fa-filter'}`}></i>
                {isSidebarOpen ? 'Hide' : 'Filters'}
                {activeFiltersCount > 0 && <span className="filter-badge">{activeFiltersCount}</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="market-content">
          {/* Filters Sidebar */}
          <aside className={`filters-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-content">
              <div className="sidebar-header">
                <div className="sidebar-title">
                  <i className="fa-solid fa-sliders"></i>
                  <h2>Filters</h2>
                </div>
                {activeFiltersCount > 0 && (
                  <button className="clear-filters-btn" onClick={handleClearFilters}>
                    <i className="fa-solid fa-rotate-left"></i>
                    Clear All
                  </button>
                )}
              </div>

              <div className="filters-sections">
                {/* Search by Name */}
                <div className="filter-section">
                  <label className="filter-label">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    Search Item
                  </label>
                  <input
                    type="text"
                    className="filter-input"
                    value={itemName}
                    onChange={handleItemNameChange}
                    placeholder="Type item name..."
                  />
                </div>

                {/* Price Range */}
                <div className="filter-section">
                  <label className="filter-label">
                    <i className="fa-solid fa-dollar-sign"></i>
                    Price Range
                  </label>
                  <div className="price-inputs">
                    <input
                      type="number"
                      className="filter-input price-input"
                      value={minPrice}
                      onChange={handleMinPriceChange}
                      placeholder="Min"
                      min="0"
                    />
                    <span className="price-separator">-</span>
                    <input
                      type="number"
                      className="filter-input price-input"
                      value={maxPrice}
                      onChange={handleMaxPriceChange}
                      placeholder="Max"
                      min="0"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="filter-section">
                  <label className="filter-label">
                    <i className="fa-solid fa-layer-group"></i>
                    Categories
                    {selectedCategories.length > 0 && (
                      <span className="selected-count">({selectedCategories.length})</span>
                    )}
                  </label>
                  <div className="filter-options">
                    {categories.map((category) => (
                      <button
                        key={category.value}
                        className={`filter-chip ${selectedCategories.includes(category.value) ? 'active' : ''}`}
                        onClick={() => handleCategoryChange(category.value)}
                      >
                        <i className={`fa-solid ${category.icon}`}></i>
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditions */}
                <div className="filter-section">
                  <label className="filter-label">
                    <i className="fa-solid fa-shield"></i>
                    Condition
                    {selectedConditions.length > 0 && (
                      <span className="selected-count">({selectedConditions.length})</span>
                    )}
                  </label>
                  <div className="filter-options conditions-grid">
                    {conditions.map((condition) => (
                      <button
                        key={condition.value}
                        className={`condition-chip ${selectedConditions.includes(condition.value) ? 'active' : ''}`}
                        onClick={() => handleConditionChange(condition.value)}
                        style={{
                          '--condition-color': condition.color
                        }}
                      >
                        <span className="condition-dot" style={{ background: condition.color }}></span>
                        {condition.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Apply Filters Button */}
              <button className="apply-filters-btn" onClick={handleFilter}>
                <i className="fa-solid fa-check"></i>
                Apply Filters
              </button>
            </div>
          </aside>

          {/* Items Grid */}
          <main className="items-container">
            {isLoading ? (
              <div className="loading-state">
                <Spinner />
                <p>Loading marketplace...</p>
              </div>
            ) : displayItems.length === 0 ? (
              <div className="empty-state">
                <i className="fa-solid fa-box-open"></i>
                <h2>No Items Found</h2>
                <p>Try adjusting your filters to see more results</p>
                <button className="reset-btn" onClick={handleClearFilters}>
                  <i className="fa-solid fa-rotate-left"></i>
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="items-grid">
                {displayItems.map((auction, i) => (
                  <div key={i} className="item-wrapper" style={{ animationDelay: `${i * 0.05}s` }}>
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
            )}
          </main>
        </div>

        {/* Modal - keeping existing for now */}
        <Modal isOpen={!!selectedAuction} onRequestClose={closeModal} style={{overlay: {backdropFilter: 'blur(8px)', zIndex: 1000, backgroundColor: 'rgba(0, 0, 0, 0.3)'}, content: {margin:'auto', width: '50%',border:'none' ,height: '610px',top:'50px',backgroundColor: 'rgba(0, 0, 0, 0.0001)',overflow:'hidden'} }}>
          {selectedAuction && (
            <div className={`flex w-full h-full ${isDarkMode ? 'bg-neutral-700 text-white' : 'bg-gradient-to-r from-blue-800 via-indigo-600 to-violet-900'}`}>
                  <div className="container mx-auto">
                      <div className={`text-center text-3xl p-4 ${isDarkMode ? 'bg-zinc-800':'bg-white text-blue-800'}`}>
                          <h1><b>Item details</b></h1>
                      </div>
                      <div className="lg:flex">
                          <div className="flex flex-col w-full lg:w-1/2 p-4 items-center justify-center mb-20">
                              <img src = {selectedAuction.item.imageLink} className='w-[180px] h-[180px]'/>
                              <p className='text-2xl text-zinc-200'>{selectedAuction.item.name} </p>
                              <a href="#_" className="mt-12 inline-flex hover:-translate-y-1 items-center justify-center h-16 px-10 py-0 text-xl font-semibold text-center text-gray-200 no-underline align-middle transition-all duration-300 ease-in-out bg-transparent border-2 border-gray-600 border-solid rounded-full cursor-pointer select-none hover:text-white hover:border-white focus:shadow-xs focus:no-underline">
                                   Inspect in game
                              </a>
                          </div>
                          <div className={`flex flex-col w-full lg:w-1/2 items-center justify-center ${isDarkMode ? 'bg-neutral-700 text-white':'text-white'}`}>
                              <p className='text-xl'><b>Condition:</b> {selectedAuction.item.condition}</p>
                              <p className='text-xl pt-8'><b>Float:</b></p>
                              <p className='pt-8 text-xl'> <b>Price:</b> {selectedAuction.price}$ </p>
                              <p className='pt-8 text-xl'><b> Suggested price:</b> {selectedAuction.price}$ </p> 
                          </div>
                      </div>
                      <div className={`text-center p-4 text-3xl ${isDarkMode ? 'bg-zinc-800' : 'bg-white text-blue-800' }`}>
                              <a href="#_" className={`no-underline align-middle transition-all duration-300 ease-in-out bg-transparent inline-flex hover:-translate-y-2 items-center justify-center h-16 px-10 py-0 text-2xl font-semibold rounded-full cursor-pointer select-none focus:no-underline text-center${isDarkMode ? 'text-gray-200 hover:text-green-400':'border border-solid border-blue-800 hover:text-green-500' }`}>
                                   Buy now!
                              </a>
                      </div>
                  </div>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
}
