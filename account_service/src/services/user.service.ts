import {IUserRepository} from "../interface/userRepository.interface";
import {ChangePasswordUser, CreateUser, UpdateUser, User, UserSession} from "../models";
import {TokenUserSession} from "../models/token.model";
import {NotFoundError} from "../utils/error";
import mongoose from "mongoose";

export class UserService{
    private _repository: IUserRepository
    constructor(repository:IUserRepository) {
        this._repository = repository
    }

    async createUser(input:CreateUser){
        const data = await this._repository.registration(input)
        return data
    }

    async authentication(input:any){
        const data = await this._repository.authentication(input)
        return data
    }

    async updateUser(input:UpdateUser):Promise<User>{
        const data = await this._repository.updateUser(input)
        if(!data._id){
            throw new NotFoundError('unable to update user')
        }
        return data;
    }

    async verifyEmail(data:TokenUserSession):Promise<User>{
        return await this._repository.verifyMail(data)
    }

    async resetPassword(email:string):Promise<UserSession>{
        return await this._repository.resetPassword(email)
    }

    async changePassword(data:ChangePasswordUser):Promise<string>{
        return this._repository.changePassword(data)
    }

    async getUserData(userId:string | mongoose.Types.ObjectId):Promise<User>{
        if(!userId){
            throw new NotFoundError('unable to get data')
        }
        return await this._repository.getInfo(userId)
    }
}
