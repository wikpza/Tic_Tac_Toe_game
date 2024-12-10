import mongoose, {Model} from "mongoose";
import {User} from "../../models";


export const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        unique:true
    },
    rating: {
        type: Number,
        default:0
    },
    password: {
        type: String,
        required: true,
    },

    active: {
        type: Boolean,
        default:false
    },

    createdAt: {
        type: Date,
        default:Date.now
    },
    modifiedAt: {
        type: Date,
        default:Date.now
    },
});

const userSessionSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    },
    email:{
        type:String,
        required:true,
    },

    token:{
        type:String,
        required:true,
    },
    type:{
        type:String,
        enum:['verificationEmail', 'resetPassword']
    },
    createdAt: {
        type: Date,
        default:Date.now
    },
    modifiedAt: {
        type: Date,
        default:Date.now
    },
    status:{
        type:Boolean,
        default:false
    }
})

export const UserSessionModel = mongoose.model('UserSession',userSessionSchema )
export const UserModel = mongoose.model("User", userSchema);
