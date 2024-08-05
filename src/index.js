import dotenv from 'dotenv';
import app from '../src/app.js';
import connectDB from './config/database.js';

dotenv.config();
const port=process.env.PORT || 5000;

// start server
connectDB().then(()=>{
    app.listen(port,()=>console.log(`Server is running on ${port}`))
}).catch((error)=>{
    console.log(`Server connection failed!!`,error)
})


