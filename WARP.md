# Astra - Architecture Notes

## Renderer: React + Vite

- **Entry HTML**: `index.html`
- **React mount point**: `#root` div element
- **Renderer entry**: `src/renderer.tsx`
- **Root component**: `src/App.tsx`
- **Components directory**: `src/components/`

### Configuration

- Vite is configured with `@vitejs/plugin-react` in `vite.renderer.config.ts`
- TypeScript uses `"jsx": "react-jsx"` (modern JSX transform) in `tsconfig.json`
- Module resolution set to `"bundler"` for optimal Vite compatibility

### Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite 5
- **Desktop Framework**: Electron 39
- **Language**: TypeScript
- **Package Manager**: pnpm
