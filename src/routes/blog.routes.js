
import Router from "express"
import { verifyJwt as authMiddleware } from "../middlewares/auth.middleware.js"
import { createBlog,getBlogs,updateBlog,deleteBlog, likeBlog, addComment, getBlogBySlug, getLatestBlogs } from "../controllers/blog.controller.js"
import { fileValidation, upload } from "../middlewares/multer.middleware.js";
const router=Router();


//Prefix: api/blogs/
router.post('/create-blog', authMiddleware, upload.single('feature_image'), fileValidation, createBlog)
router.get('/get-blogs',getBlogs);
router.get('/latest-blogs',getLatestBlogs);
router.get('/get-blog/:slug',getBlogBySlug);
router.patch('/update-blog/:blogId',authMiddleware, upload.single('feature_image'), fileValidation, updateBlog)
router.delete('/delete-blog/:blogId',authMiddleware, deleteBlog)
router.patch('/:blogId/like',authMiddleware,likeBlog)
router.patch('/:blogId/comment',authMiddleware,addComment)
router.get('/test',(req,res)=>res.send("test message"))

export default router;
