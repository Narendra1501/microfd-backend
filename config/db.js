import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb+srv://naren_ramesh:KNk22UAergyi7wJ8@cluster0.cfoeua7.mongodb.net/?appName=Cluster0', {
        // const conn = await mongoose.connect('mongodb://127.0.0.1:27017/microfeedback', {
            serverApi: {
                version: '1',
                strict: true,
                deprecationErrors: true,
            }
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        // Exit process with failure
        process.exit(1);
    }
};

export default connectDB;
