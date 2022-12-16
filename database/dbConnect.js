const mongoose=require('mongoose')
mongoose.set('strictQuery', false)
const uri = process.env.DB_PATH
const dboptions= { useNewUrlParser: true, useUnifiedTopology: true,dbName: 'db_isgduyuru'}

const dbConnect=async()=>{
    try {
        await mongoose.connect(uri,dboptions)
    } 
    catch (error) {
        console.log(error.message)
        return error.message
    }
}
module.exports=dbConnect