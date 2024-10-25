// admin signup, login, add course, delete course, course content

import { Router } from "express";
import { AdminModel, CourseModel } from "../db.mjs";
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { adminMiddleware } from "../middlewares/adminmiddleware.mjs";
const adminRouter = Router();

adminRouter.post('/signup', async (request, response) => {
    //input validation
    const admin = z.object({
        firstName: z.string().min(5).max(50),
        lastName: z.string().min(5).max(50),
        email: z.string().min(5).max(50).email(),
        password: z.string().min(5).max(500)
    })
    //error handling
    try {
        const validateAdmin = admin.parse(request.body);
        const hashedPassword = await bcrypt.hash(validateAdmin.password, 10)

        const newadmin = await AdminModel.create({
            firstName: validateAdmin.firstName,
            lastName: validateAdmin.lastName,
            email: validateAdmin.email,
            password: hashedPassword
        })

        response.status(201).json({
            message: 'Admin signed up successfully.',
            firstName: newadmin.firstName
        })

    } catch (error) {
        console.log(error)
        response.status(400).json({
            message: 'Error signing up.',
            error: error.errors || error.message
        })
    }
})

adminRouter.post('/signin', async (request, response) => {
    const { email, password } = request.body;

    if (!email || !password) {
        return response.status(400).json({
            message: 'Invalid email and password.'
        })
    }
    try {
        const foundAdmin = await AdminModel.findOne({ email });
        if (foundAdmin && await bcrypt.compare(password, foundAdmin.password)) {
            const token = jwt.sign({
                id: foundAdmin._id.toString()
            }, process.env.JWT_ADMIN_SECRET)

            response.status(200).json({
                message: 'You have signed in successfully.',
                token: token
            })
        }
    }
    catch (error) {
        console.log(error)
        response.status(500).json({
            message: 'Error signing in.',
            error: error.errors || error.message
        })
    }
})

// /api/v1/course/course shouldn't be there, it's /api/v1/course
adminRouter.post('/course', adminMiddleware, async (request, response) => {
    const adminId = request.adminId;

    const courseSchema = z.object({
        title: z.string().min(1).max(50),
        description: z.string().min(5).max(100),
        price: z.number(),
        imageUrl: z.string().min(1).max(100)
    })
    try{
        const courseData = courseSchema.parse(request.body);
        const course = await CourseModel.create({
            ...courseData,
            adminId
        }) 
        response.status(201).json({
            message: 'Course created.',
            courseId: course._id
        })

    }catch(error){
        console.log(error);
        response.json({
            message: 'Error creating course.',
            error: error.errors || error.message
        })
    }
})

adminRouter.put('/course', (request, response) => {
    const adminId = request.adminId

    response.json({
        message: 'admin delete courses endpoint.'
    })
})

adminRouter.get('/course/bulk', (request, response) => {
    response.json({
        message: 'admin all courses endpoint.'
    })
})

export { adminRouter }