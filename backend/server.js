import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import limparDadosRouter from './routes/limparDados.js';

// Carregar variáveis de ambiente
dotenv.config();

// Log de todas as variáveis de ambiente (exceto senhas)
console.log('Todas as variáveis de ambiente disponíveis:', {
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET ? 'Definido' : 'Não definido',
  MONGODB_URI: process.env.MONGODB_URI ? 'Definido' : 'Não definido',
  PORT: process.env.PORT,
});

// Verificar variáveis de ambiente essenciais
if (!process.env.MONGODB_URI) {
  console.error('ERRO: MONGODB_URI não está definido nas variáveis de ambiente');
  console.log('Tentando usar URI de fallback para desenvolvimento...');
  process.env.MONGODB_URI = 'mongodb+srv://sandrod:Sandro2010.@cluster0.qzdji8m.mongodb.net/chamadorSenhas?retryWrites=true&w=majority&appName=Cluster0';
}

if (!process.env.JWT_SECRET) {
  console.log('JWT_SECRET não definido, usando valor padrão para desenvolvimento');
  process.env.JWT_SECRET = 'sua_chave_secreta_padrao';
}

const app = express();
const port = process.env.PORT || 3005;

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://chamador.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Função para encontrar uma porta disponível
const findAvailablePort = async (startPort) => {
  const net = await import('net');
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
  });
};
app.use(express.json());

// MongoDB connection
const uri = process.env.MONGODB_URI;
const dbName = 'chamadorSenhas';

let client = null;
let db = null;

async function connectToMongoDB() {
  try {
    console.log('Tentando conectar ao MongoDB...');
    console.log('URI:', uri.replace(/:[^:]*@/, ':****@')); // Oculta a senha no log
    console.log('Database:', dbName);
    
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    await client.connect();
    console.log('Conectado ao MongoDB com sucesso!');
    
    db = client.db(dbName);
    console.log('Database selecionado:', dbName);
    
    // Verificar se as coleções existem
    const collections = await db.listCollections().toArray();
    console.log('Coleções disponíveis:', collections.map(c => c.name));
    
    // Criar coleções se não existirem
    const requiredCollections = ['users', 'senhas'];
    for (const collectionName of requiredCollections) {
      if (!collections.find(c => c.name === collectionName)) {
        await db.createCollection(collectionName);
        console.log(`Coleção ${collectionName} criada com sucesso!`);
      }
    }
    
    // Criar índices para a coleção senhas
    try {
      await db.collection('senhas').createIndex({ numero: 1 });
      await db.collection('senhas').createIndex({ status: 1 });
      // Remover qualquer índice TTL existente para garantir persistência permanente
      await db.collection('senhas').dropIndex('createdAt_1', { ignoreUndefined: true }).catch(() => {});
      console.log('Índices criados para senhas com sucesso');
    } catch (indexError) {
      console.warn('Aviso ao criar índices:', indexError);
    }

    // Verificar se há usuários cadastrados
    const users = await db.collection('users').find().toArray();
    console.log('Usuários cadastrados:', users.length);
    
  } catch (error) {
    console.error('Erro detalhado ao conectar ao MongoDB:', error);
    throw error;
  }
}

// Middleware para verificar conexão com o banco
app.use(async (req, res, next) => {
  try {
    if (!db) {
      console.log('Banco de dados não inicializado, tentando conectar...');
      await connectToMongoDB();
    }
    // Disponibilizar o objeto db para as rotas
    app.locals.db = db;
    next();
  } catch (error) {
    console.error('Erro detalhado de conexão com o banco:', error);
    res.status(500).json({ 
      message: 'Erro de conexão com o banco de dados',
      error: error.message 
    });
  }
});

// Middleware para verificar campos obrigatórios
const validateFields = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      message: 'Email e senha são obrigatórios' 
    });
  }
  
  next();
};

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

// Rotas de autenticação
app.post('/api/register', validateFields, async (req, res) => {
  try {
    console.log('Recebida requisição de registro:', { email: req.body.email, companyName: req.body.companyName });
    const { email, password, companyName } = req.body;

    if (!companyName) {
      console.log('Erro: Nome da empresa não fornecido');
      return res.status(400).json({ 
        message: 'Nome da empresa é obrigatório' 
      });
    }

    console.log('Verificando se email já existe:', email);
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      console.log('Erro: Email já cadastrado:', email);
      return res.status(400).json({ 
        message: 'Email já cadastrado' 
      });
    }

    console.log('Criando novo usuário...');
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      _id: uuidv4(),
      email,
      companyName,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      permissoes: {
        gerarSenha: true,
        chamarSenha: true,
        finalizarSenha: true
      },
      config: {
        theme: 'light',
        backgroundColor: '#f8f9fa',
        textColor: '#2c3e50',
        senhaColor: '#3498db',
        fontFamily: 'Arial',
        fontSize: 120,
        logo: null,
        backgroundType: 'color',
        backgroundImage: null,
        footerText: '',
        voiceType: 'default',
        volume: 80,
        soundEffect: 'bell',
        repeatInterval: 1
      }
    };

    console.log('Inserindo usuário no banco...');
    await db.collection('users').insertOne(user);
    console.log('Usuário inserido com sucesso');
    
    // Gerar token JWT
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    console.log('Token JWT gerado');

    // Remover senha do objeto de resposta
    const { password: _, ...userWithoutPassword } = user;

    console.log('Enviando resposta de sucesso');
    res.status(201).json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro detalhado no registro:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
});

app.post('/api/login', validateFields, async (req, res) => {
  try {
    console.log('Recebida requisição de login com body:', req.body);
    const { email, password } = req.body;
    console.log('Tentativa de login:', { email });
    
    if (!email || !password) {
      console.log('Email ou senha não fornecidos');
      return res.status(400).json({ 
        message: 'Email e senha são obrigatórios' 
      });
    }
    
    // Verificar se o banco de dados está conectado
    if (!db) {
      console.error('Banco de dados não está conectado');
      return res.status(500).json({ 
        message: 'Erro de conexão com o banco de dados' 
      });
    }
    
    const users = db.collection('users');
    console.log('Buscando usuário com email:', email);
    
    try {
      const user = await users.findOne({ email });
      console.log('Usuário encontrado:', user ? 'Sim' : 'Não');
      
      if (!user) {
        console.log('Usuário não encontrado');
        return res.status(401).json({ 
          message: 'Email ou senha incorretos' 
        });
      }

      console.log('Comparando senhas...');
      try {
        const validPassword = await bcrypt.compare(password, user.password);
        console.log('Senha válida:', validPassword);
        
        if (!validPassword) {
          console.log('Senha inválida');
          return res.status(401).json({ 
            message: 'Email ou senha incorretos' 
          });
        }

        // Verificar se JWT_SECRET está definido
        if (!process.env.JWT_SECRET) {
          console.error('JWT_SECRET não está definido no arquivo .env');
          return res.status(500).json({ 
            message: 'Erro de configuração do servidor: JWT_SECRET não está definido',
            details: 'Verifique se o arquivo .env contém a variável JWT_SECRET'
          });
        }

        const token = jwt.sign(
          { userId: user._id }, 
          process.env.JWT_SECRET, 
          { expiresIn: '24h' }
        );
        console.log('Token gerado com sucesso');

        res.json({
          token,
          user: {
            id: user._id,
            email: user.email,
            companyName: user.companyName
          }
        });
      } catch (bcryptError) {
        console.error('Erro ao comparar senhas:', bcryptError);
        return res.status(500).json({ 
          message: 'Erro ao verificar credenciais',
          error: bcryptError.message 
        });
      }
    } catch (dbError) {
      console.error('Erro ao buscar usuário no banco:', dbError);
      return res.status(500).json({ 
        message: 'Erro ao buscar usuário',
        error: dbError.message 
      });
    }
  } catch (error) {
    console.error('Erro detalhado no login:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
});

// Rotas de senhas
app.post('/api/senhas', verificarToken, async (req, res) => {
  try {
    console.log('Recebida requisição de nova senha:', req.body);
    
    // Verificar se o usuário tem permissão para gerar senha
    const users = db.collection('users');
    const user = await users.findOne({ _id: req.userId });
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Garantir que todos os usuários possam gerar senhas
    if (!user.permissoes) {
      user.permissoes = { gerarSenha: true, chamarSenha: true, finalizarSenha: true };
      await users.updateOne({ _id: req.userId }, { $set: { permissoes: user.permissoes } });
    } else if (user.permissoes.gerarSenha === undefined || user.permissoes.gerarSenha === false) {
      user.permissoes.gerarSenha = true;
      await users.updateOne({ _id: req.userId }, { $set: { 'permissoes.gerarSenha': true } });
    }
    
    const tipo = req.body.tipo;
    if (!tipo) {
      return res.status(400).json({ message: 'Tipo da senha é obrigatório' });
    }

    // Obter o último contador para este tipo de senha e usuário
    const senhas = db.collection('senhas');
    const ultimaSenha = await senhas.find({ 
      userId: req.userId,
      tipo: tipo
    }).sort({ numero: -1 }).limit(1).toArray();
    
    let proximoNumero = 1;
    if (ultimaSenha.length > 0 && ultimaSenha[0].numero) {
      // Extrair o número da senha (ignorando o prefixo do tipo)
      const numeroAtual = parseInt(ultimaSenha[0].numero.replace(/[^0-9]/g, ''));
      if (!isNaN(numeroAtual)) {
        proximoNumero = numeroAtual + 1;
      }
    }
    
    // Formatar o número com prefixo do tipo e zeros à esquerda
    const numeroFormatado = `${tipo}${String(proximoNumero).padStart(3, '0')}`;
    console.log(`Gerando nova senha: ${numeroFormatado} para tipo: ${tipo}`);
    
    const senha = {
      _id: uuidv4(),
      userId: req.userId,
      tipo: tipo,
      numero: numeroFormatado,
      createdAt: new Date().toISOString(),
      status: 'aguardando',
      horarioGeracao: new Date().toISOString(),
      horarioChamada: null,
      horarioFinalizacao: null,
      guiche: null
    };

    await senhas.insertOne(senha);
    console.log('Senha criada com sucesso:', senha._id, senha.numero);
    
    res.status(201).json(senha);
  } catch (error) {
    console.error('Erro ao criar senha:', error);
    res.status(500).json({ 
      message: 'Erro ao criar senha',
      error: error.message 
    });
  }
});

app.get('/api/senhas', verificarToken, async (req, res) => {
  try {
    console.log('Buscando senhas para usuário:', req.userId);
    const senhas = db.collection('senhas');
    const todasSenhas = await senhas.find({ userId: req.userId }).toArray();
    console.log(`Encontradas ${todasSenhas.length} senhas`);
    res.json(todasSenhas);
  } catch (error) {
    console.error('Erro ao buscar senhas:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar senhas',
      error: error.message 
    });
  }
});

app.get('/api/senhas/aguardando', verificarToken, async (req, res) => {
  try {
    console.log('Buscando senhas aguardando para usuário:', req.userId);
    const senhas = db.collection('senhas');
    
    // Verificar se há parâmetros de status na requisição
    let statusFilter = { $in: ['aguardando'] };
    
    if (req.query.status) {
      // Se status for uma string com valores separados por vírgula, fazer o split
      if (typeof req.query.status === 'string' && req.query.status.includes(',')) {
        statusFilter = { $in: req.query.status.split(',') };
      } 
      // Se for um array, usar diretamente
      else if (Array.isArray(req.query.status)) {
        statusFilter = { $in: req.query.status };
      }
      // Se for uma string única, usar como um único valor
      else {
        statusFilter = req.query.status;
      }
    }
    
    console.log('Filtro de status:', statusFilter);
    
    const senhasEncontradas = await senhas.find({ 
      userId: req.userId,
      status: statusFilter 
    }).toArray();
    
    console.log(`Encontradas ${senhasEncontradas.length} senhas com os status selecionados`);
    res.json(senhasEncontradas);
  } catch (error) {
    console.error('Erro ao buscar senhas aguardando:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar senhas aguardando',
      error: error.message 
    });
  }
});

app.put('/api/senhas/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (!id) {
      return res.status(400).json({ message: 'ID da senha é obrigatório' });
    }

    console.log('Atualizando senha:', id, updates);
    const senhas = db.collection('senhas');
    
    const result = await senhas.updateOne(
      { _id: id, userId: req.userId },
      { $set: updates }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Senha não encontrada' });
    }
    
    const senhaAtualizada = await senhas.findOne({ _id: id });
    console.log('Senha atualizada com sucesso:', id);
    res.json(senhaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({ 
      message: 'Erro ao atualizar senha',
      error: error.message 
    });
  }
});

// Rota para estatísticas
app.get('/api/estatisticas', verificarToken, async (req, res) => {
  try {
    console.log('Buscando estatísticas para usuário:', req.userId);
    const senhas = db.collection('senhas');
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const [
      totalSenhas,
      senhasHoje,
      senhasAguardando,
      senhasChamadas,
      senhasFinalizadas
    ] = await Promise.all([
      senhas.countDocuments({ userId: req.userId }),
      senhas.countDocuments({ 
        userId: req.userId,
        createdAt: { $gte: hoje.toISOString() }
      }),
      senhas.countDocuments({ 
        userId: req.userId,
        status: 'aguardando'
      }),
      senhas.countDocuments({ 
        userId: req.userId,
        status: 'chamada'
      }),
      senhas.countDocuments({ 
        userId: req.userId,
        status: 'finalizada'
      })
    ]);

    const estatisticas = {
      totalSenhas,
      senhasHoje,
      senhasAguardando,
      senhasChamadas,
      senhasFinalizadas,
      tempoMedioEspera: 0, // TODO: Implementar cálculo
      senhasPorTipo: {} // TODO: Implementar agregação
    };

    console.log('Estatísticas encontradas:', estatisticas);
    res.json(estatisticas);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar estatísticas',
      error: error.message 
    });
  }
});

// Registrar rota de limpeza de dados
app.use('/api', limparDadosRouter);

// Rota para verificar conectividade
app.get('/api/check-connection', async (req, res) => {
  try {
    const collections = await db.listCollections().toArray();
    const users = await db.collection('users').find().toArray();
    
    res.json({
      status: 'ok',
      message: 'Conexão com MongoDB estabelecida',
      collections: collections.map(c => c.name),
      usersCount: users.length
    });
  } catch (error) {
    console.error('Erro ao verificar conexão:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao verificar conexão com MongoDB',
      error: error.message
    });
  }
});

// Rota para obter informações do usuário atual
app.get('/api/me', verificarToken, async (req, res) => {
  try {
    console.log('Buscando informações do usuário:', req.userId);
    const users = db.collection('users');
    const user = await users.findOne({ _id: req.userId });
    
    if (!user) {
      console.log('Usuário não encontrado');
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Remover a senha do objeto de resposta
    const { password, ...userWithoutPassword } = user;
    
    console.log('Informações do usuário encontradas');
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Erro ao buscar informações do usuário:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar informações do usuário',
      error: error.message 
    });
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ 
    message: 'Erro interno do servidor' 
  });
});

// Conectar ao MongoDB antes de iniciar o servidor
connectToMongoDB().then(() => {
  // Iniciar o servidor com porta dinâmica
  findAvailablePort(port).then(availablePort => {
    app.listen(availablePort, () => {
      console.log(`Servidor rodando na porta ${availablePort}`);
      // Atualizar a configuração do proxy do Vite se necessário
      if (availablePort !== port) {
        console.log(`Nota: O servidor está usando a porta ${availablePort} em vez da porta ${port} padrão.`);
        console.log('Por favor, atualize a configuração do proxy no vite.config.js se necessário.');
      }
    });
  }).catch(err => {
    console.error('Erro ao iniciar o servidor:', err);
    process.exit(1);
  });
}).catch(error => {
  console.error('Erro ao iniciar o servidor:', error);
  process.exit(1);
});