import mongoose from "mongoose";

// for the connection with the database 
export const connectDB = async ()=> {
    try {

        mongoose.connection.on('connected',()=>{
            console.log('Connected to the chat Application DataBase')
        })

        await mongoose.connect(`${process.env.MONGODB_URI}/chat-App`)
    } catch (error) {
        console.log(error)
    }
}