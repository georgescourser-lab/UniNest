#!/bin/bash
# Quick deployment script for ComradeHomes to Vercel

echo "🚀 ComradeHomes Deployment Script"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if .env.local exists
echo -e "${BLUE}Step 1: Checking environment configuration...${NC}"
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local not found!${NC}"
    echo "Copy .env.example to .env.local and update with your values"
    exit 1
fi
echo -e "${GREEN}✅ .env.local found${NC}"
echo ""

# Step 2: Install dependencies if needed
echo -e "${BLUE}Step 2: Installing dependencies...${NC}"
if [ ! -d node_modules ]; then
    npm install
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi
echo ""

# Step 3: Generate Prisma client
echo -e "${BLUE}Step 3: Generating Prisma client...${NC}"
npm run prisma:generate
echo -e "${GREEN}✅ Prisma client generated${NC}"
echo ""

# Step 4: Build Next.js project
echo -e "${BLUE}Step 4: Building Next.js project...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed. Check errors above.${NC}"
    exit 1
fi
echo ""

# Step 5: Instructions
echo -e "${BLUE}===================================${NC}"
echo -e "${GREEN}✅ Local build successful!${NC}"
echo ""
echo -e "${YELLOW}Next steps for Vercel deployment:${NC}"
echo ""
echo "1. Install Vercel CLI:"
echo "   npm install -g vercel"
echo ""
echo "2. Login to Vercel:"
echo "   vercel login"
echo ""
echo "3. Deploy to production:"
echo "   vercel --prod"
echo ""
echo "   OR deploy via GitHub:"
echo "   - Push to GitHub: git push origin main"
echo "   - Visit: https://vercel.com/dashboard"
echo "   - Click 'Add New' → 'Project'"
echo "   - Select your repository"
echo ""
echo -e "${BLUE}===================================${NC}"
echo -e "${YELLOW}Important: Update these on Vercel:${NC}"
echo ""
echo "Environment Variables (Settings → Environment Variables):"
echo "  • DATABASE_URL=<your_postgresql_connection_string>"
echo "  • NEXT_PUBLIC_API_URL=https://<your-domain>.vercel.app"
echo "  • MPESA_ENV=production (or sandbox)"
echo "  • MPESA_CONSUMER_KEY=<your_key>"
echo "  • MPESA_CONSUMER_SECRET=<your_secret>"
echo "  • MPESA_PASSKEY=<your_passkey>"
echo ""
echo -e "${BLUE}===================================${NC}"
echo ""
echo "For detailed instructions, see: DEPLOYMENT_GUIDE.md"
echo ""
