const Post = require('../models/post');
const Comment = require('../models/comment');
const Like = require('../models/like');
module.exports.create= async function(req,res){
    try{
        let post = await Post.create({
             content:req.body.content,
             user:req.body.user
        });
        if (req.xhr){
            // if we want to populate just the name of the user (we'll not want to send the password in the API), this is how we do it!
            post = await Post.findById(post.id).populate('user', 'name').exec();

            return res.status(200).json({
                data: {
                    post: post
                },
                message: "Post created!"
            });
        }
        return res.redirect('back');
    }catch(err){
        console.log('error in creating a post', err);
        return;
    }
};
module.exports.destroy = async function(req,res){
  try{
     let post = await Post.findById(req.params.id);
        if(post.user==req.user.id){

            //  CHANGE :: delete the associated likes for the post and all its comments' likes too
            await Like.deleteMany({likeable: post, onModel: 'Post'});
            await Like.deleteMany({_id: {$in: post.comments}});

            post.remove();
            await Comment.deleteMany({post:req.params.id});
            if (req.xhr){
                return res.status(200).json({
                    data: {
                        post_id: req.params.id
                    },
                    message: "Post deleted"
                });
            }
            return res.redirect('back');
        }else{
            return res.redirect('back');  
        }
    }catch(err){
        console.log('error',err);
    }
};