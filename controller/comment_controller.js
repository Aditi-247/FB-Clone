const Comment = require('../models/comment');
const Post = require('../models/post');
const { post } = require('../routes/post');
// const commentMailer = require('../mailers/comment_mailers');
const Like = require('../models/like');
module.exports.create = async function(req,res){
    console.log('hi');
    try{
      let post = await Post.findById(req.body.post);
       if(post){
        //    console.log(req.body.post);
        //    console.log(req.user.id);
           let comment = await Comment.create({
               content:req.body.content,
               post: req.body.post,
               user: req.user.id
           });
        //    console.log(comment);
               post.comments.push(comment);
               post.save(); 
               console.log(post);

                // Similar for comments to fetch the user's id!
                // comment = await Comment.findById(comment._id).populate('user', 'name email').exec();
                // commentMailer.newComment(Comment);
               if (req.xhr){
                comment = await Comment.findById(comment._id).populate('user', 'name email').exec();
                // commentMailer.newComment(Comment);
                  return res.status(200).json({
                    data: {
                        comment: comment
                    },
                    message: "Post created!"
                  });
                }
               return res.redirect('back');   
           }
       }catch(err){
           console.log('error in comment', err);
           return;
       } 
}
module.exports.destroy = async function(req,res){
   try{
        let comment = await Comment.findById(req.params.id);
        if(comment.user==req.user.id){
            let postid = comment.post;
            comment.remove();
            let post =  Post.findByIdAndUpdate(postid, {$pull:{comments:req.params.id}});
            
            // CHANGE :: destroy the associated likes for this comment
            await Like.deleteMany({likeable: comment._id, onModel: 'Comment'});
            
            // send the comment id which was deleted back to the views
            if (req.xhr){
                return res.status(200).json({
                    data: {
                        comment_id: req.params.id
                    },
                    message: "Post deleted"
                });
            }
            return res.redirect('back');
        }else{
            return res.redirect('back');
        }
    }catch(err){
        console.log('error in deleting comment',err);
        return;
    }
}