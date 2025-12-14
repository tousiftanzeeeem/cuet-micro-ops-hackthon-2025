# Delineate React Frontend

This is the React frontend for the Delineate Download Manager, implementing a hybrid WebSocket/Polling architecture.

## Features

- 🚀 **Smart Protocol Selection** - Automatically chooses WebSocket or Polling based on job size
- ⚡ **Real-time Updates** - WebSocket for fast jobs (<60s) with 60fps updates
- 🔄 **Automatic Fallback** - Seamlessly switches to Polling if WebSocket fails
- 🛡️ **Proxy-Friendly** - Works with Cloudflare, nginx, and other proxies
- 📱 **Responsive Design** - Beautiful UI with Tailwind CSS
- 🎯 **TypeScript** - Fully typed for better developer experience

## Architecture

The frontend implements the architecture described in `ARCHITECTURE.md`:

1. **Negotiation Phase** - Calls `/v1/download/estimate` to get recommended mode
2. **WebSocket Mode** - Opens WS connection for real-time progress updates
3. **Polling Mode** - Polls `/v1/download/status/:jobId` every 3 seconds
4. **Automatic Fallback** - Switches to polling if WebSocket times out (90s) or fails
5. **Download Trigger** - Uses native browser download via `<a>` tag click

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
cd client
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

The Vite dev server is configured to proxy API requests to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── FileSelector.tsx      # File selection UI
│   │   └── DownloadProgress.tsx  # Progress display
│   ├── hooks/
│   │   └── useDownload.ts        # Main download hook with hybrid logic
│   ├── services/
│   │   └── api.ts                # API client (axios + WebSocket)
│   ├── types/
│   │   └── download.ts           # TypeScript types
│   ├── App.tsx                   # Main app component
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles (Tailwind)
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Key Components

### `useDownload` Hook

The core hook that manages the download lifecycle:

- Calls `/v1/download/estimate` to get mode (WebSocket or Polling)
- Opens WebSocket connection for fast jobs
- Starts polling for long jobs
- Implements 90s WebSocket timeout with automatic fallback
- Triggers native browser download when complete

### API Service

Handles all backend communication:

- `estimate(fileIds)` - Get job estimate and recommended mode
- `initiate(jobId)` - Start download job (for Polling mode)
- `getStatus(jobId)` - Check job status (for Polling mode)
- `createWebSocket(jobId)` - Create WebSocket connection

## Environment Variables

Create a `.env` file:

```bash
# Optional - defaults to /v1 (proxied by Vite dev server)
VITE_API_BASE_URL=http://localhost:3000/v1

# Optional - defaults to localhost:3000
VITE_WS_HOST=localhost:3000
```

## API Integration

The frontend expects these backend endpoints:

- `POST /v1/download/estimate` - Get job estimate
- `POST /v1/download/initiate` - Start download job
- `GET /v1/download/status/:jobId` - Get job status
- `WS /v1/download/ws?jobId=xxx` - WebSocket connection

## Deployment

### With Docker

The project includes Dockerfile configurations. To deploy with the backend:

```bash
cd ..
docker compose -f docker/compose.prod.yml up -d
```

### Standalone

Build and serve the static files:

```bash
npm run build
# Serve the dist folder with any static file server
npx serve -s dist -p 5173
```

## Development Tips

### Running with Backend

1. Start the backend API:

   ```bash
   cd ..
   npm run docker:dev
   ```

2. Start the frontend:

   ```bash
   cd client
   npm run dev
   ```

3. Access the app at `http://localhost:5173`

### Testing WebSocket Fallback

The WebSocket timeout is set to 90 seconds. To test fallback:

1. Start a download with large files
2. Wait for WebSocket to timeout
3. Observe automatic switch to Polling mode in console

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **WebSocket API** - Real-time communication

## License

MIT
