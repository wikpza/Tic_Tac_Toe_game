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
        {expiresIn:"5d"},
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
        subject: type === "verificationEmail" ? "Подтверждение электронной почты" : "Запрос на сброс пароля",
        html: type === "verificationEmail" ?
            `
            <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f7f7f7;
                            color: #333;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            width: 100%;
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #fff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        }
                        h1 {
                            color: #4CAF50;
                            font-size: 26px;
                        }
                        p {
                            font-size: 16px;
                            line-height: 1.5;
                        }
                        a {
                            display: inline-block;
                            padding: 12px 24px;
                            margin-top: 20px;
                            background-color: #4CAF50;
                            color: #fff;
                            text-decoration: none;
                            border-radius: 5px;
                            font-size: 18px;
                        }
                        a:hover {
                            background-color: #45a049;
                        }
                        .footer {
                            margin-top: 30px;
                            font-size: 14px;
                            color: #777;
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Приветствуем вас!</h1>
                        <p>Спасибо, что посетили наш сайт и предоставили свой электронный адрес.</p>
                        <p>Для подтверждения вашего адреса электронной почты, пожалуйста, нажмите на ссылку ниже:</p>
                        <a href="${verificationLink}">Подтвердить электронную почту</a>
                        <p>Спасибо!</p>
                        <p class="footer">С уважением, команда проекта</p>
                    </div>
                </body>
            </html>
            `
            :
            `
            <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f7f7f7;
                            color: #333;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            width: 100%;
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #fff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        }
                        h1 {
                            color: #ff5722;
                            font-size: 26px;
                        }
                        p {
                            font-size: 16px;
                            line-height: 1.5;
                        }
                        a {
                            display: inline-block;
                            padding: 12px 24px;
                            margin-top: 20px;
                            background-color: #ff5722;
                            color: #fff;
                            text-decoration: none;
                            border-radius: 5px;
                            font-size: 18px;
                        }
                        a:hover {
                            background-color: #e64a19;
                        }
                        .footer {
                            margin-top: 30px;
                            font-size: 14px;
                            color: #777;
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Запрос на сброс пароля</h1>
                        <p>Мы получили запрос на изменение пароля для вашей учетной записи.</p>
                        <p>Для сброса пароля, пожалуйста, нажмите на ссылку ниже:</p>
                        <a href="${resetLink}">Сбросить пароль</a>
                        <p>Если вы не запрашивали сброс пароля, игнорируйте это письмо.</p>
                        <p class="footer">С уважением, команда проекта</p>
                    </div>
                </body>
            </html>
            `
    };
};
