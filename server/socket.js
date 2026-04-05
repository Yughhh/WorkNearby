const jwt = require('jsonwebtoken');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

const initSocket = (io) => {
  // Auth Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join Private Room
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.userId} joined room: ${conversationId}`);
    });

    // Send Message
    socket.on('send_message', async ({ conversationId, receiverId, content }) => {
      try {
        // Save Message to DB
        const message = new Message({
          conversationId,
          senderId: socket.userId,
          receiverId,
          content
        });
        await message.save();

        // Update Conversation Last Message
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: {
            text: content,
            senderId: socket.userId,
            createdAt: new Date()
          }
        });

        // Emit to the specific conversation room
        io.to(conversationId).emit('receive_message', message);
      } catch (err) {
        console.error('Error sending message:', err);
      }
    });

    // Typing Indicators
    socket.on('typing', ({ conversationId, userName }) => {
      socket.to(conversationId).emit('user_typing', { userName });
    });

    socket.on('stop_typing', ({ conversationId }) => {
      socket.to(conversationId).emit('user_stop_typing');
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};

module.exports = initSocket;
