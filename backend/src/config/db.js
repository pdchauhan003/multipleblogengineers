import mg from 'mongoose';

export const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error('error MONGO_URI environment variable is missing or undefined.');
        process.exit(1);
    }
    try {
        await mg.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.log('MongoDB connection error', error);
        process.exit(1);
    }
};