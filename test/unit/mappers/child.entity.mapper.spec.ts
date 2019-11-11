import { assert } from 'chai'
import { Child } from '../../../src/application/domain/model/child'
import { ChildMock } from '../../mocks/child.mock'
import { ChildEntityMapper } from '../../../src/infrastructure/entity/mapper/child.entity.mapper'
import { ChildEntity } from '../../../src/infrastructure/entity/child.entity'
import { UserType } from '../../../src/application/domain/model/user'

describe('Mappers: ChildEntity', () => {
    const child: Child = new ChildMock()
    child.password = 'child_password'

    // To test how mapper works with an object without any attributes
    const emptyChild: Child = new Child()
    emptyChild.type = undefined
    emptyChild.scopes = undefined!

    // Create child JSON
    const childJSON: any = {
        id: '77388a5c901305e367c5e660',
        type: 'child',
        scopes: [
            'children:read',
            'institutions:read',
            'questionnaires:create',
            'questionnaires:read',
            'foodrecord:create',
            'foodrecord:read',
            'physicalactivities:create',
            'physicalactivities:read',
            'sleep:create',
            'sleep:read',
            'measurements:create',
            'measurements:read',
            'environment:read',
            'missions:read',
            'gamificationprofile:read',
            'gamificationprofile:update',
            'external:sync'
        ],
        username: 'child_mock',
        password: 'child_password',
        institution: '273ab3632f16bbd9044753cb',
        gender: 'male',
        age: 6
    }

    // To test how mapper works with an object without any attributes (JSON)
    const emptyChildJSON: any = {}

    describe('transform(item: any)', () => {
        context('when the parameter is of type Child', () => {
            it('should normally execute the method, returning a ChildEntity as a result of the transformation', () => {
                const result: ChildEntity = new ChildEntityMapper().transform(child)
                assert.propertyVal(result, 'id', child.id)
                assert.propertyVal(result, 'username', child.username)
                assert.propertyVal(result, 'password', child.password)
                assert.propertyVal(result, 'type', child.type)
                assert.propertyVal(result, 'scopes', child.scopes)
                assert.propertyVal(result, 'institution', child.institution!.id)
                assert.propertyVal(result, 'gender', child.gender)
                assert.propertyVal(result, 'age', child.age)
            })
        })

        context('when the parameter is of type Child and does not contain any attributes', () => {
            it('should normally execute the method, returning an empty ChildEntity', () => {
                const result: ChildEntity = new ChildEntityMapper().transform(emptyChild)
                assert.isEmpty(result)
            })
        })

        context('when the parameter is a JSON', () => {
            it('should not normally execute the method, returning a Child as a result of the transformation', () => {
                const result: Child = new ChildEntityMapper().transform(childJSON)
                assert.propertyVal(result, 'id', childJSON.id)
                assert.propertyVal(result, 'username', childJSON.username)
                assert.propertyVal(result, 'password', childJSON.password)
                assert.propertyVal(result, 'type', childJSON.type)
                assert.propertyVal(result, 'scopes', childJSON.scopes)
                assert.equal(result.institution!.id, childJSON.institution)
                assert.propertyVal(result, 'gender', childJSON.gender)
                assert.propertyVal(result, 'age', childJSON.age)
            })
        })

        context('when the parameter is a JSON without an institution', () => {
            it('should not normally execute the method, returning a Child as a result of the transformation', () => {
                childJSON.institution = null
                const result: Child = new ChildEntityMapper().transform(childJSON)
                assert.propertyVal(result, 'id', childJSON.id)
                assert.propertyVal(result, 'username', childJSON.username)
                assert.propertyVal(result, 'password', childJSON.password)
                assert.propertyVal(result, 'type', childJSON.type)
                assert.propertyVal(result, 'scopes', childJSON.scopes)
                assert.isUndefined(result.institution)
                assert.propertyVal(result, 'gender', childJSON.gender)
                assert.propertyVal(result, 'age', childJSON.age)
            })
        })

        context('when the parameter is a JSON and does not contain any attributes', () => {
            it('should normally execute the method, returning a Child as a result of the transformation', () => {
                const result: Child = new ChildEntityMapper().transform(emptyChildJSON)
                assert.propertyVal(result, 'id', emptyChildJSON.id)
                assert.propertyVal(result, 'username', emptyChildJSON.username)
                assert.propertyVal(result, 'password', emptyChildJSON.password)
                assert.propertyVal(result, 'type', UserType.CHILD)
                assert.deepPropertyVal(result, 'scopes', childJSON.scopes)
                assert.propertyVal(result, 'institution', emptyChildJSON.institution)
            })
        })

        context('when the parameter is a undefined', () => {
            it('should not normally execute the method, returning a Child as a result of the transformation', () => {
                const result: Child = new ChildEntityMapper().transform(undefined)

                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'username', undefined)
                assert.propertyVal(result, 'password', undefined)
                assert.propertyVal(result, 'institution', undefined)
                assert.propertyVal(result, 'gender', undefined)
                assert.propertyVal(result, 'age', undefined)
            })
        })
    })
})
