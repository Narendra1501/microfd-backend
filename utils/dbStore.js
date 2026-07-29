import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';

const initialState = {
    users: [],
    feedbacks: [],
    otps: [],
    chats: [],
    notifications: [],
    courseNotes: []
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const createId = (prefix = 'id') => `${prefix}_${randomUUID()}`;
const now = () => new Date().toISOString();

const withTimestamp = (record) => {
    const base = { ...record };
    if (!base.id) {
        base.id = createId(base.table || 'id');
    }
    if (!base.created_at && !base.createdAt) {
        base.created_at = now();
        base.createdAt = base.created_at;
    }
    return base;
};

const upsert = (table, record) => {
    const normalized = withTimestamp({ ...record, table });
    initialState[table].push(normalized);
    return clone(normalized);
};

const findOne = (table, predicate) => {
    const row = initialState[table].find(predicate);
    return row ? clone(row) : null;
};

const findMany = (table, predicate = () => true) => clone(initialState[table].filter(predicate));

export const dbStore = initialState;

export const resetDatabase = () => {
    Object.keys(initialState).forEach((key) => {
        initialState[key] = [];
    });
};

export const seedDefaultUsers = async () => {
    if (initialState.users.length > 0) {
        return initialState.users;
    }

    const facultyPassword = await bcrypt.hash('faculty123', 10);
    const studentPassword = await bcrypt.hash('student123', 10);

    upsert('users', {
        name: 'Jayanthi',
        email: 'jayanthi@ptuniv.edu.in',
        password: facultyPassword,
        role: 'faculty',
        registerNumber: null,
        register_number: null,
        is_disabled: false,
        isDisabled: false
    });

    upsert('users', {
        name: 'Test Student',
        email: '2401109073@ptuniv.edu.in',
        password: studentPassword,
        role: 'student',
        registerNumber: '2401109073',
        register_number: '2401109073',
        is_disabled: false,
        isDisabled: false
    });

    return initialState.users;
};

export const createUser = async (input) => {
    const password = input.password && !String(input.password).startsWith('$2')
        ? await bcrypt.hash(String(input.password), 10)
        : input.password;

    const user = upsert('users', {
        ...input,
        password,
        registerNumber: input.registerNumber ?? input.register_number ?? null,
        register_number: input.register_number ?? input.registerNumber ?? null,
        isDisabled: input.isDisabled ?? input.is_disabled ?? false,
        is_disabled: input.is_disabled ?? input.isDisabled ?? false
    });

    return user;
};

export const getUserByEmail = (email) => findOne('users', (user) => user.email === email);
export const getUserById = (id) => findOne('users', (user) => user.id === id || user._id === id);
export const listUsers = () => findMany('users');
export const updateUser = (id, updates) => {
    const target = initialState.users.find((user) => user.id === id || user._id === id);
    if (!target) {
        return null;
    }

    Object.assign(target, updates);
    return clone(target);
};

export const deleteUser = (id) => {
    const index = initialState.users.findIndex((user) => user.id === id || user._id === id);
    if (index === -1) {
        return false;
    }
    initialState.users.splice(index, 1);
    return true;
};

export const comparePassword = async (candidatePassword, hashedPassword) => bcrypt.compare(candidatePassword, hashedPassword);

export const createOtp = (payload) => upsert('otps', payload);
export const getLatestOtp = (email, type) => {
    const records = findMany('otps', (entry) => entry.email === email && entry.type === type);
    return records.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))[0] || null;
};
export const updateOtp = (id, updates) => {
    const target = initialState.otps.find((otp) => otp.id === id);
    if (!target) {
        return null;
    }
    Object.assign(target, updates);
    return clone(target);
};
export const deleteOtps = (email, type) => {
    initialState.otps = initialState.otps.filter((otp) => !(otp.email === email && otp.type === type));
};

export const createFeedback = (payload) => upsert('feedbacks', payload);
export const listFeedbacks = (filters = {}) => {
    const rows = findMany('feedbacks');
    return rows.filter((row) => {
        return Object.entries(filters).every(([key, value]) => {
            if (value === undefined || value === null || value === '') {
                return true;
            }
            return String(row[key]) === String(value);
        });
    });
};
export const getFeedbacksByStudent = (studentId) => findMany('feedbacks', (feedback) => feedback.studentId === studentId || feedback.student_id === studentId);
export const deleteFeedback = (id) => {
    const index = initialState.feedbacks.findIndex((feedback) => feedback.id === id);
    if (index === -1) {
        return false;
    }
    initialState.feedbacks.splice(index, 1);
    return true;
};
export const deleteFeedbacksForStudent = (studentId) => {
    initialState.feedbacks = initialState.feedbacks.filter((feedback) => feedback.studentId !== studentId && feedback.student_id !== studentId);
};

export const createChat = (payload) => upsert('chats', payload);
export const listChats = () => findMany('chats');
export const clearAllChats = () => {
    initialState.chats = [];
};

export const createNotification = (payload) => upsert('notifications', payload);
export const listNotificationsForUser = (userId) => findMany('notifications', (notification) => notification.user === userId || notification.user_id === userId);
export const markNotificationAsRead = (id) => {
    const target = initialState.notifications.find((notification) => notification.id === id);
    if (!target) {
        return null;
    }
    target.isRead = true;
    target.is_read = true;
    return clone(target);
};
export const markAllNotificationsRead = (userId) => {
    initialState.notifications = initialState.notifications.map((notification) => {
        if (notification.user === userId || notification.user_id === userId) {
            notification.isRead = true;
            notification.is_read = true;
        }
        return notification;
    });
};

export const createNote = (payload) => upsert('courseNotes', payload);
export const listNotes = () => findMany('courseNotes');

export default initialState;
