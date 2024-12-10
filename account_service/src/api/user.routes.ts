import express, {NextFunction, Response, Request} from "express";
import {RequestValidator} from "../utils/requestValidator";
import {
    authenticationUserRequest, ChangeUserPasswordRequest,
    CreateUserRequest,
    ResetUserPasswordRequest,
    UpdateUserRequest
} from "../dto/user.dto";
import {UserService} from "../services/user.service";
import {UserRepository} from "../repository/user.repository";

import {TokenUser, TokenUserSession} from "../models/token.model";
import {
    AuthenticatedRequest,
    checkTokenJWT,
    UserSessionRequest,
    verifySessionTokenJWT
} from "./middlewares/user.middlewares";
import {generateJwt} from "../utils";
import {logger} from "../utils/logger";
import {ChangePasswordUser, UpdateUser, User} from "../models";
import {NotFoundError} from "../utils/error";
import {UserModel} from "../database/schemas/user";
import mongoose, {Document} from "mongoose";


const router = express.Router()
export const userService = new UserService(new UserRepository())

router.post('/registration', async(req:Request, res:Response, next:NextFunction)=>{
    try{
        const {errors, input} = await RequestValidator(
            CreateUserRequest,
            req.body
        )
        if(errors) return res.status(400).json(errors)
        const userSession = await userService.createUser(req.body)
        return res.status(201).json(
            {
                _id:userSession._id,
                email:userSession.email,
                createdAt:userSession.createdAt,
                type:userSession.type,
        })
    }catch(error){
        const err = error as Error
        return res.status(500).json(err.message)
    }

})

router.post('/login', async(req:Request, res:Response, next:NextFunction)=>{
    try{
        const {errors, input} = await RequestValidator(
            authenticationUserRequest,
            req.body
        )
        if(errors) return res.status(400).json(errors)
        const user = await userService.authentication({email:req.body.email, password:req.body.password})
        const token = generateJwt(
            {
                _id:user._id,
               name:user.name,
                email:user.email
            } as TokenUser)
        return res.status(201).json({token})
    }catch (error){
        const err = error as Error
        return res.status(500).json(err.message)
    }

})


router.get('/verify/:token',
    verifySessionTokenJWT,
    async (req: UserSessionRequest, res: Response, next: NextFunction) => {
        try {
            const sessionToken = req.tokenSession;

            if (!sessionToken) {
                throw new NotFoundError('not found data');
            }

            // Верификация email пользователя
            const user = await userService.verifyEmail(sessionToken);

            // Генерация нового JWT токена
            const token = generateJwt({
                _id: user._id,
                name: user.name,
                email: user.email,
            } as TokenUser);

            // Возвращаем HTML страницу с успешным сообщением
            return res.status(200).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Verified</title>
                <style>
                    body {
                        background: linear-gradient(to top, #1f3c88, #6a4f9b);
                        font-family: 'Arial', sans-serif;
                        color: white;
                        text-align: center;
                        padding: 50px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: rgba(255, 255, 255, 0.1);
                        padding: 30px;
                        border-radius: 10px;
                    }
                    h1 {
                        font-size: 3rem;
                        margin-bottom: 20px;
                    }
                    p {
                        font-size: 1.25rem;
                        margin-bottom: 30px;
                    }
                    .btn {
                        padding: 12px 20px;
                        background-color: #fe8e62;
                        color: white;
                        border: none;
                        border-radius: 10px;
                        font-size: 1.2rem;
                        cursor: pointer;
                        text-decoration: none;
                    }
                    .btn:hover {
                        background-color: #64e3ac;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Поздравляем, ваш email успешно верифицирован!</h1>
                    <p>Вы успешно зарегистрировались и подтвердили свой email. Теперь вы можете войти в систему и начать играть в крестики-нолики.</p>
             
                </div>
            </body>
            </html>
        `);

        } catch (error) {
            const err = error as Error;
            console.log(err);
            return res.status(500).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Error</title>
                <style>
                    body {
                        background: linear-gradient(to top, #1f3c88, #6a4f9b);
                        font-family: 'Arial', sans-serif;
                        color: white;
                        text-align: center;
                        padding: 50px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: rgba(255, 255, 255, 0.1);
                        padding: 30px;
                        border-radius: 10px;
                    }
                    h1 {
                        font-size: 3rem;
                        margin-bottom: 20px;
                    }
                    p {
                        font-size: 1.25rem;
                        margin-bottom: 30px;
                    }
                    .btn {
                        padding: 12px 20px;
                        background-color: #fe8e62;
                        color: white;
                        border: none;
                        border-radius: 10px;
                        font-size: 1.2rem;
                        cursor: pointer;
                        text-decoration: none;
                    }
                    .btn:hover {
                        background-color: #64e3ac;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Что-то пошло не так...</h1>
                    <p>Не удалось верифицировать ваш email. Пожалуйста, попробуйте позже.</p>
                    <a href="/contact" class="btn">Связаться с поддержкой</a>
                </div>
            </body>
            </html>
        `);
        }
    });


router.patch('/',
    checkTokenJWT,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            if(!req.user){
                return res.status(400).json({message:"not found user"})
            }

            const { errors, input } = await RequestValidator(
                UpdateUserRequest,
                req.body
            );


            if (errors) return res.status(400).json(errors);



            const user: User = await userService.updateUser(
                {_id:req.user._id,
                  name:req.body.name
                } as UpdateUser
            );
            const token =  generateJwt(
                {
                    _id:user._id,
                   name:user.name,
                    email:user.email
                } as TokenUser)
            return res.status(200).json(token);

        } catch (error) {
            const err = error as Error;
            logger.error(error);
            return res.status(500).json({ message: err.message });
        }
    }
);

router.post('/reset',
    async(req:Request, res:Response, next:NextFunction)=>{
        try {
            const { errors, input } = await RequestValidator(
                ResetUserPasswordRequest,
                req.body
            );

            if (errors) return res.status(400).json(errors);
            const userSession = await userService.resetPassword(req.body.email)
            return res.status(200).json({
                    _id: userSession._id,
                    email: userSession.email,
                    createdAt: userSession.createdAt,
                    type: userSession.type,
                }
            );
        } catch (error) {
            const err = error as Error;
            logger.error(error);
            return res.status(500).json({ message: err.message });
        }
})

router.post(
    '/reset/:token',
    verifySessionTokenJWT,
    async(req:UserSessionRequest, res:Response, next:NextFunction)=>{
    try {
        const { errors, input } = await RequestValidator(
            ChangeUserPasswordRequest,
            req.body
        );
        if (errors) return res.status(400).json(errors);
        const message = await userService.changePassword({...req.tokenSession, password:req.body.password} as ChangePasswordUser)

        return res.status(200).json(message);
    } catch (error) {
        const err = error as Error;
        logger.error(error);
        return res.status(500).json({ message: err.message });
    }
})



router.get('/',
    checkTokenJWT,
    async(req:AuthenticatedRequest, res:Response, next:NextFunction)=>{
    try{
        if(!req.user || !req.user?._id) return res.status(400).json('invalid token')
        const data = await userService.getUserData(req.user._id)
        return res.status(200).json(data)
    }catch(error){
        const err = error as Error
        logger.error(error);
        res.status(500).json({message:err.message})
    }
})

router.get('/rating',
    checkTokenJWT,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id;
            if (!userId) return res.status(500).json('Unable to load rating');

            const userRating = 150; // Рейтинг вашего пользователя (например, 150)

            // Получаем всех пользователей, отсортированных по рейтингу
            const allUsers = await UserModel.find({active:true}).sort({ rating: -1 }).select("name rating");

            // Находим индекс текущего пользователя в рейтинговой таблице
            const userIndex = allUsers.findIndex(user => user._id.toString() === userId);
            let updatedUsers = [...allUsers];

            // Если пользователь не найден, возвращаем ошибку
            if (userIndex === -1) return res.status(500).json('User not found');

            // Присваиваем всем пользователям номер в рейтинге
            const updatedUsersWithRanking = updatedUsers.map((user, index) => ({
                ...user.toObject(),
                ranking: index + 1,  // Рейтинг по порядку
            }));

            // Если текущий пользователь уже в топ-10, просто возвращаем топ-10
            if (userIndex < 10) {
                return res.status(200).json({ list: updatedUsersWithRanking.slice(0, 10) });
            }

            // Если пользователь не в топ-10, добавляем его в конец списка топ-10
            const topUsers = updatedUsersWithRanking.slice(0, 10);
            const userToAdd = updatedUsersWithRanking[userIndex];

            // Добавляем пользователя в список, если он не входит в топ-10
            const rankList = topUsers.concat(userToAdd);

            return res.status(200).json({ list: rankList });
        } catch (error) {
            const err = error as Error;
            logger.error(error);
            res.status(500).json({ message: err.message });
        }
    });



export default router