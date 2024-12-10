import {
    ChangePasswordUser,
    CreateUser,
    CreateUserSession, UpdateUser,
    User,
    UserAuthenticationForm,
    UserSession,
    UserSessionType
} from "../models/user.model";
import {TokenUserSession} from "../models/token.model";
import mongoose from "mongoose";

export interface IUserRepository{
    registration(data: CreateUser): Promise<UserSession>;
    createUser(data:CreateUser): Promise<UserSession>
    verifyMail(data:TokenUserSession):Promise<User>;
    createSession(data:CreateUserSession, type:UserSessionType):Promise<UserSession>
    authentication(data:UserAuthenticationForm):Promise<User>;
    updateUser(data: UpdateUser): Promise<User>;
    resetPassword(email:string):Promise<UserSession>;

    getInfo(userId:string | mongoose.Types.ObjectId):Promise<User>;

    changePassword(data:ChangePasswordUser):Promise<string>;
}