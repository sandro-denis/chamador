const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://chamador-backend.onrender.com' // URL do seu serviço no Render
  : 'http://localhost:3001'

export default API_URL; 