# Sistema de Votação Eletrónica

Sistema completo de votação eletrónica para eventos presenciais, otimizado para tablets Android em modo quiosque.

## 📋 Características

- ✅ Sistema de tokens únicos e anónimos
- ✅ Interface em português otimizada para tablets
- ✅ Painel administrativo completo
- ✅ Exportação de resultados em CSV
- ✅ Segurança com hashing SHA-256
- ✅ Rate limiting para proteção
- ✅ Transações atómicas para integridade dos dados
- ✅ Deploy pronto para Vercel

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+ instalado
- Conta Supabase (gratuita)
- Conta Vercel (opcional, para deploy)

### 1. Configurar Supabase

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá para SQL Editor e execute o script `database/schema.sql`
4. Copie as credenciais do projeto (URL e Anon Key)

### 2. Configurar Variáveis de Ambiente

Copie o ficheiro `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Edite `.env.local` com as suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
ADMIN_USERNAME=LionsClubeGaia
ADMIN_PASSWORD=Lionsclubegaia@
```

### 3. Instalar Dependências

```bash
npm install
```

### 4. Executar em Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📱 Fluxo de Utilização

### Para Votantes

1. Aceda à página inicial
2. Insira o código de token fornecido
3. Selecione a opção de voto
4. Confirme o voto
5. Veja a mensagem de sucesso

### Para Administradores

1. Aceda a `/admin/login`
2. Insira a senha de administrador
3. Crie uma nova eleição
4. Adicione opções de voto
5. Gere tokens para distribuição
6. Ative a eleição
7. Monitorize os resultados em tempo real
8. Exporte resultados em CSV quando necessário
9. Feche a eleição quando terminar

## 🏗️ Estrutura do Projeto

```
lions_clube_gaia/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Página inicial (entrada de token)
│   ├── votar/               # Página de votação
│   ├── sucesso/             # Página de sucesso
│   ├── admin/               # Área administrativa
│   │   ├── page.tsx         # Dashboard admin
│   │   └── login/           # Login admin
│   ├── api/                 # API Routes
│   │   ├── validate-token/  # Validação de tokens
│   │   ├── submit-vote/     # Submissão de votos
│   │   ├── election/        # Dados da eleição
│   │   └── admin/           # Endpoints admin
│   ├── layout.tsx           # Layout principal
│   └── globals.css          # Estilos globais
├── lib/                     # Utilitários
│   ├── supabase.ts         # Cliente Supabase
│   └── utils/              # Funções auxiliares
│       ├── token.ts        # Geração de tokens
│       ├── hash.ts         # Hashing SHA-256
│       ├── csv.ts          # Exportação CSV
│       └── rateLimit.ts    # Rate limiting
├── database/               # SQL
│   └── schema.sql         # Schema da base de dados
├── .env.example           # Exemplo de variáveis de ambiente
└── README.md             # Esta documentação
```

## 🗄️ Base de Dados

### Tabelas

- **elections**: Eleições criadas
- **choices**: Opções de voto por eleição
- **tokens**: Tokens hashed (únicos e seguros)
- **votes**: Votos anónimos (SEM ligação a tokens ou votantes)

### Segurança

- Tokens armazenados com hash SHA-256 + salt
- Votos completamente anónimos
- Transações atómicas para prevenir condições de corrida
- Row Level Security (RLS) ativado

## 🔒 Segurança

1. **Anonimato**: Votos não têm qualquer ligação a tokens ou identidade
2. **Tokens seguros**: Hash SHA-256 com salt
3. **Rate limiting**: Proteção contra ataques de força bruta
4. **Transações atómicas**: Previne votos duplicados
5. **Sem IPs armazenados**: Privacidade total
6. **Validação**: Todas as entradas são validadas

## 🚀 Deploy na Vercel

### Opção 1: Deploy Automático

1. Faça push do código para GitHub
2. Aceda a [vercel.com](https://vercel.com)
3. Importe o repositório
4. Configure as variáveis de ambiente
5. Deploy!

### Opção 2: CLI da Vercel

```bash
npm install -g vercel
vercel login
vercel
```

### Variáveis de Ambiente na Vercel

Configure estas variáveis no painel da Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ADMIN_PASSWORD`

## 📊 Uso em Produção

### Preparação para o Evento

1. Configure a base de dados no Supabase
2. Faça deploy na Vercel
3. Aceda ao painel admin
4. Crie a eleição do evento
5. Adicione todas as opções de voto
6. Gere tokens (ex: 60 para 60 votantes)
7. **IMPORTANTE**: Copie e imprima os tokens
8. Ative a eleição

### Durante o Evento

1. Configure tablets em modo quiosque (URL: `https://seu-site.vercel.app`)
2. Distribua tokens impressos aos participantes
3. Os votantes inserem o token e votam
4. Monitorize resultados em tempo real no painel admin

### Após o Evento

1. Feche a eleição no painel admin
2. Exporte resultados em CSV
3. Archive os dados conforme necessário

## 🎨 Personalização

### Cores e Estilos

Edite `app/globals.css` para personalizar:
- Cores dos botões
- Tamanhos de fonte
- Espaçamentos

### Textos

Todos os textos estão em português e podem ser editados diretamente nos componentes.

## 🔧 Desenvolvimento

### Comandos Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # Verificar código
```

### Testar Localmente

1. Execute `npm run dev`
2. Crie uma eleição em `/admin`
3. Gere alguns tokens
4. Teste a votação com um token
5. Verifique os resultados no admin

## 📝 Notas Importantes

- **Tokens são mostrados apenas uma vez** ao serem gerados - guarde-os!
- **Votos são irreversíveis** - não há forma de reverter um voto
- **Eleições fechadas** não aceitam mais votos
- **Rate limiting** está ativo - máximo 10 tentativas por minuto
- **Sessões** usam sessionStorage (limpam ao fechar aba)

## 🆘 Resolução de Problemas

### Erro de Conexão ao Supabase

Verifique se:
- As variáveis de ambiente estão corretas
- O projeto Supabase está ativo
- O schema SQL foi executado

### Tokens não validam

Verifique se:
- A eleição está no status "active"
- O token foi corretamente gerado
- O token não foi já utilizado

### Problemas de Deploy

Verifique se:
- Todas as variáveis de ambiente estão configuradas na Vercel
- O build completa sem erros
- A versão do Node.js é compatível

## 📄 Licença

Este projeto é fornecido como está, para uso do Lions Clube de Gaia.

## 👥 Suporte

Para questões ou problemas, contacte a equipa técnica.

---

**Desenvolvido para Lions Clube de Gaia** 🦁
