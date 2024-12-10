import {validate} from "class-validator";

export const ValidatorError = async(input:any): Promise<Record<string, any> | false> => {
    const error = await validate(input, {
        ValidatorError:{target:true, property:true}
    })
    if(error.length){
        return error.map((err)=>({
            field:err.property,
            message:
                (err.constraints && Object.values(err.constraints)[0]) ||
                'please provide input for this field',
        }))
    }
    return false
}