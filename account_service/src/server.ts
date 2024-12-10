import expressApp from "./expressApp";
import connectDB from "./database";
import dotenv from 'dotenv';
import {logger} from "./utils/logger";
dotenv.config();

const PORT = process.env.PORT || 9001

export const StartServer = async()=>{
    expressApp.listen(PORT, ()=>{
        logger.info('App is listening to :', PORT)
    })

    process.on("uncaughtException", async(err)=>{
        logger.error(err)
        process.exit(1)
    })

}

StartServer().then(()=>{
    logger.info("server is up")
    connectDB()
})
