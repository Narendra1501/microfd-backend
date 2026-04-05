import Chat from '../models/Chat.js';

export const getChats = async (req, res) => {
    try {
        const chats = await Chat.find()
            .populate('sender', 'name role email')
            .sort({ createdAt: 1 }); // Oldest first
        res.status(200).json({ success: true, data: chats });
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const postChat = async (req, res) => {
    const { message } = req.body;
    try {
        if (!message) {
            return res.status(400).json({ success: false, message: 'Message cannot be empty' });
        }
        const newChat = await Chat.create({
            sender: req.user._id,
            senderModel: 'User',
            message
        });

        // Populate sender info for the response
        await newChat.populate('sender', 'name role email');

        res.status(201).json({ success: true, data: newChat });
    } catch (error) {
        console.error('Error posting chat:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const clearChats = async (req, res) => {
    try {
        await Chat.deleteMany({});
        res.status(200).json({ success: true, message: 'All chats cleared successfully.' });
    } catch (error) {
        console.error('Error clearing chats:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
