import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors'
const app=express();

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("../public"));
app.use(cookieParser())
app.use(cors({origin:"http://localhost:5173",credentials:true}));

//import routes
import userRoutes from '../src/routes/user.routes.js'
import blogRoutes from '../src/routes/blog.routes.js';

app.use('/api/users',userRoutes);
app.use('/api/blogs',blogRoutes);

export default app;