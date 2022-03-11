const jwt = require('jsonwebtoken');
const User = require('../models/user');


const authenticate = async (req,res,next) => {
   try{
       const token = req.cookies.jwtt;
       const verify = jwt.verify(token, 'AditiTomarmakingtokensforsignincodialmanagementproject');

       const preuser = await User.findOne({_id:verify._id, "tokens.token":token});
       if(!preuser){
        //    console.log('not found');
            return res.render('user_sign_in',{
            title:"CD | Sign In"
        });
       }else{
          req.token = token;
          req.user = preuser;
          req.USERID = preuser.id;
          //    console.log(req.token);
          next();
        }
       
    }
   catch(err){
        //  res.status(401).send('no token provided');
        //  console.log(err);
         return res.render('user_sign_in',{
            title:"CD | Sign In",
            isAdded:'Login is Required'
    
        });
   }
} 

module.exports = authenticate;
