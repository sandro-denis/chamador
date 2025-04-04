import express from 'express';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware para verificar token JWT
const verificarToken = (req, res, next) => {
  try {
    console.log('Iniciando verificação do token...');
    const authHeader = req.headers.authorization;
    console.log('Authorization header:', authHeader ? 'Presente' : 'Ausente');

    const token = authHeader?.split(' ')[1];
    if (!token) {
      console.error('Token não fornecido na requisição');
      return res.status(401).json({ message: 'Token não fornecido' });
    }
    console.log('Token extraído com sucesso');

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não está definido no ambiente');
      return res.status(500).json({ message: 'Erro de configuração do servidor' });
    }
    console.log('JWT_SECRET está configurado');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', { userId: decoded.userId ? 'Presente' : 'Ausente' });

    if (!decoded.userId) {
      console.error('Token não contém userId');
      return res.status(401).json({ message: 'Token inválido - userId não encontrado' });
    }

    req.userId = decoded.userId;
    console.log('Token verificado com sucesso para userId:', decoded.userId);
    next();
  } catch (error) {
    console.error('Erro detalhado ao verificar token:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(401).json({ 
      message: 'Token inválido ou expirado',
      error: error.message
    });
  }
};

// Rota para limpar dados da empresa
router.post('/limpar-dados', verificarToken, async (req, res) => {
  try {
    console.log('Iniciando processo de limpeza de dados...');
    const db = req.app.locals.db;
    const userId = req.userId;

    console.log('Verificando conexão com o banco de dados...');
    console.log('Tipo de req.app.locals:', typeof req.app.locals);
    console.log('req.app.locals contém db?', req.app.locals.hasOwnProperty('db'));
    
    if (!db) {
      console.error('Conexão com o banco de dados não disponível');
      return res.status(500).json({ 
        message: 'Erro de conexão com o banco de dados',
        details: 'A conexão com o banco de dados não está disponível'
      });
    }
    console.log('Conexão com o banco de dados OK');
    console.log('Tipo do objeto db:', typeof db);
    console.log('Métodos disponíveis em db:', Object.keys(db));

    console.log('Verificando ID do usuário...');
    if (!userId) {
      console.error('ID do usuário não fornecido');
      return res.status(400).json({ 
        message: 'ID do usuário não fornecido',
        details: 'O ID do usuário é necessário para limpar os dados'
      });
    }
    console.log('ID do usuário verificado:', userId);

    // Verificar se o usuário existe
    console.log('Buscando usuário no banco de dados...');
    console.log('Tipo do userId:', typeof userId);
    console.log('Valor do userId:', userId);
    let user;
    try {
      // Garantir que estamos buscando por string
      const userIdStr = String(userId);
      console.log('Convertido userId para string:', userIdStr);
      
      user = await db.collection('users').findOne({ _id: userIdStr });
      console.log('Resultado da busca do usuário:', user ? 'Encontrado' : 'Não encontrado');
      
      if (!user) {
        // Tentar buscar sem conversão como fallback
        console.log('Tentando buscar usuário sem conversão de tipo...');
        user = await db.collection('users').findOne({ _id: userId });
        console.log('Resultado da segunda tentativa:', user ? 'Encontrado' : 'Não encontrado');
      }
    } catch (dbError) {
      console.error('Erro ao buscar usuário:', dbError);
      return res.status(500).json({ 
        message: 'Erro ao buscar usuário',
        details: dbError.message
      });
    }

    if (!user) {
      console.error(`Usuário não encontrado: ${userId}`);
      return res.status(404).json({ 
        message: 'Usuário não encontrado',
        details: 'O usuário especificado não existe no banco de dados'
      });
    }

    console.log(`Iniciando limpeza de dados para usuário: ${userId}`);

    // Remover todas as senhas do usuário
    console.log('Iniciando remoção das senhas...');
    console.log('Tipo do userId para remoção de senhas:', typeof userId);
    let resultSenhas;
    try {
      // Garantir que estamos usando o userId como string
      const userIdStr = String(userId);
      console.log('Tentando remover senhas com userId (string):', userIdStr);
      
      // Primeiro tentar com o userId como string
      resultSenhas = await db.collection('senhas').deleteMany({ userId: userIdStr });
      console.log(`${resultSenhas.deletedCount} senhas foram removidas usando userId como string`);
      
      // Se não encontrou nenhuma senha, tentar com o userId original
      if (resultSenhas.deletedCount === 0) {
        console.log('Nenhuma senha encontrada com userId como string, tentando com o formato original...');
        resultSenhas = await db.collection('senhas').deleteMany({ userId });
        console.log(`${resultSenhas.deletedCount} senhas foram removidas usando userId no formato original`);
      }
    } catch (dbError) {
      console.error('Erro detalhado ao remover senhas:', {
        message: dbError.message,
        stack: dbError.stack,
        code: dbError.code
      });
      return res.status(500).json({ 
        message: 'Erro ao remover senhas',
        details: dbError.message
      });
    }

    // Resetar dados de atendimento do usuário
    console.log('Resetando dados de atendimento...');
    let resultUser;
    try {
      // Garantir que estamos usando o userId como string
      const userIdStr = String(userId);
      console.log('Tentando atualizar usuário com ID (string):', userIdStr);
      
      // Primeiro tentar com o userId como string
      resultUser = await db.collection('users').updateOne(
        { _id: userIdStr },
        { $set: { ultimoAtendimento: null, totalAtendimentos: 0 } }
      );
      console.log(`Dados de atendimento do usuário resetados (string): ${resultUser.modifiedCount > 0 ? 'Sim' : 'Não'}`);
      
      // Se não atualizou nenhum documento, tentar com o userId original
      if (resultUser.modifiedCount === 0) {
        console.log('Nenhum usuário atualizado com ID como string, tentando com o formato original...');
        resultUser = await db.collection('users').updateOne(
          { _id: userId },
          { $set: { ultimoAtendimento: null, totalAtendimentos: 0 } }
        );
        console.log(`Dados de atendimento do usuário resetados (original): ${resultUser.modifiedCount > 0 ? 'Sim' : 'Não'}`);
      }
    } catch (dbError) {
      console.error('Erro detalhado ao resetar dados de atendimento:', {
        message: dbError.message,
        stack: dbError.stack,
        code: dbError.code
      });
      return res.status(500).json({ 
        message: 'Erro ao resetar dados de atendimento',
        details: dbError.message
      });
    }

    res.status(200).json({
      message: 'Dados limpos com sucesso no servidor. Para completar a limpeza, é necessário limpar também os dados do navegador.',
      senhasRemovidas: resultSenhas.deletedCount,
      usuarioAtualizado: resultUser.modifiedCount > 0,
      instrucoes: 'Para garantir a limpeza completa, o sistema tentará limpar os dados do navegador automaticamente. Se ainda houver problemas, recarregue a página ou limpe manualmente o localStorage.'
    });
  } catch (error) {
    console.error('Erro detalhado ao limpar dados:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code || 'N/A'
    });
    
    // Verificar se o erro está relacionado ao MongoDB
    const isMongoError = error.name === 'MongoError' || 
                         error.name === 'MongoServerError' || 
                         error.message.includes('mongo') || 
                         error.message.includes('Mongo');
    
    // Enviar resposta com mais detalhes para ajudar no diagnóstico
    res.status(500).json({ 
      message: 'Erro ao limpar dados', 
      error: error.message,
      errorType: error.name,
      errorCode: error.code || 'N/A',
      isMongoDB: isMongoError,
      // Incluir informações de diagnóstico
      diagnostico: {
        temDB: !!req.app.locals.db,
        temUserId: !!req.userId,
        tipoUserId: typeof req.userId
      }
    });
  }
});

export default router;