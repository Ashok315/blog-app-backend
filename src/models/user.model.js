import { Schema,mongoose } from "mongoose";
const userSchema=new Schema({
    firstName:{
        type:String,
        required:true 
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },  
    image:{
        type:String,    
        default:"https://res.cloudinary.com/webappbucket/image/upload/v1716002132/profile_auz7g3.jpg"
    }
},{timestamps:true})

export const User=mongoose.model('User',userSchema)