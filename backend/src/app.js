import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { userRouter } from './routes/authRoute.js';
import { blogRouter } from './routes/blogRoute.js';

const app = express();
const allowedOrigins = [
    'http://localhost:3000',
];
if (process.env.CLIENT_URL) {
    allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', userRouter);
app.use('/api/blog',blogRouter);

export { app };