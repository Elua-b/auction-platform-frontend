# AuctionHub Platform - Setup & Getting Started

## Prerequisites
- Node.js 18+ installed
- Your backend API running on `https://auction-platform-backend-uvjo.onrender.com`
- All API endpoints from the documentation working

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 3. Backend Setup
Ensure your backend API is running:
```bash
# Backend should be accessible at https://auction-platform-backend-uvjo.onrender.com
# All endpoints documented in your API documentation should be active
```

## Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── (protected)/          # Protected routes requiring auth
│   │   ├── auction/[id]/    # Auction details & bidding
│   │   ├── buyer/           # Buyer dashboard
│   │   ├── seller/          # Seller dashboard & product management
│   │   ├── admin/           # Admin dashboard & analytics
│   │   └── events/          # Live auction events
│   ├── page.tsx             # Authentication page (login/register)
│   └── layout.tsx           # Root layout
├── components/
│   ├── auth/                # Authentication components
│   ├── products/            # Product display components
│   ├── header.tsx           # Navigation header
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── auth-context.tsx     # Authentication context & hooks
│   └── api.ts               # API client utilities
├── public/                  # Static assets
└── package.json
```

## Key Features

### 1. Authentication
- **Registration**: Create account as Buyer or Seller
- **Login**: Secure authentication with token storage
- **Role-Based Access**: Different dashboards for Buyers, Sellers, and Admins

### 2. Buyer Features
- Browse all available products and auctions
- Search and filter by category
- Place bids on active auctions
- Add items to watchlist
- View bid history and auction details
- Real-time bid updates (polling every 3 seconds)

### 3. Seller Features
- Create and manage product listings
- Set up timed auctions with start/end times
- Host live auction events
- View seller analytics
- Manage inventory and auction status

### 4. Admin Features
- View platform-wide analytics
- Manage all users
- Manage product categories
- Monitor platform activity
- User account management

### 5. Live Auction Events
- Join live events with real-time bidding
- Multiple products per event
- Live bid feed showing latest bidders
- Support for 3-5 products per event
- Automatic bid validation

## How to Use

### As a Buyer

1. **Register**
   - Go to home page
   - Click "Register" tab
   - Enter details and select "Buyer" as account type
   - Click "Create Account"

2. **Browse & Search**
   - Navigate to Dashboard
   - Use search bar to find products
   - Filter by category
   - Browse upcoming and active auctions

3. **Place a Bid**
   - Click on any product to view details
   - Enter bid amount (must be higher than current highest)
   - Click "Place Bid"
   - Your bid is recorded and you're notified of outbids

4. **Add to Watchlist**
   - Click the heart icon on any product
   - View your watchlist in the "Watchlist" tab
   - Get notified of price changes

### As a Seller

1. **Register as Seller**
   - Complete registration with "Seller" account type
   - Redirect to Seller Dashboard

2. **Create Product**
   - Click "Create Product" button
   - Fill in product details (title, description, price, category)
   - Set auction start and end times
   - Submit to create product and auction

3. **Manage Auctions**
   - View all products on Seller Dashboard
   - See active, upcoming, and ended auctions
   - View bids for each auction
   - Monitor seller analytics

4. **Host Live Event**
   - Click "Host Event" button on Events page
   - Create event with title, description, date, and time
   - Add multiple products to the event
   - Start event when scheduled time arrives
   - Monitor live bids in real-time

### As an Admin

1. **Access Admin Dashboard**
   - Login with Admin account
   - Automatically redirected to Admin Dashboard

2. **View Analytics**
   - See total users, products, auctions, and revenue
   - Break down by user type (Buyers/Sellers)
   - Monitor platform health

3. **Manage Users**
   - View all registered users
   - See user details and account type
   - View join date

4. **Manage Categories**
   - View all product categories
   - Create new categories
   - Edit existing categories
   - Delete unused categories

## Workflow Examples

### Complete Auction Flow

1. **Seller Creates Product**
   ```
   Seller Dashboard → Create Product → Fill Details → Set Auction Times → Submit
   ```

2. **Buyer Discovers Product**
   ```
   Buyer Dashboard → Browse/Search → View Product Details
   ```

3. **Buyer Places Bid**
   ```
   Product Page → Enter Bid Amount → Click "Place Bid" → Bid Recorded
   ```

4. **Live Bidding**
   ```
   Multiple Buyers → Place Increasing Bids → Bid History Updates Live → Auction Ends
   ```

5. **Auction Ends**
   ```
   Timer Expires → Highest Bidder Determined → Winner Notified → Settlement Process
   ```

### Live Event Workflow

1. **Seller Creates Event**
   ```
   Events Page → Host Event → Create Event Details → Add Products → Go Live
   ```

2. **Buyers Join Event**
   ```
   Events Page → View Active Events → Join Event → Live Bidding Interface
   ```

3. **Real-Time Bidding**
   ```
   View Current Product → Place Bid → Live Bid Feed Updates → Move to Next Product
   ```

## Features in Development

The following features are implemented in the frontend but require backend API endpoints:

- ✅ Real-time bid notifications (polling-based)
- ✅ Live event management
- ✅ Watchlist management (localStorage)
- ⏳ Server-side watchlist persistence
- ⏳ Seller ratings and reviews
- ⏳ Email notifications
- ⏳ Payment processing
- ⏳ Dispute resolution system

## API Integration Notes

### Authentication Flow
```javascript
1. User registers/logs in
2. Backend returns token
3. Token stored in localStorage
4. Included in Authorization header for all requests
5. Token validated on protected routes
```

### Real-Time Bid Updates
```javascript
1. Polling interval: 3 seconds
2. Client requests: GET /bids/auction/:auctionId
3. Updates bid history and highest bid
4. Detects when user is outbid
5. Can be replaced with WebSocket for true real-time
```

### Error Handling
```javascript
- 401 Unauthorized: Redirect to login
- 403 Forbidden: Show permission denied message
- 404 Not Found: Show item not found
- 500 Server Error: Show error alert with retry option
```

## Troubleshooting

### "API request failed" Error
- Check that backend is running on `https://auction-platform-backend-uvjo.onrender.com`
- Verify all endpoints are properly configured
- Check CORS settings on backend

### "Authentication failed" Error
- Verify email and password are correct
- Check that user account exists
- Clear localStorage and try again

### Bids not updating
- Ensure polling is enabled (check browser console)
- Verify auction is in ACTIVE status
- Check that bid amount is higher than current highest

### Products not showing
- Verify products exist in database
- Check category filter isn't too restrictive
- Try clearing search filters

## Development Tips

### Debugging
```javascript
// Check local storage
console.log(localStorage.getItem('authToken'))
console.log(localStorage.getItem('userData'))

// Monitor API calls
// Open browser DevTools → Network tab
```

### Testing Different Roles
1. Open three browser windows/tabs
2. Login as Buyer, Seller, and Admin in each
3. Test workflows across different roles simultaneously

### Performance Optimization
- Products are cached in component state
- Reduce polling interval to 1 second for more real-time feel
- Implement skeleton loading states for better UX

## Deployment

### Build for Production
```bash
npm run build
```

### Run Production Build Locally
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
# Connected GitHub repository automatically deploys on push
# Or use Vercel CLI:
npm i -g vercel
vercel
```

## Support & Documentation

- **API Documentation**: See `API_IMPROVEMENTS.md`
- **Component Documentation**: Check component comments
- **Backend Setup**: Ensure your backend implements all documented endpoints

## Environment Variables

No environment variables required for local development with default setup.

For production, add to Vercel:
```
NEXT_PUBLIC_API_BASE=https://your-api-domain.com
```

---

**Ready to auction? Start by registering and exploring the platform!**
