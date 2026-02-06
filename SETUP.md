# SyncState Setup Guide

This guide will help you get SyncState up and running in minutes.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier is fine)
- A Clerk account (free tier is fine)

## Step 1: Install Dependencies

```bash
npm install --legacy-peer-deps
```

The `--legacy-peer-deps` flag is needed due to TipTap extension version compatibility.

## Step 2: Set Up Supabase

1. **Go to [Supabase](https://supabase.com) and create a new project**

2. **Run the database schema**
   - Go to the SQL Editor in your Supabase dashboard
   - Copy the contents of `supabase-schema.sql` from the project root
   - Paste it into the SQL Editor
   - Click "Run" to execute

   This will create:
   - `documents` table for document metadata
   - `document_collaborators` table for sharing
   - Row Level Security (RLS) policies
   - Indexes for performance

3. **Get your API credentials**
   - Go to Project Settings → API
   - Copy the `Project URL` (looks like: `https://xxxxx.supabase.co`)
   - Copy the `anon/public` key

4. **Update `.env.local`**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## Step 3: Set Up Clerk Authentication

1. **Go to [Clerk](https://clerk.com) and create a new application**

2. **Choose authentication methods**
   - Email/Password (recommended)
   - OAuth providers (Google, GitHub, etc.) - optional

3. **Get your API keys**
   - Go to API Keys in your Clerk dashboard
   - Copy the `Publishable key`
   - Copy the `Secret key`

4. **Update `.env.local`**
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   CLERK_SECRET_KEY=sk_test_xxxxx
   ```

5. **Configure redirect URLs in Clerk**
   - Go to Paths in your Clerk dashboard
   - Set Sign-in URL: `/sign-in`
   - Set Sign-up URL: `/sign-up`
   - Set After sign-in URL: `/dashboard`
   - Set After sign-up URL: `/dashboard`

## Step 4: Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Step 5: Test the Application

1. **Visit `http://localhost:3000`**
   - You should see the landing page with SyncState branding

2. **Click "Get Started" or "Dashboard"**
   - You'll be redirected to the sign-in page

3. **Create an account**
   - Sign up with email or OAuth
   - You'll be redirected to the dashboard

4. **Create a document**
   - Click "New Document" button
   - The document will be created and you'll see it in the list

5. **Open the editor**
   - Click on a document card
   - You should see the collaborative editor with:
     - Rich text formatting toolbar (top)
     - Floating toolbar (appears on text selection)
     - Connection status indicator
     - User presence avatars
     - "3D Version Tree" button

6. **Test features**
   - **Type some text** - Should save automatically
   - **Select text** - Floating toolbar appears with formatting options
   - **Press Shift+?** - Shows keyboard shortcuts modal
   - **Click "3D Version Tree"** - Opens 3D visualization
   - **Test dark mode** - Toggle with sun/moon icon

## Features to Explore

### Collaborative Editing
- Open the same document in two different browser tabs (or incognito)
- Sign in as different users in each tab
- Type in one tab and see changes appear in the other
- See other users' cursors with their names

### 3D Version Tree
- Click "3D Version Tree" button in editor
- Interact with the visualization:
  - Left click + drag: Rotate camera
  - Right click + drag: Pan camera
  - Scroll: Zoom in/out
  - Click nodes: Select version
  - Auto-rotation enabled by default

### Keyboard Shortcuts
Press `Shift+?` to see all shortcuts:
- `Ctrl+B` - Bold
- `Ctrl+I` - Italic
- `Ctrl+U` - Strikethrough
- `Ctrl+K` - Insert Link
- `Ctrl+E` - Inline Code
- `Ctrl+Shift+H` - Highlight
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `Ctrl+N` - New Document (dashboard)

### Offline Mode
- Open a document
- Disconnect from internet
- Keep typing
- Reconnect to internet
- Changes will automatically sync via WebRTC or WebSocket

## Troubleshooting

### "Cannot create document" error

**Problem:** Database tables don't exist

**Solution:**
1. Go to Supabase dashboard
2. Open SQL Editor
3. Run the `supabase-schema.sql` file
4. Refresh the page

### "Authentication error" or redirect loop

**Problem:** Clerk configuration incorrect

**Solution:**
1. Check `.env.local` has correct Clerk keys
2. Verify Clerk redirect URLs are set correctly
3. Make sure middleware.ts is in the root directory
4. Restart the dev server

### Editor doesn't load

**Problem:** Yjs providers not connecting

**Solution:**
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_YJS_SIGNALING_SERVER` is set
3. Try using the default: `wss://signaling.yjs.dev`
4. Clear browser cache and IndexedDB

### 3D Visualization doesn't appear

**Problem:** Three.js loading issue

**Solution:**
1. Hard refresh the page (Ctrl+Shift+R)
2. Check browser console for errors
3. Try a different browser (Chrome/Firefox recommended)

### Connection status shows "offline"

**Problem:** WebRTC peer discovery

**Solution:**
1. This is normal if you're the only user
2. Open document in another tab to see connection
3. WebSocket fallback will work automatically

## Production Deployment

### Deploy to Vercel

1. **Push code to GitHub**
   ```bash
   git remote add origin your-github-repo
   git push -u origin master
   ```

2. **Go to [Vercel](https://vercel.com)**
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add environment variables**
   - In Vercel project settings → Environment Variables
   - Add all variables from `.env.local`

4. **Deploy**
   - Vercel will automatically build and deploy
   - Your app will be live at `your-app.vercel.app`

5. **Update Clerk redirect URLs**
   - In Clerk dashboard, add your production URL
   - Update sign-in/sign-up URLs

## Performance Tips

1. **CRDT Batching** - Already optimized to batch updates every 50ms
2. **Code Splitting** - Three.js loads dynamically only when needed
3. **IndexedDB** - Documents persist offline automatically
4. **WebRTC** - Peer-to-peer sync reduces server load

## Architecture Overview

```
┌─────────────┐
│   Browser   │
│             │
│ ┌─────────┐ │
│ │ Editor  │ │ ← TipTap + Yjs
│ └─────────┘ │
│      ↓      │
│ ┌─────────┐ │
│ │IndexedDB│ │ ← Offline storage
│ └─────────┘ │
│      ↓      │
│ ┌─────────┐ │
│ │ WebRTC  │ │ ← P2P sync (20 peers max)
│ └─────────┘ │
│      ↓      │
│ ┌─────────┐ │
│ │WebSocket│ │ ← Fallback sync
│ └─────────┘ │
└─────────────┘
       ↓
┌─────────────┐
│  Supabase   │ ← Document metadata only
└─────────────┘
```

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v3
- **Editor:** TipTap (ProseMirror)
- **CRDTs:** Yjs for conflict-free collaboration
- **Sync:** WebRTC Provider + WebSocket fallback
- **Auth:** Clerk
- **Database:** Supabase (PostgreSQL)
- **3D:** Three.js + React Three Fiber
- **State:** React hooks + Yjs awareness

## Support

If you encounter any issues:

1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure database schema is created
4. Try clearing browser cache
5. Restart the dev server

For persistent issues, check the code or ask for help!
