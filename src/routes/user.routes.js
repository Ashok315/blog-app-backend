import Router from 'express';
import { getCurrentUser, loginUser, logoutUser, registerUser, updateProfile, updateProfileImage} from '../controllers/user.controller.js';
import { verifyJwt as authMiddleware } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
const router=Router();

//api/users/
router.post('/sign_up',registerUser);
router.post('/sign_in',loginUser);
router.post('/logout',authMiddleware,logoutUser);
router.get('/getCurrentUser',authMiddleware,getCurrentUser);
router.patch('/updateProfile/:userId',authMiddleware,updateProfile)
router.patch('/updateProfileImage/:userId',authMiddleware,upload.single('image'),updateProfileImage)

export default router;