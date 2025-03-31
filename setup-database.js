import setupDatabase from './src/config/setupMongoDB.js';

console.log('Iniciando configuração do banco de dados...');
setupDatabase()
  .then(() => {
    console.log('Configuração concluída com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro durante a configuração:', error);
    process.exit(1);
  }); 