# Lions Clube Gaia - Sistema de Votação Eletrónica

App web de voto eletrónico para eventos presenciais, feita em Next.js e pronta para deploy na Vercel.

## Características

- ✅ **Votação anónima e segura**: Tokens com hash e registo separado dos votos
- ✅ **Um voto por código**: Cada participante vota uma vez usando um código único
- ✅ **Interface em Português**: Toda a interface em português
- ✅ **Optimizado para tablets**: Botões grandes para touch, funciona em modo quiosque
- ✅ **Painel de administração completo**:
  - Criar e gerir eleições
  - Gerar códigos de votação
  - Acompanhar contagem em tempo real
  - Exportar resultados em CSV
  - Imprimir códigos

## Tecnologias

- **Next.js 14**: Framework React com App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Estilização responsiva
- **Supabase**: Base de dados PostgreSQL e autenticação
- **Row Level Security**: Segurança a nível de base de dados

## Instalação Local

**📘 Para instruções detalhadas sobre configuração do Supabase, consulte [SUPABASE_SETUP.md](SUPABASE_SETUP.md)**

1. Clone o repositório:
```bash
git clone https://github.com/PedroGGomess/lions_clube_gaia.git
cd lions_clube_gaia
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o Supabase:
   - Siga o guia completo em [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
   - Crie um projeto no Supabase
   - Execute o script `database/schema.sql` no SQL Editor
   - Copie as credenciais (URL e Anon Key)

4. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Edite `.env.local` com as suas credenciais do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
ADMIN_PASSWORD=sua-senha-segura
```

5. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

6. Aceda à aplicação em [http://localhost:3000](http://localhost:3000)

## Deploy na Vercel

**📘 Para instruções detalhadas de deploy, consulte [DEPLOY.md](DEPLOY.md)**

1. Configure o Supabase primeiro (ver [SUPABASE_SETUP.md](SUPABASE_SETUP.md))

2. Faça push do código para o GitHub

3. Importe o projeto na Vercel

4. Configure as variáveis de ambiente na Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon key do Supabase
   - `ADMIN_PASSWORD`: Palavra-passe do admin

5. O deploy será automático!

## Como Usar

### Para Administradores

1. **Aceder ao painel**: Ir para `/admin` e fazer login
   - Utilizador padrão: `admin`
   - Palavra-passe padrão: `admin123`

2. **Criar uma eleição**:
   - Clicar em "Nova Eleição"
   - Preencher título, datas e candidatos
   - Guardar

3. **Gerar códigos de votação**:
   - Clicar em "Códigos" na eleição
   - Definir quantidade de códigos
   - Clicar em "Gerar Códigos"
   - Imprimir ou exportar os códigos

4. **Ativar a eleição**:
   - Clicar em "Ativar" na eleição desejada
   - Apenas eleições ativas permitem votação

5. **Ver resultados**:
   - Clicar em "Resultados" para ver contagem em tempo real
   - Exportar resultados em CSV

### Para Votantes

1. Aceder à página principal
2. Clicar em "Votar"
3. Introduzir o código fornecido
4. Selecionar o candidato
5. Confirmar o voto
6. Receber confirmação

## Segurança

- **Códigos únicos**: Cada código só pode ser usado uma vez
- **Hashing**: Códigos são convertidos em hashes antes de serem armazenados
- **Anonimato**: Não há ligação entre o código e o voto registado
- **Validação**: Múltiplas camadas de validação de dados
- **Separação**: Códigos e votos são armazenados em tabelas separadas

## Estrutura da Base de Dados

Supabase (PostgreSQL) com 4 tabelas principais:

- **elections**: Eleições com título, estado (draft/active/closed), data de criação
- **choices**: Opções de voto para cada eleição (candidatos, propostas, etc.)
- **tokens**: Códigos de votação com hash SHA-256 para segurança
- **votes**: Votos anónimos (sem ligação a tokens ou identidade)

**Ver schema completo**: `database/schema.sql`

## Modo Quiosque (Android)

Para usar em tablets Android em modo quiosque:

1. Instale uma app de quiosque (ex: Kiosk Browser Lockdown)
2. Configure para abrir o URL da aplicação
3. Ative modo quiosque
4. Os botões grandes e interface touch-friendly facilitam o uso

## Scripts Disponíveis

- `npm run dev`: Servidor de desenvolvimento
- `npm run build`: Build para produção
- `npm start`: Servidor de produção
- `npm run lint`: Verificar código

## Licença

MIT

## Suporte

Para questões ou suporte, abra um issue no GitHub.
