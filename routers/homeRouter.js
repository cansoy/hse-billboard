const express=require('express')
const path=require('path')
const fs=require('fs')
const stream=require('stream')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt')
const multer =require('multer')
const mongoose=require('mongoose')
const router=express.Router()
const dbConnect=require('../database/dbConnect')
const RegisterSchema=require('../database/model/registerSchema')
const UserSchema=require('../database/model/userSchema')
const FileSchema=require('../database/model/fileSchema')

router.get('/',async(req,res)=>{
    try {
        const login_token=req.cookies.cansoy_token
        const verif_token=jwt.verify(login_token,process.env.JWT_SECRET)
    } 
    catch (error) {
        req.session.destroy()
        res.clearCookie('cansoy_token')
        res.redirect('/user/login')
        return
    }
    const loggeduser=req.session.loggeduser
    const loggedUserRole=req.session.loggedUserRole
    if (!loggeduser) {
        res.redirect('/user/login')
        return
    }
    if (!loggedUserRole) {
        res.redirect('/user/login')
        return
    }
   if (loggedUserRole === "admin") {
        const flashJustPdf=req.flash('justpdf')
        const flashSizeFile=req.flash('sizeFile')
        const flashFileSaved=req.flash('fileSaved')
        const flashStreamError=req.flash('streamError')
        const flashConnectionerror=req.flash('connectionerror')
        const flashConnectionerrorloaded=req.flash('connectionerrorloaded')
        const flashPdfRenderError=req.flash('pdfRenderError')
        const connection = await dbConnect()
        const waitingRequests=await RegisterSchema.find()
        res.render('./home/homeadmin',{
            loggeduser:loggeduser,
            flashConnectionerror:flashConnectionerror,
            waitingRequests:waitingRequests,
            flashJustPdf:flashJustPdf,
            flashSizeFile:flashSizeFile,
            flashFileSaved:flashFileSaved,
            flashStreamError:flashStreamError,
            flashConnectionerrorloaded:flashConnectionerrorloaded,
            flashPdfRenderError:flashPdfRenderError
        })
        return
   }
    else {
        const connection = await dbConnect()
        const dbReadyState =mongoose.connection.readyState
        if (dbReadyState !== 1 ) {
            req.flash('connectionerror','İnternet bağlantı Hatası !')
            res.redirect('/user/login')
            return
        }
        try {
            const getFile=await FileSchema.findOne({name:'loadedmypdf'})
            const buffer =new Buffer.from(getFile.file.buffer)
            const readStream=stream.Readable.from(buffer)
            const writeStream=fs.createWriteStream(path.join(__dirname,'../pdffile/newpdf.pdf'))
            readStream.pipe(writeStream)
        } 
        catch (error) {
            res.flash('streamError','PDF Okumada Hata Oluştu !')
            res.redirect('/home')
            return
        }
        try {
            const data =fs.readFileSync(path.join(__dirname,'../pdffile/newpdf.pdf'))
            res.contentType("application/pdf");
            res.send(data);
        } 
        catch (error) {
            req.flash('pdfRenderError','PDF Dosyası Görüntülenemiyor !')
            res.redirect('/home')
            return
        }
   }
})

router.post('/admin/registeredornot',async(req,res)=>{
    try {
        const login_token=req.cookies.cansoy_token
        const verif_token=jwt.verify(login_token,process.env.JWT_SECRET)
    } 
    catch (error) {
        req.session.destroy()
        res.clearCookie('cansoy_token')
        res.redirect('/user/login')
        return
    }
    const connection = await dbConnect()
    const dbReadyState =mongoose.connection.readyState
    if (dbReadyState !== 1 ) {
        req.flash('connectionerror','Kullanıcı Kayıt İşleminiz Yapılamadı !')
        res.redirect('/home')
        return
    }
    if (req.body.confirm) {
        const salt=await bcrypt.genSalt(10)
        const password=await bcrypt.hash('1234',salt)
        const userSchema=new UserSchema({
        name:req.body.name,
        password:password,
        role:req.body._role
       }) 
       const newUser =await userSchema.save()
       const deleteRequest=await RegisterSchema.findOneAndDelete({_id:req.body.objID})
       res.redirect('/home')
    } 
    else if(req.body.reject) {
        const deleteRequest=await RegisterSchema.findOneAndDelete({_id:req.body.objID})
        res.redirect('/home')
    }
})

router.post('/admin/documentloaded',multer().single('pdffile'),async(req,res)=>{
    try {
        const login_token=req.cookies.cansoy_token
        const verif_token=jwt.verify(login_token,process.env.JWT_SECRET)
    } 
    catch (error) {
        req.session.destroy()
        res.clearCookie('cansoy_token')
        res.redirect('/user/login')
        return
    }
    const connection = await dbConnect()
    const dbReadyState =mongoose.connection.readyState
    if (dbReadyState !== 1 ) {
        req.flash('connectionerrorloaded','DÖküman Yükleme Bağlantı İşleminiz Yapılamadı !')
        res.redirect('/home')
        return
    }
    const file=req.file
    const mimeType=path.parse(file.originalname).ext
    const sizeOfFile=file.size
    if (mimeType !== ".pdf") {
        req.flash('justpdf','Lütfen Sadece PDF Dosyası Yükleyiniz !')
        res.redirect('/home')
        return
    }
    if (sizeOfFile >= 6912083) {
        req.flash('sizeFile','Lütfen 7 MB Üzeri Dosya Yüklemeyiniz !')
        res.redirect('/home')
        return
    }
    const fileSchema=new FileSchema({
        file:file.buffer
    })
    await FileSchema.deleteMany({})
    const savedFile=await fileSchema.save()
    req.flash('fileSaved','Dosyanız Başaralı Bir Şekilde Kayıt Edildi !')
    res.redirect('/home')
})

router.get('/homepdf',async(req,res)=>{
    try {
        const login_token=req.cookies.cansoy_token
        const verif_token=jwt.verify(login_token,process.env.JWT_SECRET)
    } 
    catch (error) {
        req.session.destroy()
        res.clearCookie('cansoy_token')
        res.redirect('/user/login')
        return
    }
    const loggeduser=req.session.loggeduser
    const loggedUserRole=req.session.loggedUserRole
    if (!loggeduser) {
        res.redirect('/user/login')
        return
    }
    if (!loggedUserRole) {
        res.redirect('/user/login')
        return
    }
    const connection = await dbConnect()
    const dbReadyState =mongoose.connection.readyState
    if (dbReadyState !== 1 ) {
        req.flash('connectionerror','Kullanıcı Kayıt İşleminiz Yapılamadı !')
        res.redirect('/home')
        return
    }
    try {
        const getFile=await FileSchema.findOne({name:'loadedmypdf'})
        const buffer =new Buffer.from(getFile.file.buffer)
        const readStream=stream.Readable.from(buffer)
        const writeStream=fs.createWriteStream(path.join(__dirname,'../pdffile/newpdf.pdf'))
        readStream.pipe(writeStream)
    } 
    catch (error) {
        res.flash('streamError','PDF Okumada Hata Oluştu !')
        res.redirect('/home')
        return
    }
    try {
        const data =fs.readFileSync(path.join(__dirname,'../pdffile/newpdf.pdf'))
        res.contentType("application/pdf");
        res.send(data);
    } 
    catch (error) {
        req.flash('pdfRenderError','PDF Dosyası Görüntülenemiyor !')
        res.redirect('/home')
        return
    }
})

router.get('/usermanagement',async(req,res)=>{
    try {
        const login_token=req.cookies.cansoy_token
        const verif_token=jwt.verify(login_token,process.env.JWT_SECRET)
    } 
    catch (error) {
        req.session.destroy()
        res.clearCookie('cansoy_token')
        res.redirect('/user/login')
        return
    }
    const loggeduser=req.session.loggeduser
    const loggedUserRole=req.session.loggedUserRole
    if (!loggeduser) {
        res.redirect('/user/login')
        return
    }
    if (!loggedUserRole) {
        res.redirect('/user/login')
        return
    }
    const connection = await dbConnect()
    const dbReadyState =mongoose.connection.readyState
    if (dbReadyState !== 1 ) {
        req.flash('connectionerrorloaded','DÖküman Yükleme Bağlantı İşleminiz Yapılamadı !')
        res.redirect('/home')
        return
    }
    const allUserList= await UserSchema.find()
    res.render('./home/homeadminusers',{
        allUserList:allUserList
    })
})

router.post('/home/usermanagement/deleted',async(req,res)=>{
    try {
        const login_token=req.cookies.cansoy_token
        const verif_token=jwt.verify(login_token,process.env.JWT_SECRET)
    } 
    catch (error) {
        req.session.destroy()
        res.clearCookie('cansoy_token')
        res.redirect('/user/login')
        return
    }
    const loggeduser=req.session.loggeduser
    const loggedUserRole=req.session.loggedUserRole
    if (!loggeduser) {
        res.redirect('/user/login')
        return
    }
    if (!loggedUserRole) {
        res.redirect('/user/login')
        return
    }
    await  UserSchema.findByIdAndDelete({_id:req.body.objID})
    res.redirect('/home/usermanagement')
})

router.get('/logout',(req,res)=>{
    req.session.destroy()
    delete req.cookies
    res.clearCookie('cansoy_token')
    res.redirect('/user/login')
    return
})

module.exports=router