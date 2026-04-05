const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Application = require('../models/Application');

// Get all conversations for a user
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate('participants', 'name email role')
    .sort({ 'lastMessage.createdAt': -1 });

    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get messages for a specific conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // Verify participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view these messages' });
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 }); // Oldest first

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Start or Get Conversation (Strict Access Control)
exports.startConversation = async (req, res) => {
  try {
    const { receiverId, applicationId } = req.body;

    // Check if an application exists between these two and is ACCEPTED
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.status !== 'Accepted') {
      return res.status(403).json({ message: 'Chat is only enabled after application acceptance.' });
    }

    // Verify participants match application
    const isParticipant = (req.user.id === application.freelancerId.toString() && receiverId === application.clientId.toString()) ||
                          (req.user.id === application.clientId.toString() && receiverId === application.freelancerId.toString());

    if (!isParticipant) {
      return res.status(403).json({ message: 'Unauthorized participants for this chat' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, receiverId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user.id, receiverId],
        lastMessage: { text: 'New chat started', senderId: req.user.id }
      });
      await conversation.save();
    }

    res.json(conversation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
