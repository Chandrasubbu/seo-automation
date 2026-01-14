# Phase 2 Setup Guide

This guide covers the setup for **Content Generation, Performance Tracking, Optimization, and Workflows**.

## Prerequisites Checklist
- [x] Node.js 18+ & Dependencies installed
- [x] PostgreSQL Database running
- [x] Basic API Keys (OpenAI/Anthropic)
- [ ] **New:** Google Search Console Credentials (for Analytics)
- [ ] **New:** `NEXTAUTH_SECRET` (for Authentication)

## Step 1: Environment Configuration

Edit your `.env.local` to include Phase 2 keys:

```bash
# ... existing keys (DATABASE_URL, OPENAI_API_KEY) ...

# --- Authentication ---
# Generate a secret: openssl rand -base64 32
AUTH_SECRET="your-generated-secret-here"
AUTH_URL="http://localhost:3000"

# --- Google Search Console (Optional) ---
# Required for /analytics dashboard
GOOGLE_CLIENT_EMAIL="service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

## Step 2: Database Update

Phase 2 adds new tables (`SearchPerformance`, `Workflow`, etc).

```bash
# 1. Update Prisma Client
npx prisma generate

# 2. Push schema changes to DB
npx prisma db push
```

## Step 3: Verify Features

Start the server:
```bash
npm run dev
```

### 1. Test Authentication
- Visit `http://localhost:3000/login`
- Sign up for a new account.
- Verify you are redirected to the dashboard.

### 2. Test Content Generator
- Visit `http://localhost:3000/content-generator`
- Create an article using a template.

### 3. Test Analytics (GSC)
- Visit `http://localhost:3000/analytics`
- Click "Sync GSC Data" (Uses mock data if no keys provided).

### 4. Test Workflows
- Visit `http://localhost:3000/workflows`
- Create a simple workflow.
- Click "Run Now".

## Troubleshooting

### Q: "Prisma Client not initialized"
**Fix:** Run `npx prisma generate`.

### Q: "NextAuth.js error" / "404 on login"
**Fix:** Ensure `AUTH_SECRET` and `AUTH_URL` are set in `.env.local`.

### Q: Build Fails with Type Errors
**Note:** There is a known issue with `next-auth` v5 beta types during `npm run build`. The application works correctly in development mode (`npm run dev`). We are tracking this upstream.

## Next Steps
- Explore the [Walkthrough](/.gemini/antigravity/brain/de9b8533-3771-40d8-8f25-23946a0cfd9e/walkthrough.md) for usage details.

## Deployment Guide: Private VPS (e.g., GoDaddy, DigitalOcean)

This guide walks you through deploying the application to a Linux VPS (Ubuntu 20.04/22.04).

### 1. Server Prerequisites
- **OS**: Ubuntu 22.04 LTS (Recommended)
- **RAM**: Minimum 2GB (4GB recommended for build process)
- **Access**: SSH access with sudo privileges

### 2. Install Dependencies
Run these commands on your VPS:

```bash
# Update System
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+ (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx & Certbot (for SSL)
sudo apt install -y nginx certbot python3-certbot-nginx

# Install Process Manager (PM2)
sudo npm install -g pm2
```

### 3. Application Setup

#### Clone & Install
```bash
# Clone your repository (use HTTPS or set up SSH keys)
git clone https://github.com/yourusername/seo-automation.git
cd seo-automation

# Install dependencies
npm install --production=false
```

#### Configure Environment
Create a `.env` file with production values:
```bash
nano .env
```
Paste your variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
AUTH_SECRET="<run: openssl rand -base64 32>"
AUTH_URL="https://yourdomain.com"
# ... other keys
```

#### Build Application
```bash
# Generate Prisma Client
npx prisma generate

# Build Next.js app
npm run build
```

### 4. Run with PM2
Start the application in the background:
```bash
pm2 start npm --name "seo-app" -- start
pm2 save
pm2 startup
# (Run the command output by 'pm2 startup' to lock it in)
```

### 5. Configure Nginx (Reverse Proxy)
Edit the default site config:
```bash
sudo nano /etc/nginx/sites-available/default
```

Replace contents with:
```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Restart Nginx:**
```bash
sudo systemctl restart nginx
```

### 6. SSL Certificate (HTTPS)
Secure your domain:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Follow the prompts. Certbot will automatically update Nginx to force HTTPS.

### 7. Troubleshooting
- **Build Fails**: Often due to low memory. Enable swap:
  ```bash
  sudo fallocate -l 1G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  ```
- **Updates**: To deploy changes:
  ```bash
  git pull
  npm install
  npx prisma migrate deploy
  npm run build
  pm2 restart seo-app
  ```
