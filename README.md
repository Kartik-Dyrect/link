# Link Collector with Auto-Tags

A beautiful, full-stack web application for collecting, organizing, and sharing your favorite links with automatic categorization and public sharing features. **Fully responsive and optimized for all devices.**

## ✨ Features

- **🔐 Authentication**: Email/password authentication with Supabase Auth
- **🔗 Link Management**: Add, view, and delete links with automatic metadata fetching
- **🏷️ Auto-Tagging**: Intelligent categorization based on URL patterns:
  - **Video** (YouTube, Vimeo, Twitch)
  - **Recipe** (AllRecipes, Food.com, recipe URLs)
  - **Article** (Medium, Dev.to, blog posts)
  - **Shopping** (Amazon, eBay, Etsy)
  - **Social** (Twitter, Facebook, LinkedIn)
  - **General** (everything else)
- **🔍 Search & Filter**: Find links by title, URL, or category
- **📱 Fully Responsive**: Optimized for mobile, tablet, and desktop devices
- **🌙 Dark Mode**: Full dark mode support with system preference detection
- **🔗 Public Sharing**: Share your collection with a public link
- **⚡ Real-time Updates**: Instant UI updates with optimistic rendering
- **♿ Accessible Design**: ARIA labels, keyboard navigation, and touch-friendly interface

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth
- **Metadata Fetching**: link-preview-js
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with dark mode support

## 📱 Responsive Design

The application is fully responsive with a mobile-first approach:

### Breakpoints

- **Mobile**: 320px - 640px (1 column grid)
- **Tablet**: 640px - 1024px (2 column grid)
- **Desktop**: 1024px+ (3-4 column grid)

### Key Features

- **Touch-Optimized**: 44px minimum touch targets
- **Adaptive Layouts**: Components adjust for each screen size
- **Performance**: Optimized images and lazy loading
- **Accessibility**: Screen reader and keyboard navigation support

See [RESPONSIVE_DESIGN.md](./RESPONSIVE_DESIGN.md) for detailed responsive design documentation.

## 🛠️ Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd link-collector
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

   ```bash
   cp .env.local.example .env.local
   ```

   Update `.env.local` with your values:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Set up the database**

   Run the SQL commands from `src/lib/database.sql` in your Supabase SQL editor to create the required tables and policies.

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── collections/   # Collection sharing endpoints
│   │   ├── fetch-meta/    # URL metadata fetching
│   │   └── links/         # Link CRUD operations
│   ├── share/[shareId]/   # Public share pages
│   ├── globals.css        # Global styles
│   ├── layout.jsx         # Root layout
│   └── page.jsx           # Home page
├── components/            # React components
│   ├── AddLinkForm.jsx    # Link addition form
│   ├── AuthForm.jsx       # Authentication form
│   ├── ErrorBoundary.jsx  # Error boundary
│   ├── LinkCard.jsx       # Individual link display
│   ├── LoadingSpinner.jsx # Loading component
│   ├── Navbar.jsx         # Navigation bar
│   ├── SearchAndFilter.jsx # Search and filter controls
│   └── ShareModal.jsx     # Collection sharing modal
└── lib/                   # Utilities and configuration
    ├── categorizeLink.js  # Auto-categorization logic
    ├── database.sql       # Database schema and policies
    └── supabaseClient.js  # Supabase client configuration
```

## 🔐 Security Features

- **Row Level Security (RLS)**: All database tables have proper RLS policies
- **Authentication Required**: All user actions require authentication
- **Server-side Validation**: API routes validate all inputs
- **CORS Protection**: Proper CORS handling for API routes
- **Environment Variables**: Sensitive data stored securely
- **SQL Injection Protection**: Parameterized queries via Supabase client

## 🌐 Deployment

### Vercel (Recommended)

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically

### Other Platforms

The application can be deployed on any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📊 Database Schema

### Tables

- **links**: User links with metadata and categories
- **collections**: Shareable collections of links
- **collection_links**: Junction table linking collections to links

### Key Features

- UUID primary keys for security
- Automatic timestamp tracking
- Foreign key constraints
- Row Level Security policies
- Optimized indexes for performance

## 🎨 UI/UX Features

- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Dark Mode**: Automatic system preference detection with manual toggle
- **Loading States**: Smooth loading indicators and skeleton screens
- **Error Handling**: Graceful error messages and recovery options
- **Accessibility**: Proper ARIA labels, keyboard navigation, and screen reader support
- **Modern Design**: Clean, minimal interface with subtle animations
- **Touch-Friendly**: Optimized for touch interactions on mobile devices

## 📝 API Endpoints

- `GET /api/links` - Fetch user's links
- `POST /api/links` - Create a new link
- `DELETE /api/links` - Delete a link
- `POST /api/collections` - Create/update shareable collection
- `GET /api/collections` - Fetch shared collection
- `POST /api/fetch-meta` - Fetch URL metadata

## 🧪 Testing

### Device Testing

The application has been tested on:

- **Mobile**: iPhone SE, iPhone 12/13/14, Android devices
- **Tablet**: iPad, iPad Pro, Android tablets
- **Desktop**: Various screen sizes from 1366px to 4K

### Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🐛 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- Uses ESLint for code linting
- Prettier for code formatting
- Consistent component structure
- TypeScript-ready (can be easily migrated)

## 📞 Support

If you encounter any issues or have questions, please create an issue on GitHub.

---

Built with ❤️ using Next.js and Supabase
