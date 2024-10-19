import Router from 'express';
import { forgotPassword, getCurrentUser, loginUser, logoutUser, registerUser, resetPassword, updateProfile, updateProfileImage} from '../controllers/user.controller.js';
import { verifyJwt as authMiddleware } from '../middlewares/auth.middleware.js';
import { fileValidation, upload } from '../middlewares/multer.middleware.js';
const router=Router();

//Prefix: api/users/
router.post('/sign_up',registerUser);
router.post('/sign_in',loginUser);
router.post('/logout',authMiddleware,logoutUser);
router.get('/getCurrentUser',authMiddleware,getCurrentUser);
router.post('/forgotPassword',forgotPassword);
router.post('/resetPassword/:token',resetPassword);
router.patch('/updateProfile/:userId',authMiddleware,updateProfile);
router.patch('/updateProfileImage/:userId',authMiddleware,upload.single('image'), fileValidation, updateProfileImage)

export default router;