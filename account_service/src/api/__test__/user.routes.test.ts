import {faker} from "@faker-js/faker";
import {generatePhoneNumber, userFactory, userSessionFactory} from "../../utils/fixtures";
import userRoutes, {userService} from "../user.routes";
import request from "supertest";
import express from "express";

const app = express()
app.use(express.json())
app.use(userRoutes)

const mockUser =()=>{
    return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email:faker.internet.email(),
        password:faker.internet.password(),
        phoneNumber: generatePhoneNumber(),
    }
}

describe('User Routes', ()=>{
    describe("Post /user", ()=>{
        test('should create user session', async()=>{
            const requestBody = mockUser()
            const userSession = userSessionFactory.build()
            const expectedUserSession = {
                _id:userSession._id,
                email:userSession.email,
                createdAt: userSession.createdAt,
                type: userSession.type
            }
            jest.spyOn(userService,'createUser')
                .mockImplementation(()=>Promise.resolve(userSession))

            const response = await request(app)
                .post('/registration')
                .send(requestBody)
                .set('Accept', 'application/json')

            console.log(response.status,response)

            expect(response.status).toBe(201)

            const responseBody = {
                ...response.body,
                createdAt: new Date(response.body.createdAt),
            };

            expect(responseBody).toEqual(expectedUserSession)
        } )
        test('should response with validation error 400', async()=>{
            const requestBody = mockUser()
            const response = await request(app)
                .post('/registration')
                .send({...requestBody, firstName:""})
                .set('Accept', 'application/json')
            console.log('TEST RESPONSE', response)

            expect(response.status).toBe(400)
            expect(response.body).toEqual('firstName should not be empty')

        })
    })
})