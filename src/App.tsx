import Hello from './components/Hello'

export default function App() {
  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>💖 React + Electron + Vite (Astra)</h1>
      <p>If you can see this, React is running in the renderer.</p>
      <Hello name="Astra" />
    </main>
  )
}
