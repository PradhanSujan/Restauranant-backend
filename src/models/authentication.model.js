const mongoose = require("mongoose");
const uuidv1 = require("uuidv1");
const crypto = require("crypto")

const authSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        default:0
    },
    hashed_password:{
        type:String,
        required:true,
    },
    salt:String,
    isVerified:{
        type:Boolean,
        default:false,
    }
},{timestamps:true})

//make virtual fields
authSchema.virtual("password")
.set(function(password){
    this._password = password;
    this.salt = uuidv1();
    this.hashed_password = this.encryptPassword(password);
})

authSchema.methods = {
    encryptPassword: function(password){
        if(!password) return "";
        try{
            return crypto
            .createHmac('sha1',this.salt)
            .update(password)
            .digest("hex")
        }catch(err){
            return ""
        }
    }
}

module.exports = mongoose.model("User",authSchema);