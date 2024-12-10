import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    MinLength
} from "class-validator";

import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsValidArrayValues(allowedValues: string[], validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isValidArrayValues',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (!Array.isArray(value)) return false;
                    return value.every(item => allowedValues.includes(item));
                },
                defaultMessage(args: ValidationArguments) {
                    return `Array can only contain the values: ${allowedValues.join(', ')}.`;
                },
            },
        });
    };
}




export class CreateUserRequest {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50, { message: 'name must not be greater than 50 characters' })
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(8, { message: 'password must be greater than 8 characters' })
    password?: string;
}

export class authenticationUserRequest{
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(8, { message: 'password must be greater than 8 characters' })
    password?: string;
}


export class UpdateUserRequest {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @MaxLength(50, { message: 'name must not be greater than 50 characters' })
    name: string;
}

export class ResetUserPasswordRequest {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}

export class ChangeUserPasswordRequest {
    @IsString()
    @MinLength(8, { message: 'password must be greater than 8 characters' })
    password?: string;
}