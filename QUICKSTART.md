# 🚀 Get SyncState Running in 5 Minutes

## ⚡ What You Need RIGHT NOW

1. **Supabase Database Setup** (THIS IS CRITICAL - most errors come from skipping this!)
2. **Clerk Auth Setup**
3. **Environment Variables**

## Step 1: Supabase Database (REQUIRED!)

### Why you're seeing errors:
The "Create Document" button doesn't work because the database tables don't exist yet!

### Fix it now:

1. Go to https://supabase.com and sign in
2. Open your project: `adiigpukhrfkshizkbig`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy EVERYTHING from `supabase-schema.sql` file in this project
6. Paste it into the SQL Editor
7. Click **RUN** (or press Ctrl+Enter)

You should see: ✅ Success. No rows returned

That's it! Your database is ready!

## Step 2: Clerk Auth (REQUIRED!)

Your Clerk keys are already in `.env.local`, but you need to configure redirect URLs:

1. Go to https://clerk.com and sign into your dashboard
2. Select your application
3. Go to **Paths** in the left sidebar
4. Set these URLs:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/dashboard`
   - Home URL: `/`

5. Click **Save**

## Step 3: Run the App

```bash
npm run dev
```

Visit: http://localhost:3000

## ✅ Testing Your Setup

### Test 1: Landing Page
- Go to http://localhost:3000
- You should see "SyncState" with gradient text
- **IF NOT**: Check browser console for errors

### Test 2: Sign In
- Click "Get Started" or "Dashboard"
- You should see Clerk's sign-in page
- **IF NOT**: Check Clerk keys in `.env.local`

### Test 3: Sign Up
- Create a new account with email
- You should be redirected to `/dashboard`
- **IF NOT**: Check Clerk redirect URLs

### Test 4: Create Document
- Click "New Document" button
- A document should appear in the list
- **IF NOT**: Check Step 1 - did you run the SQL?

### Test 5: Editor
- Click on a document
- You should see the editor with toolbar
- **IF NOT**: Check browser console

### Test 6: 3D Visualization
- In the editor, click "3D Version Tree"
- You should see a 3D sphere with version nodes
- **IF NOT**: Hard refresh (Ctrl+Shift+R)

### Test 7: Floating Toolbar
- In the editor, type some text
- Select the text with your mouse
- A black toolbar should appear above the selection
- **IF NOT**: Check browser console for errors

### Test 8: Keyboard Shortcuts
- In the editor or dashboard, press **Shift+?**
- A modal should appear showing keyboard shortcuts
- **IF NOT**: Check browser console

## 🐛 Common Errors & Fixes

### Error: "Cannot create document" / Button does nothing

**Cause:** Database tables don't exist

**Fix:**
1. Go to Supabase → SQL Editor
2. Run `supabase-schema.sql`
3. Refresh the page
4. Try again

### Error: Redirect loop / Can't sign in

**Cause:** Clerk configuration incorrect

**Fix:**
1. Check `.env.local` has correct Clerk keys
2. Go to Clerk dashboard → Paths
3. Set all redirect URLs as shown in Step 2
4. Restart dev server

### Error: Editor doesn't load / Spinning forever

**Cause:** Yjs providers not initializing

**Fix:**
1. Check browser console (F12)
2. Look for red errors
3. Most common: missing environment variables
4. Verify `NEXT_PUBLIC_YJS_SIGNALING_SERVER=wss://signaling.yjs.dev`

### Error: 3D visualization is black screen

**Cause:** Three.js loading issue

**Fix:**
1. Hard refresh: Ctrl+Shift+R
2. Clear browser cache
3. Try different browser (Chrome/Edge recommended)

### Error: "Connection failed" status

**Cause:** Normal if you're alone

**Fix:**
1. This is normal if you're the only user
2. Open the same document in incognito mode
3. Sign in as a different user
4. You should see connection status change

## 🎯 What Features Should Work

After setup, these features should ALL work:

✅ Sign in / Sign up
✅ Create new documents
✅ Delete documents
✅ Open documents in editor
✅ Type and format text
✅ See floating toolbar on text selection
✅ Press Shift+? for keyboard shortcuts
✅ Click "3D Version Tree" to see visualization
✅ Toggle dark/light mode
✅ Edit document title (click the title to edit)
✅ See connection status indicator

## 🔥 Advanced: Test Collaboration

### Test Real-Time Collaboration:

1. Open document in Chrome
2. Copy the URL
3. Open same URL in Chrome Incognito
4. Sign in as DIFFERENT user in incognito
5. Type in one window
6. See changes appear in other window
7. See other user's cursor with their name

This tests:
- WebRTC peer connection
- Yjs CRDT synchronization
- User presence/awareness
- Cursor tracking

## 📊 What To Expect

### Dashboard:
- Grid of document cards
- "New Document" button (top right)
- Dark mode toggle
- Theme automatically saves

### Editor:
- Rich text toolbar at top
- Floating toolbar on text selection
- User avatars (top right)
- Connection status badge
- Document title (editable)
- "3D Version Tree" button

### 3D Visualization:
- Interactive 3D sphere
- Version nodes as glowing spheres
- Geodesic curves connecting versions
- Auto-rotation
- Mouse controls (drag to rotate)
- Info overlay (top left)

## 🆘 Still Not Working?

Check the browser console (F12 → Console tab) and look for red errors.

Common issues:
1. **401 Unauthorized** → Check Supabase keys
2. **404 Not Found** → Check table names match schema
3. **Clerk redirect error** → Check Clerk paths configuration
4. **CORS error** → Restart dev server
5. **Module not found** → Run `npm install --legacy-peer-deps`

If you see specific errors, they'll point you to the problem!

## 🎉 Success Checklist

- ✅ Can sign in/sign up
- ✅ Can create documents
- ✅ Can open editor
- ✅ Can type and format text
- ✅ Floating toolbar appears on selection
- ✅ Can view 3D visualization
- ✅ Keyboard shortcuts work (Shift+?)
- ✅ Dark mode toggle works
- ✅ No console errors

**If all of the above work, congratulations! Your SyncState is fully functional!** 🎊

## 🚀 Next Steps

- Open a document in two tabs and watch real-time sync
- Try going offline and back online
- Explore the 3D version tree
- Test keyboard shortcuts (Ctrl+B for bold, etc.)
- Share a document URL with a friend

Need more help? Check **SETUP.md** for detailed troubleshooting!
