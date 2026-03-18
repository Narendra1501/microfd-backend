import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderModel: { type: String, required: true, enum: ['User'] }, // Kept for later generic usage if needed, though all users are in User model
    message: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Chat', chatSchema);
