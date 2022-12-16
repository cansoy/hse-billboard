const express=require('express')
const mongoose=require('mongoose')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const router=express.Router()
const dbConnect=require('../database/dbConnect')
const RegisterSchema=require('../database/model/registerSchema')
const UserSchema=require('../database/model/userSchema')

// router.get('/me',async(req,res)=>{
//     const salt=await bcrypt.genSalt(10)
//     const password=await bcrypt.hash("1234",salt)
//     const connection = await dbConnect()
//     const userSchema=new UserSchema({
//         name:'test',
//         password:password,
//         role:'user',
//     })
//     await userSchema.save()
//     console.log(userSchema)
// })

router.get('/login',(req,res)=>{
    const flashRegistered=req.flash('registered')
    const flashNewUserRegisterError=req.flash('newUserRegisterError')
    const flashConnectionerror=req.flash('connectionerror')
    const flashWronguserpassword=req.flash('wronguserpassword')
    const fashExistUser=req.flash('existUser')
    const flashLoginError=req.flash('loginError')
    res.render('./user/login',{
        flashRegistered:flashRegistered,
        flashNewUserRegisterError:flashNewUserRegisterError,
        flashConnectionerror:flashConnectionerror,
        flashWronguserpassword:flashWronguserpassword,
        flashLoginError:flashLoginError,
        fashExistUser:fashExistUser
    })
})

router.get('/register',(req,res)=>{
    res.render('./user/register')
})

router.post('/logged',async(req,res)=>{
    const connection= await dbConnect()
    const dbReadyState=mongoose.connection.readyState
    if (dbReadyState !==1) {
        req.flash('connectionerror','İnternet bağlantı Hatası !')
        res.redirect('/user/login')
        return
    }
    try {
        const userName=req.body.username
        const userPassword=req.body.password
        const dbuser =await UserSchema.findOne({name:userName})
        if (!dbuser) {
            req.flash('wronguserpassword','Kullanici Adı veya Şifresi yanlış')
            res.redirect('/user/login')
            return 
        }
        const comparePassword=await bcrypt.compare(userPassword,dbuser.password)
        if (!comparePassword) {
            req.flash('wronguserpassword','Kullanici Adı veya Şifresi yanlış')
            res.redirect('/user/login')
            return
        }
        const jwt_token=jwt.sign({name:'cansoy'},process.env.JWT_SECRET,{expiresIn:"1h"})
        res.cookie('cansoy_token',jwt_token,
            {   maxAge:60*60*1000,
                httpOnly:true,
                secure:true,
                sameSite:'lax'
            })
        req.session.loggeduser=dbuser.name
        req.session.loggedUserRole=dbuser.role
        res.redirect('/home')
    }
    catch (error) {
        req.flash('loginError','Giriş İşleminde Bir Hata Oluştu !')
        res.redirect('/user/login') 
    }
})

router.post('/registered',async(req,res)=>{
        const connection = await dbConnect()
        const dbReadyState =mongoose.connection.readyState
        if (dbReadyState !== 1 ) {
            req.flash('notregistered','Kayıt İşleminiz Yapılamadı !')
            res.redirect('/user/login')
            return
        }
        try {
            const name=req.body.name
            const surname=req.body.surname
            const fullname=`${name}_${surname}`
            const workerid=req.body.workerid
            const userExist=await RegisterSchema.findOne({fullname:fullname})
            if (userExist) {
                req.flash('existUser','Bu Kullanıcı İçin Önceden Talep Yapıldı !')
                res.redirect('/user/login')
                return
            }
            const registerSchema=new RegisterSchema({
                name:name,
                surname:surname,
                fullname:`${name}_${surname}`,
                workerID:workerid
            })
            await registerSchema.save()
            req.flash('registered','Başarılı Şekilde Kaydınız Alındı !')
            res.redirect('/user/login') 
        } 
        catch (error) {
            req.flash('newUserRegisterError','Bir Sebebten Dolayı Hata Oluştu !')
            res.redirect('/user/login')
            return
        }    
})

module.exports=router