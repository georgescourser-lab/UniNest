# 🚀 Deployment Guide - ComradeHomes to Vercel

## Prerequisites
- GitHub account
- Vercel account (free at vercel.com)
- PostgreSQL database (Vercel Postgres recommended)
- Environment variables configured

---

## Step 1: Prepare Your Database

### Option A: Use Vercel Postgres (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project (or create a new one)
3. Go to **Storage** tab → **Create Database** → **Postgres**
4. Copy the `DATABASE_URL` connection string
5. Update your `.env.local`:
   ```
   DATABASE_URL="your_vercel_postgres_connection_string"
   ```

### Option B: Use Railway, PlanetScale, or Other Services
- Get your PostgreSQL connection string from your database provider
- Add it to `.env.local`

---

## Step 2: Push Database Schema to Production

1. **Deploy migrations to your production database:**
   ```bash
   # Set your production DATABASE_URL temporarily
   # Or create a .env.production with your production database

   npx prisma migrate deploy
   ```

2. **Or use Prisma db push:**
   ```bash
   npx prisma db push
   ```

---

## Step 3: Configure Environment Variables on Vercel

1. In **Vercel Dashboard**, go to your project
2. Click **Settings** → **Environment Variables**
3. Add the following variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `NEXT_PUBLIC_API_URL` | `https://your-domain.vercel.app` |
| `NEXT_PUBLIC_KU_GATE_A_LAT` | `1.9437` |
| `NEXT_PUBLIC_KU_GATE_A_LNG` | `36.8810` |
| `NEXT_PUBLIC_KU_GATE_B_LAT` | `1.9467` |
| `NEXT_PUBLIC_KU_GATE_B_LNG` | `36.8850` |
| `NEXT_PUBLIC_KU_GATE_C_LAT` | `1.9410` |
| `NEXT_PUBLIC_KU_GATE_C_LNG` | `36.8880` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Your Mapbox token (optional) |
| `MPESA_ENV` | `production` or `sandbox` |
| `MPESA_CONSUMER_KEY` | Your M-Pesa consumer key |
| `MPESA_CONSUMER_SECRET` | Your M-Pesa consumer secret |
| `MPESA_PASSKEY` | Your M-Pesa passkey |

---

## Step 4: Deploy to Vercel

### Option A: Deploy via Git (Recommended)

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Connect GitHub to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **Add New** → **Project**
   - Select your GitHub repository
   - Click **Import**

3. **Vercel will automatically:**
   - Detect Next.js
   - Run `npm install`
   - Run `npm run build`
   - Deploy to production

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Follow the prompts** to connect your GitHub account and select your project

---

## Step 5: Verify Deployment

1. Your app will be available at: `https://your-project.vercel.app`
2. Check **Deployments** tab in Vercel Dashboard
3. Verify environment variables are loaded (check logs if issues occur)
4. Test the application features

---

## Troubleshooting

### Database Connection Errors
```bash
# Verify DATABASE_URL in Vercel settings
# Test connection locally:
npx prisma db execute --stdin
```

### Build Errors
- Check **Deployment Logs** in Vercel Dashboard
- Ensure all environment variables are set
- Verify Prisma schema is valid: `npx prisma validate`

### Prisma Client Issues
```bash
# Regenerate Prisma client
npx prisma generate
```

### 502 Bad Gateway
- Database might not be initialized
- Run: `npx prisma migrate deploy` on production database
- Check CloudFlare/DNS settings

---

## Post-Deployment Checklist

- [ ] Database migrations applied successfully
- [ ] Environment variables configured in Vercel
- [ ] Can access application at deployed URL
- [ ] Can create accounts and log in
- [ ] Can post listings
- [ ] Can search and filter properties
- [ ] API routes working (auth, listings, etc.)
- [ ] Maps loading (if using Mapbox)
- [ ] M-Pesa payments configured (if applicable)

---

## Continuous Deployment

Vercel automatically redeploys when you push to your GitHub main branch. Just push updates:

```bash
git push origin main
```

Vercel will automatically:
1. Build the project
2. Run tests (if configured)
3. Deploy to production

---

## Performance Optimization Tips

1. **Enable Image Optimization:**
   - Images are automatically optimized in production
   - Consider using Vercel's Image Optimization API

2. **Database:**
   - Use Vercel Postgres for lowest latency
   - Enable connection pooling

3. **Monitoring:**
   - Set up Vercel Analytics
   - Monitor database performance
   - Track API response times

---

## Rollback

If something goes wrong after deployment:

1. Go to **Deployments** in Vercel Dashboard
2. Click on a previous successful deployment
3. Click the "..." menu and select **Promote to Production**

---

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/getting-started/setup-prisma/deploy-to-production)
