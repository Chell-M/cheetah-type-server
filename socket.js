export const socketHandler = (io) => {
  const rooms = {};

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    const joinRoom = (roomId) => {
      socket.join(roomId);
      if (!rooms[roomId]) {
        rooms[roomId] = { players: [], ready: {} };
      }
      if (!rooms[roomId].players.includes(socket.id)) {
        rooms[roomId].players.push(socket.id);
      }
      io.to(roomId).emit("updatePlayers", rooms[roomId].players);
      console.log(`Current players in room ${roomId}:`, rooms[roomId].players);
    };

    const readyUp = (roomId) => {
      if (!rooms[roomId]) return;
      rooms[roomId].ready[socket.id] = true;
      console.log(`User ${socket.id} is ready in room ${roomId}`);

      if (Object.keys(rooms[roomId].ready).length === 2) {
        console.log(`Both players ready in room ${roomId}. Starting countdown.`);
        io.to(roomId).emit("playersReady");

        setTimeout(() => {
          io.to(roomId).emit("startCountdown");
          setTimeout(() => {
            io.to(roomId).emit("startRace");
            console.log(`Players have begun racing in room ${roomId}`);
          }, 5000); // Countdown duration
        }, 1000); // Short delay before starting the countdown
      }
    };

    const handleProgress = (data) => {
      const { playerId, progress, room } = data;
      console.log(`Progress from Player ID ${playerId} in room: ${room}: progress: ${progress}`);
      io.to(room).emit("progressUpdate", { playerId, progress });
    };

    const handleDisconnect = () => {
      console.log(`User disconnected: ${socket.id}`);

      for (const roomId in rooms) {
        const room = rooms[roomId];
        room.players = room.players.filter((id) => id !== socket.id);
        delete room.ready[socket.id];
        io.to(roomId).emit("updatePlayers", room.players);

        console.log(`Current players in room ${roomId}:`, rooms[roomId].players);

        if (room.players.length === 0) {
          delete rooms[roomId];
          console.log(`Room ${roomId} deleted.`);
        }
      }
    };

    socket.on("joinRoom", joinRoom);
    socket.on("readyUp", readyUp);
    socket.on("progress", handleProgress);
    socket.on("disconnect", handleDisconnect);
  });
};
