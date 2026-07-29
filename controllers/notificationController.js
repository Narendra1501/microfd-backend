import { createNotification, listNotificationsForUser, markAllNotificationsRead, markNotificationAsRead } from '../utils/dbStore.js';

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

        const notifications = listNotificationsForUser(userId).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
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

        const notification = listNotificationsForUser(userId).find((item) => item.id === req.params.id);
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        const notifUser = notification.user ?? notification.user_id;
        if (String(notifUser) !== String(userId)) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const updated = markNotificationAsRead(req.params.id);
        res.status(200).json({ success: true, data: formatNotification(updated) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const markAllRead = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        markAllNotificationsRead(userId);
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
