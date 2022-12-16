const mongoose=require('mongoose')
const Schema=mongoose.Schema

const fileSchema=new Schema({
    name:{
        type:String,
        default:"loadedmypdf"
    },
    file:{
        type:Buffer
    }
})

const FileSchema=mongoose.model('FileSchema',fileSchema)

module.exports=FileSchema