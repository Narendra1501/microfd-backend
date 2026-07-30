import supabase from '../config/supabase.js';

const formatNotification = (notif) => {
    if (!notif) return null;
    return {
        ...notif,
        _id: notif.id,
        user: notif.user ?? notif.user_id,
        isRead: notif.isRead ?? notif.is_read ?? false,
        createdAt: notif.createdAt ?? notif.created_at
    };
};

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        const { data: notifications, error } = await supabase
            .from('notifications')
            .select('*')
            .or(`user.eq.${userId},user_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching notifications:', error);
            return res.status(500).json({ success: false, message: 'Server Error' });
        }

        const formatted = (notifications || []).map(formatNotification);
        res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        const { data: notification, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('id', req.params.id)
            .maybeSingle();

        if (error || !notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        const notifUser = notification.user ?? notification.user_id;
        if (String(notifUser) !== String(userId)) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const { data: updated, error: updateErr } = await supabase
            .from('notifications')
            .update({ isRead: true, is_read: true })
            .eq('id', req.params.id)
            .select()
            .single();

        if (updateErr) {
            return res.status(500).json({ success: false, message: updateErr.message });
        }

        res.status(200).json({ success: true, data: formatNotification(updated) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const markAllRead = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        await supabase
            .from('notifications')
            .update({ isRead: true, is_read: true })
            .or(`user.eq.${userId},user_id.eq.${userId}`);

        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
