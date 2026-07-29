import { clearAllChats, createChat, listChats } from '../utils/dbStore.js';

const formatChat = (chat) => {
    if (!chat) return null;
    let senderObj = chat.sender;
    if (senderObj && typeof senderObj === 'object') {
        senderObj = { ...senderObj, _id: senderObj.id };
    }
    return {
        ...chat,
        _id: chat.id,
        sender: senderObj,
        createdAt: chat.createdAt ?? chat.created_at
    };
};

export const getChats = async (req, res) => {
    try {
        const chats = listChats().sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
        const formatted = (chats || []).map(formatChat);
        res.status(200).json({ success: true, data: formatted });
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

        const senderId = req.user.id || req.user._id;
        const newChat = createChat({
            sender: senderId,
            sender_id: senderId,
            senderModel: 'User',
            message,
            created_at: new Date().toISOString()
        });

        res.status(201).json({ success: true, data: formatChat(newChat) });
    } catch (error) {
        console.error('Error posting chat:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const clearChats = async (req, res) => {
    try {
        clearAllChats();
        res.status(200).json({ success: true, message: 'All chats cleared successfully.' });
    } catch (error) {
        console.error('Error clearing chats:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
