# Guia de Resolução: Erro de Login "Could not find table 'public.admins'"

## Problema

Ao tentar fazer login no painel administrativo (`/admin/login`), recebe o erro:

```
Error fetching admin: {
  code: 'PGRST205',
  details: null,
  hint: "Perhaps you meant the table 'public.tokens'",
  message: "Could not find the table 'public.admins' in the schema cache"
}
```

## Causa

A tabela `admins` não existe na base de dados Supabase. Isto acontece quando:
1. O schema SQL não foi executado completamente
2. Apenas algumas tabelas foram criadas, mas a tabela `admins` foi omitida
3. Houve um erro durante a execução do schema inicial

## Solução

### Opção 1: Executar o Schema Completo (Recomendado)

Se a sua base de dados Supabase está vazia ou quer recomeçar:

1. Aceda ao [Supabase Dashboard](https://app.supabase.com)
2. Selecione o seu projeto
3. Vá para **SQL Editor** (menu lateral esquerdo)
4. Clique em **New Query**
5. Cole o conteúdo completo do ficheiro `database/schema.sql`
6. Clique em **Run** (ou pressione Ctrl/Cmd + Enter)
7. Aguarde a mensagem de sucesso

Isto criará todas as tabelas necessárias:
- `elections` - Eleições
- `choices` - Opções de voto
- `tokens` - Códigos de votação
- `votes` - Votos anónimos
- `admins` - Utilizadores administradores

### Opção 2: Criar Apenas a Tabela Admins (Fix Rápido)

Se já tem dados nas outras tabelas e só precisa adicionar a tabela `admins`:

1. Aceda ao [Supabase Dashboard](https://app.supabase.com)
2. Selecione o seu projeto
3. Vá para **SQL Editor**
4. Clique em **New Query**
5. Cole o conteúdo do ficheiro `database/fix-admins-table.sql`
6. Clique em **Run**

Este script apenas cria a tabela `admins` e as políticas de segurança necessárias.

## Verificar que Funcionou

### Usar o Health Check Endpoint

A forma mais rápida de verificar se tudo está correto:

1. Aceda a `https://seu-site.vercel.app/api/health`
2. Deve ver uma resposta JSON com `"status": "healthy"`
3. Se houver problemas, verá `"status": "unhealthy"` com detalhes dos erros

Exemplo de resposta saudável:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-31T19:00:00.000Z",
  "checks": {
    "supabaseConfig": true,
    "databaseConnection": true,
    "requiredTables": {
      "elections": true,
      "choices": true,
      "tokens": true,
      "votes": true,
      "admins": true
    }
  },
  "errors": []
}
```

### No Supabase

1. Vá para **Table Editor** no dashboard do Supabase
2. Verifique que vê a tabela `admins` na lista de tabelas
3. A tabela deve ter as colunas: `id`, `username`, `password`, `created_at`

### Na Aplicação

1. Aceda ao URL da sua aplicação no Vercel
2. Vá para `/admin/login`
3. Tente fazer login com as credenciais definidas nas variáveis de ambiente:
   - Username: o valor de `ADMIN_USERNAME`
   - Password: o valor de `ADMIN_PASSWORD`
4. Se é o primeiro login, o sistema criará automaticamente o admin na base de dados

## Configuração das Variáveis de Ambiente no Vercel

Certifique-se de que tem TODAS estas variáveis configuradas no Vercel:

1. Aceda ao [Vercel Dashboard](https://vercel.com)
2. Selecione o seu projeto
3. Vá para **Settings** > **Environment Variables**
4. Verifique que tem estas 4 variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
ADMIN_USERNAME=seu-nome-de-utilizador
ADMIN_PASSWORD=sua-senha-segura
```

### Como Obter as Credenciais do Supabase

1. No [Supabase Dashboard](https://app.supabase.com)
2. Selecione o seu projeto
3. Vá para **Settings** > **API**
4. Copie:
   - **Project URL** → Use para `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use para `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Após Configurar

1. **Redeploy da aplicação**:
   - No Vercel, vá para **Deployments**
   - Clique nos 3 pontos (...) no deployment mais recente
   - Clique em **Redeploy**
   - Aguarde o deployment completar

2. **Teste o login**:
   - Aceda a `https://seu-site.vercel.app/admin/login`
   - Use as credenciais de `ADMIN_USERNAME` e `ADMIN_PASSWORD`
   - O primeiro login criará o utilizador na base de dados

## Verificar Logs de Erro

Se continuar a ter problemas, verifique os logs:

### Logs do Vercel

1. No Vercel Dashboard, vá para **Deployments**
2. Clique no deployment mais recente
3. Clique em **Functions** (ou **Runtime Logs**)
4. Procure por erros relacionados com Supabase ou login

### Logs do Supabase

1. No Supabase Dashboard, vá para **Logs**
2. Selecione **Postgres Logs**
3. Procure por erros relacionados com tabelas ou políticas

## Problemas Comuns

### Erro: "relation 'public.admins' does not exist"

**Solução**: Execute o schema SQL completo (Opção 1) ou o fix específico (Opção 2)

### Erro: "new row violates row-level security policy"

**Solução**: Verifique que as políticas RLS foram criadas. Execute novamente o `database/schema.sql`

### Login não aceita credenciais corretas

**Possíveis causas**:
1. Variáveis de ambiente no Vercel não estão configuradas
2. Variáveis foram alteradas mas não foi feito redeploy
3. Existe um admin na base de dados com credenciais diferentes

**Solução**:
1. Verifique as variáveis no Vercel (Settings > Environment Variables)
2. Faça redeploy após qualquer alteração
3. No Supabase Table Editor, veja a tabela `admins` e verifique o username existente

### Erro: "Invalid API key"

**Solução**: Verifique que `NEXT_PUBLIC_SUPABASE_ANON_KEY` está correta no Vercel

## Comandos SQL Úteis

### Script de Verificação Completo

Para verificar se tudo está configurado corretamente, execute o script `database/verify-setup.sql` no Supabase SQL Editor. Este script faz 7 verificações e mostra o estado da sua base de dados.

### Verificar se a tabela admins existe

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'admins'
);
```

### Listar todas as tabelas

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Ver todos os admins

```sql
SELECT id, username, created_at FROM admins;
```

### Apagar todos os admins (use com cuidado!)

```sql
DELETE FROM admins;
```

## Suporte

Se após seguir estes passos ainda tiver problemas:

1. Verifique que seguiu todos os passos corretamente
2. Verifique os logs no Vercel e Supabase
3. Abra um issue no GitHub com:
   - Descrição do erro
   - Screenshots dos logs
   - Passos que já tentou

## Checklist de Verificação

Antes de pedir ajuda, certifique-se que:

- [ ] Executou o `database/schema.sql` completo no Supabase SQL Editor
- [ ] A tabela `admins` aparece no Supabase Table Editor
- [ ] As 4 variáveis de ambiente estão configuradas no Vercel
- [ ] Fez redeploy após configurar as variáveis
- [ ] As credenciais Supabase (URL e Key) estão corretas
- [ ] Tentou fazer login com as credenciais corretas (as mesmas das variáveis de ambiente)
- [ ] Verificou os logs no Vercel e Supabase

---

**Nota**: Este é um sistema de votação eletrónica. A segurança é importante! Use sempre credenciais fortes para `ADMIN_PASSWORD` em produção.
