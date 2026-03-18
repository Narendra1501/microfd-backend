import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dateString: {
        type: String, // format "yyyy-MM-dd"
        required: true
    },
    ratings: {
        lifeSkills: { type: Number, required: true, min: 1, max: 5 },
        learningExperience: { type: Number, required: true, min: 1, max: 5 },
        teacherReach: { type: Number, required: true, min: 1, max: 5 },
        overall: { type: Number, required: true, min: 1, max: 5 }
    },
    textFeedback: {
        makeMoreInteresting: { type: String, required: true },
        mostInteresting: { type: String, required: true },
        classImpact: { type: String, required: true }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to enforce one feedback per student per day at the DB level
feedbackSchema.index({ studentId: 1, dateString: 1 }, { unique: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
