const jwt=require("jsonwebtoken");

module.exports.
JWTVerify=(req,res,next)=>{
    const authHeader=req.headers['authorization']
    if(!authHeader) return res.sendStatus(401).json({ message: 'Unauthorized' });
    const token=authHeader.split(' ')[1]
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err,decoded)=>{
            if(err) return res.sendStatus(403).json({message:"forbidden"})
            req.user=decoded.userDetails.username
            next();
        }
    )
}