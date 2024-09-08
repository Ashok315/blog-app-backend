import mongoose, { Schema } from 'mongoose'
const blogSchema=new Schema({
   author:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required:true
     },
   title:{
    type:String,
    required:true,
    unique:true
   },
   slug:{
    type:String,
    required:true,
    unique:true
   },
   category:{
    type:String,
    default:"uncategorized"
   },
   content:{
    type:String,
    required:true,
   },
   feature_image:{
    type:String,
    default:"https://res.cloudinary.com/webappbucket/image/upload/v1725001468/myblog/images/blogDefault_rk3yod.png"
   },
   visibility:{
    type:String,
    enum:["public","private"],
    default:"public"
   },
   likes:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
   }],
   comments:[{
      comment:{type:String},
      commentedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User"}
   },{timestamps:true}]
   

},{timestamps:true})

export const Blog=mongoose.model('Blog',blogSchema);