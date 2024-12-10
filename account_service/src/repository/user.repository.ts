import {IUserRepository} from "../interface/userRepository.interface";
import {
    ChangePasswordUser,
    CreateUser,
    CreateUserSession, UpdateUser,
    User,
    UserAuthenticationForm,
    UserSession,
    UserSessionType
} from "../models/user.model";

import bcrypt from 'bcrypt'
import {

    generateJwtSession,
    mailConfigurations, toUserSessionType,
    transporter
} from "../utils";
import {NotFoundError} from "../utils/error";
import {UserModel, UserSessionModel} from "../database/schemas/user";
import {logger} from "../utils/logger";
import {TokenUserSession} from "../models/token.model";
import mongoose from "mongoose";


export class UserRepository implements IUserRepository {
    async createSession(data: CreateUserSession, typeSession:UserSessionType):Promise<UserSession>{

        const userSessionExist = await UserSessionModel.findOne({userId:data._id, type:typeSession}).sort({createdAt:-1}).exec()

        if(userSessionExist){
            const term:number = Math.abs( (userSessionExist.createdAt.getTime() - new Date().getTime())) / (60000)
            if(term < 3){
                throw new NotFoundError("unable to sent email, wait a few minute and try again");
            }
        }

        let fullToken = 'Bearer '
        const newUserSession = await UserSessionModel.create({
            userId: data._id,
            type: typeSession,
            token: fullToken,
            email:data.email,
        });

        const token = generateJwtSession({
            _id: newUserSession._id.toString(),
            userId:data._id.toString(),
            email: data.email,
            type: toUserSessionType(newUserSession.type),
        } as TokenUserSession);

        fullToken = fullToken + token
        newUserSession.token = fullToken

        await transporter.sendMail(mailConfigurations(data.email, typeSession, token));
        await newUserSession.save();
        return {
            _id:newUserSession._id,
            email:newUserSession.email,
            token:newUserSession.token,
            status:newUserSession.status,
            userId:data._id,
            type:toUserSessionType(newUserSession.type),
            createdAt:newUserSession.createdAt,
            modifiedAt:newUserSession.modifiedAt
        }
    }
    async createUser(data: CreateUser): Promise<UserSession> {
        try {
            const hashPassword = await bcrypt.hash(data.password, 5);
            const newUser = await UserModel.create({
                ...data,
                password: hashPassword,
            });
            await newUser.save();
           return await this.createSession({email:newUser.email,_id:newUser._id}, 'verificationEmail')
        } catch (error) {
            logger.error(error)
            throw new NotFoundError('An error occurred while sending the message. Please try again later.')
        }
    }
    async registration(data: CreateUser): Promise<UserSession> {
       const userEmailExist = await  UserModel.findOne({email:data.email})

        if(userEmailExist && userEmailExist.active){
            throw new NotFoundError("user has already exist");
        }

        const userNameExist = await UserModel.findOne({name:data.name})

        if(userNameExist && userNameExist.active){
            throw new NotFoundError("This name is taken");
        }

        if(!userEmailExist){
             return await this.createUser(data)
        }


        const userSession = await this.createSession({_id:userEmailExist._id, email:data.email}, 'verificationEmail')

        const hashPassword = await bcrypt.hash(data.password, 5)
        userEmailExist.name = data.name
        userEmailExist.password = hashPassword
        userEmailExist.modifiedAt = new Date()

        return userSession

    }
    async authentication(data: UserAuthenticationForm): Promise<User> {
        const userExist = await UserModel.findOne({email:data.email}).exec()
        if(!userExist || !userExist.active){
            throw new NotFoundError('not found user with such email')
        }

        let comparePassword = bcrypt.compareSync(data.password, userExist.password)
        if (!comparePassword) {
            throw new NotFoundError('wrong password')
        }

        return {
            _id:userExist._id,
            name:userExist.name,
            active:userExist.active,
            email:userExist.email,
            createdAt:userExist.createdAt,
            modifiedAt:userExist.modifiedAt,
        }
    }

    async resetPassword(email: string): Promise<UserSession> {
        const userExist = await UserModel.findOne({email}).exec()
        if(!userExist){
            throw new NotFoundError('not found user with such email')
        }
        if(userExist && !userExist.active){
            throw new NotFoundError('not found user with such email')
        }

        return await this.createSession({_id:userExist._id,email}, 'resetPassword')
    }

    async updateUser(data: UpdateUser): Promise<User> {
        const userExist = await UserModel.findOne({name:data.name}).exec()
        if(userExist) throw new NotFoundError('user with such id has been created')

        const mainUser = await UserModel.findById(data._id)
        if(!mainUser) throw new NotFoundError('not found user')
        mainUser.name = data.name

        return {
            _id:mainUser._id,
            name:mainUser.name,
            active:mainUser.active,
            email:mainUser.email,
        } as User
    }

    async verifyMail(data: TokenUserSession): Promise<User> {
        console.log(data)
        const userSession = await UserSessionModel.findById(data._id).exec()
        if(!userSession){
            throw new NotFoundError('session not found')
        }
        if(userSession && userSession.status){
            throw new NotFoundError('url is expired or invalid')
        }
        const term:number = Math.abs( (userSession.createdAt.getTime() - new Date().getTime())) / (60000)
        if(term > 5){
            throw new NotFoundError('time is out, try again')
        }

        const user = await UserModel.findById(userSession.userId).exec()
        if(!user){
            throw new NotFoundError('unable to verify email')
        }
        user.active = true
        userSession.status = true
        await userSession.save()
        await user.save()

        return {
            _id:user._id,
            name:user.name,
            active:user.active,
            email:user.email
        }

    }

    async getInfo(userId: string | mongoose.Types.ObjectId): Promise<User> {
        const userData = await UserModel.findById(userId).exec()
        if(!userData) throw new NotFoundError('user not found')
        return {
            name:userData.name,
            active:userData.active,
            _id:userData._id,
            email:userData.email,
            createdAt:userData.createdAt,
        }
    }

    async changePassword(data: ChangePasswordUser): Promise<string> {

        const userSession = await UserSessionModel.findById(data._id).exec()

        if(!userSession){
            throw new NotFoundError('session not found')
        }

        if(userSession && userSession.status){
            throw new NotFoundError('url is expired or invalid')
        }

        const term:number = Math.abs( (userSession.createdAt.getTime() - new Date().getTime())) / (60000)
        if(term > 5){
            throw new NotFoundError('time is out, try again')
        }

        const user = await UserModel.findById(userSession.userId).exec()
        if(!user){
            throw new NotFoundError('unable to change password')
        }

        user.password = await bcrypt.hash(data.password, 5)
        userSession.status = true
        user.modifiedAt = new Date()
        await userSession.save()
        await user.save()

        return 'password has been changed successfully'
    }



}

