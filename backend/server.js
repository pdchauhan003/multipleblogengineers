import 'dotenv/config';
import express from 'express';
import { app } from './src/app.js';
import { connectDB } from './src/config/db.js';
import { User } from './src/models/User.js';


const port=process.env.PORT;
// app.get('/',async(req,res)=>{
//     await connectDB()
//     try{
//         const user=await User.find().select('name');
//         console.log('username is ihoem...',user)
//         res.send('username',user)
//     }
//     catch(error){
//     console.log('mongo error...')
//     res.send('mongo error.....')
//     }
// })

const startServer = async () => {
    await connectDB();
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
};
startServer();
