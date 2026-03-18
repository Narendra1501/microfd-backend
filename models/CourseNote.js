import mongoose from 'mongoose';

const courseNoteSchema = new mongoose.Schema({
    unitNumber: {
        type: String,
        required: [true, 'Please specify the unit number'],
        enum: ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5']
    },
    fileName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
});

const CourseNote = mongoose.model('CourseNote', courseNoteSchema);
export default CourseNote;
