# SyncState

An offline-first collaborative document editor powered by CRDTs (Conflict-free Replicated Data Types). Write together in real-time, even when offline.

## 🚀 Quick Start

**Want to get started immediately?** Follow our detailed **[SETUP.md](./SETUP.md)** guide!

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Set up your .env.local with Supabase and Clerk keys
# See SETUP.md for detailed instructions

# 3. Run the Supabase schema
# Copy supabase-schema.sql into Supabase SQL Editor and run

# 4. Start the dev server
npm run dev
```

Then visit `http://localhost:3000` and start collaborating!

## Features

- **Real-Time Collaboration**: See edits and cursors from other users instantly
- **Offline-First**: Keep working without internet, auto-sync when back online
- **CRDT-Powered**: Automatic conflict resolution using Yjs
- **Rich Text Editing**: Full-featured editor with formatting, lists, and more
- **WebRTC P2P**: Direct peer-to-peer synchronization for low latency
- **User Presence**: Visual indicators showing who's actively editing

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **CRDT Engine**: Yjs with WebRTC and IndexedDB providers
- **Editor**: TipTap with collaboration extensions
- **Authentication**: Clerk
- **Database**: Supabase (metadata only, not document content)
- **Styling**: Tailwind CSS v3
- **State Management**: Zustand
- **3D Visualization**: Three.js, @react-three/fiber (planned)

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

   Run the SQL schema in your Supabase SQL editor:
   ```bash
   # Copy contents of supabase-schema.sql and run in Supabase SQL Editor
   ```

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

## Roadmap

- [x] Basic collaborative editing
- [x] User presence and cursors
- [x] Offline-first architecture
- [x] Document management
- [ ] WebSocket fallback implementation
- [ ] 3D version tree visualization
- [ ] Dark/light mode toggle
- [ ] Comment system
- [ ] Version history and restore
- [ ] Export to PDF/Markdown
- [ ] Mobile app (React Native)

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
