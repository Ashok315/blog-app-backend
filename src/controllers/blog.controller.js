import { Blog } from "../models/blog.model.js";
import { uploadOnCloudinary } from "../services/cloudinary.service.js";


//create blog
const createBlog=async (req,res)=>{

    try {    
        const {title,category,content,visibility}=req.body;

        if(!title || !content){
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const slug= title
                        .split(' ')
                        .join('-').toLowerCase()
                        .replace(/(?<=\b\w)\b/g,'') // Remove single characters
                        .replace(/[^\w\s-]/g, '') // Remove any non-word characters except dashes and spaces
                        .replace(/\s+/g, '-') // Replace spaces with dashes
                        .replace(/-+/g, '-'); // Replace multiple dashes with a single dash
        
        
        const feature_image_local_path=req.file?.path;
        let feature_image;

        if(feature_image_local_path){
            feature_image=await uploadOnCloudinary(feature_image_local_path);
        }

        if(!feature_image){
            return res.status(400).json({
                statusCode:400,
                message:"File was not uploaded"
            })
        }
            
        const blog=new Blog({
            author:req.user._id,
            title,
            slug,
            category,
            content,
            feature_image,
            visibility
        })
    
        await blog.save();
       
        return res.status(201).json({
            statusCode:201,
            message:"Blog added successfully",
        })
         
    } catch (error) {
        return res.status(500).json({
            statusCode:500,
            message:error.message
        })
    }
  
}

//get all blogs
const getBlogs=async (req,res)=>{
    
    try {
        // const blogs=await Blog.find(req.query).populate("author","-password");
        const blogs=await Blog.find(req.query).populate('author','-password').populate({path:'comments.commentedBy',select:['image','firstName','lastName','createdAt']});
        return res.status(200).json({
            statusCode:200,
            blogs
        })
    } catch (error) {
       return res.status(500).json({
        statusCode:500,
        message:error.message
    })
    }

}

const getBlogById=async (req,res)=>{
     try {
        const id=req.params.blogId
        const blog=await Blog.findById(id).populate("author","-password");
        return res.status(200).json({
            statusCode:200,
            blog
        })
        
     } catch (error) {  
        return res.status(500).json({
            statusCode:500,
            message:error.message
        })
     }
}

//update blog
const updateBlog=async (req,res)=>{
    try {
        const blogId=req.params.blogId;
        const {title,category,content,status}=req.body;

        if(!title || !content){
            return res.status(400).json({
                 statusCode:400,
                 message: 'Title and content are required' });
        }

        const slug= title
                        .split(' ')
                        .join('-').toLowerCase()
                        .replace(/(?<=\b\w)\b/g,'') // Remove single characters
                        .replace(/[^\w\s-]/g, '') // Remove any non-word characters except dashes and spaces
                        .replace(/\s+/g, '-') // Replace spaces with dashes
                        .replace(/-+/g, '-'); // Replace multiple dashes with a single dash
        
        
        const feature_image_local_path=req.file?.path;
        let feature_image;

        if(feature_image_local_path){
            feature_image=await uploadOnCloudinary(feature_image_local_path);
        }
        if(!feature_image){
            return res.status(400).json({
                statusCode:400,
                message:"File was not uploaded"
            })
        }

        const updatedBlog=await Blog.findByIdAndUpdate(blogId,{
           $set:{
            user_id:req.user._id,
            title,
            slug,
            category,
            content,
            feature_image,
            status
           } 
        },{new:true})
        return res.status(200).json({
            statusCode:200,
            message:"Blog updated successfully",
            updatedBlog
        })


    } catch (error) {
        return res.status(500).json({
            statusCode:500,
            message:error.message
        })
    }
}

//delete blog
const deleteBlog=async(req,res)=>{
    try {
        const blogId=req.params.blogId;
        await Blog.findByIdAndDelete(blogId);
        return res.status(200).json({
            statusCode:200,
            message:"Blog deleted successfully"
        })
        

    } catch (error) {
        return res.status(500).json({
            statusCode:500,
            message:error.message
        })     
    }
}

//like blog
const likeBlog=async(req,res)=>{
    try {
      let blogId=req.params.blogId;
      let blog=await Blog.findById(blogId);
      const isLiked=blog.likes.indexOf(req.user._id)!==-1;
 
        if(!isLiked){
          let blogs= await Blog.findByIdAndUpdate(blogId,{
                $push:{likes:req.user._id}
            },
            {new:true}) 
            return res.status(200).json({
                statusCode:200,
                blogs
            })
        }
       let blogs= await Blog.findByIdAndUpdate(blogId,{
            $pull:{likes:req.user._id}
        },{new:true})

        return res.status(200).json({
            statusCode:200,
            blogs
        })

        
    } catch (error) {
        return res.status(500).json({
            statusCode:500,
            message:error.message
        })   
    }
}

//comment blog
const addComment=async (req,res)=>{
   try {
       const comment={
        comment:req.body.comment,
        commentedBy:req.user._id
       };

      let blogId=req.params.blogId;

       let blogs= await Blog.findByIdAndUpdate(blogId,{
         $push:{comments:comment}
       },{new:true})
       return res.status(200).json({
        statusCode:200,
        blogs
       })

   } catch (error) {
    return res.status(500).json({
        statusCode:500,
        message:error.message
    })   
   }
}



export {createBlog,getBlogs,getBlogById,updateBlog,deleteBlog,likeBlog,addComment}



