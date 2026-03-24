import userModel from "../models/user.model.js"
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import configList from "../config/config.js"
import sessionModel from "../models/session.model.js"


export const userRegisterController = async (req, res, next) => {
    try {
        const { username, email, password } = req.body

        const isAlreadyRegistered = await userModel.findOne({
            $or: [
                { username },
                { email }
            ]
        })

        if (isAlreadyRegistered) {
            return res.status(409).json({
                success: false,
                msg: 'User already registered',
            })
        }

        const hashedPassword = crypto.createHash("sha256").update(password).digest("hex")
        const user = await userModel.create({
            username,
            email,
            password: hashedPassword
        })

        // const token = jwt.sign({
        //     id: user._id
        // }, configList.JWT_SECRET, { expiresIn: '1d' })

        return res.status(200).json({
            success: true,
            msg: 'User registered successfully',
            user: {
                username: user.username,
                email: user.email
            },
            // token
        })
    } catch (error) {
        return res.status(404).json({
            success: false,
            msg: 'Something went wrong',
            error
        })
    }
}




export const userLoginController = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const user = await userModel.findOne({ email: email })
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found',
            })
        }

        const hasedPassword = crypto.createHash("sha256").update(password).digest("hex")

        const isPasswordValid = hasedPassword === user.password

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                msg: 'Invalid password',
            })
        }

        const refereshToken = jwt.sign({
            id: user._id
        }, configList.JWT_SECRET, { expiresIn: '7d' })

        const refreshTokenHash = crypto.createHash("sha256").update(refereshToken).digest("hex")

        const session = await sessionModel.create({
            user: user._id,
            refreshToken: refreshTokenHash,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        })

        const accessToken = jwt.sign({
            id: user._id,
            sessionId: session._id
        }, configList.JWT_SECRET, { expiresIn: '3min' })

        res.cookie('refersehToken', refereshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 25 * 60 * 60 * 1000 //7 days
        })



        return res.status(200).json({
            success: true,
            msg: 'User logged in successfully',
            accessToken
        })
    } catch (error) {
        return res.status(404).json({
            success: false,
            msg: 'Something went wrong',
            error
        })
    }
}


export const getMeController = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) {
            return res.status(401).json({
                success: false,
                msg: 'Unauthorized'
            })
        }
        const decodedToken = jwt.verify(token, configList.JWT_SECRET)
        // console.log(decodedToken)
        const user = await userModel.findById({ _id: decodedToken.id }).select('username email')
        // console.log(user)
        return res.status(200).json({
            success: true,
            msg: 'User Fetched Successfully',
            user
        })
    } catch (error) {
        return res.status(404).json({
            success: false,
            msg: 'Something went wrong',
            error
        })
    }
}

export const getRefreshTokenController = async (req, res, next) => {
    try {
        const refereshToken = req.cookies.refersehToken
        if (!refereshToken) {
            return res.status(401).json({
                success: false,
                msg: 'Unauthorized'
            })
        }
        const decodedToken = jwt.verify(refereshToken, configList.JWT_SECRET)

        const refreshTokenHash = crypto.createHash("sha256").update(refereshToken).digest("hex")

        const session = await sessionModel.findOne({
            refreshToken: refreshTokenHash,
            revoked: false
        })

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Token is not valid'
            })
        }

        const accessToken = jwt.sign({ id: decodedToken.id }, configList.JWT_SECRET, { expiresIn: '3min' })

        const newRefereshToken = jwt.sign({ id: decodedToken.id }, configList.JWT_SECRET, { expiresIn: '7d' })

        const newRefereshTokenHash = crypto.createHash("sha256").update(newRefereshToken).digest("hex")

        session.refreshToken = newRefereshTokenHash
        await session.save()

        res.cookie('refersehToken', newRefereshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 25 * 60 * 60 * 1000 //7 days
        })

        return res.status(200).json({
            success: true,
            msg: 'Referesh token generated successfully',
            accessToken
        })
    } catch (error) {
        return res.status(404).json({
            success: false,
            msg: 'Something went wrong',
            error
        })
    }
}


export const logoutController = async (req, res, next) => {
    try {
        const refersehToken = req.cookies.refersehToken

        if (!refersehToken) {
            return res.status(401).json({
                success: false,
                msg: 'Unauthorized referesh token was not found'
            })
        }


        const refreshTokenHash = crypto.createHash('sha256').update(refersehToken).digest('hex')

        const session = await sessionModel.findOne({
            refreshToken: refreshTokenHash,
            revoked: false
        })

        if (!session) {
            return res.status(401).json({
                success: false,
                msg: 'Unauthorized referesh token was not valid'
            })
        }

        session.revoked = true
        await session.save()

        res.clearCookie('refersehToken')



        return res.status(200).json({
            success: true,
            msg: 'Logout successfully',
        })
    } catch (error) {
        return res.status(404).json({
            success: false,
            msg: 'Something went wrong',
            error
        })
    }
}


