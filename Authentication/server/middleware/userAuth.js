import jwt from 'jsonwebtoken'

const userAuth = async (req,res,next) =>{
    const {token} = req.cookies  // get the token stored in the cookie

    if(!token){
        return res.json({success:false,message:"Not Authorized.Login Again"})
    }

    try{
        const tokenDecode = jwt.verify(token,process.env.JWT_SECRET)  // verify and decode the token
                                                                      // it contain the decoded payload
        if(tokenDecode.id){  // since we used Id while creating the token
            req.userId = tokenDecode.id
        }else{
            return res.json({success:false,message:"Not Authorized.Login Again"})
        }

        next()  // it will try to execute our controller func

    }catch(err){
        res.json({success:false,message:err.message})
    }
}

export default userAuth