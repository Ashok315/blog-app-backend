import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config()

cloudinary.config({ 
    cloud_name:`${process.env.CLOUDINARY_CLOUD_NAME}`, 
    api_key:`${process.env.CLOUDINARY_API_KEY}`, 
    api_secret:`${process.env.CLOUDINARY_API_SECRET}` 
  });

const uploadOnCloudinary=async (localFilePath)=>{
    try {
        if(!localFilePath) return null
        
        //upload file on cloudinary
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:'image',
            folder:'myblog/upload'
        })

        //delete file from local path
        fs.unlinkSync(localFilePath)
        return response.secure_url
    } catch (error) {
        fs.unlinkSync(localFilePath); //remove the locally saved temporary file
        console.log(error);
        return null
    }
}

export {uploadOnCloudinary}