import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'
import transporter from '../config/nodemailer.js'
import { EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js'



/// new account registration ----------------------
export const register = async (req,res) =>{
    const {name,email,password} = req.body

    if(!name || !email || !password){
        return res.json({success:false,message: 'Missing details'})
    }

    try{
        const existingUser = await userModel.findOne({email})

        if(existingUser){
            return res.json({success:false,message: 'User already exists'})
        }

        const hashedPassword = await bcrypt.hash(password,10)  // 5-15
        const user = new userModel({name,email, password:hashedPassword})   // for creating a new user
        await user.save()   // user is stored in the DB

        // have to generate token for authentication // send this token using cookies
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET,{expiresIn:'7d'})  // creates a token
        // have to send this token in res to client using cookie  // storing the JWT token inside a browser cookie with some security configurations.
        res.cookie('token', token, {
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production',  // it will be secure in development environment
            sameSite: process.env.NODE_ENV === 'production'? 'none': 'strict',
            maxAge: 7*24*60*60*1000   // 7days in ms
        })

        //// sending a welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome To Auth',
            text:`welcome to the Auth webapp. Your account has been successfully created with email id: ${email}`
        }

        await transporter.sendMail(mailOptions)

        return res.json({success:true})

    }catch(err){
        res.json({success:false,message:err.message})
    }
}



/// account login ----------------------
export const login = async (req,res)=>{
    const {email,password} = req.body

    if(!email || !password){
        return res.json({success:false,message: 'Email and password are required'})
    }

    try{
        const user = await userModel.findOne({email})

        if(!user){
            return res.json({success:false,message: 'Invalid Email'})
        }

        // comparing the user entered password with DB stored passsword 
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.json({success:false,message: 'Incorrect password'})
        }

        /// now create a token after a valid email and password for authentication and logging the user in
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET,{expiresIn:'7d'})
        
        res.cookie('token', token, {
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production',  
            sameSite: process.env.NODE_ENV === 'production'? 'none': 'strict',
            maxAge: 7*24*60*60*1000 
        })

        return res.json({success:true})

    }catch(err){
        return res.json({success:false,message: err.message})
    }
}



/// account logout ----------------------
export const logout = async (req,res)=>{
    try{
        // removing the token 
        res.clearCookie('token',{
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production',  
            sameSite: process.env.NODE_ENV === 'production'? 'none': 'strict',
        })

        return res.json({success:true,message:"Logged Out"})

    }catch(err){
        return res.json({success:false,message:err.message})
    }
}



/// send email verification OTP -----------------------
export const sendVerifyOtp = async (req,res) =>{
    try{
        const userId = req.userId // how can we get the userId /// actually we get the userId from the token and the token is stored in cookie
                                    // so we need a middleware to get the id from token from cookie
        const user = await userModel.findById(userId)

        if(user.isAccountVerified){
            return res.json({success:false,message:"Account Already verified"})
        }

        const otp = String(Math.floor(100000 + Math.random()*900000))

        user.verifyOtp = otp
        user.verifyOtpExpiredAt = Date.now() + 24*60*60*1000

        await user.save()

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            // text:`Your OTP is ${otp}. Verify your account using this OTP`,
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        }
        await transporter.sendMail(mailOptions)

        res.json({success:true,message:"Verification OTP sent on Email"})

    }catch(err){
        res.json({success:false,message:err.message})
    }
}



/// verify the emailusing OTP ---------------------------
export const verifyEmail = async (req,res)=>{
    const {otp} = req.body
    const userId = req.userId

    if (!userId || !otp){
        return res.json({success:false, message:"Missing Details"})
    }

    try{

        const user = await userModel.findById(userId)
        if(!user){
            return res.json({success:false,message:"User not found"})
        }
        if(user.verifyOtp === "" || user.verifyOtp !== otp){
            return res.json({success:false,message:"Invalid OTP"})
        }
        if(user.verifyOtpExpiredAt < Date.now()){ // so OTP is already expired
            return res.json({success:false,message:"OTP expired"})
        }

        user.isAccountVerified = true
        user.verifyOtp = ''
        user.verifyOtpExpiredAt = 0

        await user.save()
        return res.json({success:true,message:"Email verified successfully"})

    }catch(err){
        return res.json({success:false,message:err.message})
    }
}



///  Check if the usr is authenticated -------------------
export const isAuthenticated = async (req,res)=>{
    try{
        return res.json({success:true})  // since we are using the middleware in the routes 
                            //  ==> it checks whether the token is present in the  cookie
    }catch(err){
        res.json({success:false,message:err.message})
    }
}



/// send password reset OTP ---------------------------
export const sendResetOtp = async (req,res)=>{
    const {email} = req.body

    if(!email){
        return res.json({success:false,message:"Email is required"})
    }
    
    try{
        const user = await userModel.findOne({email})
        if(!user){
            return res.json({success:false, message:"user not found"})
        }

        const otp = String(Math.floor(100000 + Math.random()*900000))

        user.resetOtp = otp
        user.resetOtpExpiredAt = Date.now() + 15*60*1000

        await user.save()

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset',
           // text:`Your OTP for resetting your password is ${otp}. Use this OTP to proceed with resetting your password`
           html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        }
        await transporter.sendMail(mailOptions)

        res.json({success:true,message:"OTP sent on Email"})

    }catch(err){
        res.json({success:false,message:err.message})
    }
}



/// reset user password -------------------------------
export const resetPassword = async (req,res)=>{
    const {email,otp,newPassword} = req.body

    if(!email || !otp || !newPassword){
        return res.json({success:false,message:"Email, New Password, OTP are required"})
    }

    try{

        const user = await userModel.findOne({email})

        if(!user){
            return res.json({success:false,message:"User not found"})
        }

        if(user.resetOtp === "" || user.resetOtp !== otp){
           return res.json({success:false,message:"Invalid OTP"})
        }

        if(user.resetOtpExpiredAt < Date.now()){
           return res.json({success:false,message:"OTP expired"})
        }

        const hashedPassword = await bcrypt.hash(newPassword,10)
        user.password = hashedPassword
        user.resetOtp = ''
        user.resetOtpExpiredAt = 0

        await user.save()

        return res.json({success:true,message:"Password has been Successfully Changed"})

    }catch(err){
        res.json({success:false,message:err.message})
    }
}