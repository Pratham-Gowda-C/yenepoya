import app from './app.js';
import { env } from './config/env.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
🌾 ======================================================= 🌾
           AGRIPULSE AI — BACKEND ADVISORY SERVICE         
   Empowering farmers with AI-driven agricultural insights   
🌾 ======================================================= 🌾
🚀 Server running in [${env.NODE_ENV}] mode on port: ${PORT}
📡 API Base URL: http://localhost:${PORT}/api/v1
🩺 Health Check: http://localhost:${PORT}/api/v1/health
🌾 ======================================================= 🌾
  `);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down gracefully.');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Shutting down gracefully.');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
