import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { userRouter } from './routes/authRoute.js';
import { blogRouter } from './routes/blogRoute.js';
import { paymentRouter } from './routes/paymentRoute.js';

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://multipleblogengineers.vercel.app",
];

const checkOrigin = (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error("Not allowed by CORS"));
};

app.use(cors({
  origin: checkOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["set-cookie"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use('/api/auth', userRouter);
app.use('/api/blog',blogRouter);
app.use('/api/payment/',paymentRouter);

export { app };