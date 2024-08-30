// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const BeerList = () => {
//   const [beers, setBeers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
    
//     const fetchBeers = async () => {
//       try {
//         const response = await axios.get('/api/v1/beers');
//         setBeers(response.data.beers);
//       } catch (error) {
//         console.error('Error fetching beers:', error);
//       }
//     };

//     fetchBeers();
//   }, []);

//   const handleSearch = (event) => {
//     setSearchTerm(event.target.value);
//   };

//   const filteredBeers = beers.filter(beer =>
//     beer.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div>
//       <input
//         type="text"
//         placeholder="Buscar cervezas..."
//         value={searchTerm}
//         onChange={handleSearch}
//       />
//       <ul>
//         {filteredBeers.map(beer => (
//           <li key={beer.id}>
//             <h3>{beer.name}</h3>
//             <p>{beer.description}</p>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default BeerList;
