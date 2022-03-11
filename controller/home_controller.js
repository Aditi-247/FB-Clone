const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
module.exports.home = async function(req,res){
  try{
      let posts = await Post.find({})
      .sort('-createdAt')
      .populate('user')
      .populate({
         path:'comments',
         populate:{
             path:'user'
         }
     });
     if (req.cookies.jwtt){
        return res.redirect('/home');
    }
    else {
     let users =  await User.find({});
        return res.render('home',{
            title:'Codial|Home',
            posts:posts,
            all_users: users
            
        }); 
     }    
  }catch(err){
      console.log('error in displaying post',err);
      return;
  }
};
module.exports.homeinside = async function(req,res){
    try
    {
        // CHANGE :: populate the likes of each post and comment
         let homepost = await Post.find({})
         .sort('-createdAt')
         .populate('user')
         .populate({
             path:'comments',
             populate:{
                path:'user',
             },
             populate: {
                 path: 'likes'
             }
         }).populate('likes');
        let alluser =  await User.find({})
        User.findById(req.user._id,function(err,user){
        return res.render('homeinside',{
            title:'Home',
            all_users:alluser, 
            user : user,
            posts: homepost
         });
        }) 
    }catch (err){
        console.log('Error', err);
        return;
    }       
};
