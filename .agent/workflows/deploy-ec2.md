---
description: Steps to deploy the AI Interview Platform to an EC2 instance
---

# Deployment Workflow for EC2

Follow these steps to get your backend and frontend running on your EC2 server.

## 1. Prerequisites
Make sure you have Node.js and pnpm installed:
```bash
# Install Node.js (if not already installed)
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Install pnpm
sudo npm install -g pnpm
```

## 2. Environment Setup
Create a `.env` file in the root directory:
```bash
nano .env
```
Paste your production variables:
```env
DATABASE_URL=your_supabase_url
GEMINI_API_KEY=your_gemini_key
PORT=4000
FRONTEND_URL=your_frontend_url (e.g. https://your-app.vercel.app)
NEXT_PUBLIC_API_URL=http://your_ec2_public_ip:4000
```

## 3. Install and Build
```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm --filter @repo/db prisma generate

# Build the project
pnpm build
```

## 4. Port Configuration (Crucial)
You **must** open port 4000 in your AWS EC2 Security Group:
1. Go to **EC2 Dashboard** > **Instances**.
2. Select your instance > **Security** tab.
3. Click the **Security Group**.
4. **Edit Inbound Rules** > Add Rule:
   - Type: `Custom TCP`
   - Port: `4000`
   - Source: `0.0.0.0/0` (Anywhere)

## 5. Start with PM2 (Production Mode)
PM2 ensures your server restarts automatically if it crashes or the EC2 restarts.
```bash
# Install PM2
sudo npm install -g pm2

# Start the API
pm2 start apps/api/dist/index.js --name "ai-prep-api"

# Save PM2 list
pm2 save
pm2 startup
```

## 6. Verify Deployment
Check if the server is responding:
```bash
curl http://localhost:4000/health
```
From your browser: `http://your_ec2_public_ip:4000/health`
