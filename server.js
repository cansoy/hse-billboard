const path =    require('path')
const fs=       require('fs')
require('dotenv').config({path:path.join(__dirname,'./bin/.env')})
const express=  require('express')
const cors=     require('cors')
const helmet =  require('helmet')
const session=  require('express-session')
const cookieParser=require('cookie-parser')
const flash=    require('connect-flash')
const server=   express()

const PORT=process.env.PORT || 3000

const userRouter=require('./routers/userRouter')
const homeRouter=require('./routers/homeRouter')


server.use(express.json())
server.use(express.urlencoded({extended:true}))
server.use(express.static(path.join(__dirname,'./public')))
server.set('view engine','ejs')
server.set('views',path.join(__dirname,'./views'))
server.use(cors())
server.use(helmet())
server.use(session({
    name:'cansoy',
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:60*60*1000,
        httpOnly:true,
        secure:true,
        sameSite:'lax'
    },
}))

server.use(flash())
server.use(cookieParser())
server.use('/user',userRouter)
server.use('/home',homeRouter)

server.use('*',(req,res)=>{
    req.session.destroy()
    res.clearCookie('cansoy_token')
    res.redirect('/user/login')
})

server.listen(PORT,()=>{
    console.log('//////////////////////////////////////////////////////////////////////')
})