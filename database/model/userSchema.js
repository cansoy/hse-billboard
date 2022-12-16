const mongoose=require('mongoose')
const Schema=mongoose.Schema

const userSchema=new Schema({
    name:{
        type:String
    },
    password:{
        type:String
    },
    role:{
        type:String
    },
    registeredDate:{
        type:Date,
        default:Date.now
    }
})

const UserSchema=mongoose.model('UserSchema',userSchema)

module.exports=UserSchema