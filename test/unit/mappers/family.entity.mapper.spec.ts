import { assert } from 'chai'
import { Family } from '../../../src/application/domain/model/family'
import { FamilyMock } from '../../mocks/family.mock'
import { FamilyEntityMapper } from '../../../src/infrastructure/entity/mapper/family.entity.mapper'

describe('Mappers: FamilyEntity', () => {
    const family: Family = new FamilyMock()
    family.password = 'family_password'

    // Create educator JSON
    const familyJSON: any = {
        id: '7cf999f68228fb5e49f1d198',
        type: 'family',
        scopes: [
            'families:read',
            'families:update',
            'institutions:read',
            'questionnaires:create',
            'questionnaires:read',
            'questionnaires:update',
            'questionnaires:delete',
            'foodrecord:create',
            'foodrecord:read',
            'foodrecord:update',
            'foodrecord:delete',
            'physicalactivities:create',
            'physicalactivities:read',
            'physicalactivities:update',
            'physicalactivities:delete',
            'sleep:create',
            'sleep:read',
            'sleep:update',
            'sleep:delete',
            'environment:read',
            'missions:read',
            'gamificationprofile:read',
            'external:sync'
        ],
        username: 'family_mock',
        password: 'family_password',
        institution: '08acd7b4216880c5c576e805',
        children: [
            {
                id: '719a847e5582d1ad44d8e804',
                type: 'child',
                scopes: [
                    'families:read',
                    'institutions:read',
                    'questionnaires:create',
                    'questionnaires:read',
                    'questionnaires:update',
                    'questionnaires:delete',
                    'foodrecord:create',
                    'foodrecord:read',
                    'foodrecord:update',
                    'foodrecord:delete',
                    'physicalactivities:create',
                    'physicalactivities:read',
                    'physicalactivities:update',
                    'physicalactivities:delete',
                    'sleep:create',
                    'sleep:read',
                    'sleep:update',
                    'sleep:delete',
                    'environment:read',
                    'missions:read',
                    'gamificationprofile:read'
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
                    'families:read',
                    'institutions:read',
                    'questionnaires:create',
                    'questionnaires:read',
                    'questionnaires:update',
                    'questionnaires:delete',
                    'foodrecord:create',
                    'foodrecord:read',
                    'foodrecord:update',
                    'foodrecord:delete',
                    'physicalactivities:create',
                    'physicalactivities:read',
                    'physicalactivities:update',
                    'physicalactivities:delete',
                    'sleep:create',
                    'sleep:read',
                    'sleep:update',
                    'sleep:delete',
                    'environment:read',
                    'missions:read',
                    'gamificationprofile:read'
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
                     'families:read',
                     'institutions:read',
                     'questionnaires:create',
                     'questionnaires:read',
                     'questionnaires:update',
                     'questionnaires:delete',
                     'foodrecord:create',
                     'foodrecord:read',
                     'foodrecord:update',
                     'foodrecord:delete',
                     'physicalactivities:create',
                     'physicalactivities:read',
                     'physicalactivities:update',
                     'physicalactivities:delete',
                     'sleep:create',
                     'sleep:read',
                     'sleep:update',
                     'sleep:delete',
                     'environment:read',
                     'missions:read',
                     'gamificationprofile:read'
                 ],
                username: 'child_mock',
                institution: '08acd7b4216880c5c576e805',
                gender: 'female',
                age: 8
             }
         ],
        last_login: family.last_login
    }

    describe('transform(item: any)', () => {
        context('when the parameter is of type Family', () => {
            it('should normally execute the method, returning an FamilyEntity as a result of the transformation', () => {
                const result = new FamilyEntityMapper().transform(family)
                assert.propertyVal(result, 'id', family.id)
                assert.propertyVal(result, 'username', family.username)
                assert.propertyVal(result, 'password', family.password)
                assert.propertyVal(result, 'type', family.type)
                assert.propertyVal(result, 'scopes', family.scopes)
                assert.propertyVal(result, 'institution', family.institution!.id)
                assert.equal(result.children[0], family.children![0].id)
                assert.equal(result.children[1], family.children![1].id)
                assert.propertyVal(result, 'last_login', family.last_login)
            })
        })

        context('when the parameter is a JSON', () => {
            it('should not normally execute the method, returning an Family as a result of the transformation', () => {
                const result = new FamilyEntityMapper().transform(familyJSON)
                assert.propertyVal(result, 'id', familyJSON.id)
                assert.propertyVal(result, 'username', familyJSON.username)
                assert.propertyVal(result, 'password', familyJSON.password)
                assert.propertyVal(result, 'type', familyJSON.type)
                assert.propertyVal(result, 'scopes', familyJSON.scopes)
                assert.equal(result.institution.id, familyJSON.institution)
                assert.property(result, 'children')
                assert.propertyVal(result, 'last_login', familyJSON.last_login)
            })
        })

        context('when the parameter is a JSON without an institution', () => {
            it('should not normally execute the method, returning an Family as a result of the transformation', () => {
                familyJSON.institution = null
                const result = new FamilyEntityMapper().transform(familyJSON)
                assert.propertyVal(result, 'id', familyJSON.id)
                assert.propertyVal(result, 'username', familyJSON.username)
                assert.propertyVal(result, 'password', familyJSON.password)
                assert.propertyVal(result, 'type', familyJSON.type)
                assert.propertyVal(result, 'scopes', familyJSON.scopes)
                assert.isUndefined(result.institution)
                assert.property(result, 'children')
                assert.propertyVal(result, 'last_login', familyJSON.last_login)
            })
        })

        context('when the parameter is a undefined', () => {
            it('should not normally execute the method, returning an Family as a result of the transformation', () => {
                const result = new FamilyEntityMapper().transform(undefined)

                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'username', undefined)
                assert.propertyVal(result, 'password', undefined)
                assert.propertyVal(result, 'institution', undefined)
                assert.propertyVal(result, 'children', undefined)
                assert.propertyVal(result, 'last_login', undefined)
            })
        })
    })
})
