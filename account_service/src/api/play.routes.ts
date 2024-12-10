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
import PlayModel from "../database/schemas/userPlay";


const router = express.Router()
export const userService = new UserService(new UserRepository())

router.get('/',
    checkTokenJWT,
    async(req:AuthenticatedRequest, res:Response, next:NextFunction)=>{
        try{
            const page = typeof req.query.page === 'string' ? parseInt(req.query.page, 10) : 1;
            const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : 10;

            const id = req.user?._id
            if(!id) return res.status(200).json({list:[], totalPages:1})

            const SessionPlay = await PlayModel.find({
                $or: [
                    { player1: id },
                    { player2: id }
                ]
            })
                .limit(limit)
                .skip((page - 1) * limit)
                .populate('player1', 'name')  // Заполняем поле player1, выбираем только поле name
                .populate('player2', 'name')
                .select('player1 player2 winnerId createdAt type')// Заполняем поле player2, выбираем только поле name


            const totalInventoryCount = await PlayModel.countDocuments(
                {
                    $or: [
                        { player1: id },
                        { player2: id }
                    ]
                });

            const totalPages = Math.ceil(totalInventoryCount / limit);


            return res.status(200).json({list:SessionPlay, totalPages:totalPages})
        }catch(error){
            const err = error as Error
            console.log(err)
            return res.status(500).json("unable to get history")
        }
    })
export default router