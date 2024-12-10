import mongoose from "mongoose";

export type UserSessionType = 'verificationEmail' | 'resetPassword'
export class User {
    constructor(
        public readonly name?: string,
        public rating?:number,

        public readonly active?: boolean,


        public readonly _id?: string | mongoose.Types.ObjectId,
        public readonly password?: string,
        public readonly email?: string,

        public readonly createdAt?: Date,
        public readonly modifiedAt?:Date,

    ) {
    }
}

export class ChangePasswordUser{
    constructor(
        public readonly _id: string | mongoose.Types.ObjectId,
        public readonly userId: string | mongoose.Types.ObjectId,
        public readonly email: string,
        public readonly  type: UserSessionType | string,
        public readonly password:string
    ) {
    }
}

export class CreateUser{
    constructor(
        public readonly name: string,
        public readonly password: string,
        public readonly email: string,
        public readonly phoneNumber:string,
    ) {
    }
 }

export class CreateUserSession{
    constructor(
        public readonly _id:string  | mongoose.Types.ObjectId,
        public readonly email: string
    ) {
    }
}

type UserUpdateFields = 'firstName' | 'lastName' | 'phoneNumber';

export class UpdateUser {
    constructor(
        public readonly _id: string | mongoose.Types.ObjectId,
        public readonly name:string,

        public readonly createdAt?: Date,
        public readonly modifiedAt?: Date,
    ) {}
}

export class UserSession{

    constructor(
        public readonly userId:string  | mongoose.Types.ObjectId,
        public readonly token:string,
        public readonly type:UserSessionType,
        public readonly status:boolean,
        public readonly email:string,

        public readonly _id?:string  | mongoose.Types.ObjectId,
        public readonly createdAt?: Date,
        public readonly modifiedAt?:Date,
    ) {
    }
}
export class UserAuthenticationForm{
    public readonly email:string
    public readonly  password:string
}