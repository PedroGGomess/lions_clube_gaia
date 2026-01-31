# Guia Completo: Configuração do Supabase Dashboard

Este documento explica em detalhe como configurar o Supabase Dashboard para o sistema de votação do Lions Clube de Gaia.

## Índice

1. [Criar Conta no Supabase](#1-criar-conta-no-supabase)
2. [Criar um Novo Projeto](#2-criar-um-novo-projeto)
3. [Executar o Schema SQL](#3-executar-o-schema-sql)
4. [Obter as Credenciais da API](#4-obter-as-credenciais-da-api)
5. [Verificar Row Level Security (RLS)](#5-verificar-row-level-security-rls)
6. [Verificar as Tabelas Criadas](#6-verificar-as-tabelas-criadas)
7. [Resolução de Problemas](#7-resolução-de-problemas)

---

## 1. Criar Conta no Supabase

### Passo 1.1: Aceder ao Website
1. Abra o navegador e vá para [https://supabase.com](https://supabase.com)
2. Clique no botão **"Start your project"** ou **"Sign In"** no canto superior direito

### Passo 1.2: Criar Conta
Tem várias opções para criar conta:
- **GitHub**: Clique em "Continue with GitHub" (recomendado)
- **Email**: Preencha email e crie uma password

### Passo 1.3: Verificar Email
1. Se criou conta com email, verifique a sua caixa de entrada
2. Clique no link de verificação enviado pelo Supabase
3. Faça login no dashboard

---

## 2. Criar um Novo Projeto

### Passo 2.1: Aceder ao Dashboard
1. Após fazer login, será redirecionado para o dashboard principal
2. Verá uma lista dos seus projetos (vazia se for a primeira vez)

### Passo 2.2: Criar Novo Projeto
1. Clique no botão **"New Project"** (verde, no canto superior direito)
2. Selecione a organização (ou crie uma nova se for o primeiro projeto)

### Passo 2.3: Configurar o Projeto
Preencha os seguintes campos:

| Campo | O que preencher | Exemplo |
|-------|----------------|---------|
| **Name** | Nome do projeto | `lions-clube-gaia-voting` |
| **Database Password** | Password segura para a base de dados | `SuaPasswordSegura123!` |
| **Region** | Região mais próxima | `Europe West (London)` ou `Europe Central (Frankfurt)` |
| **Pricing Plan** | Plano de preços | `Free` (suficiente para começar) |

**⚠️ IMPORTANTE**: Guarde a **Database Password** num local seguro! Vai precisar dela se quiser aceder diretamente à base de dados.

### Passo 2.4: Criar Projeto
1. Clique no botão **"Create new project"**
2. Aguarde 1-2 minutos enquanto o Supabase cria a sua base de dados
3. Verá uma barra de progresso durante a criação

---

## 3. Executar o Schema SQL

### Passo 3.1: Abrir o SQL Editor
1. No menu lateral esquerdo, procure a secção **"SQL Editor"**
2. Clique em **"SQL Editor"**
3. Verá um editor de código vazio

### Passo 3.2: Criar Nova Query
1. Clique no botão **"New query"** (canto superior esquerdo)
2. Será criada uma nova aba vazia

### Passo 3.3: Copiar o Schema
1. Abra o ficheiro `database/schema.sql` do projeto
2. Copie **TODO** o conteúdo do ficheiro (Ctrl+A, Ctrl+C)

**Conteúdo que deve copiar:**
```sql
-- Migration: Electronic Voting System
-- Description: Creates tables for elections, choices, tokens, and votes

-- Table: elections
CREATE TABLE IF NOT EXISTS elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: choices (voting options for each election)
CREATE TABLE IF NOT EXISTS choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(election_id, order_index)
);

-- Table: tokens (pre-generated hashed tokens)
CREATE TABLE IF NOT EXISTS tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT NOT NULL UNIQUE,
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: votes (anonymous votes - NO link to tokens or voters)
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  choice_id UUID NOT NULL REFERENCES choices(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tokens_election ON tokens(election_id);
CREATE INDEX IF NOT EXISTS idx_tokens_hash ON tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_votes_election ON votes(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_choice ON votes(choice_id);
CREATE INDEX IF NOT EXISTS idx_choices_election ON choices(election_id);

-- Enable Row Level Security (RLS)
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow all operations for now (authentication will be handled in app layer)
-- In production, you would want more restrictive policies

CREATE POLICY "Enable all for elections" ON elections FOR ALL USING (true);
CREATE POLICY "Enable all for choices" ON choices FOR ALL USING (true);
CREATE POLICY "Enable all for tokens" ON tokens FOR ALL USING (true);
CREATE POLICY "Enable all for votes" ON votes FOR ALL USING (true);
```

### Passo 3.4: Colar no Editor
1. Cole o conteúdo no SQL Editor (Ctrl+V)
2. Reveja o código para garantir que foi colado corretamente

### Passo 3.5: Executar o Script
1. Clique no botão **"Run"** (ou pressione Ctrl+Enter)
2. Aguarde alguns segundos
3. Deverá ver uma mensagem de sucesso: **"Success. No rows returned"**

**✅ Se vir esta mensagem, as tabelas foram criadas com sucesso!**

---

## 4. Obter as Credenciais da API

Agora precisa de copiar as credenciais para configurar a aplicação.

### Passo 4.1: Aceder às Configurações
1. No menu lateral esquerdo, clique no ícone de **engrenagem** (⚙️) ou procure **"Settings"**
2. Clique em **"API"** no submenu

### Passo 4.2: Localizar as Credenciais
Na página de API, verá várias secções:

#### Project URL
- **Localização**: Secção "Config" no topo
- **Campo**: `URL`
- **Exemplo**: `https://abcdefghijk.supabase.co`
- **O que fazer**: Copie este URL completo

#### API Keys
- **Localização**: Secção "Project API keys"
- **Campo**: `anon` `public`
- **Exemplo**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **O que fazer**: Copie a key que está ao lado de `anon` `public`

**⚠️ NOTA**: NÃO copie a `service_role` key! Essa é secreta e só deve ser usada no backend.

### Passo 4.3: Guardar as Credenciais
Crie um ficheiro `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui

# Admin
ADMIN_PASSWORD=sua-senha-admin-segura

# Optional: Rate limiting (requests per minute)
RATE_LIMIT_MAX=10
```

**Substituir**:
- `https://seu-projeto.supabase.co` → pelo seu Project URL
- `sua-anon-key-aqui` → pela sua anon public key
- `sua-senha-admin-segura` → por uma password forte para acesso admin

---

## 5. Verificar Row Level Security (RLS)

O Row Level Security (RLS) protege os dados na base de dados.

### Passo 5.1: Aceder ao Table Editor
1. No menu lateral, clique em **"Table Editor"**
2. Verá a lista de tabelas criadas

### Passo 5.2: Verificar Políticas de Segurança
Para cada tabela (`elections`, `choices`, `tokens`, `votes`):

1. Clique no nome da tabela
2. Clique no ícone de **escudo** 🛡️ ou vá ao separador **"RLS"**
3. Deverá ver:
   - **RLS enabled**: ✅ (verde)
   - Uma política chamada "Enable all for [nome da tabela]"

**✅ Se todas as tabelas tiverem RLS ativado, está correto!**

---

## 6. Verificar as Tabelas Criadas

### Passo 6.1: Ver Estrutura das Tabelas
1. No **"Table Editor"**, clique em cada tabela
2. Verifique que foram criadas as seguintes tabelas:

#### 1. `elections` (Eleições)
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | ID único da eleição |
| `title` | TEXT | Título da eleição |
| `status` | TEXT | Estado: 'draft', 'active', ou 'closed' |
| `created_at` | TIMESTAMP | Data de criação |

#### 2. `choices` (Opções de Voto)
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | ID único da opção |
| `election_id` | UUID | Referência à eleição |
| `label` | TEXT | Nome da opção (ex: candidato) |
| `order_index` | INTEGER | Ordem de exibição |
| `created_at` | TIMESTAMP | Data de criação |

#### 3. `tokens` (Códigos de Votação)
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | ID único do token |
| `token_hash` | TEXT | Hash do código (segurança) |
| `election_id` | UUID | Referência à eleição |
| `used_at` | TIMESTAMP | Data de uso (null se não usado) |
| `created_at` | TIMESTAMP | Data de criação |

#### 4. `votes` (Votos Anónimos)
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | ID único do voto |
| `election_id` | UUID | Referência à eleição |
| `choice_id` | UUID | Referência à opção votada |
| `created_at` | TIMESTAMP | Data do voto |

### Passo 6.2: Testar Inserção de Dados (Opcional)
Para testar se está tudo a funcionar:

1. Vá ao **SQL Editor**
2. Execute este comando de teste:
```sql
INSERT INTO elections (title, status) 
VALUES ('Teste', 'draft');

SELECT * FROM elections;
```
3. Deverá ver a eleição de teste criada
4. Para limpar: 
```sql
DELETE FROM elections WHERE title = 'Teste';
```

---

## 7. Resolução de Problemas

### Problema: "permission denied for table elections"
**Causa**: RLS não foi configurado corretamente  
**Solução**:
1. Vá ao SQL Editor
2. Execute novamente as linhas de RLS do schema.sql:
```sql
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for elections" ON elections FOR ALL USING (true);
-- Repita para as outras tabelas
```

### Problema: "relation elections does not exist"
**Causa**: O schema não foi executado  
**Solução**:
1. Vá ao SQL Editor
2. Execute todo o conteúdo do ficheiro `database/schema.sql`
3. Verifique se aparece "Success"

### Problema: Não consigo encontrar as credenciais
**Causa**: Procura no local errado  
**Solução**:
1. Menu lateral → ⚙️ **Settings**
2. Submenu → **API**
3. As credenciais estão nas secções "Config" e "Project API keys"

### Problema: A aplicação não conecta ao Supabase
**Causa**: Credenciais erradas no `.env.local`  
**Solução**:
1. Verifique se copiou o URL completo (com `https://`)
2. Verifique se copiou a key `anon` `public` (não a `service_role`)
3. Certifique-se que o ficheiro se chama `.env.local` (não `.env`)
4. Reinicie o servidor de desenvolvimento (`npm run dev`)

### Problema: Esqueci a Database Password
**Causa**: Password não foi guardada  
**Solução**:
1. Vá a Settings → Database
2. Clique em "Reset database password"
3. Guarde a nova password num gestor de passwords

---

## Próximos Passos

Depois de completar esta configuração:

1. ✅ Verifique se o ficheiro `.env.local` tem as credenciais corretas
2. ✅ Execute a aplicação localmente: `npm run dev`
3. ✅ Aceda a `/admin/login` e configure a primeira eleição
4. ✅ Gere alguns tokens de teste
5. ✅ Teste o fluxo completo de votação
6. ✅ Quando estiver satisfeito, faça deploy na Vercel (ver [DEPLOY.md](DEPLOY.md))

---

## Recursos Adicionais

- **Documentação Oficial do Supabase**: [https://supabase.com/docs](https://supabase.com/docs)
- **SQL Editor Guide**: [https://supabase.com/docs/guides/database/overview](https://supabase.com/docs/guides/database/overview)
- **Row Level Security**: [https://supabase.com/docs/guides/auth/row-level-security](https://supabase.com/docs/guides/auth/row-level-security)

---

## Contacto e Suporte

Se encontrar problemas não listados aqui:
1. Verifique os logs no console do navegador (F12)
2. Consulte a documentação principal ([README.md](README.md))
3. Abra um issue no repositório GitHub

---

**Configuração completa! 🎉**

Agora já sabe exatamente o que fazer no dashboard do Supabase para configurar o sistema de votação.
