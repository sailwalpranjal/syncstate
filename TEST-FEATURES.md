# 🧪 Feature Testing Checklist

**Server:** http://localhost:3003

Follow this checklist to verify every feature works.

## ✅ Pre-Flight Check

- [ ] Dev server is running (`npm run dev`)
- [ ] No compilation errors in terminal
- [ ] Browser console has no red errors (F12 → Console)
- [ ] Supabase SQL schema has been run
- [ ] `.env.local` has all required keys

## 🔐 Authentication Flow

### Test 1: Landing Page
1. Go to http://localhost:3003
2. **Expected:**
   - ✅ Gradient "SyncState" title
   - ✅ "Get Started" and "View Dashboard" buttons
   - ✅ Feature grid with 4 cards
   - ✅ Dark mode toggle (sun/moon icon)
   - ✅ Smooth animations
3. **What to check:**
   - No console errors
   - Images load properly
   - Gradients render correctly

### Test 2: Sign Up Flow
1. Click "Get Started" or "Dashboard"
2. You'll be redirected to `/sign-in`
3. Click "Sign up" at the bottom
4. **Expected:**
   - ✅ Clerk sign-up form appears
   - ✅ "Get Started" header with gradient
   - ✅ Email/password fields
5. Fill in:
   - Email: test@example.com
   - Password: TestPassword123!
6. Click "Sign up"
7. **Expected:**
   - ✅ Redirected to `/dashboard`
   - ✅ "My Documents" page appears

### Test 3: Sign Out & Sign In
1. Click your profile icon (top right)
2. Click "Sign out"
3. Click "Dashboard" or go to http://localhost:3003/dashboard
4. You'll be redirected to `/sign-in`
5. **Expected:**
   - ✅ "Welcome Back" header
   - ✅ Email/password fields
6. Sign in with your credentials
7. **Expected:**
   - ✅ Redirected to dashboard
   - ✅ See "My Documents" page

## 📝 Dashboard Features

### Test 4: Dashboard UI
1. Go to http://localhost:3003/dashboard
2. **Expected:**
   - ✅ "My Documents" gradient heading
   - ✅ "New Document" button (top right)
   - ✅ Dark mode toggle
   - ✅ Keyboard shortcuts icon
   - ✅ Grid layout
   - ✅ Gradient background

### Test 5: Create Document
1. Click "New Document" button
2. **Expected:**
   - ✅ Toast notification: "Document created successfully"
   - ✅ New document card appears instantly
   - ✅ Title: "Untitled Document [date]"
   - ✅ Updated time shown
3. **If you see an error:**
   - Check browser console
   - Verify Supabase SQL schema was run
   - Check `.env.local` Supabase keys

### Test 6: Document Card Interactions
1. Hover over a document card
2. **Expected:**
   - ✅ Card scales up slightly
   - ✅ Shadow increases
   - ✅ Two icon buttons appear: GitBranch (purple) and Trash (red)
3. Click the **GitBranch icon**
4. **Expected:**
   - ✅ Opens 3D visualization page
5. Go back to dashboard
6. Click the **Trash icon**
7. **Expected:**
   - ✅ Confirmation dialog appears
   - ✅ After confirming, document disappears
   - ✅ Toast: "Document deleted"

### Test 7: Dark Mode
1. Click the sun/moon icon (top right)
2. **Expected:**
   - ✅ Smooth color transition (0.3s)
   - ✅ All colors invert properly
   - ✅ Gradients adjust for dark mode
   - ✅ No flash or flicker
3. Toggle back
4. **Expected:**
   - ✅ Smooth transition back to light mode

### Test 8: Keyboard Shortcuts (Dashboard)
1. Press `Shift + ?`
2. **Expected:**
   - ✅ Modal appears with title "Keyboard Shortcuts"
   - ✅ Shows "Ctrl+N: New Document"
   - ✅ Shows "Shift+?: Show keyboard shortcuts"
   - ✅ Has close button (X)
3. Press `Esc`
4. **Expected:**
   - ✅ Modal closes
5. Press `Ctrl + N`
6. **Expected:**
   - ✅ New document is created

## ✏️ Editor Features

### Test 9: Open Editor
1. Create a new document
2. Click on the document card (anywhere except icons)
3. **Expected:**
   - ✅ Redirected to `/editor/[id]`
   - ✅ Document title shown at top (editable)
   - ✅ Back arrow button (top left)
   - ✅ "3D Version Tree" button (top right)
   - ✅ Connection status badge
   - ✅ User avatars section
   - ✅ Empty editor area
   - ✅ Keyboard shortcuts icon

### Test 10: Basic Typing
1. Click in the editor area
2. Type: "Hello World"
3. **Expected:**
   - ✅ Text appears as you type
   - ✅ No lag or delay
   - ✅ Cursor blinks normally
4. Wait 3 seconds
5. Refresh the page
6. **Expected:**
   - ✅ Your text is still there (auto-saved)

### Test 11: Floating Toolbar
1. Type some text in the editor
2. Select the text with your mouse (click and drag)
3. **Expected:**
   - ✅ Black toolbar appears ABOVE selection
   - ✅ Contains icons: Bold, Italic, Strikethrough, Code, Highlight, Link
   - ✅ Toolbar follows selection as you adjust it
4. Click **Bold** icon
5. **Expected:**
   - ✅ Text becomes bold
   - ✅ Icon is highlighted in blue
6. Click **Italic** icon
7. **Expected:**
   - ✅ Text becomes italic
   - ✅ Icon highlighted
8. Click **Highlight** icon
9. **Expected:**
   - ✅ Text gets yellow background
10. Click somewhere else (deselect)
11. **Expected:**
    - ✅ Floating toolbar disappears smoothly

### Test 12: Keyboard Shortcuts (Editor)
1. Press `Shift + ?`
2. **Expected:**
   - ✅ Modal shows editor shortcuts
   - ✅ Lists: Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+K, etc.
3. Close modal
4. Type new text
5. Select it
6. Press `Ctrl + B`
7. **Expected:**
   - ✅ Text becomes bold
8. Press `Ctrl + I`
9. **Expected:**
   - ✅ Text becomes italic
10. Press `Ctrl + Z` (undo)
11. **Expected:**
    - ✅ Last action is undone
12. Press `Ctrl + Y` (redo)
13. **Expected:**
    - ✅ Action is redone

### Test 13: Edit Document Title
1. Click on the document title at the top
2. Change it to "My Test Document"
3. Click outside the title field or press Enter
4. **Expected:**
   - ✅ Title updates
   - ✅ "Saving..." appears briefly
   - ✅ Changes persist on refresh

### Test 14: Connection Status
1. Look at the connection status badge (top right)
2. **Expected:**
   - ✅ Shows "Offline" or "Online" with colored dot
   - ✅ Shows "0 peers" if you're alone
   - ✅ Badge is styled and readable

### Test 15: User Presence
1. Note the user avatars section (top right)
2. **Expected:**
   - ✅ Your avatar/name appears
   - ✅ Colored circle with initials or icon

## 🎨 3D Visualization Features

### Test 16: Open 3D Visualization
1. In the editor, click "3D Version Tree" button
2. **Expected:**
   - ✅ Redirected to `/visualization/[id]`
   - ✅ Dark gradient background
   - ✅ 3D sphere appears (may take 1-2 seconds to load)
   - ✅ Version nodes as glowing spheres
   - ✅ Lines connecting nodes (geodesic paths)
   - ✅ Info overlay (top left)
   - ✅ Controls hint (bottom right)

### Test 17: 3D Interactions
1. **Left click + drag**
   - ✅ Camera rotates around the sphere
2. **Scroll wheel**
   - ✅ Camera zooms in/out
3. **Auto-rotation**
   - ✅ Sphere slowly rotates automatically
4. **Hover over a node**
   - ✅ Node lights up brighter
   - ✅ Author name appears above node
5. **Click a node**
   - ✅ Node stays highlighted
   - ✅ Info overlay shows node details

### Test 18: 3D Visualization UI
1. Check the info overlay (top left)
2. **Expected:**
   - ✅ Shows "Version History"
   - ✅ Shows number of versions
   - ✅ Shows selected node info when clicked
3. Check controls hint (bottom right)
4. **Expected:**
   - ✅ Shows control instructions
   - ✅ "Left click + drag: Rotate"
   - ✅ "Scroll: Zoom"
   - ✅ "Click node: Select"

### Test 19: Return to Editor
1. Click the "Back" button or "Open Editor" button
2. **Expected:**
   - ✅ Returns to editor
   - ✅ Your text is still there

## 🌐 Collaboration Features

### Test 20: Multi-Tab Collaboration
1. Open the editor in Tab 1
2. Copy the URL
3. Open a new **Incognito/Private window**
4. Paste the URL and open it
5. Sign in as a **DIFFERENT** user (create new account)
6. **Expected:**
   - ✅ Both tabs show the same document
7. In Tab 1, type "Hello from Tab 1"
8. **Expected in Tab 2:**
   - ✅ Text appears in real-time
   - ✅ Other user's cursor appears with their name
   - ✅ Connection status shows "1 peer"
9. In Tab 2, type " - Response from Tab 2"
10. **Expected in Tab 1:**
    - ✅ Text appears in real-time
    - ✅ Cursor tracking works
11. **Expected in both tabs:**
    - ✅ User avatars show both users
    - ✅ Connection status shows "1 peer"

### Test 21: Cursor Tracking
1. With two tabs open (different users)
2. In Tab 1, move your cursor around while typing
3. **Expected in Tab 2:**
   - ✅ See other user's cursor position
   - ✅ Cursor has a label with user's name
   - ✅ Cursor is colored
   - ✅ Cursor moves smoothly

### Test 22: Offline Mode
1. Open a document in editor
2. Type some text
3. Disconnect your internet (Wi-Fi off or unplug Ethernet)
4. **Expected:**
   - ✅ Connection status changes to "Offline"
5. Keep typing
6. **Expected:**
   - ✅ You can still type normally
   - ✅ Changes are saved locally (IndexedDB)
7. Reconnect to internet
8. **Expected:**
   - ✅ Connection status changes to "Online"
   - ✅ Changes sync automatically
   - ✅ No data loss

## 🎯 Advanced Features

### Test 23: Formatting Options
1. In editor, type a paragraph
2. Select some words
3. Use floating toolbar to:
   - ✅ Make text **bold**
   - ✅ Make text *italic*
   - ✅ Add ~~strikethrough~~
   - ✅ Add `inline code`
   - ✅ Add ==highlight==
4. Click **Link** icon
5. Enter URL: https://example.com
6. **Expected:**
   - ✅ Text becomes blue and underlined
   - ✅ Clicking it (Ctrl+click) opens link

### Test 24: Rich Text Features
1. Type some text
2. Press `Ctrl + Shift + H` (highlight)
3. **Expected:**
   - ✅ Text gets highlighted
4. Type a new line
5. Type some text and press `Ctrl + E` (code)
6. **Expected:**
   - ✅ Text gets monospace font and background

### Test 25: Document List Management
1. Go back to dashboard
2. Create 5 documents
3. **Expected:**
   - ✅ All appear in grid layout
   - ✅ Most recent at the top
   - ✅ Each shows updated time
4. Delete 2 documents
5. **Expected:**
   - ✅ Grid adjusts automatically
   - ✅ Remaining documents stay in place

## 🚨 Error Handling

### Test 26: Empty State
1. Delete all documents
2. **Expected:**
   - ✅ Shows empty state with icon
   - ✅ "No documents yet" message
   - ✅ "Create Document" button

### Test 27: Loading States
1. Refresh dashboard
2. **Expected:**
   - ✅ Skeleton loaders appear
   - ✅ 6 gray rectangles pulsing
3. Wait for load
4. **Expected:**
   - ✅ Skeletons replaced with actual documents

### Test 28: Toast Notifications
1. Create a document
2. **Expected:**
   - ✅ Green toast appears: "Document created successfully"
   - ✅ Toast auto-dismisses after 4 seconds
3. Delete a document
4. **Expected:**
   - ✅ Toast appears: "Document deleted"

## ✅ Final Checklist

After completing all tests above, verify:

- [ ] Can sign in/sign up
- [ ] Can create documents
- [ ] Can delete documents
- [ ] Can open editor and type
- [ ] Floating toolbar appears on selection
- [ ] Can format text (bold, italic, etc.)
- [ ] Keyboard shortcuts work (Shift+?, Ctrl+B, etc.)
- [ ] Can view 3D visualization
- [ ] 3D visualization is interactive
- [ ] Can edit document title
- [ ] Dark mode toggle works
- [ ] Two tabs can collaborate in real-time
- [ ] Cursor tracking works
- [ ] Offline mode works
- [ ] Changes auto-save
- [ ] Toast notifications appear
- [ ] No console errors

## 🐛 Common Issues

### Issue: "Cannot create document"
- **Fix:** Run `supabase-schema.sql` in Supabase SQL Editor
- **Verify:** Check browser console for 404 or 401 errors

### Issue: Floating toolbar doesn't appear
- **Fix:** Hard refresh (Ctrl+Shift+R)
- **Verify:** Check console for TipTap errors

### Issue: 3D visualization is black
- **Fix:** Clear cache and hard refresh
- **Verify:** Check console for Three.js errors

### Issue: Real-time sync doesn't work
- **Check:** Connection status badge
- **Verify:** WebRTC signaling server is accessible
- **Fix:** Try WebSocket fallback (automatic)

### Issue: "Hoisting error" still appears
- **Fix:** Restart dev server (`Ctrl+C` then `npm run dev`)
- **Verify:** No TypeScript errors during compilation

## 📊 Success Criteria

**Your app is fully functional if:**

✅ ALL 28 tests pass
✅ NO console errors
✅ Real-time collaboration works between tabs
✅ All features respond instantly
✅ Dark mode is smooth
✅ 3D visualization loads and is interactive
✅ Offline mode works properly

**If you can check all boxes above, congratulations! SyncState is production-ready!** 🎉

---

**Test Date:** _________
**Tester:** _________
**Result:** PASS ✅ / FAIL ❌
**Notes:** _________
