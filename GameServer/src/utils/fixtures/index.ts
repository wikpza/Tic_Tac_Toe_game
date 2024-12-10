import {faker} from "@faker-js/faker";
import {Factory} from 'rosie'
import {Address, User, UserSession} from "../../models";

export const generatePhoneNumber = (): string => {
    const areaCode = faker.number.int({ min: 100, max: 999 }); // Генерация случайного кода области
    const lineNumber1 = faker.number.int({ min: 10, max: 99 }); // Генерация первой части номера линии
    const lineNumber2 = faker.number.int({ min: 10, max: 99 }); // Генерация первой части номера линии
    const lineNumber3 = faker.number.int({ min: 10, max: 99 }); // Генерация второй части номера линии

    return `+996(${areaCode})${lineNumber1}-${lineNumber2}-${lineNumber3}`;
}

export const addressFactory = new Factory<Address>()
    .attr('firstName',faker.person.firstName())
    .attr('lastName', faker.person.lastName())
    .attr("addressLine1", faker.location.streetAddress())
    .attr("addressLine2", faker.location.secondaryAddress())
    .attr("city", faker.location.city())
    .attr("state", faker.location.state())
    .attr("zipCode", faker.location.zipCode())
    .attr("phoneNumber",  generatePhoneNumber())
    .attr("preferred", faker.datatype.boolean())

    .attr("_id",faker.string.uuid())
    .attr("createdAt", new  Date(faker.date.anytime()))
    .attr("modifiedAt", new  Date(faker.date.anytime()))


export const userFactory = new Factory<User>()
    .attr('firstName',faker.person.firstName())
    .attr('lastName', faker.person.lastName())
    .attr("phoneNumber",  generatePhoneNumber())
    .attr("role", 'user')
    .attr('active',true)

    .attr("_id",faker.string.uuid())
    .attr("createdAt",new  Date(faker.date.anytime()))
    .attr("modifiedAt",new  Date(faker.date.anytime()))

export const userSessionFactory = new Factory<UserSession>()
    .attr("_id",faker.string.uuid())
    .attr("userId",faker.string.uuid())
    .attr("token",faker.string.uuid())
    .attr('type', "verificationEmail")
    .attr('status', false)
    .attr("email", faker.internet.email())
    .attr("createdAt",new  Date(faker.date.anytime()))
    .attr("modifiedAt",new  Date(faker.date.anytime()))



