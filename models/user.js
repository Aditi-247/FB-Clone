const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const AVATAR_PATH = path.join('/uploads/users/avatars');

const userSchema = new mongoose.Schema({
    email: {
        type : String,
        required : true,
        unique : true
    },
    password: {
        type : String,
        required : true,
    },
    name: {
        type : String,
        required : true,
    },
    phone:{
        type:String,
        required:true
    },
    avatar : {
        type : String
    },
    status:{
        type:String,
        required:true
     },
    tokens: [
        {
            token : {
                type: String,
                required: true
            }
        }
    ]
}, {
    timestamps : true,
});
// Generating Token
userSchema.methods.generateAuthToken = function(){
        let token = jwt.sign({_id:this._id}, 'AditiTomarmakingtokensforsignincodialmanagementproject');
        this.tokens = this.tokens.concat({token:token});
        this.save();
        // return token;
        if(token){
            return token;
        }
        else{
            console.log('xyz');
        }
    
};
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname,'..',AVATAR_PATH));
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
});
// static methods
userSchema.statics.uploadedAvatar = multer({ storage: storage}).single('avatar');
userSchema.statics.avatarPath = AVATAR_PATH;

const User = mongoose.model('User', userSchema);
module.exports = User;