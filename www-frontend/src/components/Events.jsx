import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import './Events.css'

const Events = () => {

  return (
    <div class='container' id='fondo' disableGutters maxWidth={false}>
            <Card className="event-card" sx={{ maxWidth: 345 }}>
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <CardContent className="event-card-content" sx={{ flex: 1 }}>
                  <Typography gutterBottom variant="h5" component="div">
                    Test Event
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Address
                  </Typography>
                  </CardContent>
              <Box sx={{ width: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Here goes the photo of the event</p>
          </Box>
        </Box>
      </Card>

    </div>
  );
};
  
export default  Events;
