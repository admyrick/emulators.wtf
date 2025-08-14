# Deployment Guide

This guide covers deploying the Emulators.wtf application to various platforms.

## 🚀 Vercel Deployment (Recommended)

Vercel provides the best experience for Next.js applications with automatic deployments and optimizations.

### Prerequisites
- GitHub/GitLab/Bitbucket account
- Vercel account
- Supabase project set up

### Steps

1. **Push your code to a Git repository**
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Import project to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Select "Next.js" framework preset

3. **Configure environment variables**
   In the Vercel dashboard, add these environment variables:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   \`\`\`

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application
   - You'll get a production URL like `https://your-app.vercel.app`

### Custom Domain

1. **Add domain in Vercel dashboard**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Configure DNS**
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or add A record pointing to Vercel's IP addresses

## 🐳 Docker Deployment

### Dockerfile

\`\`\`dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
\`\`\`

### Docker Compose

\`\`\`yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
\`\`\`

### Build and Run

\`\`\`bash
# Build the image
docker build -t emulators-wtf .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  -e SUPABASE_SERVICE_ROLE_KEY=your_service_key \
  emulators-wtf

# Or use docker-compose
docker-compose up -d
\`\`\`

## ☁️ AWS Deployment

### Using AWS Amplify

1. **Connect repository**
   - Go to AWS Amplify console
   - Connect your Git repository
   - Choose branch to deploy

2. **Configure build settings**
   \`\`\`yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   \`\`\`

3. **Add environment variables**
   - In Amplify console, go to Environment variables
   - Add your Supabase credentials

### Using EC2 with PM2

1. **Launch EC2 instance**
   - Choose Ubuntu 20.04 LTS
   - Configure security groups (ports 22, 80, 443)

2. **Install dependencies**
   \`\`\`bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Install Nginx
   sudo apt install nginx -y
   \`\`\`

3. **Deploy application**
   \`\`\`bash
   # Clone repository
   git clone https://github.com/yourusername/emulators-wtf.git
   cd emulators-wtf

   # Install dependencies
   npm install

   # Build application
   npm run build

   # Start with PM2
   pm2 start npm --name "emulators-wtf" -- start
   pm2 startup
   pm2 save
   \`\`\`

4. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   \`\`\`

## 🔧 Environment Configuration

### Production Environment Variables

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Optional: Error Monitoring
SENTRY_DSN=https://your-sentry-dsn

# Optional: CDN
NEXT_PUBLIC_CDN_URL=https://your-cdn.com
\`\`\`

### Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use different keys for development and production
   - Rotate keys regularly

2. **Supabase Security**
   - Enable Row Level Security (RLS)
   - Configure proper policies
   - Use service role key only on server-side

3. **HTTPS**
   - Always use HTTPS in production
   - Configure SSL certificates
   - Enable HSTS headers

## 📊 Monitoring and Analytics

### Performance Monitoring

1. **Vercel Analytics**
   - Automatically enabled on Vercel
   - Monitor Core Web Vitals
   - Track page performance

2. **Google Analytics**
   \`\`\`javascript
   // Add to app/layout.tsx
   import { GoogleAnalytics } from '@next/third-parties/google'
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>{children}</body>
         <GoogleAnalytics gaId="G-XXXXXXXXXX" />
       </html>
     )
   }
   \`\`\`

### Error Monitoring

1. **Sentry Integration**
   \`\`\`bash
   npm install @sentry/nextjs
   \`\`\`

   \`\`\`javascript
   // sentry.client.config.js
   import * as Sentry from "@sentry/nextjs";

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     tracesSampleRate: 1.0,
   });
   \`\`\`

## 🔄 CI/CD Pipeline

### GitHub Actions

\`\`\`yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
\`\`\`

## 🔍 Health Checks

### Application Health Endpoint

\`\`\`typescript
// app/api/health/route.ts
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Check database connection
    const { data, error } = await supabase
      .from('consoles')
      .select('id')
      .limit(1)
    
    if (error) throw error
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    }, { status: 500 })
  }
}
\`\`\`

### Monitoring Script

\`\`\`bash
#!/bin/bash
# health-check.sh

URL="https://your-domain.com/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $RESPONSE -eq 200 ]; then
    echo "✅ Application is healthy"
    exit 0
else
    echo "❌ Application is unhealthy (HTTP $RESPONSE)"
    exit 1
fi
\`\`\`

## 📈 Scaling Considerations

### Database Optimization

1. **Indexes**
   \`\`\`sql
   -- Add indexes for frequently queried columns
   CREATE INDEX CONCURRENTLY idx_emulators_recommended ON emulators(recommended);
   CREATE INDEX CONCURRENTLY idx_games_release_year ON games(release_year);
   CREATE INDEX CONCURRENTLY idx_consoles_manufacturer ON consoles(manufacturer);
   \`\`\`

2. **Connection Pooling**
   - Supabase handles connection pooling automatically
   - Monitor connection usage in Supabase dashboard
   - Consider upgrading plan for higher connection limits

### CDN Configuration

\`\`\`javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-cdn.com'],
    loader: 'custom',
    loaderFile: './lib/image-loader.js'
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
\`\`\`

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   \`\`\`bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   
   # Clear npm cache
   npm cache clean --force
   npm install
   \`\`\`

2. **Database Connection Issues**
   - Verify environment variables
   - Check Supabase project status
   - Ensure RLS policies are configured correctly

3. **Performance Issues**
   - Enable React Query devtools in development
   - Monitor Supabase dashboard for slow queries
   - Use Next.js built-in performance monitoring

### Logs and Debugging

\`\`\`javascript
// lib/logger.js
export const logger = {
  info: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`ℹ️ ${message}`, data)
    }
  },
  error: (message, error) => {
    console.error(`❌ ${message}`, error)
    // Send to error monitoring service
  },
  warn: (message, data) => {
    console.warn(`⚠️ ${message}`, data)
  }
}
\`\`\`

## 📋 Maintenance

### Regular Tasks

1. **Update Dependencies**
   \`\`\`bash
   # Check for outdated packages
   npm outdated
   
   # Update packages
   npm update
   
   # Update major versions carefully
   npm install package@latest
   \`\`\`

2. **Database Maintenance**
   - Monitor database size and performance
   - Clean up old data if necessary
   - Update statistics and analyze tables

3. **Security Updates**
   - Regularly update all dependencies
   - Monitor security advisories
   - Rotate API keys and secrets

### Backup Strategy

1. **Database Backups**
   - Supabase provides automatic daily backups
   - Consider additional backup solutions for critical data
   - Test restore procedures regularly

2. **Code Backups**
   - Use Git for version control
   - Maintain multiple remote repositories
   - Tag releases for easy rollback

---

This deployment guide covers the most common deployment scenarios and best practices for the Emulators.wtf application. Choose the deployment method that best fits your needs and infrastructure requirements.
\`\`\`

Let's also add some additional utility components and pages:
