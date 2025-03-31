import { MongoClient } from 'mongodb';

async function limparDados() {
  try {
    console.log('Conectando ao MongoDB...');
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    console.log('Conectado com sucesso!');
    
    const db = client.db('chamadorSenhas');
    
    // Limpar coleção de senhas
    console.log('Removendo todas as senhas...');
    const resultSenhas = await db.collection('senhas').deleteMany({});
    console.log(`${resultSenhas.deletedCount} senhas foram removidas com sucesso!`);
    
    // Limpar dados de atendimento (mantendo usuários)
    // Se quiser preservar os usuários mas limpar seus dados de atendimento
    console.log('Atualizando dados de atendimento dos usuários...');
    const resultUsers = await db.collection('users').updateMany(
      {}, 
      { $set: { ultimoAtendimento: null, totalAtendimentos: 0 } }
    );
    console.log(`${resultUsers.modifiedCount} usuários foram atualizados com sucesso!`);
    
    // Instruções para limpar localStorage
    console.log('\n===== INSTRUÇÕES PARA LIMPAR DADOS DO NAVEGADOR =====');
    console.log('Para limpar completamente os dados do navegador, siga os passos:');
    console.log('MÉTODO 1 - Manual:');
    console.log('1. Abra o site no navegador');
    console.log('2. Pressione F12 para abrir as ferramentas de desenvolvedor');
    console.log('3. Vá para a aba "Application" ou "Aplicativo"');
    console.log('4. No menu lateral, expanda "Local Storage"');
    console.log('5. Clique com o botão direito no seu domínio e selecione "Clear" ou "Limpar"');
    console.log('6. Recarregue a página (F5)');
    console.log('\nMÉTODO 2 - Usando a função de limpeza no sistema:');
    console.log('1. Faça login no sistema');
    console.log('2. Acesse a página de Configurações');
    console.log('3. Clique no botão "Limpar Todos os Dados"');
    console.log('\nMÉTODO 3 - Usando código JavaScript no console:');
    console.log('1. Abra o site no navegador');
    console.log('2. Pressione F12 para abrir as ferramentas de desenvolvedor');
    console.log('3. Vá para a aba "Console"');
    console.log('4. Cole e execute o seguinte código:');
    console.log(`
    // Código para limpar todos os dados relacionados a senhas
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('senha') || key.includes('Senha') || 
                 key.includes('estatistica') || key.includes('Estatistica') || 
                 key.includes('atendimento') || key.includes('Atendimento'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('senhas_sistema');
    localStorage.removeItem('senhas_timestamp');
    localStorage.removeItem('contadores');
    localStorage.removeItem('senhasAguardando');
    localStorage.removeItem('ultimasSenhasChamadas');
    console.log('Dados limpos com sucesso!');
    // Recarregar a página para aplicar as mudanças
    location.reload();
    `);
    console.log('=================================================\n');
    
    await client.close();
    console.log('Conexão fechada.');
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
  }
}

limparDados();