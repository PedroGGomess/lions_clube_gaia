# Quick Start Guide - Lions Clube Gaia Voting System

## ⚡ Início Rápido

Para começar a usar o sistema de votação, siga estes passos:

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

O ficheiro `.env` já está configurado com as credenciais corretas:

```env
DATABASE_URL="file:./dev.db"
ADMIN_USERNAME="LionsClubGaia"
ADMIN_PASSWORD="Lionsclubegaia@"
```

### 3. Inicializar Base de Dados

```bash
npm run prisma:push
```

Este comando:
- Cria o ficheiro de base de dados SQLite em `prisma/dev.db`
- Aplica o schema da Prisma
- Gera o Prisma Client

### 4. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em: `http://localhost:3000`

### 5. Fazer Login no Painel Admin

1. Aceda a `http://localhost:3000/admin/login`
2. Use as credenciais:
   - **Utilizador**: `LionsClubGaia`
   - **Palavra-passe**: `Lionsclubegaia@`

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev                 # Inicia servidor de desenvolvimento

# Base de Dados
npm run prisma:push        # Sincroniza schema com base de dados
npm run prisma:generate    # Gera Prisma Client

# Build para Produção
npm run build              # Cria build otimizado
npm start                  # Inicia servidor de produção
```

## ⚠️ Resolução de Problemas

### Erro ao fazer login?

1. **Verifique se a base de dados existe:**
   ```bash
   ls -la prisma/dev.db
   ```

2. **Se não existir, execute:**
   ```bash
   npm run prisma:push
   ```

3. **Reinicie o servidor:**
   ```bash
   npm run dev
   ```

### Base de dados foi apagada?

A base de dados está em `.gitignore` e não é enviada para o repositório. Após clonar ou em ambientes novos, sempre execute:

```bash
npm install
npm run prisma:push
```

### O utilizador admin não existe?

O utilizador admin é criado automaticamente na primeira tentativa de login usando as credenciais definidas em `.env`.

## 📝 Notas Importantes

- A base de dados SQLite (`prisma/dev.db`) **não é enviada para o Git**
- Para ambientes de produção, considere usar PostgreSQL ou MySQL
- As credenciais admin estão definidas em `.env` (não partilhar este ficheiro)
- O primeiro login cria automaticamente o utilizador admin

## 🚀 Próximos Passos

Após fazer login com sucesso:

1. Criar uma nova eleição
2. Gerar códigos de votação
3. Partilhar os códigos com os votantes
4. Acompanhar os resultados em tempo real

---

Para mais informações, consulte `README.md` ou `SETUP.md`
