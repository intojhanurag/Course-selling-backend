const express=require("express");//Router
const { userMiddleware } = require("../middleware/user");
const {Router}=require("express");
const {userModel,purchaseModel,courseModel}=require("../db");
const jwt=require("jsonwebtoken")
// const JWT_USER_PASSWORD="aladkldffm123"
const {JWT_USER_PASSWORD}=require("../config");
const { courseRouter } = require("./course");
const userRouter=Router()

userRouter.post("/signup",async function(req,res){

    const {email,password,firstName,lastName}=req.body;//todo:adding zod validation
    //todo: hash the passoword so plaintext pw is not stored in the DB

    //todo:put inside a try catch block
    await userModel.create({
        email:email,
        password:password,
        firstName:firstName,
        lastName:lastName
    
    })
    res.json({
        message:"signup succeded"
    })
})
userRouter.post("/signin",async function(req,res){
    const {email,password}=req.body;
    //Todo:ideally password should bee hashed so that you can't compare user password and db passsowrd
    const user=await userModel.findOne({
        email:email,
        password:password
    })
    //find: return empty arrya 
    //findone: return undefined or user
    if(user){
        const token=jwt.sign({
            id:user._id
        },JWT_USER_PASSWORD)
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
userRouter.get("/purchases",userMiddleware,async function(req,res){
    const userId=req.userId;

    const purchases=await purchaseModel.find({
        userId
    })
    const coursesData=await courseModel.find({
        _id:{$in:purchases.map(x=>x.courseId)}
    })
    res.json({
        purchases,
        coursesData
    })
})

module.exports={
    userRouter:userRouter
}
