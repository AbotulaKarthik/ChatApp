import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import cookieParser from 'cookie-parser'
import connectDb from './config/monogDb.js'
import authRouter from './routes/authRoutes.js'
import userRouter from './routes/userRoutes.js'

const app = express()
const port = process.env.PORT || 4000

connectDb()

const allowedOrigins = ['http://localhost:5173']   // in this array you can add all the frontEnd urls were you can access this backend server

app.use(express.json())
app.use(cookieParser())
app.use(cors({origin:allowedOrigins, credentials:true}))

/// api routes -----------
app.use('/api/auth',authRouter)   ///  url ==> localhost:4000/api/auth/[register,login,logout]
app.use('/api/user',userRouter)


app.listen(port,()=>{
    console.log("server running on port "+port)
})