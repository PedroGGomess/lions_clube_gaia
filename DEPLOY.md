# Deploy to Vercel - Quick Guide

## Prerequisites

1. GitHub account with this repository
2. Vercel account (free tier works perfectly)
3. Supabase project setup completed

## Step-by-Step Deployment

### 1. Prepare Supabase

**📘 Para instruções detalhadas passo-a-passo, consulte [SUPABASE_SETUP.md](SUPABASE_SETUP.md)**

Resumo:
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to SQL Editor
3. Copy and paste the entire contents of `database/schema.sql`
4. Execute the SQL script
5. Go to Settings > API to get your credentials:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - Anon/Public Key

### 2. Deploy to Vercel

#### Option A: One-Click Deploy (Recommended)

1. Click this button: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
2. Import your GitHub repository
3. Add environment variables when prompted:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key
   - `ADMIN_PASSWORD` = Choose a secure admin password
4. Click Deploy!

#### Option B: Manual Deploy

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ADMIN_PASSWORD=your-secure-password
   ```
5. Click "Deploy"

### 3. Post-Deployment Setup

1. Once deployed, visit `https://your-app.vercel.app/admin/login`
2. Login with your `ADMIN_PASSWORD`
3. Create your first election
4. Add voting options
5. Generate tokens
6. Activate the election

### 4. Configure for Event

1. Set up tablets in kiosk mode pointing to your Vercel URL
2. Print or distribute generated tokens to voters
3. Monitor results in real-time via admin dashboard

## Vercel Configuration (Optional)

Create `vercel.json` in root for custom configuration:

```json
{
  "version": 2,
  "regions": ["lhr1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "ADMIN_PASSWORD": "@admin-password"
  }
}
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | `eyJhbGciOiJIUzI1N...` |
| `ADMIN_PASSWORD` | Admin panel password | `YourSecureP@ssw0rd!` |

## Testing Your Deployment

1. **Voter Flow Test:**
   - Visit your Vercel URL
   - Try entering a generated token
   - Complete the voting process

2. **Admin Flow Test:**
   - Visit `/admin/login`
   - Login with admin password
   - Create test election
   - Generate tokens
   - Test voting with a token
   - Check stats and export CSV

## Troubleshooting

### Build Fails

- Check all environment variables are set correctly
- Ensure Supabase URL and key are valid
- Review build logs in Vercel dashboard

### Database Connection Issues

- Verify Supabase project is active
- Check RLS policies are enabled
- Confirm schema.sql was executed successfully

### Token Validation Fails

- Ensure election status is "active"
- Verify tokens were generated for the correct election
- Check rate limiting isn't blocking requests

## Production Checklist

- [ ] Supabase database created and schema applied
- [ ] Strong admin password set in Vercel
- [ ] Environment variables configured in Vercel
- [ ] Deployment successful
- [ ] Test election created
- [ ] Token generation working
- [ ] Voting flow tested end-to-end
- [ ] Admin dashboard accessible
- [ ] CSV export working
- [ ] Tablets configured in kiosk mode

## Support

For issues during deployment:
1. Check Vercel deployment logs
2. Verify Supabase connection in browser console
3. Review the main [SETUP.md](SETUP.md) documentation

---

**Ready to Deploy?** Click the deploy button or follow the steps above! 🚀
