'use client';

import { useState, useEffect } from 'react';
import { searchImages, getImageProviders, searchTechLogos } from '@/lib/api';

export default function ImagePickerModal({ open, onClose, onSelectImage }) {
  const [query, setQuery] = useState('');
  const [tags, setTags] = useState('');
  const [images, setImages] = useState([]);
  const [techLogos, setTechLogos] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('pixabay');
  const [activeTab, setActiveTab] = useState('images');

  useEffect(() => {
    if (open) {
      const fetchProviders = async () => {
        const availableProviders = await getImageProviders();
        setProviders(availableProviders);
      };
      fetchProviders();
    }
  }, [open]);

  if (!open) return null;

  const handleSearch = async () => {
    const results = await searchImages(query, selectedProvider);
    setImages(results);
  };

  const handleTechLogoSearch = async () => {
    const results = await searchTechLogos(query);
    setTechLogos(results);
  };

  const handleSelectImage = (item, type) => {
    onSelectImage({ type, data: item });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-3xl transform transition-all scale-100 opacity-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Select Image</h2>
        <div className="flex border-b border-gray-200 mb-4">
          <button onClick={() => setActiveTab('images')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'images' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}>
            Images
          </button>
          <button onClick={() => setActiveTab('tech_logos')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'tech_logos' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}>
            Tech Logos
          </button>
        </div>
        <div className="flex flex-col gap-3 mb-6">
          {activeTab === 'images' && (
            <div className="flex gap-3">
              <select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)} className="p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                {providers.map(provider => (
                  <option key={provider} value={provider}>{provider}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search for images..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <button onClick={handleSearch} className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium shadow-md">
                Search
              </button>
            </div>
          )}
          {activeTab === 'tech_logos' && (
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search for tech logos..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <button onClick={handleTechLogoSearch} className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium shadow-md">
                Search
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 h-80 overflow-y-auto p-2 border border-gray-200 rounded-md bg-gray-50">
          {activeTab === 'images' && images.map((image, index) => (
            <div key={index} className="relative w-full h-32 rounded-md overflow-hidden shadow-sm cursor-pointer group" onClick={() => handleSelectImage(image, 'image')}>
              <img src={image.url} alt={image.attribution} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-white text-sm font-medium">Select</span>
              </div>
            </div>
          ))}
          {activeTab === 'tech_logos' && techLogos.map((logo, index) => (
            <div key={index} className="relative w-full h-32 rounded-md overflow-hidden shadow-sm cursor-pointer group" onClick={() => handleSelectImage(logo, 'tech_logo')}>
              <img src={logo.logo_url} alt={logo.name} className="w-full h-full object-contain p-4" />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-white text-sm font-medium">{logo.name}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}