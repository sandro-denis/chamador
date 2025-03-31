import express from 'express';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware para verificar token JWT
const verificarToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Rota para limpar dados da empresa
router.post('/limpar-dados', verificarToken, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.userId;

    if (!db) {
      return res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
    }

    // Verificar se o usuário existe
    const user = await db.collection('users').findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    console.log(`Iniciando limpeza de dados para usuário: ${userId}`);

    // Remover todas as senhas do usuário
    const resultSenhas = await db.collection('senhas').deleteMany({ userId });
    console.log(`${resultSenhas.deletedCount} senhas foram removidas`);

    // Resetar dados de atendimento do usuário
    const resultUser = await db.collection('users').updateOne(
      { _id: userId },
      { $set: { ultimoAtendimento: null, totalAtendimentos: 0 } }
    );

    console.log(`Dados de atendimento do usuário resetados: ${resultUser.modifiedCount > 0 ? 'Sim' : 'Não'}`);

    res.status(200).json({
      message: 'Dados limpos com sucesso no servidor. Para completar a limpeza, é necessário limpar também os dados do navegador.',
      senhasRemovidas: resultSenhas.deletedCount,
      usuarioAtualizado: resultUser.modifiedCount > 0,
      instrucoes: 'Para garantir a limpeza completa, o sistema tentará limpar os dados do navegador automaticamente. Se ainda houver problemas, recarregue a página ou limpe manualmente o localStorage.'
    });
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    res.status(500).json({ 
      message: 'Erro ao limpar dados', 
      error: error.message 
    });
  }
});

export default router;