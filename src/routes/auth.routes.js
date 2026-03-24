import express from 'express'
import { userRegisterController, userLoginController, getMeController, getRefreshTokenController, logoutController } from '../controllers/auth.controller.js'
const router = express.Router()


router.post('/register', userRegisterController)

router.post('/login', userLoginController)

router.get('/get-me', getMeController)

router.get('/refresh-token', getRefreshTokenController)

router.get('/logout', logoutController)

export default router