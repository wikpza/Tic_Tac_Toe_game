import { UserSessionType} from "../models";
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import {TokenUser, TokenUserSession} from "../models/token.model";
dotenv.config()
export const generateJwt =(input:TokenUser)=>{

    const secretKey = process.env.SECRET_KEY

    if(!secretKey){
        throw new Error("SECRET_KEY is not defined")
    }

    return jwt.sign(
        {_id:input._id,
            name:input.name,
            email:input.email,
        },
        secretKey,
        {expiresIn:"24h"},
    )}

export const generateJwtSession =(input:TokenUserSession)=>{

    const secretKey = process.env.SECRET_KEY_SESSION

    if(!secretKey){
        throw new Error("SECRET_KEY is not defined")
    }

    return jwt.sign(
        {_id:input._id,
            userId:input.userId,
            email:input.email,
            type:input.type
        },
        secretKey,
        {expiresIn:"5m"},
    )}
function isUserSessionType(value: any): value is UserSessionType {
    return value === 'verificationEmail' || value === 'resetPassword';
}

export const toUserSessionType = (unknownValue: any)=>{
    let type:UserSessionType
    if(isUserSessionType(unknownValue)){
        type = unknownValue
    }else{
        throw new Error('unknown type of User session')
    }
    return type
}

export const transporter = nodemailer.createTransport({
    service: `${process.env.SERVICE_TYPE as string}`,
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth:{
        user: `${process.env.MAIL_USER as string}`,
        pass: `${process.env.MAIL_PASSWORD as string}`
    }
})

export const mailConfigurations = (userEmail: string, type: UserSessionType, token: string) => {
    if (!process.env.MAIL_USER) {
        throw new Error("MAIL_USER is not defined");
    }

    if (!process.env.SERVER_REGISTRATION_URL) {
        throw new Error("SERVER_REGISTRATION_URL is not defined");
    }

    if (!process.env.SERVER_RESET_PASSWORD_URL) {
        throw new Error("SERVER_RESET_PASSWORD_URL is not defined");
    }

    const verificationLink = `${process.env.SERVER_REGISTRATION_URL}/${token}`;
    const resetLink = `${process.env.SERVER_RESET_PASSWORD_URL}/${token}`;

    return {
        from: process.env.MAIL_USER,
        to: userEmail,
        subject: type,
        html: type === "verificationEmail" ?
            `<h1>Welcome!</h1>
            <p>Thank you for visiting our website and providing your email.</p>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationLink}">Verify Email</a>
            <p>Thanks,</p>
            <p>The Team</p>`
            :
            `<h1>Password Reset Request</h1>
            <p>We received a request to change your password.</p>
            <p>Please click the link below to reset your password:</p>
            <a href="${resetLink}">Reset Password</a>
            <p>Thanks,</p>
            <p>The Team</p>`
    };
};
