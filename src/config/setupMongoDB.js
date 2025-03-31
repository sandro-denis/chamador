import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'chamadorSenhas';

async function setupDatabase() {
  let client;
  try {
    console.log('Tentando conectar ao MongoDB...');
    client = new MongoClient(uri);
    await client.connect();
    console.log('Conectado ao MongoDB com sucesso!');

    const db = client.db(dbName);
    console.log(`Banco de dados '${dbName}' selecionado`);

    // Criar coleção users se não existir
    try {
      await db.createCollection('users');
      console.log('Coleção users criada com sucesso');
    } catch (error) {
      if (error.code === 48) { // Código de erro para coleção já existente
        console.log('Coleção users já existe');
      } else {
        throw error;
      }
    }

    // Criar coleção senhas se não existir
    try {
      await db.createCollection('senhas');
      console.log('Coleção senhas criada com sucesso');
    } catch (error) {
      if (error.code === 48) {
        console.log('Coleção senhas já existe');
      } else {
        throw error;
      }
    }

    // Criar índices para a coleção users
    try {
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      console.log('Índices criados para users com sucesso');
    } catch (error) {
      console.log('Índices para users já existem ou erro ao criar:', error.message);
    }

    // Criar índices para a coleção senhas
    try {
      await db.collection('senhas').createIndex({ numero: 1 });
      await db.collection('senhas').createIndex({ status: 1 });
      console.log('Índices criados para senhas com sucesso');
    } catch (error) {
      console.log('Índices para senhas já existem ou erro ao criar:', error.message);
    }

    // Verificar se as coleções foram criadas
    const collections = await db.listCollections().toArray();
    console.log('Coleções existentes:', collections.map(c => c.name));

    console.log('Configuração do banco de dados concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao configurar o banco de dados:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('Conexão com MongoDB fechada');
    }
  }
}

export default setupDatabase; 