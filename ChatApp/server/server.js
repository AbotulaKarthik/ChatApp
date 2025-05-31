import express from 'express';
import 'dotenv/config'
import cors from 'cors'
import http from 'http'
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';

import { Server } from 'socket.io';
import { Socket } from 'dgram';

const app = express()
const server = http.createServer(app)

// Initialize socket.io
export const io = new Server(server,{
    cors:{origin:"*"}
})

// store online users -----------
export const userSocketMap = {}  // {userId:socketId}

// Socket.io connection handler 
io.on('connection',(socket)=>{
    const userId = socket.handshake.query.userId
    console.log('User Connected',userId)

    if (userId) {
        if (!userSocketMap[userId]) userSocketMap[userId] = []
        userSocketMap[userId].push(socket.id)
  }

    // emit online users to all connected clients
    io.emit('getOnlineUsers',Object.keys(userSocketMap))

    socket.on('disconnect', () => {
        if (userId && userSocketMap[userId]) {
            userSocketMap[userId] = userSocketMap[userId].filter(id => id !== socket.id)
            if (userSocketMap[userId].length === 0) {
                delete userSocketMap[userId]
            }
        }
        io.emit('getOnlineUsers', Object.keys(userSocketMap))
    })
})

// middleware setup
app.use(express.json({limit:'4mb'}))
app.use(cors())   // allows all the URLs to connect with the backend

//// routes -----------------
app.use("/api/auth",userRouter)
app.use('/api/messages',messageRouter)

// DB connection ---
await connectDB()

if(process.env.NODE_ENV !== "production"){
    const PORT = process.env.PORT || 5000
    server.listen(PORT,()=>{
        console.log("Server is running on port "+PORT)
    })
}

// exporting server for vercel
export default server