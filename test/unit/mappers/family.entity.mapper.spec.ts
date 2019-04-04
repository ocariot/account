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
        username: 'family_mock',
        password: 'family_password',
        institution: {
            id: '08acd7b4216880c5c576e805',
            type: 'Institute of Scientific Research',
            name: 'Name Example',
            address: '221B Baker Street, St.',
            latitude: 20.19441680428105,
            longitude: 105.9879473290647
        },
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
                institution: {
                    id: '08acd7b4216880c5c576e805',
                    type: 'Institute of Scientific Research',
                    name: 'Name Example',
                    address: '221B Baker Street, St.',
                    latitude: 20.19441680428105,
                    longitude: 105.9879473290647
                },
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
                institution: {
                    id: '08acd7b4216880c5c576e805',
                    type: 'Institute of Scientific Research',
                    name: 'Name Example',
                    address: '221B Baker Street, St.',
                    latitude: 20.19441680428105,
                    longitude: 105.9879473290647
                },
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
                 institution: {
                     id: '08acd7b4216880c5c576e805',
                     type: 'Institute of Scientific Research',
                     name: 'Name Example',
                     address: '221B Baker Street, St.',
                     latitude: 20.19441680428105,
                     longitude: 105.9879473290647
                 },
                gender: 'female',
                age: 8
             }
         ]
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
                assert.property(result, 'institution')
                assert.property(result, 'children')
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
            })
        })

        context('when the parameter is a undefined', () => {
            it('should not normally execute the method, returning an Family as a result of the transformation', () => {
                const result = new FamilyEntityMapper().transform(undefined)

                assert.isObject(result)
                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'username', undefined)
                assert.propertyVal(result, 'password', undefined)
                assert.propertyVal(result, 'institution', undefined)
                assert.propertyVal(result, 'children', undefined)
            })
        })
    })
})
