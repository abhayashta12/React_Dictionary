# React Dictionary

A comprehensive dictionary app for React terms and concepts, with fuzzy search, bookmarking, and dark mode.

## Features

- **Search React Terms**: Instantly find definitions for React-related terms and concepts
- **Fuzzy Search**: Find terms even with typos using Fuse.js
- **Smart Caching**: API responses are cached both in-memory and in IndexedDB
- **Dark Mode**: Toggle between light and dark themes with automatic persistence
- **Bookmarks**: Save your favorite terms for quick reference
- **Voice Search**: Use your microphone to search for terms (where supported)
- **Term Suggestions**: Suggest missing terms for addition to the dictionary
- **Admin Panel**: Review and moderate user-suggested terms
- **Preloading Script**: Bulk-generate definitions for common React terms

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **API**: Express.js server with OpenAI integration
- **Storage**: IndexedDB for client-side storage
- **Search**: Fuse.js for fuzzy searching
- **Syntax Highlighting**: react-syntax-highlighter for code examples

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and add your OpenAI API key
3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

## API

The application provides two main API endpoints:

- `GET /api/define?term={term}` - Retrieves the definition for a given term
- `POST /api/suggest` - Allows users to suggest new terms

## Preloading Terms

To preload the dictionary with common React terms:

```bash
npm run preload
```

This script will generate definitions for the predefined list of React terms and save them to `src/data/terms.json`.

## Project Structure

```
react-dictionary/
├── src/
│   ├── components/        # Reusable UI components
│   ├── lib/               # Utility functions and API clients
│   ├── pages/             # Page components
│   ├── server/            # Express server implementation
│   ├── data/              # Static data files
│   ├── types/             # TypeScript type definitions
├── scripts/               # Utility scripts
├── public/                # Static assets
```

## License

MIT