const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://chamador-backend.onrender.com'  // URL do backend no Render
  : 'http://localhost:3001'  // URL local para desenvolvimento

export default API_URL; 