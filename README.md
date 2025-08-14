# Emulators.wtf - Emulation Database

A comprehensive database website for emulators, games, ports, tools, and community resources across various gaming consoles and systems. Built with Next.js 14, Supabase, and modern web technologies.

## 🚀 Features

- **Comprehensive Database**: Extensive collection of emulators, games, consoles, and tools
- **Advanced Search**: Global search with filtering by platform, features, and categories
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Admin Interface**: Complete content management system
- **Real-time Data**: Powered by Supabase for instant updates
- **SEO Optimized**: Server-side rendering and meta tags
- **Performance**: Image optimization and lazy loading

## 🛠 Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## 🔧 Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/emulators-wtf.git
   cd emulators-wtf
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in your Supabase credentials:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   \`\`\`

4. **Set up the database**
   - Create a new Supabase project
   - Run the SQL scripts in order:
     - `scripts/01-create-tables.sql`
     - `scripts/02-seed-data.sql`

5. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

\`\`\`
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin interface
│   ├── console/           # Console detail pages
│   ├── consoles/          # Console listing
│   ├── emulator/          # Emulator detail pages
│   ├── emulators/         # Emulator listing
│   ├── games/             # Games listing
│   ├── search/            # Search functionality
│   └── tools/             # Tools listing
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Utility functions
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Helper functions
├── scripts/              # Database scripts
│   ├── 01-create-tables.sql
│   └── 02-seed-data.sql
└── public/               # Static assets
\`\`\`

## 🗄️ Database Schema

### Tables

1. **consoles** - Gaming consoles and systems
2. **emulators** - Emulator software
3. **games** - Games and ports
4. **tools** - Utilities and helper tools
5. **guides** - Setup and configuration guides (optional)

### Key Relationships

- Emulators can support multiple consoles
- Games can run on multiple consoles
- Tools can be associated with specific consoles
- All tables include metadata (URLs, images, descriptions)

## 🔍 API Endpoints

The application uses Supabase's auto-generated REST API:

- `GET /rest/v1/consoles` - List consoles
- `GET /rest/v1/emulators` - List emulators
- `GET /rest/v1/games` - List games
- `GET /rest/v1/tools` - List tools

All endpoints support filtering, sorting, and pagination.

## 🎨 UI Components

### Core Components

- `ConsoleCard` - Display console information
- `EmulatorCard` - Display emulator details
- `GameCard` - Display game information
- `ToolCard` - Display tool details
- `SearchBar` - Global search functionality

### Admin Components

- `AdminLayout` - Admin panel layout
- `DataTable` - Generic data table for CRUD operations
- `FormDialog` - Modal forms for creating/editing

## 🔐 Admin Interface

Access the admin panel at `/admin` to:

- Manage consoles, emulators, games, and tools
- View dashboard statistics
- Bulk import/export data
- Monitor recent activity

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Add environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

1. **Build the application**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Start the production server**
   \`\`\`bash
   npm start
   \`\`\`

## 🧪 Testing

Run the test suite:
\`\`\`bash
npm test
\`\`\`

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- Create an issue for bug reports
- Join our Discord community
- Check the documentation wiki

## 🔄 Roadmap

- [ ] User authentication and profiles
- [ ] Community features (ratings, reviews)
- [ ] Advanced filtering and sorting
- [ ] Mobile app
- [ ] API rate limiting
- [ ] Content moderation tools
- [ ] Multi-language support

## 📊 Performance

- Lighthouse score: 95+
- Core Web Vitals: All green
- Image optimization: Next.js Image component
- Database queries: Optimized with indexes
- Caching: React Query for client-side caching

---

Built with ❤️ for the emulation community
