import jwt from 'jsonwebtoken';
import { getUserById } from '../utils/dbStore.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = getUserById(decoded.id);

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        const userObj = {
            ...user,
            _id: user.id,
            registerNumber: user.registerNumber ?? user.register_number,
            isDisabled: user.isDisabled ?? user.is_disabled ?? false
        };

        req.user = userObj;

        if (req.user.isDisabled) {
            return res.status(403).json({ success: false, message: 'Your account has been disabled. Contact faculty.' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};
