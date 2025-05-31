import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/UserModel.js";
import bcrypt from 'bcryptjs'

/// Signing up new user -------
export const signup = async (req,res)=>{
    const {fullName, email, password, bio} = req.body;

    try {
        if(!fullName || !email || !password || !bio){
            return res.json({success:false,message: "Missing Details"})
        }

        const user = await User.findOne({email})
        if(user){
            return res.json({success:false,message: "User Already exists"})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const newUser = await User.create({
            fullName,email,password:hashedPassword,bio
        })

        const token = generateToken(newUser._id)

        res.json({success:true, userData: newUser, token, message: 'Account created successfully'})

    } catch (error) {
        console.log(error.message)
        return res.json({success:false,message: error.message})
    }
}


/// logging the existing user -------
export const login = async (req,res)=>{
    try {
        const {email,password} = req.body;

        const userData = await User.findOne({email})
        if(!userData){
            return res.json({success:false, message: "User does not exist"})
        }

        const isPasswordCorrect = await bcrypt.compare(password,userData.password)

        if(!isPasswordCorrect){
            return res.json({success:false,message: "Incorrect Password"})
        }

        const token = generateToken(userData._id)

        res.json({success:true, userData: userData, token, message: 'Login successfully'})

    } catch (error) {
        console.log(error.message)
        return res.json({success:false,message: error.message})
    }
}


/// controller to check if the user is authenticated -----------
export const checkAuth = (req,res)=>{                // returns the user data if the user is authenticated
    res.json({success:true,user:req.user});
}


// controller to update user profile details ---------
export const updateProfile = async (req,res)=>{
    try {
        const {profilePic,bio,fullName} = req.body

        const userId = req.user._id       // will get the userId from the protected routes
        let updateUser

        if(!profilePic){
            updateUser = await User.findByIdAndUpdate(userId,{bio,fullName},{new:true})
        }else{
            const upload = await  cloudinary.uploader.upload(profilePic)

            updateUser = await User.findByIdAndUpdate(userId,{profilePic:upload.secure_url,bio,fullName},{new:true})
        }
        res.json({success:true,user: updateUser, message:'Profile updated Successfully'})
        
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}