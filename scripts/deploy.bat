@echo off
REM Quick deployment script for ComradeHomes to Vercel (Windows)

echo.
echo 🚀 ComradeHomes Deployment Script
echo ====================================
echo.

REM Step 1: Check if .env.local exists
echo [1/5] Checking environment configuration...
if not exist .env.local (
    echo ❌ .env.local not found!
    echo Copy .env.example to .env.local and update with your values
    exit /b 1
)
echo ✅ .env.local found
echo.

REM Step 2: Install dependencies if needed
echo [2/5] Installing dependencies...
if not exist node_modules (
    call npm.cmd install
) else (
    echo ✅ Dependencies already installed
)
echo.

REM Step 3: Generate Prisma client
echo [3/5] Generating Prisma client...
call npm.cmd run prisma:generate
echo ✅ Prisma client generated
echo.

REM Step 4: Build Next.js project
echo [4/5] Building Next.js project...
call npm.cmd run build
if errorlevel 1 (
    echo ❌ Build failed. Check errors above.
    exit /b 1
)
echo ✅ Build successful
echo.

REM Step 5: Instructions
echo ====================================
echo ✅ Local build successful!
echo.
echo Next steps for Vercel deployment:
echo.
echo 1. Install Vercel CLI:
echo    npm install -g vercel
echo.
echo 2. Login to Vercel:
echo    vercel login
echo.
echo 3. Deploy to production:
echo    vercel --prod
echo.
echo    OR deploy via GitHub:
echo    - Push to GitHub: git push origin main
echo    - Visit: https://vercel.com/dashboard
echo    - Click 'Add New' -^> 'Project'
echo    - Select your repository
echo.
echo ====================================
echo IMPORTANT: Update these on Vercel:
echo.
echo Environment Variables (Settings -^> Environment Variables):
echo   • DATABASE_URL=^<your_postgresql_connection_string^>
echo   • NEXT_PUBLIC_API_URL=https://^<your-domain^>.vercel.app
echo   • MPESA_ENV=production (or sandbox)
echo   • MPESA_CONSUMER_KEY=^<your_key^>
echo   • MPESA_CONSUMER_SECRET=^<your_secret^>
echo   • MPESA_PASSKEY=^<your_passkey^>
echo.
echo ====================================
echo.
echo For detailed instructions, see: DEPLOYMENT_GUIDE.md
echo.
pause
