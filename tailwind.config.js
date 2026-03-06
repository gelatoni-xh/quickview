export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0e1a',
          surface: '#0f1629',
          border: '#1e3a5f',
          accent: '#00d4ff',
          accent2: '#7c3aed',
          text: '#e2e8f0',
          muted: '#64748b',
        }
      },
      boxShadow: {
        'cyber': '0 0 15px rgba(0, 212, 255, 0.15)',
        'cyber-sm': '0 0 8px rgba(0, 212, 255, 0.1)',
      }
    }
  },
  plugins: []
}
