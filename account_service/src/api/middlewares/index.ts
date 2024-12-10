import {NextFunction, Response, Request} from "express";
import dotenv from "dotenv";
import {NotFoundError} from "../../utils/error";
dotenv.config()

const PAYMENT_PORT = process.env.PAYMENT_PORT
const PAYMENT_HOST = process.env.PAYMENT_HOST

export const allowOnlyLocalhost = (req:Request, res:Response, next:NextFunction) => {

    if(!PAYMENT_HOST || !PAYMENT_PORT) throw new Error('PAYMENT_PORT or PAYMENT_HOST not declared')
    const allowedOrigin = `http://${PAYMENT_HOST}:${PAYMENT_PORT}`;
    const origin = req.headers.origin || req.headers.referer;

    if (origin === allowedOrigin) {
        next(); // Разрешить запрос
    } else {
        res.status(403).send('Forbidden'); // Отклонить запрос
    }
};
