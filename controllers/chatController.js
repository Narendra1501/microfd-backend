import supabase from '../config/supabase.js';

const formatChat = (chat) => {
    if (!chat) return null;
    let senderObj = chat.sender;
    if (senderObj && typeof senderObj === 'object') {
        senderObj = {
            ...senderObj,
            _id: senderObj.id
        };
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
        const { data: chats, error } = await supabase
            .from('chats')
            .select('*, sender:users(id, name, role, email)')
            .order('created_at', { ascending: true }); // Oldest first

        if (error) {
            console.error('Error fetching chats from Supabase:', error);
            return res.status(500).json({ success: false, message: 'Server Error' });
        }

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

        const { data: newChat, error } = await supabase
            .from('chats')
            .insert([{
                sender: senderId,
                sender_id: senderId,
                senderModel: 'User',
                message,
                created_at: new Date().toISOString()
            }])
            .select('*, sender:users(id, name, role, email)')
            .single();

        if (error) {
            console.error('Error creating chat in Supabase:', error);
            return res.status(500).json({ success: false, message: 'Server Error' });
        }

        res.status(201).json({ success: true, data: formatChat(newChat) });
    } catch (error) {
        console.error('Error posting chat:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const clearChats = async (req, res) => {
    try {
        await supabase.from('chats').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        res.status(200).json({ success: true, message: 'All chats cleared successfully.' });
    } catch (error) {
        console.error('Error clearing chats:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
