import mongoose from "mongoose";
import { Blog } from "../models/blog.model.js";
import { uploadOnCloudinary } from "../services/cloudinary.service.js";
import { cache } from "../utils/cache.js";

//create blog
const createBlog=async (req,res)=>{
    try {    
        const {title,category,content,visibility}=req.body;
        
        // check input validation
        if(!title || !content){
            return res.status(400).json({
                 statusCode:400,
                 message:'Title and content are required' });
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

        // upload blog image on cloudinary
        if(feature_image_local_path){
            feature_image=await uploadOnCloudinary(feature_image_local_path);

            if(!feature_image){
                return res.status(400).json({
                    statusCode:400,
                    message:"File was not uploaded"
                })
            }
        }
        else{
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
        
        //store blog data in database
        await blog.save();
        
        // clear all cache
        cache.flushAll();
       
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
const getBlogs = async (req, res) => {
    try {

        let queryParams=req.query;
        let cacheKey;

        //set cackeKey value when query parameter has default value
        if(Object.keys(queryParams).length!=0){   
            cacheKey = Object.values(queryParams)[0];
        }
        else{
            cacheKey ="all";
        }
     
        // Check if the data is already in the cache
        let cachedBlogs = cache.get(cacheKey);

        if (cachedBlogs) {
            return res.status(200).json({
                statusCode: 200,
                blogs: JSON.parse(cachedBlogs),
                message: 'Fetched from cache'
            });
        }
        else{

            // check query parameter value is valid or not 
           let validAuthorId=(queryParams.hasOwnProperty('author')&&!mongoose.Types.ObjectId.isValid(queryParams.author));
           let validBlogId=(queryParams.hasOwnProperty('_id')&&!mongoose.Types.ObjectId.isValid(queryParams._id));
           
            if(validAuthorId||validBlogId){
                return res.status(400).json({
                    statusCode:400,
                    message:"Invalid parameter value"
                });
            }

            const blogs = await Blog.find(queryParams)
                            .populate('author', '-password')
                            .populate({
                                path: 'comments.commentedBy',
                                select: ['image', 'firstName', 'lastName', 'createdAt']
                            });

            if(blogs.length==0){
                return res.status(404).json({
                    statusCode:404,
                    message:"Data not found"
                })
            }
    
            // Store the result in the cache
            cache.set(cacheKey, JSON.stringify(blogs));
        
            return res.status(200).json({
                statusCode: 200,
                blogs,
                message: 'Fetched from database'
            });                                                     
        }

    
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};

// get latest blogs
const getLatestBlogs=async (req,res)=>{
    try{

        // Check if the data is already in the cache
        let cachedBlogs=cache.get("latest-blogs");

        if(cachedBlogs){
            return res.status(200).json({
                statusCode: 200,
                blogs:JSON.parse(cachedBlogs),
                message: 'Fetched from cache'   
            });
        }

        const blogs=await Blog.find({})
            .populate('author', '-password')
            .populate({
                path: 'comments.commentedBy',
                select: ['image', 'firstName', 'lastName', 'createdAt']
            })
            .sort({createdAt:-1})
            .limit(6);
           
            //Store the data in cache
            cache.set("latest-blogs",JSON.stringify(blogs));

            return res.status(200).json({
                statusCode:200,
                blogs,
                message:"fetch latest from database"
            });
            
    }catch(error){
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }

}

//get blog by slug
const getBlogBySlug=async (req,res)=>{
    try {

       const blog=await Blog.find({ slug: req.params.slug }).populate("author","-password").populate({path:'comments.commentedBy',select:['image','firstName','lastName','createdAt']});
      
       if(blog.length==0){
          return res.status(400).json({
            statusCode:400,
            message:"Bad Request"
          })
       }

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
        const {title,category,content,visibility}=req.body;
        
        // check input validation
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
        
        // upload blog image on cloudinary
        if(feature_image_local_path){
            feature_image=await uploadOnCloudinary(feature_image_local_path);
            if(!feature_image){
                return res.status(400).json({
                    statusCode:400,
                    message:"File was not uploaded"
                })
            }
        }
        else{
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
            visibility
           } 
        },{new:true});

        // clear all cache
        cache.flushAll();

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
        cache.flushAll();

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
        
        // liked post if not liked
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

        // remove liked if liked
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
      
       // update comment value 
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

export {createBlog,getBlogs,getBlogBySlug,updateBlog,deleteBlog,likeBlog,addComment,getLatestBlogs}



