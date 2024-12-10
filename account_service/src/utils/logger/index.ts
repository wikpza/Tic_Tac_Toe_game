import pino from 'pino'
import {pinoHttp} from "pino-http";
export const logger = pino({
    level:"info",
    base:{
        serviceName:'account_service'
    },
    serializers:pino.stdSerializers,
    timestamp: ()=> `,"time":"${new Date(Date.now()).toISOString()}"`,
    transport:{
        target:'pino-pretty',
        level:'error'
    },

})

export const httpLogger = pinoHttp({
    level:"error",
    logger,
})