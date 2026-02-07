# SyncState

A production-grade, offline-first collaborative document editor powered by CRDTs (Conflict-free Replicated Data Types). Write together in real-time, even when offline, with a beautiful and responsive interface.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up your .env.local with Supabase and Clerk keys
# Copy .env.example to .env.local and fill in your credentials

# 3. Run the Supabase schema
# Copy supabase-schema.sql into Supabase SQL Editor and execute

# 4. (Optional) Enable version history
# Copy supabase-versions-table.sql into Supabase SQL Editor and execute

# 5. Start the dev server
npm run dev
```

Then visit `http://localhost:3000` and start collaborating!

## ✨ Features

### Core Collaboration
- **Real-Time Collaboration**: See edits and cursors from other users instantly with color-coded presence
- **Offline-First**: Keep working without internet, auto-sync when back online via IndexedDB persistence
- **CRDT-Powered**: Automatic conflict resolution using Yjs - no merge conflicts ever
- **Rich Text Editing**: Full-featured TipTap editor with comprehensive formatting options
- **WebRTC P2P**: Direct peer-to-peer synchronization for ultra-low latency
- **User Presence**: Real-time indicators showing who's actively editing with colored cursors

### Rich Text Editor Features
- **Text Formatting**: Bold, Italic, Underline, Strikethrough
- **Headings**: H1, H2, H3 with proper hierarchy
- **Text Colors**: 7-color palette for text customization
- **Highlighting**: 6 pastel highlight colors
- **Text Alignment**: Left, Center, Right, Justify
- **Lists**: Bulleted and numbered lists
- **Code Blocks**: Syntax highlighting with Lowlight
- **Tables**: Resizable tables with header rows
- **Images**: Inline images with Base64 support
- **Links**: Interactive hyperlinks
- **Blockquotes**: Styled quote blocks
- **Floating Toolbar**: Context-aware toolbar that appears on text selection (draggable!)
- **Sticky Main Toolbar**: Toolbar stays visible while scrolling

### User Experience
- **Beautiful UI**: Professional design system with smooth animations and transitions (Framer Motion)
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Dark/Light Mode**: Full theme support with smooth transitions
- **Document Management**: Create, search, view, and delete documents with intuitive interface
- **Export Options**: Export documents as PDF, HTML, Markdown, or Plain Text
- **Custom Document Names**: Name your documents with helpful suggestions
- **Grid & List Views**: Toggle between grid and list layouts for document browsing
- **Keyboard Shortcuts**: Comprehensive keyboard shortcuts for power users

### Advanced Features
- **Version History**: Automatic versioning with 3D visualization (geodesic paths)
- **Connection Status**: Real-time P2P connection and peer count indicators
- **Active Users Display**: See who's currently editing the document
- **Auto-Save**: Automatic saving with visual feedback
- **Professional Landing Page**: Stunning hero section with feature highlights

### Landing Page
<!-- ![Landing Page](screenshots/landing.png) -->
_Beautiful hero section with feature highlights and call-to-action_

### Dashboard
<!-- ![Dashboard](screenshots/dashboard.png) -->
_Grid and list views for document management with search and filters_

### Collaborative Editor
<!-- ![Editor](screenshots/editor.png) -->
_Rich text editor with real-time collaboration and user presence_

### Floating Toolbar
<!-- ![Floating Toolbar](screenshots/toolbar.png) -->
_Context-aware toolbar with draggable functionality_

### Version Visualization
<!-- ![Version History](screenshots/versions.png) -->
_3D geodesic visualization of document version history_

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router with Turbopack), React 19, TypeScript
- **CRDT Engine**: Yjs with WebRTC and IndexedDB providers for offline-first sync
- **Rich Text Editor**: TipTap v2.10.3 with collaboration extensions
- **Authentication**: Clerk (secure user management)
- **Database**: Supabase PostgreSQL (metadata only, not document content)
- **Styling**: Tailwind CSS v3 with custom design tokens
- **Animations**: Framer Motion for smooth transitions and interactions
- **3D Visualization**: Three.js, @react-three/fiber, @react-three/drei
- **Export**: jsPDF + html2canvas for document export
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project
- A Clerk account and application

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd syncstate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```bash
   # Supabase (for user metadata only)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # Yjs Signaling Server
   NEXT_PUBLIC_YJS_SIGNALING_SERVER=wss://signaling.yjs.dev
   ```

4. **Set up Supabase database**

   Run these SQL scripts in your Supabase SQL Editor (in order):

   a. **Main schema** - Creates tables and disables RLS for Clerk compatibility:
   ```bash
   # Copy contents of supabase-schema.sql and execute
   ```

   b. **Version tracking** (Optional) - Adds version history support:
   ```bash
   # Copy contents of supabase-disable-rls-versions.sql and execute
   ```

   **Important**: This app uses Clerk for authentication, not Supabase Auth. The RLS (Row Level Security) policies are disabled to ensure compatibility with Clerk's JWT structure.

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the application.

### Building for Production

```bash
npm run build
npm start
```

## How It Works

### Architecture

SyncState uses a distributed architecture where document content is stored entirely on the client using CRDTs:

1. **Document Storage**:
   - Content: Stored in browser IndexedDB via Yjs
   - Metadata: Stored in Supabase (title, owner, permissions)

2. **Synchronization**:
   - Primary: WebRTC peer-to-peer (up to 20 simultaneous peers)
   - Fallback: WebSocket via signaling server
   - Offline: Changes saved locally, synced when online

3. **Conflict Resolution**:
   - Automatic via Yjs CRDT operations
   - No manual merge conflicts
   - Last-write-wins for simple properties

### Key Components

- **Yjs Provider** (`lib/yjs/provider.ts`): Manages CRDT document and synchronization
- **Collaborative Editor** (`components/editor/CollaborativeEditor.tsx`): TipTap editor with Yjs bindings
- **Presence System** (`lib/yjs/awareness.ts`): User cursors and activity indicators
- **Hooks**: React hooks for document state, collaboration, and presence

## Project Structure

```
syncstate/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Document list
│   │   ├── editor/[id]/        # Collaborative editor
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── editor/             # Editor components
│   │   ├── dashboard/          # Dashboard components
│   │   └── ui/                 # Reusable UI components
│   ├── lib/
│   │   ├── yjs/                # CRDT infrastructure
│   │   ├── supabase/           # Database client
│   │   └── utils/              # Utility functions
│   ├── hooks/                  # React hooks
│   ├── stores/                 # State management
│   └── types/                  # TypeScript types
├── public/                     # Static assets
└── supabase-schema.sql         # Database schema
```

## Development

### Code Quality

- TypeScript strict mode enabled
- ESLint for code linting
- Prettier for code formatting (recommended)
- Follows Vercel React best practices

### Performance Targets

- Lighthouse score: 95+ on all metrics
- CRDT operation latency: <1ms
- WebRTC connection time: <500ms
- Bundle size: <300KB initial load

## 🗺️ Roadmap

### ✅ Completed
- [x] Real-time collaborative editing with TipTap
- [x] User presence with colored cursors
- [x] Offline-first architecture (IndexedDB persistence)
- [x] Complete document management (CRUD operations)
- [x] Beautiful responsive UI with animations
- [x] Dark/light mode toggle
- [x] Version history and auto-versioning
- [x] 3D version tree visualization with geodesic paths
- [x] Export to PDF, HTML, Markdown, and Plain Text
- [x] Keyboard shortcuts system
- [x] Search and filter documents
- [x] Grid and list view modes
- [x] Custom document naming with modal
- [x] Professional landing page
- [x] Complete text formatting (Bold, Italic, Underline, Strikethrough)
- [x] Text color picker with 7 colors
- [x] Text highlighting with 6 pastel colors
- [x] Text alignment (Left, Center, Right, Justify)
- [x] Draggable floating toolbar
- [x] Sticky main toolbar on scroll
- [x] Mobile responsive design
- [x] Document templates

### 🚧 Future Enhancements
- [ ] Comment and annotation system
- [ ] Inline commenting on text selections
- [ ] @mention notifications

- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Document sharing via public links
- [ ] Advanced permissions management
- [ ] Document folders and organization
- [ ] Full-text search across all documents

## Troubleshooting

### Common Issues

**WebSocket Connection Errors**
```
WebSocket connection to 'wss://signaling.yjs.dev/' failed
```
- These are harmless! The app works in offline-first mode
- The public signaling server may be rate-limiting connections
- For production, set up your own Y.js signaling server
- Filter console: Type `-websocket` in DevTools console filter

**Supabase 401/406 Errors on document_versions**
- Make sure you ran `supabase-disable-rls-versions.sql` to disable RLS
- Verify RLS is disabled: Run `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'document_versions';`
- Result should show `rowsecurity = false`

**Text Not Showing in PDF Exports**
- Already fixed! PDF exports now force black text on white background
- If issues persist, check browser console for html2canvas errors

**Color Picker Not Working**
- Fixed in latest version with proper fixed positioning
- Clear browser cache and reload if using older version

**App Keeps Rebuilding (Fast Refresh)**
- React Strict Mode is disabled to prevent Yjs duplicate room errors
- This is intentional for Yjs compatibility

### Getting Help

If you encounter issues:
1. Check the browser console for specific error messages
2. Verify all environment variables are set correctly
3. Ensure Supabase tables are created with RLS disabled
4. Try clearing IndexedDB: DevTools → Application → IndexedDB → Delete

## Deployment

### Deploying to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Import your GitHub repository in Vercel
   - Add environment variables in Vercel dashboard
   - Deploy!

3. **Set up Production Signaling Server** (Recommended)
   ```bash
   # Install y-websocket globally or in a separate project
   npm install -g y-websocket

   # Run signaling server (deploy to Railway, Render, or Fly.io)
   HOST=0.0.0.0 PORT=4444 npx y-websocket

   # Update your Vercel environment variable:
   NEXT_PUBLIC_YJS_SIGNALING_SERVER=wss://your-signaling-server.com
   ```

### Environment Variables for Production

Make sure to set these in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_YJS_SIGNALING_SERVER` (use your own for production)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning or production.

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Yjs](https://yjs.dev/)
- [TipTap](https://tiptap.dev/)
- [Clerk](https://clerk.com/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Note**: This is a demonstration project showcasing CRDT-based collaboration. For production use, consider adding:
- End-to-end encryption
- Rate limiting
- Advanced access controls
- Monitoring and analytics
- Backup and disaster recovery

## 👤 Author

**Pranjal Sailwal**

Built with passion to demonstrate the power of CRDTs and offline-first architecture in collaborative applications.

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

© 2026 Pranjal Sailwal • Licensed under MIT
