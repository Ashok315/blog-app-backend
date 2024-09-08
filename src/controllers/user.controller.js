import {User} from '../models/user.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { uploadOnCloudinary } from '../services/cloudinary.service.js';
import NodeCache from 'node-cache';

const nodeCache=new NodeCache();

const registerUser=async (req,res)=>{

  const {firstName,lastName,email,password}=req.body;

  if(
    [firstName,lastName,email,password].some((field)=>field.trim()==='')
    ){
        return res.status(400).json({
            statusCode:400,
            message:`all fields are required`
        })
    }

    const existedUser= await User.findOne({email});

    if(existedUser){
        
        return res.status(409).json({
            statusCode:409,
            message:'User with email already exist'
        })
    }

    const hashPassword= await bcrypt.hash(password,10)

  try {
    const user=new User({
        firstName,
        lastName,
        email,
        password:hashPassword
      })
     
      await user.save()

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

const loginUser=async (req, res)=>{
const {email,password}=req.body;

if([email,password].some((field)=>field.trim()==="")){
    return res.status(400).json({
        statusCode:400,
        message:"email or password is required"
    })
}

const existUser=await User.findOne({email});
if(!existUser){
    return res.status(400).json({
        statusCode:404,
        message:"User does not exist"
    })
}
const isPasswordCorrect=await bcrypt.compare(password,existUser.password)

if(!isPasswordCorrect){
    return res.status(400).json({
        statusCode:400,
        message:"Invalid password"
    })
}

    
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

}

const logoutUser=async (req,res)=>{
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
 
}

const getCurrentUser=async (req,res)=>{
    const userId=req.user._id;
    try {
        const userData=await User.findById(userId,"-password");
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

const updateProfile=async (req,res)=>{
    try{
        const userId=req.params.userId;
        const {firstName,lastName}=req.body;

        if(!firstName.trim()||!lastName.trim()){
            return res.status(400).json({
                statusCode:400,
                message:"all field are required"
            })
        }

        const updatedUser=await User.findByIdAndUpdate(userId,{
            $set:{
                firstName:firstName,
                lastName:lastName
            }
        },{new:true}).select("-password")

        nodeCache.del('blogs');

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

const updateProfileImage=async(req,res)=>{

    try{
        const userId=req.params.userId
        const image_local_path=req.file?.path
        let profileImage;
        
        if(image_local_path){
            profileImage=await uploadOnCloudinary(image_local_path);
        }
        
        if(!profileImage){
            return res.status(400).json({
                statusCode:400,
                message:"File was not uploaded"
            })
        }

        const updatedUser=await User.findByIdAndUpdate(userId,{
            $set:{
                image:profileImage
            }
        },{new:true}).select("-password")

        nodeCache.del('blogs');

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

export {registerUser,loginUser,logoutUser,getCurrentUser,updateProfile,updateProfileImage}