# AuctionHub - Premium Auction Platform

A modern, full-featured auction platform built with Next.js that allows buyers to bid on products and sellers to host timed and live auctions. Features role-based access for Buyers, Sellers, and Admins with real-time bidding, live auction events, and comprehensive analytics.

## 🎯 Key Features

### For Buyers
- **Browse & Search**: Explore products with advanced filtering by category
- **Smart Watchlist**: Save favorite items and get notified of activity
- **Live Bidding**: Place bids on both timed and live auctions
- **Real-time Updates**: See bid activity with 3-second polling intervals
- **Bid History**: Track all your bids and auction participation
- **Live Events**: Join seller-hosted live auctions with multiple products

### For Sellers
- **Product Management**: Create and manage auction listings
- **Flexible Auctions**: Set custom start/end times for auctions
- **Live Events**: Host live auction events with multiple products
- **Analytics Dashboard**: Track sales, bids, and revenue
- **Inventory Control**: Manage product status and availability

### For Admins
- **Platform Analytics**: Real-time metrics on users, products, and revenue
- **User Management**: View and manage all platform users
- **Category Management**: Create and maintain product categories
- **Moderation Tools**: Foundation for content moderation (expandable)

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 16, React 19, TypeScript
- **UI Components**: shadcn/ui, Radix UI
- **Styling**: Tailwind CSS
- **State Management**: React Context API + SWR patterns
- **API Client**: Fetch with custom middleware
- **Real-time**: Polling-based (3-second intervals)

### File Structure
```
app/
├── (protected)/          # Authenticated routes
│   ├── auction/[id]/     # Auction details & bidding
│   ├── buyer/            # Buyer dashboard & products
│   ├── seller/           # Seller dashboard & management
│   ├── admin/            # Admin dashboard
│   └── events/           # Live auction events
├── page.tsx              # Auth page
└── layout.tsx            # Root layout

components/
├── auth/                 # Authentication UI
├── products/             # Product components
├── header.tsx            # Navigation
└── ui/                   # shadcn components

lib/
├── auth-context.tsx      # Auth state management
└── api.ts                # API client
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running on `https://auction-platform-backend-uvjo.onrender.com`

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Quick Start
1. **Register**: Create account as Buyer or Seller
2. **Browse**: Explore products and auctions (Buyer) or create products (Seller)
3. **Bid**: Place bids on active auctions
4. **Events**: Join live auction events for real-time bidding

## 📋 User Flows

### Buyer Flow
```
Register/Login → Dashboard → Browse Products → Add to Watchlist → Place Bids → Win Auction
```

### Seller Flow
```
Register/Login → Create Product → Set Auction Times → Host Live Events → Monitor Analytics
```

### Admin Flow
```
Login as Admin → View Analytics → Manage Users → Manage Categories → Monitor Platform
```

## 🔄 Real-Time Features

### Bid Updates (Polling)
- Fetches latest bids every 3 seconds
- Detects when user is outbid
- Updates bid count and history
- Can be upgraded to WebSocket for instant updates

### Live Events
- Multiple products per event
- Real-time bid feed
- Automatic product rotation
- Live bidder tracking

## 📊 API Integration

All endpoints connect to `https://auction-platform-backend-uvjo.onrender.com`:

### Core Endpoints Used
```
POST   /users/login
POST   /users
GET    /products
GET    /products/:id
GET    /auctions
GET    /bids/auction/:auctionId
POST   /bids
GET    /categories
GET    /events
POST   /events
GET    /events/:id
GET    /analytics/seller/:sellerId
GET    /analytics/platform
```

### Missing Endpoints (Need Backend)
See `API_IMPROVEMENTS.md` for:
- Watchlist persistence API
- Notifications system
- Seller ratings & reviews
- Live event real-time status
- Enhanced search

## 🎨 Design System

### Color Palette
- **Primary**: Amber-500 (CTAs and accents)
- **Background**: Slate-950 (Main), Slate-800 (Cards)
- **Text**: White, Slate-300 (Primary), Slate-400 (Secondary)
- **Accents**: Green-500 (Active), Blue-500 (Upcoming), Red-500 (Warnings)

### Typography
- **Heading**: Geist Sans (bold weights)
- **Body**: Geist Sans (regular)
- **Mono**: Geist Mono (code)

### Components
- Fully accessible with ARIA labels
- Dark theme optimized
- Mobile-responsive
- Built with shadcn/ui

## 🔐 Security Features

- **Authentication**: Token-based with localStorage
- **Protected Routes**: Auth guard on all protected pages
- **Role-Based Access**: Different views for Buyer/Seller/Admin
- **Input Validation**: Form validation on client side
- **API Security**: Bearer token in Authorization header

## 📈 Analytics

### Seller Analytics
- Total products listed
- Active auctions count
- Total sales revenue
- Average product price

### Platform Analytics (Admin)
- Total registered users
- User breakdown by type
- Total products listed
- Total auctions created
- Platform revenue

## 🔧 Configuration

### API Base URL
Change in `lib/api.ts`:
```typescript
const API_BASE = 'https://auction-platform-backend-uvjo.onrender.com'
```

### Polling Interval
Change in component useState:
```typescript
const interval = setInterval(pollForUpdates, 3000) // 3 seconds
```

### Minimum Bid Increment
Currently set to: `highestBid + 1`

Modify in `components/auction/`:
```typescript
const minBid = highestBid + MIN_INCREMENT // Adjust MIN_INCREMENT
```

## 🧪 Testing

### Test Accounts
Create accounts during registration:
- **Buyer Account**: Select "Buyer" role
- **Seller Account**: Select "Seller" role
- **Admin Account**: Requires database entry or API support

### Test Scenarios

1. **Auction Bidding**
   - Create product as seller
   - Place bids as buyer
   - Watch real-time updates
   - Verify highest bidder tracking

2. **Live Events**
   - Create event with multiple products
   - Join as buyer
   - Place bids on different products
   - Switch between products

3. **Watchlist**
   - Add products to watchlist
   - Verify localStorage persistence
   - Check watchlist view

## 📱 Responsive Design

- **Mobile**: Single column layout
- **Tablet**: 2 column layout
- **Desktop**: 3-4 column layout
- **Large**: Full-featured layout

## ⚡ Performance Optimization

- **Code Splitting**: Route-based splitting
- **Image Optimization**: Using Next.js Image (when available)
- **Caching**: API responses cached at component level
- **Debouncing**: Search input debounced (can be improved)

## 🐛 Known Issues & Limitations

1. **Watchlist**: Currently stored in localStorage, not persisted server-side
2. **Notifications**: Frontend-ready but no backend notifications
3. **Real-time**: Uses polling, not WebSocket
4. **Images**: Placeholder support, no file upload yet
5. **Payments**: No payment gateway integrated

## 🚧 Upcoming Features

- [ ] Email notifications
- [ ] Payment processing (Stripe/PayPal)
- [ ] User ratings and reviews
- [ ] Message system for buyer-seller communication
- [ ] Advanced search with filters
- [ ] Bulk auction creation
- [ ] Automated auction extension
- [ ] Fraud detection system

## 📚 Documentation

- **Setup Guide**: See `SETUP.md`
- **API Improvements**: See `API_IMPROVEMENTS.md`
- **Component Props**: Check component comments
- **API Utilities**: See `lib/api.ts`

## 🤝 Contributing

To improve the platform:

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit PR with description
5. Wait for review

## 📄 License

MIT License - feel free to use for personal or commercial projects

## 🆘 Support

### Common Issues

**"Cannot connect to API"**
- Ensure backend is running on port 5000
- Check CORS settings
- Verify endpoint URLs

**"Bids not updating"**
- Check browser console for errors
- Verify auction is ACTIVE
- Try refreshing page

**"Authentication failed"**
- Clear localStorage and cookies
- Verify credentials
- Check backend auth service

## 📞 Quick Links

- **Frontend Repo**: Current project
- **Backend Setup**: Implement endpoints from `API_IMPROVEMENTS.md`
- **Deployment**: See `SETUP.md` for Vercel deployment

## 🎉 Success Criteria

You'll know the platform is working when:
- ✅ Users can register with different roles
- ✅ Sellers can create products and auctions
- ✅ Buyers can place bids and see updates
- ✅ Live events work with real-time bidding
- ✅ Admin dashboard shows correct analytics
- ✅ Responsive design works on all devices

---

**Built with ❤️ using Next.js and shadcn/ui**

For more information, check the documentation files included in the project.
