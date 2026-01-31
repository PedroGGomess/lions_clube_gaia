# 🚨 FIX RÁPIDO: Erro de Login "Table admins not found"

## O Problema
```
Error: Could not find the table 'public.admins' in the schema cache
```

## Solução em 3 Passos

### 1️⃣ Aceder ao Supabase SQL Editor

1. Vá para https://app.supabase.com
2. Selecione o seu projeto
3. Clique em **SQL Editor** (menu lateral)
4. Clique em **New Query**

### 2️⃣ Executar Script SQL

**Opção A - Se a base de dados está vazia:**
- Cole TODO o conteúdo de `database/schema.sql`
- Clique em **Run**

**Opção B - Se já tem dados:**
- Cole o conteúdo de `database/fix-admins-table.sql`
- Clique em **Run**

### 3️⃣ Verificar e Testar

**Método 1 - Health Check (Rápido):**
1. Aceda a `https://seu-site.vercel.app/api/health`
2. Deve ver `"status": "healthy"` e todas as tabelas como `true`

**Método 2 - Manual:**
1. Vá para **Table Editor** no Supabase
2. Verifique que a tabela `admins` existe
3. Aceda a `https://seu-site.vercel.app/admin/login`
4. Faça login com as credenciais do `.env`

## Variáveis de Ambiente (Vercel)

Certifique-se que tem estas 4 variáveis configuradas:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
ADMIN_USERNAME=LionsClubeGaia
ADMIN_PASSWORD=Lionsclubegaia@
```

### Como configurar:
1. Vercel Dashboard > Seu Projeto
2. **Settings** > **Environment Variables**
3. Adicione as 4 variáveis
4. **Deployments** > ... > **Redeploy**

## Obter Credenciais Supabase

1. Supabase Dashboard > Seu Projeto
2. **Settings** > **API**
3. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Ainda com Problemas?

📖 Consulte o guia completo: **TROUBLESHOOTING.md**

## Verificação Rápida

Execute isto no Supabase SQL Editor para verificar:

```sql
-- Ver todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Deve retornar: elections, choices, tokens, votes, admins
```

**Para verificação completa**: Execute o script `database/verify-setup.sql` que faz 7 verificações automáticas.

## Contacto

Em caso de dúvidas, abra um issue no GitHub com:
- Descrição do erro
- Screenshot dos logs
- Passos já tentados

---

💡 **Dica**: Guarde este ficheiro para referência rápida!
