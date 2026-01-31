# Guia de Deployment no Vercel

Este guia explica como fazer o deployment da aplicação de votação no Vercel.

## Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. Conta no [Supabase](https://supabase.com)
3. Repositório GitHub com o código

## Parte 1: Configurar Supabase

### 1.1. Criar Projeto no Supabase

1. Aceda a [supabase.com](https://supabase.com)
2. Crie uma nova organização (se ainda não tiver)
3. Crie um novo projeto
4. Escolha uma região (recomendado: próxima dos seus utilizadores)
5. Defina uma palavra-passe para a base de dados (guarde-a!)

### 1.2. Executar Schema SQL

**⚠️ IMPORTANTE**: Este passo é OBRIGATÓRIO e cria todas as tabelas necessárias na base de dados.

1. No dashboard do Supabase, vá para **SQL Editor**
2. Clique em **New Query**
3. **Cole o conteúdo COMPLETO** do ficheiro `database/schema.sql`
   - Certifique-se de copiar TODO o ficheiro (do início ao fim)
   - Não execute apenas parte do script
4. Clique em **Run** para executar (ou pressione Ctrl/Cmd + Enter)
5. **Aguarde** a mensagem de sucesso
6. **Verifique** que todas as tabelas foram criadas:
   - Vá para **Table Editor** 
   - Deve ver 5 tabelas: `elections`, `choices`, `tokens`, `votes`, `admins`

Isto criará todas as tabelas necessárias:
- `elections` - Eleições
- `choices` - Opções de voto
- `tokens` - Códigos de votação
- `votes` - Votos anónimos
- `admins` - Utilizadores administradores (necessário para login!)

**Se faltar a tabela `admins`**, o login não funcionará. Ver secção de [Resolução de Problemas](#resolução-de-problemas) abaixo.

### 1.3. Obter Credenciais do Supabase

1. No dashboard do Supabase, vá para **Settings** > **API**
2. Copie os seguintes valores:
   - **Project URL** (exemplo: `https://xxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (chave pública)

Guarde estes valores - vai precisar deles no Vercel!

## Parte 2: Configurar Vercel

### 2.1. Importar Projeto

1. Aceda a [vercel.com](https://vercel.com)
2. Clique em **Add New** > **Project**
3. Selecione o repositório GitHub `lions_clube_gaia`
4. Clique em **Import**

### 2.2. Configurar Variáveis de Ambiente

**IMPORTANTE**: Antes de fazer deploy, configure estas variáveis de ambiente:

1. No Vercel, antes de clicar em "Deploy", clique em **Environment Variables**
2. Adicione as seguintes variáveis:

```env
# Supabase (OBRIGATÓRIO)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica-aqui

# Admin Credentials (OBRIGATÓRIO)
# IMPORTANTE: Altere estas credenciais para algo seguro e único!
ADMIN_USERNAME=seu-nome-utilizador
ADMIN_PASSWORD=sua-senha-super-segura

# Opcional
RATE_LIMIT_MAX=10
```

**Valores a substituir:**
- `NEXT_PUBLIC_SUPABASE_URL`: O Project URL do Supabase (Parte 1.3)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: A anon/public key do Supabase (Parte 1.3)
- `ADMIN_USERNAME`: Nome de utilizador para login admin (escolha um seguro!)
- `ADMIN_PASSWORD`: Palavra-passe para login admin (use uma senha forte!)

**⚠️ IMPORTANTE**: Para produção, use credenciais diferentes das que estão nos exemplos do repositório!

### 2.3. Deploy

1. Clique em **Deploy**
2. Aguarde o build e deployment (2-3 minutos)
3. Quando terminar, clique no link do projeto

## Parte 3: Primeiro Acesso

### 3.1. Aceder ao Painel Admin

1. Aceda ao URL do seu projeto Vercel
2. Vá para `/admin/login`
3. Use as credenciais definidas em `ADMIN_USERNAME` e `ADMIN_PASSWORD`

**Nota**: O primeiro login cria automaticamente o utilizador admin na base de dados Supabase.

### 3.2. Verificar Funcionamento

1. **Teste o login**: Deve conseguir fazer login com as credenciais
2. **Crie uma eleição**: Teste criar uma nova eleição
3. **Gere códigos**: Teste gerar códigos de votação
4. **Verifique os dados**: No Supabase, vá para **Table Editor** e verifique que os dados aparecem nas tabelas

## Resolução de Problemas

### Login não funciona

**Problema**: "Erro ao fazer login", "Credenciais inválidas", ou erro "Could not find table 'public.admins'"

Este é o problema mais comum! Consulte o guia detalhado: **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)**

**Soluções rápidas**:

1. **Verificar variáveis de ambiente no Vercel**:
   - Vá para o seu projeto no Vercel
   - Settings > Environment Variables
   - Confirme que TODAS as 4 variáveis estão configuradas:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `ADMIN_USERNAME`
     - `ADMIN_PASSWORD`

2. **Verificar tabela admins no Supabase**:
   - Vá para o Supabase > Table Editor
   - Verifique se a tabela `admins` existe
   - **Se não existir**, execute o ficheiro `database/schema.sql` completo
   - **OU** execute apenas `database/fix-admins-table.sql` para criar a tabela em falta

3. **Verificar schema no Supabase**:
   - Vá para o Supabase > Table Editor
   - Deve ver 5 tabelas: `elections`, `choices`, `tokens`, `votes`, `admins`
   - Se faltar alguma tabela, execute novamente o `database/schema.sql`

4. **Verificar logs no Vercel**:
   - No projeto Vercel, vá para **Deployments**
   - Clique no deployment mais recente
   - Vá para **Functions** > Clique numa função
   - Verifique os logs para erros específicos

5. **Redeployar**:
   - No Vercel, vá para **Deployments**
   - Clique nos 3 pontos (...) no deployment mais recente
   - Clique em **Redeploy**

**Para diagnóstico completo e soluções passo-a-passo**, consulte **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)**

### Supabase retorna erro 401

**Problema**: Erro de autenticação ao aceder Supabase

**Soluções**:

1. **Verificar RLS (Row Level Security)**:
   - No Supabase, vá para **Table Editor**
   - Selecione a tabela `admins`
   - Clique em "Add RLS policy"
   - Ou verifique se a política "Enable all for admins" existe

2. **Regenerar chaves** (último recurso):
   - No Supabase, vá para Settings > API
   - Reset a chave anon
   - Atualize `NEXT_PUBLIC_SUPABASE_ANON_KEY` no Vercel
   - Faça redeploy

### Base de dados vazia

**Problema**: Não aparecem dados nas tabelas

**Solução**:

1. Execute novamente o schema SQL no Supabase
2. Verifique se todas as tabelas foram criadas
3. Tente criar dados manualmente para testar

## Manutenção

### Atualizar Código

1. Faça push do código para o GitHub
2. O Vercel fará deploy automaticamente
3. Verifique o status em **Deployments**

### Atualizar Variáveis de Ambiente

1. No Vercel, vá para Settings > Environment Variables
2. Edite a variável
3. Faça redeploy do projeto

### Backup dos Dados

1. No Supabase, vá para **Database** > **Backups**
2. Configure backups automáticos
3. Ou exporte manualmente via SQL Editor

## Segurança

### Recomendações

1. ✅ Use palavras-passe fortes para `ADMIN_PASSWORD`
2. ✅ Não partilhe as credenciais Supabase publicamente
3. ✅ Configure backups regulares
4. ✅ Monitorize os logs do Vercel regularmente
5. ✅ Considere ativar autenticação 2FA no Supabase e Vercel

### RLS (Row Level Security)

As políticas atuais permitem acesso total (para simplificar). Em produção, considere:

1. Restringir acesso às tabelas `admins`, `elections`, etc.
2. Criar políticas baseadas em autenticação
3. Consultar a [documentação do Supabase](https://supabase.com/docs/guides/auth/row-level-security)

## Links Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Supabase](https://supabase.com/docs)
- [Next.js no Vercel](https://nextjs.org/docs/deployment)

## Suporte

Para problemas ou questões:

1. Verifique os logs no Vercel e Supabase
2. Consulte este guia
3. Abra um issue no GitHub
