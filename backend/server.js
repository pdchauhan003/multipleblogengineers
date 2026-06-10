import 'dotenv/config';
import express from 'express';
import { app } from './src/app.js';
import { connectDB } from './src/config/db.js';


const port=process.env.PORT;
app.get('/',(req,res)=>{
    if(await connectDB()){
    console.log('run home page...')
    res.send('run home page......')
    }
    console.log('mongo error...')
    res.send('mongo error.....')
})

const startServer = async () => {
    await connectDB();
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
};
startServer();
