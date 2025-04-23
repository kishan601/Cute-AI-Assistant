const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-placeholder.onrender.com' // You'll update this after backend deployment
  : '';
   
export default API_URL;