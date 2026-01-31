# Deployment Guide - Lions Clube Gaia Voting System

## Quick Start (Local Development)

1. **Clone and Install**
```bash
git clone https://github.com/PedroGGomess/lions_clube_gaia.git
cd lions_clube_gaia
npm install
```

2. **Setup Database**
```bash
npx prisma generate
npx prisma db push
```

3. **Seed Sample Data (Optional)**
```bash
npx tsx prisma/seed.ts
```

This will create:
- Admin user: `admin` / `admin123`
- Sample election with 3 candidates
- 10 voting codes (will be displayed in console)

4. **Run Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Production Deployment (Vercel)

### Prerequisites
- GitHub repository
- Vercel account
- PostgreSQL database (recommended: Vercel Postgres)

### Step-by-Step Deployment

#### 1. Prepare Database
1. Go to Vercel Dashboard → Storage → Create Database
2. Select "Postgres"
3. Copy the `DATABASE_URL` connection string

#### 2. Update Prisma Schema
Edit `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

#### 3. Deploy to Vercel

**Option A: Via Vercel Dashboard**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `ADMIN_USERNAME`: Admin username (e.g., `admin`)
   - `ADMIN_PASSWORD`: Admin password (e.g., `admin123`)
4. Click "Deploy"

**Option B: Via Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel
```

Follow prompts and add environment variables when asked.

#### 4. Initialize Database
After deployment, run migrations:
```bash
vercel env pull .env.local
npx prisma db push
```

#### 5. Seed Initial Data (Optional)
```bash
npx tsx prisma/seed.ts
```

---

## Configuration

### Environment Variables

Create `.env.local` file:
```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-secure-password"
```

**Security Note**: Change the default admin password in production!

---

## Usage Guide

### For Administrators

1. **Access Admin Panel**
   - Navigate to `/admin`
   - Login with credentials

2. **Create Election**
   - Click "Nova Eleição"
   - Fill in:
     - Title (e.g., "Eleição Presidente 2026")
     - Description (optional)
     - Start date/time
     - End date/time
     - Candidates (minimum 2)
   - Click "Criar Eleição"

3. **Generate Voting Codes**
   - Click "Códigos" on the election
   - Enter quantity (1-1000)
   - Click "Gerar Códigos"
   - Options:
     - **Imprimir**: Print unused codes for distribution
     - **Exportar CSV**: Download all codes

4. **Activate Election**
   - Click "Ativar" button on the election
   - Only active elections allow voting
   - Only one election should be active at a time

5. **Monitor Results**
   - Click "Resultados" on election
   - Real-time vote counting
   - See:
     - Total votes
     - Votes per candidate
     - Participation rate
   - Export results to CSV

### For Voters

1. **Receive Code**
   - Get 8-character code at event entrance

2. **Vote**
   - Go to website homepage
   - Click "Votar"
   - Enter code
   - Select candidate
   - Confirm vote

3. **Confirmation**
   - See success message
   - Code is now used and cannot be reused

---

## Tablet/Kiosk Mode Setup

### For Android Tablets

1. **Install Kiosk Browser**
   - Recommended: "Kiosk Browser Lockdown" or "Fully Kiosk Browser"
   - Available on Google Play Store

2. **Configure Kiosk Mode**
   - Set homepage to your voting app URL
   - Enable full-screen mode
   - Disable back button
   - Disable home button
   - Set auto-refresh interval (optional)

3. **Lock Device**
   - Enable kiosk mode
   - Set as default launcher (optional)
   - Test touch interactions

### Interface Features for Touch
- Large buttons (min 120px height)
- Clear visual feedback on press
- Simple navigation
- High contrast colors
- Large text (24px+)

---

## Troubleshooting

### Build Errors

**Error**: `Module not found: Can't resolve '@prisma/client'`
```bash
npx prisma generate
```

**Error**: `Database connection error`
- Check `DATABASE_URL` in environment variables
- Ensure database is accessible
- Run `npx prisma db push`

### Runtime Issues

**Admin login not working**
- Clear browser cache
- Check environment variables
- Verify admin user exists in database

**Votes not counting**
- Ensure election is active
- Check election date range
- Verify code hasn't been used

### Performance

**Slow page loads**
- Enable Vercel caching
- Use PostgreSQL connection pooling
- Consider upgrading Vercel plan

---

## Security Best Practices

1. **Change Default Password**
   - Update `ADMIN_PASSWORD` environment variable
   - Use strong, unique password

2. **Use HTTPS**
   - Vercel provides SSL automatically
   - Never use HTTP in production

3. **Database Security**
   - Use environment variables for credentials
   - Never commit `.env` files
   - Use read-only replicas for results (optional)

4. **Rate Limiting** (Optional)
   - Add middleware for API routes
   - Prevent brute force attacks

5. **Regular Backups**
   - Enable automatic database backups
   - Test restore procedures

---

## Maintenance

### View Logs
```bash
vercel logs
```

### Update Code
```bash
git push origin main  # Triggers automatic deployment
```

### Database Migrations
```bash
# After schema changes
npx prisma migrate dev --name description
npx prisma generate
vercel --prod  # Redeploy
```

### Clear Election Data
```bash
# Delete all votes and codes for an election
npx prisma studio  # Use visual editor
```

---

## Support

For issues or questions:
1. Check this guide
2. Review README.md
3. Check server logs
4. Open GitHub issue

---

## License

MIT License - See LICENSE file for details