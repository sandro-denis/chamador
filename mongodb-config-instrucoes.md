# Instruções para Configuração do MongoDB Compass

## Instalação do MongoDB Compass

1. Acesse o site oficial do MongoDB Compass: https://www.mongodb.com/try/download/compass
2. Baixe a versão mais recente do MongoDB Compass para Windows
3. Execute o instalador e siga as instruções na tela para concluir a instalação

## Configuração do MongoDB Local

### 1. Iniciar o MongoDB Compass

1. Abra o MongoDB Compass após a instalação
2. Na tela inicial, conecte-se ao servidor local usando a URI: `mongodb://localhost:27017`
3. Clique em "Connect" para se conectar ao servidor MongoDB local

### 2. Criar o Banco de Dados

1. Após conectar, clique em "Create Database"
2. Digite `chamadorSenhas` como nome do banco de dados
3. Digite `users` como nome da primeira coleção e clique em "Create Database"

### 3. Configurar as Coleções

#### Coleção `users`

Esta coleção armazena informações dos usuários e suas configurações. Cada documento nesta coleção deve ter um campo `_id` único.

Estrutura de um documento na coleção `users`:

```javascript
{
  _id: "id_unico_do_usuario",
  email: "email@exemplo.com",
  companyName: "Nome da Empresa", // opcional
  password: "senha_criptografada", // Nova adição para autenticação local
  createdAt: "2023-06-15T10:30:00.000Z", // data de criação
  permissoes: {
    gerarSenha: true,
    chamarSenha: true,
    finalizarSenha: true
  },
  config: {
    theme: "light",
    backgroundColor: "#f8f9fa",
    textColor: "#2c3e50",
    senhaColor: "#3498db",
    fontFamily: "Arial",
    fontSize: 120,
    logo: null,
    backgroundType: "color",
    backgroundImage: null,
    footerText: "",
    voiceType: "default",
    volume: 80,
    soundEffect: "bell",
    repeatInterval: 1
  }
}
```

#### Coleção `senhas`

Para criar a coleção `senhas`:

1. No banco de dados `chamadorSenhas`, clique em "Create Collection"
2. Digite `senhas` como nome da coleção e clique em "Create"

Esta coleção armazena todas as senhas geradas no sistema. Cada senha é um documento com um ID gerado automaticamente.

Estrutura de um documento na coleção `senhas`:

```javascript
{
  _id: "id_gerado_automaticamente",
  numero: "P001", // formato: [tipo][número sequencial]
  tipo: "P", // P (Prioritária), N (Normal), R (Rápido)
  status: "aguardando", // aguardando, chamada, atendida
  horarioGeracao: "2023-06-15T10:30:00.000Z",
  horarioChamada: null, // preenchido quando a senha é chamada
  horarioFinalizacao: null, // preenchido quando o atendimento é finalizado
  guiche: null, // número do guichê que chamou a senha
  userId: "id_do_usuario" // ID do usuário que gerou a senha
}
```

## Observações Importantes

- O MongoDB Compass é uma interface gráfica para gerenciar bancos de dados MongoDB
- Diferente do Firebase, o MongoDB local não possui um sistema de autenticação integrado, por isso adicionamos o campo `password` na coleção `users`
- O sistema agora utiliza autenticação local em vez do Firebase Authentication
- Não há regras de segurança automáticas como no Firebase, a segurança é implementada no código da aplicação
- Certifique-se de que o MongoDB esteja em execução sempre que for utilizar o sistema
- Para ambientes de produção, considere configurar autenticação no MongoDB e usar HTTPS