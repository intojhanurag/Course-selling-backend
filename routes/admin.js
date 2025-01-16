const {Router}=require("express");
const adminRouter=Router();
const {adminModel}=require("../db");
const { adminMiddleware } = require("../middleware/admin");

const jwt=require("jsonwebtoken");

//bcrypt ,zod, jsonwebtoken
const {JWT_ADMIN_PASSWORD}=require("../config");
const { courseModel } = require("../db");


adminRouter.post("/signup",async function(req,res){
    const {email,password,firstName,lastName}=req.body;//todo:adding zod validation
    //todo: hash the passoword so plaintext pw is not stored in the DB

    //todo:put inside a try catch block
    await adminModel.create({
        email:email,
        password:password,
        firstName:firstName,
        lastName:lastName
    
    })
    res.json({
        message:"signup succeded"
    })
})
adminRouter.post("/signin",async function(req,res){
    const {email,password}=req.body;
    //Todo:ideally password should bee hashed so that you can't compare user password and db passsowrd
    const admin=await adminModel.findOne({
        email:email,
        password:password
    })
    //find: return empty arrya 
    //findone: return undefined or user
    if(admin){
        const token=jwt.sign({
            id:admin._id
        },JWT_ADMIN_PASSWORD)
        //Do cookie logic
        res.json({
           token:token 
        })
    }else {

        res.status(403).json({
            message:"Incorrect credentials"
        })

    }
    
})
adminRouter.post("/course",adminMiddleware,async function(req,res){
    const adminId=req.userId;
    const {title,description,imageUrl,price}=req.body;

    const course=await courseModel.create({
        title:title,
        description:description,
        imageUrl:imageUrl,
        price:price,
        creatorid:adminId
    })

    res.json({
        message:"Course created",
        courseId:course._id
    })
})
adminRouter.put("/course/update",adminMiddleware,async function(req,res){
    const adminId=req.userId;
    const {title,description,imageUrl,price,courseId}=req.body;

    const course=await courseModel.updateOne({
        _id:courseId,//flying beast id
        creatorId:adminId//creator id :flying beast

    },{
        title:title,
        description:description,
        imageUrl:imageUrl,
        price:price,
       
    })

    res.json({
        message:"Course Updated",
        courseId:course._id
    })
})

adminRouter.get("/course/bulk",adminMiddleware,async function(req,res){
    const adminId=req.userId;
    const courses=await courseModel.find({
        creatorId:adminId

    })

    res.json({
        message:"Course Updated",
        courses
    })
})

module.exports={
    adminRouter:adminRouter
}

///dhruv rathee can not update the course of mr.beast 
//with his token because creator id is diff and there is not row found 
//found with dhruv rathee creator id
