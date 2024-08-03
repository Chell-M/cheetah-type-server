import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { socketHandler } from './socket.js';
import cors from 'cors'

const expressApp = express();


const appUrl = process.env.APP_URL || "http://localhost:3000";

console.log("App URL for CORS:", appUrl);

expressApp.use(cors({
  origin: appUrl,
  methods: ["GET", "POST"],
  credentials: true,
}));

// Test endpoint
expressApp.get('/test', (req, res) => {
  res.send('Test endpoint is working!');
});

const server = createServer(expressApp)

const io = new Server(server, {
  cors: {
    origin: appUrl,
    methods: ["GET", "POST"],
    credentials: true,
  },
  path: '/socket.io',
});

socketHandler(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

