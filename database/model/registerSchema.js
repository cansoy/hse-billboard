const mongoose=require('mongoose')
const Schema=mongoose.Schema

const registerSchema=new Schema({
    name:{
        type:String,
        trim:true
    },
    surname:{
        type:String,
        trim:true
    },
    fullname:{
        type:String,
        trim:true
    },
    workerID:{
        type:String,
        trim:true
    },
    registerLocalTime:{
        type:Date,
        default: Date.now()
    }
})

const RegisterSchema=mongoose.model('RegisterSchema',registerSchema)

module.exports=RegisterSchema