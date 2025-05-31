/// this is the middleware that is executed before executing the controller functions
// using this middleware function, we will protect our routes, so that if the user is 
//  -- authenticated then only they can access that particular API endpoint

//  It ensures that only authenticated users (with a valid JWT) can access the route.


import User from "../models/UserModel.js"
import jwt from 'jsonwebtoken'



/// middleware to protect routes -----------
export const protectRoute = async (req,res,next)=>{
    try {
        const token = req.headers.token

        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        const user = await User.findById(decoded.userId).select('-password')

        if(!user){
            return res.json({success:false,message: "User not found"})
        }

        req.user = user   // Attaches the user data to req.user so the next handler or controller can use it
        next()
    } catch (error) {
        console.log(error.message)
        return res.json({success:false,message: error.message})
    }
}


// next: callback to move to the next middleware or route handler.

// in a chat app or social media app — you don’t want just anyone calling APIs like:
// GET /api/user/profile
// POST /api/messages/send
// PUT /api/user/edit

// These APIs should only be accessible if the user is logged in.
// That’s what this middleware does — it ensures the user has a valid token before giving access.