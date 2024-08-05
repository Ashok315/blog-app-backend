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
    default:"https://img.freepik.com/free-vector/blogging-fun-content-creation-online-streaming-video-blog-young-girl-making-selfie-social-network-sharing-feedback-self-promotion-strategy-vector-isolated-concept-metaphor-illustration_335657-855.jpg?w=740&t=st=1710127262~exp=1710127862~hmac=b45fb4a26446c5e8a7821675518c8708a0fad436c7ecf1e55668f2b813d9febe"
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