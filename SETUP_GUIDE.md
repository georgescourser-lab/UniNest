# ComradeHomes - Complete Setup Guide

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
# or
yarn install
```

### 2. Setup Database
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local - add your PostgreSQL connection
# DATABASE_URL="postgresql://user:password@localhost:5432/ku_house_hunting"

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### 3. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Project Structure Explained

### `/src/app` - Next.js App Router
- **layout.tsx**: Root layout with Navbar and Footer
- **page.tsx**: Home page (Hero + Featured Listings)
- **globals.css**: Global styles with Tailwind directives
- **api/**: API routes (Backend)
  - `listings/route.ts`: Get/create listings

### `/src/components` - React Components
- **Navbar.tsx**: Responsive navigation with mobile menu
- **ListingCard.tsx**: Property card with Comrade Metrics
- **FilterPanel.tsx**: Advanced filtering UI

### `/src/lib` - Utilities & Helpers
- **distance-calculator.ts**: Haversine distance calculations to KU gates
- **utils.ts**: Common utility functions
- **types.ts**: TypeScript interfaces
- **constants.ts**: App constants and configuration
- **prisma.ts**: Database client initialization

### `/prisma` - Database
- **schema.prisma**: Data models

---

## 🎯 Key Features Implemented

### ✅ Home Page
- Hero section with search bar
- Quick stats dashboard
- Popular areas selection buttons
- Featured listings grid (6 mock listings)
- Why Choose Us section
- Landlord CTA section
- Responsive mobile-first design

### ✅ Listing Cards
- Property image with filters badge overlay
- Distance to KU badge (real calculation)
- Verified Landlord badge
- Roommate Wanted indicator
- Favorite button
- Comrade Metrics display:
  - 💧 Water reliability
  - 📶 WiFi availability & quality
  - 🛡️ Security score
  - 🔊 Noise level
- Bedroom/bathroom count
- Walking time information
- Review rating & count

### ✅ Distance Calculation
- Accurate Haversine formula implementation
- Three KU gate coordinates embedded
- Walking time estimation (5 km/h standard pace)
- Supports showing distance to nearest and all gates

### ✅ Navigation
- Sticky responsive navbar
- Mobile hamburger menu
- Search bar (mobile & desktop)
- Post listing CTA button
- Auth buttons (Sign In/Sign Up)
- Logo branding

### ✅ Responsive Design
- Mobile-first approach
- Tailwind CSS breakpoints (sm, md, lg)
- Touch-friendly interface (48px minimum)
- Optimized for 90% mobile browsing

### ✅ Color Scheme
- Primary: Emerald Green (#10b981)
- Background: White
- Text: Slate 900 (#0f172a)
- Accent: Various for metrics

---

## 🗂️ Data Models (Prisma Schema)

### User
- Email (unique)
- Name, Phone
- Profile Image, Bio
- Role: STUDENT | LANDLORD | CARETAKER
- Verification status

### Property
- Title, Description, Price
- Bedrooms, Bathrooms
- Location, Area (enum), Zone
- GPS Coordinates (latitude, longitude)
- Water type: BOREHOLE | RATIONED | RELIABLE
- WiFi availability & quality
- Security & noise scores
- Roommate matching flag
- Landlord information
- Verification flag

### Review
- Rating (1-5)
- Comment
- Author (User reference)
- Property (reference)

### SearchLog
- Optional user tracking
- Filters applied

---

## 📍 KU Zones Data

| Zone | Center Coordinates | Distance to Gate A |
|------|-------------------|-------------------|
| Kahawa Wendani | 1.945, 36.881 | 0.7 km |
| KM | 1.938, 36.882 | 0.8 km |
| Kahawa Sukari | 1.95, 36.87 | 1.2 km |
| Mwihoko | 1.935, 36.892 | 1.5 km |
| Githurai 44 | 1.942, 36.889 | 0.9 km |
| Githurai 45 | 1.943, 36.89 | 0.8 km |
| Ruiru | 1.92, 36.87 | 2.0 km |

---

## 🔧 API Routes (Implemented)

### GET /api/listings
Get all properties with optional filtering

**Query Parameters:**
- `area`: Filter by zone (KAHAWA_WENDANI, KM, etc.)
- `priceMin`: Minimum price filter
- `priceMax`: Maximum price filter
- `hasWifi`: Boolean for WiFi filter
- `limit`: Results per page (default: 12)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "data": [
    {
      "id": "...",
      "title": "...",
      "price": 15000,
      "reviewCount": 12,
      "averageRating": 4.8,
      ...
    }
  ],
  "total": 342,
  "limit": 12,
  "offset": 0,
  "hasMore": true
}
```

### POST /api/listings
Create a new property (authentication required)

---

## 🎨 Customization Guide

### Change Primary Color
Edit `tailwind.config.ts`:
```typescript
// Change from emerald to indigo
extend: {
  colors: {
    primary: "hsl(209 89% 46%)", // Indigo
  }
}
```

### Modify KU Gate Coordinates
Edit `src/lib/distance-calculator.ts`:
```typescript
export const KU_GATES = {
  GATE_A: { lat: 1.9437, lng: 36.881, name: 'Gate A (Main)' },
  // Update coordinates as needed
}
```

### Add New Housing Area
1. Update `prisma/schema.prisma` (Area enum)
2. Add to `src/lib/constants.ts` (KU_AREAS)
3. Add coordinates to `src/lib/utils.ts` (getAreaCoordinates)

---

## 📚 Next Steps / TODO

- [ ] **Authentication**
  - Implement NextAuth.js
  - User registration & login
  - JWT tokens

- [ ] **Database Seeding**
  - Seed mock listings
  - Seed user accounts
  - Seed reviews

- [ ] **Advanced Filtering**
  - Client-side filter state management
  - Applied filters persistence
  - Search history

- [ ] **Individual Listing Page**
  - `src/app/listing/[id]/page.tsx`
  - Image gallery
  - Full reviews section
  - Map view
  - Contact landlord form

- [ ] **User Authentication Pages**
  - Login page
  - Signup page
  - Profile management
  - Favorite listings

- [ ] **Post Listing Page**
  - Form for landlords
  - Image upload
  - Multi-step form

- [ ] **Map Integration**
  - Replace with React-Leaflet
  - Show properties on map
  - Interactive map filtering

- [ ] **Review System**
  - Add review modal
  - Comment system
  - Verified reviewer badges

- [ ] **Admin Dashboard**
  - Landlord verification
  - Listing moderation
  - Analytics

---

## 🧪 Testing

```bash
# Run ESLint
npm run lint

# Build production
npm run build

# Start production server
npm start
```

---

## 📱 Browser Support

- Chrome/Edge: Latest
- Firefox: Latest
- Safari: Latest
- Mobile browsers: iOS Safari 12+, Chrome Mobile Latest

---

## 🚀 Deployment

### Deploy to Vercel
```bash
vercel
```

### Environment Variables for Production
```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

---

## 💡 Pro Tips

1. **Performance**: Use React.memo() for ListingCard if rendering many listings
2. **SEO**: Update metadata in `layout.tsx` with real content
3. **Images**: Consider Next.js Image optimization with Cloudinary
4. **State**: Use Zustand or Redux for complex filter state management
5. **Caching**: Implement ISR (Incremental Static Regeneration) for listings

---

## 🆘 Troubleshooting

### "Cannot find module 'prisma'"
```bash
npm install @prisma/client prisma --save
```

### Database connection error
- Check PostgreSQL is running
- Verify DATABASE_URL in .env.local
- Try: `psql -U user -d ku_house_hunting`

### Tailwind styles not applying
```bash
# Rebuild Tailwind cache
npm run build
rm -rf .next
npm run dev
```

---

## 📞 Support & Contact

For help or questions:
- Check README.md for overview
- Review component prop interfaces in .tsx files
- Check `src/lib/types.ts` for data structures

---

## 📄 License

Proprietary software for Kenyatta University

---

**Built with Next.js 14, Tailwind CSS, and ❤️ for KU Students**
