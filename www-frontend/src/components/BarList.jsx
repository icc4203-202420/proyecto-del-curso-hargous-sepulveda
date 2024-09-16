import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import './BarList.css';
import { Link, useLocation } from 'react-router-dom';

const BarList = () => {
  const [bars, setBars] = useState([]);
  const [filteredBars, setFilteredBars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          country: bar.address?.country.name || 'Unknown',
          city: bar.address.city
        }));
        
        console.log('Fetched bars with details:', barsWithDetails);
        setBars(barsWithDetails);
        setFilteredBars(barsWithDetails); // Set all bars initially
      } catch (fetchError) {
        console.error('Error fetching bars:', fetchError);
        setError('Error fetching bars');
      } finally {
        setLoading(false);
      }
    };

    fetchBars();
  }, []);

  // Filter bars based on query
  useEffect(() => {
    if (!bars.length) return;

    if (query && query.trim() !== '') {
      const lowerCaseQuery = query.toLowerCase();
      const filtered = bars.filter((bar) =>
        bar.country.toLowerCase().includes(lowerCaseQuery) ||
        bar.city.toLowerCase().includes(lowerCaseQuery) ||
        bar.line1.toLowerCase().includes(lowerCaseQuery) ||
        bar.name.toLowerCase().includes(lowerCaseQuery) ||
        bar.line2.toLowerCase().includes(lowerCaseQuery)
      );

      console.log('Filtered bars:', filtered);
      setFilteredBars(filtered);
    } else {
      setFilteredBars(bars); // Show all bars if query is empty
    }
  }, [query, bars]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="bar-list-content">
      <div className="bar-list">
        {filteredBars.map(bar => (
          <div key={bar.id} className="bar-card">
            <Link to={`/bars/${bar.id}`} className="bar-card-link">
              <Card sx={{ maxWidth: 345 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <CardContent sx={{ flex: 1 }} id="card">
                    <Typography gutterBottom variant="h5" component="div">
                      {bar.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {bar.address 
                        ? `Address: ${bar.line1}, ${bar.city}, ${bar.country}` 
                        : 'No Address'}
                    </Typography>
                  </CardContent>
                  <CardMedia
                    component="img"
                    sx={{ width: 140, maxWidth: '100%' }}
                    image={'default-image.jpg'}
                    alt='no photo yet'
                  />
                </Box>
              </Card>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarList;










