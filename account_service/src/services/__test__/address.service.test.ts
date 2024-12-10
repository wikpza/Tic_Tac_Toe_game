import {describe} from "node:test";
import {IAddressesRepository} from "../../interface/addressRepository.interface";
import {de, faker} from "@faker-js/faker";
import {MockAddressRepository} from "../../repository/mockAddress.repository";
import {AddressService} from "../address.service";
import exp from "node:constants";
import {Address} from "../../models";
import {addressFactory} from "../../utils/fixtures";


const mockAddress = (rest: any)=>{
    return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        addressLine1: faker.location.streetAddress(),
        addressLine2: faker.location.secondaryAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        phoneNumber:faker.phone.number(),
         preferred: faker.datatype.boolean(),
             ...rest
    }
}


describe('addressService',()=>{

    let repository: IAddressesRepository


    describe('createAddress', ()=>{
        test("should create address", async ()=>{
            const service = new AddressService(repository)
            const reqBody = mockAddress({})

            const result =  await service.createAddress(reqBody)
            expect(result).toMatchObject({
                _id:expect.any(String),

                firstName: expect.any(String),
                lastName: expect.any(String),
                addressLine1: expect.any(String),
                addressLine2: expect.any(String),
                city:expect.any(String),
                state: expect.any(String),
                zipCode:expect.any(String),
                phoneNumber:expect.any(String),
                preferred: expect.any(Boolean),

                createdAt: expect.any(Date),
                modifiedAt:expect.any(Date),
                deletedAt:expect.any(Date),
            })

        })

        test("should throw error with address already exist", async()=>{
            const service = new AddressService(repository)
            const reqBody = mockAddress({})
            jest.spyOn(repository, 'create')
                .mockImplementation(()=>Promise.resolve({} as Address))

            await expect(service.createAddress(reqBody)).rejects.toThrow('unable to create address')
        })

        describe('updateAddress', ()=>{
            test("should update address", async()=>{
                const service = new AddressService(repository)
                const reqBody = mockAddress({
                    _id:faker.string.uuid(),
                    createdAt:faker.date.anytime(),
                    modifiedAt:faker.date.anytime(),
                    deletedAt: faker.date.anytime(),
                })
                const result = await service.updateAddress(reqBody)
                expect(result).toMatchObject(reqBody)
            })

            test('should throw error with address does not exist', async()=>{
                const service = new AddressService(repository)
                jest
                    .spyOn(repository, 'update')
                    .mockImplementation(()=> Promise.reject(new Error("address does not exist")))

                await expect(service.updateAddress({})).rejects.toThrow('' +
                    'address does not exist')
            })
        })

        describe('getAddresses', ()=>{
            test("should get addresses", async()=>{
                const service = new AddressService(repository)
                const randomLimit = faker.number.int({min:0, max:8})
                const addresses = addressFactory.buildList(randomLimit)

                jest.spyOn(repository, 'get')
                    .mockImplementation(()=>Promise.resolve(addresses))

                const result = await service.getAddresses()
                expect(result.length).toEqual(randomLimit)
                expect(result).toMatchObject(addresses)
            })

            test('should throw with error addresses does not exist', async()=>{
                const service = new AddressService(repository)
                jest
                    .spyOn(repository, 'get')
                    .mockImplementation(()=>
                    Promise.reject(new Error("address does not exist")))

                await expect(service.getAddresses()).rejects.toThrow('address does not exist')
            })
        })
    })
    describe('getAddress', () => {
        test('should get address by id', async()=>{
            const service = new AddressService(repository)
            const address = addressFactory.build()
            jest
                .spyOn(repository, 'getOne')
                .mockImplementation(()=>Promise.resolve(address))
            const result = await service.getAddress(address._id!)
            expect(result).toMatchObject(address)
        })
    });

    describe('setPreferredAddress', ()=>{
        test('should set preferred address by id', async()=>{
            const service = new AddressService(repository)
            const address = addressFactory.build({
                preferred:true
                })
            jest
                .spyOn(repository, 'setPreferred')
                .mockImplementation(()=>
                Promise.resolve({...address, preferred:true}))

            const result = await service.setPreferred(address._id!)
            expect(result).toMatchObject({...address, preferred:true})
        })
    })

    describe('deleteAddress', ()=>{
        test('should delete address by id', async()=>{
            const service = new AddressService(repository)
            const address = addressFactory.build()
            jest
                .spyOn(repository, 'delete')
                .mockImplementation(()=>
                    Promise.resolve({_id:address._id}))
            const result = await service.deleteAddress(address._id!)
            expect(result).toMatchObject({_id : address._id})
        })
    })


})