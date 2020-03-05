import { assert } from 'chai'
import { Family } from '../../../src/application/domain/model/family'
import { FamilyMock } from '../../mocks/family.mock'
import { FamilyEntityMapper } from '../../../src/infrastructure/entity/mapper/family.entity.mapper'
import { FamilyEntity } from '../../../src/infrastructure/entity/family.entity'
import { UserType } from '../../../src/application/domain/model/user'

describe('Mappers: FamilyEntity', () => {
    const family: Family = new FamilyMock()
    family.password = 'family_password'
    family.children![1].id = undefined

    // To test how mapper works with an object without any attributes
    const emptyFamily: Family = new Family()
    emptyFamily.type = undefined
    emptyFamily.scopes = undefined!

    // Create family JSON
    const familyJSON: any = {
        id: '7cf999f68228fb5e49f1d198',
        type: 'family',
        scopes: [
            'children:read',
            'families:read',
            'families:update',
            'institutions:read',
            'physicalactivities:create',
            'physicalactivities:read',
            'physicalactivities:update',
            'physicalactivities:delete',
            'sleep:create',
            'sleep:read',
            'sleep:update',
            'sleep:delete',
            'measurements:create',
            'measurements:read',
            'measurements:delete',
            'environment:read',
            'socioquest:create',
            'socioquest:read',
            'socioquest:update',
            'healthquest:create',
            'healthquest:read',
            'healthquest:update',
            'parentphyquest:create',
            'parentphyquest:read',
            'parentphyquest:update',
            'childrenphyquest:read',
            'habitsquest:create',
            'habitsquest:read',
            'habitsquest:update',
            'foodhabitsquest:create',
            'foodhabitsquest:read',
            'foodhabitsquest:update',
            'perceptionquest:create',
            'perceptionquest:read',
            'perceptionquest:update',
            'foodtracking:create',
            'foodtracking:read',
            'foodtracking:update',
            'foodtracking:delete',
            'missions:create',
            'missions:read',
            'missions:update',
            'gamificationprofile:create',
            'gamificationprofile:read',
            'external:sync',
            'notifications:create'
        ],
        username: 'family_mock',
        password: 'family_password',
        institution: '08acd7b4216880c5c576e805',
        children: [
            {
                id: '719a847e5582d1ad44d8e804',
                type: 'child',
                scopes: [
                    'children:read',
                    'institutions:read',
                    'physicalactivities:create',
                    'physicalactivities:read',
                    'sleep:create',
                    'sleep:read',
                    'measurements:create',
                    'measurements:read',
                    'environment:read',
                    'foodtracking:create',
                    'foodtracking:read',
                    'foodtracking:update',
                    'foodtracking:delete',
                    'missions:read',
                    'gamificationprofile:read',
                    'gamificationprofile:update',
                    'external:sync'
                ],
                username: 'child_mock',
                institution: '08acd7b4216880c5c576e805',
                gender: 'male',
                age: 8
            },
            {
                id: '8e7d3ff55107e8dc5f078dcb',
                type: 'child',
                scopes: [
                    'children:read',
                    'institutions:read',
                    'physicalactivities:create',
                    'physicalactivities:read',
                    'sleep:create',
                    'sleep:read',
                    'measurements:create',
                    'measurements:read',
                    'environment:read',
                    'foodtracking:create',
                    'foodtracking:read',
                    'foodtracking:update',
                    'foodtracking:delete',
                    'missions:read',
                    'gamificationprofile:read',
                    'gamificationprofile:update',
                    'external:sync'
                ],
                username: 'child_mock',
                institution: '08acd7b4216880c5c576e805',
                gender: 'female',
                age: 7
            },
             {
                id: '652c42d320e4a62cb9bdce50',
                type: 'child',
                scopes: [
                    'children:read',
                    'institutions:read',
                    'physicalactivities:create',
                    'physicalactivities:read',
                    'sleep:create',
                    'sleep:read',
                    'measurements:create',
                    'measurements:read',
                    'environment:read',
                    'foodtracking:create',
                    'foodtracking:read',
                    'foodtracking:update',
                    'foodtracking:delete',
                    'missions:read',
                    'gamificationprofile:read',
                    'gamificationprofile:update',
                    'external:sync'
                 ],
                username: 'child_mock',
                institution: '08acd7b4216880c5c576e805',
                gender: 'female',
                age: 8
             }
         ]
    }

    // To test how mapper works with an object without any attributes (JSON)
    const emptyFamilyJSON: any = {}

    describe('transform(item: any)', () => {
        context('when the parameter is of type Family', () => {
            it('should normally execute the method, returning a FamilyEntity as a result of the transformation', () => {
                const result: FamilyEntity = new FamilyEntityMapper().transform(family)
                assert.propertyVal(result, 'id', family.id)
                assert.propertyVal(result, 'username', family.username)
                assert.propertyVal(result, 'password', family.password)
                assert.propertyVal(result, 'type', family.type)
                assert.propertyVal(result, 'scopes', family.scopes)
                assert.propertyVal(result, 'institution', family.institution!.id)
                assert.equal(result.children![0], family.children![0].id)
                assert.equal(result.children![1], family.children![1].id)
            })
        })

        context('when the parameter is of type Family and does not contain any attributes', () => {
            it('should normally execute the method, returning an empty FamilyEntity', () => {
                const result: FamilyEntity = new FamilyEntityMapper().transform(emptyFamily)
                assert.isEmpty(result)
            })
        })

        context('when the parameter is a JSON', () => {
            it('should not normally execute the method, returning a Family as a result of the transformation', () => {
                const result: Family = new FamilyEntityMapper().transform(familyJSON)
                assert.propertyVal(result, 'id', familyJSON.id)
                assert.propertyVal(result, 'username', familyJSON.username)
                assert.propertyVal(result, 'password', familyJSON.password)
                assert.propertyVal(result, 'type', familyJSON.type)
                assert.propertyVal(result, 'scopes', familyJSON.scopes)
                assert.equal(result.institution!.id, familyJSON.institution)
                assert.property(result, 'children')
            })
        })

        context('when the parameter is a JSON without an institution', () => {
            it('should not normally execute the method, returning a Family as a result of the transformation', () => {
                familyJSON.institution = null
                const result: Family = new FamilyEntityMapper().transform(familyJSON)
                assert.propertyVal(result, 'id', familyJSON.id)
                assert.propertyVal(result, 'username', familyJSON.username)
                assert.propertyVal(result, 'password', familyJSON.password)
                assert.propertyVal(result, 'type', familyJSON.type)
                assert.propertyVal(result, 'scopes', familyJSON.scopes)
                assert.isUndefined(result.institution)
                assert.property(result, 'children')
            })
        })

        context('when the parameter is a JSON and does not contain any attributes', () => {
            it('should normally execute the method, returning a Family as a result of the transformation', () => {
                const result: Family = new FamilyEntityMapper().transform(emptyFamilyJSON)

                assert.propertyVal(result, 'id', emptyFamilyJSON.id)
                assert.propertyVal(result, 'username', emptyFamilyJSON.username)
                assert.propertyVal(result, 'password', emptyFamilyJSON.password)
                assert.propertyVal(result, 'type', UserType.FAMILY)
                assert.deepPropertyVal(result, 'scopes', familyJSON.scopes)
                assert.propertyVal(result, 'institution', emptyFamilyJSON.institution)
                assert.propertyVal(result, 'children', emptyFamilyJSON.children)
            })
        })

        context('when the parameter is a undefined', () => {
            it('should not normally execute the method, returning a Family as a result of the transformation', () => {
                const result: Family = new FamilyEntityMapper().transform(undefined)

                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'username', undefined)
                assert.propertyVal(result, 'password', undefined)
                assert.propertyVal(result, 'institution', undefined)
                assert.propertyVal(result, 'children', undefined)
            })
        })
    })
})
