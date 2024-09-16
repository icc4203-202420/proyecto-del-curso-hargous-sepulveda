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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    const fetchBars = async () => {
      setLoading(true);
      try {
        const response = query
          ? await axios.get(`http://localhost:3001/api/v1/bars/search?q=${query}`)
          : await axios.get('http://localhost:3001/api/v1/bars');

        const barsWithDetails = await Promise.all(
          response.data.bars.map(async (bar) => {
            try {
              const addressResponse = await axios.get(`http://localhost:3001/api/v1/bars/${bar.id}/addresses`);
              const countryResponse = await axios.get(`http://localhost:3001/api/v1/bars/${bar.id}/countrys`);
              
              return {
                ...bar,
                address: addressResponse.data,
                country: countryResponse.data.country,
              };
            } catch (detailsError) {
              console.error(`Error fetching details for bar ${bar.id}:`, detailsError);
              return {
                ...bar,
                address: null,
                country: null,
              };
            }
          })
        );

        setBars(barsWithDetails);
      } catch (fetchError) {
        console.error('Error fetching bars:', fetchError);
        setError('Error fetching bars');
      } finally {
        setLoading(false);
      }
    };

    fetchBars();
  }, [query]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="bar-list-content">
      <div className="bar-list">
        {bars.map(bar => (
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
                        ? `Address: ${bar.address.line1}, ${bar.address.city}, ${bar.country?.name}` 
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









