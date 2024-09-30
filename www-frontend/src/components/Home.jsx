import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Loader } from '@googlemaps/js-api-loader';
import { useLocation } from 'react-router-dom';

const Home = () => {
  const [bars, setBars] = useState([]);
  const [filteredBars, setFilteredBars] = useState([]); 
  const [userLocation, setUserLocation] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const infoWindowRef = useRef(null);

  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    const fetchBars = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3001/api/v1/bars/search');
        const barsWithDetails = response.data.map((bar) => ({
          ...bar,
          line1: bar.address.line1,
          line2: bar.address.line2,
          country: bar.address?.country.name,
          city: bar.address.city
        }));

        console.log('Fetched bars with details:', barsWithDetails);
        setBars(barsWithDetails);
        setFilteredBars(barsWithDetails); 
      } catch (fetchError) {
        console.error('Error fetching bars:', fetchError);
        setError('Error fetching bars');
      } finally {
        setLoading(false);
      }
    };

    fetchBars();
  }, []);

  useEffect(() => {
    if (!bars.length) return;

    if (query && query.trim() !== '') {
      const lowerCaseQuery = query.toLowerCase();
      const filtered = bars.filter((bar) =>
        bar.country.toLowerCase().includes(lowerCaseQuery) ||
        bar.city.toLowerCase().includes(lowerCaseQuery) ||
        bar.line1.toLowerCase().includes(lowerCaseQuery) ||
        bar.line2.toLowerCase().includes(lowerCaseQuery) ||
        bar.name.toLowerCase().includes(lowerCaseQuery)
      );

      console.log('Filtered bars:', filtered);
      setFilteredBars(filtered);
    } else {
      setFilteredBars(bars); // Show all bars if query is empty
    }
  }, [query, bars]);

  // Get user's geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Error getting user's location:", error);
        }
      );
    }
  }, []);

  // Initialize Google Map
  useEffect(() => {
    if (!mapRef.current || (!filteredBars.length && !userLocation)) return;
  
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
      version: 'weekly',
    });
  
    loader
      .importLibrary('maps')
      .then((lib) => {
        const { Map } = lib;

        const center = query && filteredBars.length > 0 
          ? { lat: filteredBars[0].latitude, lng: filteredBars[0].longitude }
          : userLocation;
  

        const map = new Map(mapRef.current, {
          center: center,
          zoom: 15,
        });
  

        if (userLocation) {
          addMarker(userLocation, 'You are here', null, null, null, map, true);
        }
  

        if (filteredBars.length > 0) {
          filteredBars.forEach(({ name, latitude, longitude, id, country, city }) => {
            const position = { lat: latitude, lng: longitude };
            addMarker(position, name, id, country, city, map);
          });
        }
      })
      .catch((error) => {
        console.error('Error loading Google Maps library:', error);
      });
  }, [filteredBars, userLocation, query]); 

  const addMarker = (location, name, id, country, city, map, isUserLocation = false) => {
    const marker = new google.maps.Marker({
      position: location,
      map: map,
      icon: isUserLocation
        ? { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' } 
        : undefined,
    });

    if (!isUserLocation) {
      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="font-size: 14px; background-color: #fff; border: 2px solid #000; border-radius: 5px; padding: 10px; box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);">
              <h4 style="margin: 0; color: #1D1B20;">${name}</h4>
              <p style="margin: 5px 0; color: #1D1B20;">Country: ${country}, City: ${city}</p>
              <button style="background-color: #3f51b5; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;" onclick="window.location.href='/bars/${id}'">
                See more
              </button>
            </div>`,
          position: location,
        });
        infoWindow.open(map, marker);
        infoWindowRef.current = infoWindow;
      });
    }

    return marker;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return <div ref={mapRef} style={{ width: '100vw', height: '100vh'}} />;
};

export default Home;
















