import express from 'express';
import { app } from './src/app.js';
import 'dotenv/config';
import { connectDB } from './src/config/db.js';


const port=process.env.PORT;

const startServer = async () => {
    await connectDB();
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
};
startServer();
