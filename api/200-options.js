// Este arquivo é usado para responder requisições OPTIONS com status 200
// Resolve problemas de CORS preflight para endpoints específicos
export default function handler(req, res) {
  // Configurar cabeçalhos CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Para requisições OPTIONS, responder com 200 OK
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Para qualquer outro método, responder com 200 OK e uma mensagem
  res.status(200).json({ message: 'OK' });
} 