const bcrypt = require('bcrypt');
const crypto = require('crypto');

const accesstoken = require('../models/verifiedtokens');
const forget=require('../models/forgettokens');
const jwt = require('jsonwebtoken');
const { redirect, append } = require('express/lib/response');
const User = require('../models/user');
const fs = require('fs');
const path = require('path');
const linkmail = require('../mailers/verifyuser');

const saltr = 3; 

module.exports.profile = function(req,res){
    // console.log(req.user.name, 'erorr is coming');
        User.findById(req.params.id,function(err,user){
                return res.render('user_profile',{
                    title:'User Profile',
                    profile_user:user,
                    user : req.user
                });  
        });
}; 
module.exports.update = async function(req,res){
    if(req.user.id == req.params.id){
        try{
            let user = await User.findById(req.params.id);
            User.uploadedAvatar(req,res,function(err){
                if(err){
                    console.log('****Multer Error', err)
                }
                user.name = req.body.name;
                user.email = req.body.email;
                if(req.file){
                    if(user.avatar){
                        fs.unlinkSync(path.join(__dirname, '..', user.avatar));
                    };
                    // this is svaing the path of the uploaded file into the avatr field in the user
                    user.avatar = User.avatarPath + '/' + req.file.filename;
                }
                user.save();
                return res.redirect('back');
            });
        }catch(err){
            console.log(err);
            return res.redirect('back');
        }
    }else{
        // req.flash('error:', 'unauthorised');
        console.log('unauthorised', err)
        return res.status(401).send('Unauthorised');
    }
};
module.exports.post = function(req,res){
    return res.render('user',{
        title:'User Post'
    });
};
module.exports.signUp = function(req,res){
    if (req.cookies.jwtt){
        return res.redirect('/home');
    }
    else {
       return res.render('user_sign_up',{
        title:"CD | Sign Up",
        isAdded:''
      });
    }
};
module.exports.signIn = function(req,res){
    if (req.cookies.jwtt){
        return res.redirect('/home');
    }
    else {
        return res.render('user_sign_in',{
        title:"CD | Sign In",
        isAdded:''
     });
    }
};
// get the sign up data
// module.exports.create = function(req,res){
//     console.log(req.body);
//     if(req.body.password != req.body.confirmpassword){
//         console.log('password not match');
//         return res.redirect('back');
//     }
//     User.findOne({email: req.body.email},function(err, user){
//         if(err){
//             console.log('Error in finding user in signing up');
//             return;
//         }
//         if(!user){
//             User.create(req.body, function(err,user){
//                 if(err){
//                     console.log('error in creating user while signing up');
//                     return;
//                 }
//                 return res.redirect('/user/sign-in');
//             });
//         }else{
//             console.log('email alre');
//             return res.redirect('back');
//         }
//     });
// };

module.exports.create = async function(req,res){
    try{
          // console.log(req.body)
          
          let existusers = await User.findOne({email:req.body.email,status:"Active"});
          if(existusers){
              return res.render('user_sign_up',{
                   title:"Codeial | Sign Up",
                   isAdded:'Email Already Exist'
              });
          }
          let existuserp = await User.findOne({email:req.body.email,status:"Pending"});
          if(existuserp){
              let del=await User.findOneAndDelete({email:existuserp.email});
          }
          
          // let deleteuser=await users.findOneAndDelete({email:existuserp.email});
          let existuser = await User.findOne({email:req.body.email});
          let newuser;
          if(!existuser){
              let hashpass = await bcrypt.hash(req.body.password, saltr);
              newuser = await User.create({
                  email:req.body.email,
                  name:req.body.name,
                  phone:req.body.phone,
                //   worth:0,
                  password:hashpass,
                  status:"Pending"
              });
          }
  
          let setat;
  
          if(newuser){
              setat = await accesstoken.create({
                  userid:newuser.id,
                  accesstokenvalue:crypto.randomBytes(120).toString('hex'),
                  isvalid:true
              });
          }
          setat=await accesstoken.findOne({userid:newuser.id});
          console.log(newuser.email);
          console.log(setat);
      
  
          
          linkmail.newuserverify(newuser.email,setat.accesstokenvalue,newuser.name);
  
          return res.render('calllink',{
              title:"CD | Thank You"
              //check your mail
          });
          
    }catch(err){
      console.log(err);
      return;
    }
  }

// sign in and create a session for user
// module.exports.createSession = function(req,res){
//       User.findOne({email: req.body.email},function(err, user){
//           if(err){
//               console.log('error in finding user in signing in');
//               return;
//           }
//         //   Handle user found
//         if(user){
//             // Handle password which doesn't match
//             if(user.password!=req.body.password){
//                 return res.redirect('back');
//             }
//             // Handle Token
//             const token = user.generalAuthToken();
//             console.log(token);
//             res.cookie("jwtt", token, {
//                 expires: new Date(Date.now() + 25892000000),
//                 httpOnly : true
//             });
//             console.log('profile');
//             // req.flash('success', "Logged in Successfully");
//             return res.redirect('/home');
//         }else{
//             // Handle res.redirect('back);
//             // console.log('back');
//             console.log('error', err)
//             return res.redirect('back');
//         }
//       })
//  };

module.exports.createSession = async function(req,res){
    try{
        let token;
        let requestedsuser = await User.findOne({email:req.body.email,status:"Active"});
        //console.log(requestedsuser);
        if(requestedsuser){
            let match = await bcrypt.compare(req.body.password,requestedsuser.password);
            if(match){
                
                //var token=jwt.sign({requestedsuser},'hithisismyemprojecttomakemyresumebig',{expiresIn: '35d'});
                token = await requestedsuser.generateAuthToken();
                // console.log(token);
                // console.log('token saved in cookies and db');
            
                res.cookie("jwtt", token, {
                    expires: new Date(Date.now() + 25892000000),
                    httpOnly: true,
                    secure:false,
                });
                return res.redirect('/home');
            }else{
                return res.render('user_sign_in',{
                    title:"CD | Sign In",
                    isAdded:'Wrong Password'
            
                });
            }
        }else{
            return res.render('user_sign_in',{
                title:"CD | Sign In",
                isAdded:'Email Not Found'
        
            });
        }
 
    }catch(err){
        console.log('kya h',err);
    }
}


 module.exports.verify=async function(req,res){
    try{
      const accesstokenvalue = req.params.accesstokenvalue;
      console.log('got the token',accesstokenvalue);
      let userstoken = await accesstoken.findOne({accesstokenvalue,isvalid:true});
      console.log('token mil gya',userstoken.userid);
      if(userstoken){
          let updatetoken = await accesstoken.findOneAndUpdate({userid:userstoken.userid},{isvalid:false});
          let updateactive= await User.findByIdAndUpdate(userstoken.userid,{status:"Active"});
          let updateuser = await User.findById(userstoken.userid);
          console.log('updated ',updateuser);
          let token = await updateuser.generateAuthToken();
          // console.log(token);
          // console.log('token saved in cookies and db');
          res.cookie("jwtt", token, {
              httpOnly: true,
              secure:false,
          });
          // here changes---------------------------------------------------------
          return res.redirect('/home');
      }
    }catch(err){
        console.log(err);
    }
}

module.exports.forgetpage= function(req,res){
    return res.render('forget',{
        title:"Forget Password",
        isAddedpass:""
    });
}

module.exports.forgetpass=async function(req,res){
    userexist = await User.findOne({email:req.body.email});
    if(userexist){
        tokenpass =  await forget.create({
            email:req.body.email,
            accesstokenvalue:crypto.randomBytes(120).toString('hex'),
            isvalid:true
        });
        let forgetuser=await forget.findOne({email:req.body.email});
        console.log('user h',forgetuser);
        linkmail.forgetpass(req.body.email,forgetuser.accesstokenvalue);
        return res.render('calllink.ejs',{
            title:"send"
        });
    }
    else{
        return res.render('forget',{
            title:"Forget Password",
            isAddedpass:"Email not Found"
        });
    }

   
}
module.exports.updatepass=async function(req,res){
    try{
        const accesstokenvalue=req.params.accesstokenvalue;
        const email=req.params.email;

        console.log(email,'got the token',accesstokenvalue);
        let userstoken=await forget.findOne({accesstokenvalue,isvalid:true});
        // console.log('token mil gya',userstoken.email);
        if(userstoken){
            return res.render('passchange',{
                title:"New Password",
                user:userstoken.email,
                error:""
            });
        }
       
        // if(userstoken){

        //     let updatetoken = await forget.findOneAndUpdate({email:userstoken.email},{isvalid:false});
        //     let update= await users.findByIdAndUpdate(userstoken.userid,{status:"Active"});
        //     let updateuser= await users.findById(userstoken.userid);
        //     console.log('updated ',updateuser);
          
        //     // here changes---------------------------------------------------------
        //     return res.redirect('/users/sign-in');
        // }
      }catch(err){
          console.log(err);
      }

}

module.exports.newpass=async function(req,res){
   
    let hashpass=await bcrypt.hash(req.body.password, saltr);
    
    let updated = await User.findOneAndUpdate({email:req.body.email,status:"Active"},{password:hashpass}); 
    let updatetoken = await forget.findOneAndUpdate({email:req.body.email},{isvalid:false});  
    if(updated){
        return res.render('user_sign_in',{
            title:"Codeial | Sign-In",
            isAdded:"Password Updated !!"
        })
    }

}



module.exports.destroySession = function(req,res){
    // console.log(res.cookie.jwt);
    res.clearCookie("jwtt");
    return res.redirect('/');
}