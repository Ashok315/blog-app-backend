import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js';

const verifyJwt=async (req,res,next)=>{
     try {
         const token=req.cookies?.accessToken||req.header('Authorization')?.replace("Bearer ","");
         
         // check token value
         if(!token){
            return res.status(401).json({
                statusCode:401,
                message:"Unauthorized request"
            }) 
         }
   
        // verify token value
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET_KEY);
        const user=await User.findById(decodedToken.id).select("-password");

        if(!user){
            return res.status(401).json({
                statusCode:401,
                message:"Invalid access token"
            })
        }

        req.user=user;
        next();

     } catch (error) {
        return res.status(401).json({
            statusCode:401,
            message:"invalid access token"
        })
     }
}

export {verifyJwt}