
import Router from "express"
import { verifyJwt as authMiddleware } from "../middlewares/auth.middleware.js"
import { createBlog,getBlogs,updateBlog,deleteBlog, likeBlog, addComment, getBlogById } from "../controllers/blog.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
const router=Router();

//api/blogs/
router.post('/create-blog', authMiddleware, upload.single('feature_image'),createBlog)
router.get('/get-blogs',getBlogs);
router.get('/get-blogs/:blogId',getBlogById);
router.patch('/update-blog/:blogId',authMiddleware, upload.single('feature_image'),updateBlog)
router.delete('/delete-blog/:blogId',authMiddleware, deleteBlog)
router.patch('/:blogId/like',authMiddleware,likeBlog)
router.patch('/:blogId/comment',authMiddleware,addComment)

export default router;