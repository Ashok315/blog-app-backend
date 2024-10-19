import {User} from '../models/user.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { uploadOnCloudinary } from '../services/cloudinary.service.js';
import { cache } from '../utils/cache.js';
import { sendEmail } from '../utils/sendEmail.js';

// sign-up user
const registerUser=async (req,res)=>{
    try {
        const {firstName,lastName,email,password}=req.body;
        // check input validation    
        if([firstName,lastName,email,password].some((field)=>field.trim()==='')){
                return res.status(400).json({
                    statusCode:400,
                    message:`all fields are required`
                })
            }

        // check if user email already exist
        const existedUser= await User.findOne({email});
        if(existedUser){    
            return res.status(409).json({
                statusCode:409,
                message:'User with email already exist'
            })
        }
        
        // increapt password
        const hashPassword= await bcrypt.hash(password,10)

        const user=new User({
            firstName,
            lastName,
            email,
            password:hashPassword
        })
        
        // store user data in database
        await user.save()

        // check user data store or not
        const createdUser= await User.findById(user._id).select("-password")
        if(!createdUser){
            return res.status(500).json({statusCode:500,message:"something went wrong while register"})
        }
              
        return res.status(201).json({
            success:true,
            statusCode:201,
            message:"User Registered successfully",
            data:createdUser
        });
        
    } catch (error) {
        return res.status(500).json({
            statusCode:500,
            message:error.message
        })
    }

}

// sign-in user
const loginUser=async (req, res)=>{
    try {
        const {email,password}=req.body; 

        // check input validation
        if([email,password].some((field)=>field.trim()==="")){
            return res.status(400).json({
                statusCode:400,
                message:"email or password is required"
            })
        }
        
        // check user exist or not
        const existUser=await User.findOne({email});
        if(!existUser){
            return res.status(400).json({
                statusCode:404,
                message:"User does not exist"
            })
        }
    
        //check user password is correct or not 
        const isPasswordCorrect=await bcrypt.compare(password,existUser.password)
        if(!isPasswordCorrect){
            return res.status(400).json({
                statusCode:400,
                message:"Invalid password"
            })
        }
          
        // send access token
        const userData={
            id:existUser._id,
            email:existUser.email,
            name:`${existUser.firstName} ${existUser.lastName}`
        }
        const accessToken=jwt.sign(userData,process.env.ACCESS_TOKEN_SECRET_KEY,{expiresIn:process.env.ACCESS_TOKEN_EXPIRY});
    
        const options={
        httpOnly:true,
        secure:true,
        sameSite: 'None',
        maxAge: 24*60*60*1000, // 24hr
        }
    
        return res
        .status(200)
        .cookie('accessToken',accessToken,options)
        .json({
            statusCode:200,
            accessToken,
            message:"User logged In successfully",
        })

    } catch (error) {
        return res.status(500).json({
            statusCode:500,
            message:error.message
        })
    }
   
}

// logout user
const logoutUser=async (req,res)=>{
    try {
        const options={
            httpOnly:true,
            secure:true,
            sameSite: 'None'      
        }
        
        return res.status(200)
                .clearCookie("accessToken",options)
                .json({
                    statusCode:200,
                    message:"User logged Out successfully"
                })
    } catch (error) {
        return res.status(500).json({
            statusCode:500,
            message:error.message
        })
    }
 
}

// get current user
const getCurrentUser=async (req,res)=>{   
    try {
        const userId=req.user._id;
        const userData=await User.findById(userId,"-password");
        // check user is available or not
        if(!userData){
            return res.status(400).json({
                statusCode:400,
                message:"User does not found"
            })
        }
        return res.status(200).json({
            statusCode:200,
            data:userData
        })
    } catch (error) {
        return res.status(500).json({
            statusCode:500,
            message:error.message
        })
    }
}

// forgot password
const forgotPassword=async (req,res)=>{
     try {
        const {email}=req.body;
        // check validation
        if(!email||!email.trim()){
            return res.status(400).json({
                statusCode:400,
                message:"Email is Required"
            })
        }
        
        // check exist user or not   
        const existUser=await User.findOne({email});
        if(!existUser){
            return res.status(400).json({
                statusCode:400,
                message:"User does not existed"
            })
        }
    
        // verify email if user exist

        let token=jwt.sign({id:existUser._id},process.env.ACCESS_TOKEN_SECRET_KEY,{expiresIn:"300s"})
         
        sendEmail(email,`${process.env.CLIENT_URI}/reset_password/${token}`);

        return res.status(200).json({
            statusCode:200,
            message:"Reset link sent to your email",
    })
    
        
     } catch (error) {
        return res.status(500).json({
            statusCode:500,
            message:error.message
        })
     }
}

// reset password
const resetPassword=async(req,res)=>{

    try {
        const {token}=req.params;
        const {newPassword}=req.body;
 
        //verify token
        const verifyToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET_KEY);

           //validate input
           if(!newPassword){
               return res.status(400).json({
                   statusCode:400,
                   message:"New Password is Required"
               })
           }
       
            const user=await User.findById(verifyToken.id);

            if(!user){
                return res.status(404).json({
                    statusCode:404,
                    message:"User does not found",
                })
            }

            // Hash the new password and update the user's password    
            user.password=await bcrypt.hash(newPassword,10);
            
            await user.save();

            return res.status(200).json({
                    statusCode:200,
                    message:"Password changed successfully",
            })
        
    } catch (error) {
        return res.status(400).json({
            statusCode:400,
            message:"Link has been expired",
            Error:error.message
        })
    }
}
  


// update user profile data
const updateProfile=async (req,res)=>{
    try{
        const userId=req.params.userId;
        const {firstName,lastName}=req.body;
        // check input validation
        if(!firstName.trim()||!lastName.trim()){
            return res.status(400).json({
                statusCode:400,
                message:"all field are required"
            })
        }
        
        // update user data
        const updatedUser=await User.findByIdAndUpdate(userId,{
            $set:{
                firstName:firstName,
                lastName:lastName
            }
        },{new:true}).select("-password")

        // clear all cache
        cache.flushAll();

        return res.status(200).json({
                statusCode:200,
                message:"Profile data updated successfully",
                updatedUser
        })
    }
    catch(error){
      return  res.status(500).json({
              statusCode:500,
              message:error.message,

      })
    }

}

// update user profile image
const updateProfileImage=async(req,res)=>{
    try{
        const userId=req.params.userId
        const image_local_path=req.file?.path
        let profileImage;
        
        // upload image on cloudinary
        if(image_local_path){
            profileImage=await uploadOnCloudinary(image_local_path);

            if(!profileImage){
                return res.status(400).json({
                    statusCode:400,
                    message:"File was not uploaded"
                })
            }
        }
          
        // update user profile image
        const updatedUser=await User.findByIdAndUpdate(userId,{
            $set:{
                image:profileImage
            }
        },{new:true}).select("-password");

        // clear all cache
        cache.flushAll();
       
        return res.status(200).json({
            statusCode:200,
            message:"Profile Image updated successfully",
            updatedUser
        })

    }
    catch(error){
        return res.status(500).json({
            statusCode:500,
            message:error.message
        })
    }
}

export {registerUser,loginUser,logoutUser,getCurrentUser,updateProfile,updateProfileImage,forgotPassword,resetPassword}