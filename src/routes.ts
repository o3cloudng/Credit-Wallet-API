import { Router } from 'express';
import { createUser, getAllUsers, profileUser} from './controllers/userController';
import { loginUser } from "../src/controllers/authController";
import { fund, transfer, withdraw, getWallet } from './controllers/walletController';
import fauxAuth from './middlewares/fauxAuth';

const router = Router();
// User
router.post('/users', createUser);
router.post("/login", loginUser);
router.get('/users', getAllUsers);
router.get('/user/profile/', fauxAuth, profileUser);

// Loan
router.post('/fund', fauxAuth, fund);
router.post('/transfer', fauxAuth, transfer);
router.post('/withdraw', fauxAuth, withdraw);
router.get('/wallet', fauxAuth, getWallet);

export default router;
