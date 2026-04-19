# ComradeHomes - House Hunting Platform for KU Students

A high-performance, mobile-first house hunting platform specifically designed for Kenyatta University (KU) students. Find the perfect hostel with "Comrade Metrics" - real student ratings for water, WiFi, security, and noise levels.

## 🎯 Features

### Core Features
- **Location-Based Search**: Filter by KU zones (Kahawa Wendani, KM, Kahawa Sukari, Mwihoko, Githurai 44, Githurai 45, Ruiru)
- **Comrade Metrics**: Custom filters for:
  - 💧 Water Reliability (Borehole/Rationed/Reliable)
  - 📶 WiFi Availability & Quality (1-5 rating)
  - 🛡️ Security Score (1-5)
  - 🔊 Noise Level (1-5)
- **Distance to Campus**: Walking time/distance to KU Gates A, B, and C
- **Roommate Matching**: Identify listings with roommate-wanted indicators
- **Trust System**:
  - ✅ Verified Landlord badges
  - ⭐ Student reviews and ratings
  - Landlord & caretaker information

### UI/UX
- 📱 **Mobile-First Design**: Optimized for 90% mobile browsing
- 🎨 **Modern Aesthetics**: Airbnb-style interface with high-contrast colors
- 🗺️ **Interactive Map View**: Shows property location relative to KU Campus
- ♿ **Accessible**: WCAG compliance ready

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS & Shadcn UI
- **Icons**: Lucide React
- **Database**: PostgreSQL with Prisma ORM
- **Maps**: React-Leaflet for advanced mapping
- **UI Components**: Shadcn UI (pre-built button, card, input components)

## 📋 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with Navbar
│   ├── page.tsx            # Home page with hero and featured listings
│   ├── globals.css         # Tailwind & global styles
│   └── listing/
│       └── [id]/page.tsx   # Individual listing detail page (TODO)
├── components/
│   ├── Navbar.tsx          # Responsive navbar with search
│   └── ListingCard.tsx     # Listing card with metrics display
├── lib/
│   └── distance-calculator.ts  # KU distance calculations
└── styles/
    └── globals.css
```

## 🗄️ Database Schema

### User
- Email, Name, Phone
- Role: STUDENT, LANDLORD, CARETAKER
- Profile Image & Bio
- Verification Status

### Property
- Title, Description, Price
- Bedrooms, Bathrooms
- Location & GPS Coordinates
- Area (enum): Kahawa Wendani, KM, Kahawa Sukari, Mwihoko, Githurai 44/45, Ruiru
- Water Type: BOREHOLE, RATIONED, RELIABLE
- WiFi Availability & Quality
- Security & Noise Scores
- Roommate Matching Status
- Landlord Reference & Verification

### Review
- Rating (1-5 stars)
- Comment
- Author (User)
- Property Reference

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL 13+

### Installation

1. **Clone and setup**
```bash
cd "House Hunting System"
npm install
```

2. **Configure environment**
```bash
cp .env.example .env.local
# Edit .env.local with your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/ku_house_hunting"
```

3. **Database setup**
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📍 KU Location Coordinates

### Campus Gates (Approximate)
- **Gate A (Main)**: 1.9437°N, 36.881°E
- **Gate B**: 1.9467°N, 36.885°E
- **Gate C**: 1.941°N, 36.888°E

The app calculates distance using the Haversine formula and displays walking time at average student pace (5 km/h).

## 🎨 Design Colors

- **Primary (Action)**: Emerald Green (#10b981)
- **Background**: White (#ffffff)
- **Text**: Slate 900 (#0f172a)
- **Accent**: Slate Grey (#64748b)
- **Secondary**: Indigo Blue (#4f46e5)

## 🔧 Key Utilities

### `calculateDistanceToKU(latitude, longitude)`
Returns an object with:
- `nearestGate`: Name of nearest gate
- `distanceKm`: Distance in kilometers
- `walkingTimeMinutes`: Estimated walking time
- `allGates`: Array of all gates with distances

```typescript
const info = calculateDistanceToKU(1.945, 36.881)
// Returns: {
//   nearestGate: "Gate A (Main)",
//   distanceKm: 0.8,
//   walkingTimeMinutes: 10,
//   allGates: [...]
// }
```

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md)
- **Desktop**: > 1024px (lg)

## 🔒 Security & Trust

- ✅ Email verification for users
- ✅ Landlord verification badges
- ⭐ Student review system prevents fraud
- 🔐 Password hashing with bcrypt (to implement)
- 📝 Report suspicious listings feature (to implement)

## 📋 TODO / Future Features

- [ ] User authentication (NextAuth.js)
- [ ] Advanced property filtering & search
- [ ] Individual listing detail pages
- [ ] Image upload system
- [ ] Chat/messaging between users
- [ ] Payment integration for booking deposits
- [ ] Admin dashboard
- [ ] Student community forum
- [ ] Virtual tours (360° photos)
- [ ] Analytics dashboard

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is proprietary software designed for Kenyatta University students.

## 📞 Support

For issues and support:
- Email: support@comradehomes.com
- Help Center: comradehomes.com/help

---

**Built with ❤️ for KU Comrades**
