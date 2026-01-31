# Como Corrigir o Erro de Login "Table 'public.admins' not found"

## 📌 Resumo da Solução

Este repositório agora inclui documentação completa e ferramentas para diagnosticar e corrigir o erro de login mais comum: tabela `admins` em falta no Supabase.

## 🆘 Está com Problemas Agora?

### Solução Rápida (2 minutos)

1. **Aceda ao Supabase SQL Editor**: https://app.supabase.com → Seu Projeto → SQL Editor
2. **Cole e execute** o ficheiro `database/fix-admins-table.sql`
3. **Verifique**: Aceda a `https://seu-site.vercel.app/api/health`
4. **Teste o login**: Vá para `/admin/login`

👉 **Detalhes completos em: [QUICK_FIX.md](./QUICK_FIX.md)**

## 📚 Documentação Disponível

### Para Resolver Problemas
- **[QUICK_FIX.md](./QUICK_FIX.md)** - Solução rápida de 3 passos
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Guia completo de resolução de problemas
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Instruções de deployment atualizadas

### Para Setup Inicial
- **[README.md](./README.md)** - Visão geral do projeto
- **[SETUP.md](./SETUP.md)** - Guia de configuração

## 🛠️ Ferramentas Incluídas

### Scripts SQL
Localizados em `/database/`:

1. **schema.sql** - Schema completo (agora idempotente)
   - Cria todas as 5 tabelas necessárias
   - Pode ser executado múltiplas vezes sem erros
   
2. **fix-admins-table.sql** - Fix específico para tabela admins
   - Use se só falta a tabela admins
   - Não afeta dados existentes
   
3. **verify-setup.sql** - Script de verificação
   - Faz 7 verificações automáticas
   - Mostra estado completo da base de dados

### API Endpoint
Novo endpoint para diagnóstico rápido:

**`/api/health`** - Health check da base de dados
- Verifica configuração do Supabase
- Verifica conexão à base de dados
- Verifica existência das 5 tabelas
- Retorna erros detalhados se houver problemas

Exemplo de uso:
```bash
curl https://seu-site.vercel.app/api/health
```

Resposta esperada (saudável):
```json
{
  "status": "healthy",
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

## ✅ Checklist de Configuração

Use esta checklist ao configurar pela primeira vez:

### No Supabase
- [ ] Projeto criado
- [ ] Schema SQL executado (`database/schema.sql`)
- [ ] Tabelas verificadas no Table Editor (5 tabelas)
- [ ] Credenciais copiadas (URL e Anon Key)

### No Vercel
- [ ] Projeto importado do GitHub
- [ ] Variáveis de ambiente configuradas (4 variáveis):
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `ADMIN_USERNAME`
  - [ ] `ADMIN_PASSWORD`
- [ ] Deploy concluído
- [ ] Health check testado (`/api/health`)
- [ ] Login testado (`/admin/login`)

## 🔍 Diagnóstico

### Verificar se Tudo Está OK

**Opção 1 - API Health Check (Rápido)**
```bash
# Aceder via browser ou curl
https://seu-site.vercel.app/api/health

# Deve retornar: "status": "healthy"
```

**Opção 2 - SQL Verification Script**
1. Copie `database/verify-setup.sql`
2. Cole no Supabase SQL Editor
3. Execute e veja os resultados das 7 verificações

**Opção 3 - Verificação Manual**
1. Supabase → Table Editor
2. Confirme que vê 5 tabelas: admins, choices, elections, tokens, votes

## 🚨 Erros Comuns e Soluções

| Erro | Causa | Solução |
|------|-------|---------|
| `Table 'admins' not found` | Tabela admins não existe | Execute `fix-admins-table.sql` |
| `Invalid API key` | Credenciais Supabase incorretas | Verifique variáveis no Vercel |
| `Credenciais inválidas` | Username/password errados | Use valores das variáveis de ambiente |
| Health check retorna unhealthy | Falta tabelas | Execute `schema.sql` completo |

## 📖 Estrutura de Ficheiros

```
database/
├── schema.sql              # Schema completo (idempotente)
├── fix-admins-table.sql    # Fix específico para admins
└── verify-setup.sql        # Script de verificação

app/api/
└── health/
    └── route.ts            # Endpoint de health check

# Documentação
├── README.md               # Visão geral
├── SETUP.md               # Setup inicial
├── QUICK_FIX.md           # Solução rápida
├── TROUBLESHOOTING.md     # Troubleshooting completo
└── VERCEL_DEPLOYMENT.md   # Guia de deployment
```

## 💡 Dicas

1. **Sempre execute o schema completo** no Supabase antes do primeiro deploy
2. **Use o health check** para verificar se tudo está OK após mudanças
3. **Guarde as credenciais** do Supabase e Vercel num local seguro
4. **Faça backup** das tabelas antes de executar scripts SQL em produção
5. **Teste localmente** antes de fazer alterações em produção

## 🔒 Segurança

### Credenciais
- ✅ Use senhas fortes para `ADMIN_PASSWORD`
- ✅ Não commite ficheiros `.env` para o Git
- ✅ Rotacione credenciais periodicamente
- ✅ Use diferentes credenciais para desenvolvimento e produção

### Supabase RLS
As políticas atuais permitem acesso total (simplificado). Para produção:
- Considere restringir acesso às tabelas sensíveis
- Implemente políticas baseadas em autenticação
- Consulte: https://supabase.com/docs/guides/auth/row-level-security

## 📞 Suporte

### Ordem de Resolução
1. Consulte [QUICK_FIX.md](./QUICK_FIX.md) para solução rápida
2. Consulte [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) para diagnóstico completo
3. Use `/api/health` e `verify-setup.sql` para diagnóstico
4. Verifique logs no Vercel e Supabase
5. Abra um issue no GitHub com detalhes

### Ao Abrir um Issue
Inclua:
- Output do `/api/health`
- Screenshot dos logs do Vercel
- Screenshot do Table Editor do Supabase
- Passos já tentados
- Variáveis de ambiente configuradas (SEM mostrar valores sensíveis!)

---

## 🎯 Próximos Passos

Agora que resolveu o problema de login:

1. **Configure a primeira eleição**
   - Aceda a `/admin`
   - Clique em "Nova Eleição"
   - Configure título e opções

2. **Gere tokens de votação**
   - Na eleição criada, clique em "Códigos"
   - Defina quantidade e gere
   - Guarde/imprima os tokens

3. **Ative a eleição**
   - Clique em "Ativar"
   - A votação estará disponível

4. **Monitorize resultados**
   - Veja resultados em tempo real no dashboard
   - Exporte para CSV quando necessário

---

**Desenvolvido para Lions Clube de Gaia** 🦁

Última atualização: 2024-01-31
