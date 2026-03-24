import express from 'express'
import { config } from 'dotenv'
config()
import userRouter from './routes/auth.routes.js'
import { connectDB } from './config/database.js'
import cookieParser from 'cookie-parser'
const PORT = process.env.PORT || 8000

const app = express()

app.use(express.json())
app.use(cookieParser())
connectDB()
app.get('/', (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            msg: 'Server is healty',
        })
    } catch (error) {
        return res.status(404).json({
            success: false,
            msg: 'Something whent wrong server is not healty',
            error
        })
    }
})

app.use('/api/user', userRouter)

app.listen(PORT, () => {
    console.log(`Your server started at ${PORT}`)
})