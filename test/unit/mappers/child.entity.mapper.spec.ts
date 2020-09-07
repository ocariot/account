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
    emptyChild.fitbit_status = undefined

    // Create child JSON
    const childJSON: any = {
        id: '77388a5c901305e367c5e660',
        type: 'child',
        username: 'child_mock',
        password: 'child_password',
        institution: '273ab3632f16bbd9044753cb',
        gender: 'male',
        age: 6,
        nfc_tag: '04a22422dd6480'
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
                assert.propertyVal(result, 'institution', child.institution!.id)
                assert.propertyVal(result, 'gender', child.gender)
                assert.propertyVal(result, 'age', child.age)
                assert.propertyVal(result, 'nfc_tag', child.nfcTag)
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
                assert.equal(result.institution!.id, childJSON.institution)
                assert.propertyVal(result, 'gender', childJSON.gender)
                assert.propertyVal(result, 'age', childJSON.age)
                assert.propertyVal(result, 'nfcTag', childJSON.nfc_tag)
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
                assert.isUndefined(result.institution)
                assert.propertyVal(result, 'gender', childJSON.gender)
                assert.propertyVal(result, 'age', childJSON.age)
                assert.propertyVal(result, 'nfcTag', childJSON.nfc_tag)
            })
        })

        context('when the parameter is a JSON and does not contain any attributes', () => {
            it('should normally execute the method, returning a Child as a result of the transformation', () => {
                const result: Child = new ChildEntityMapper().transform(emptyChildJSON)
                assert.propertyVal(result, 'id', emptyChildJSON.id)
                assert.propertyVal(result, 'username', emptyChildJSON.username)
                assert.propertyVal(result, 'password', emptyChildJSON.password)
                assert.propertyVal(result, 'type', UserType.CHILD)
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
                assert.propertyVal(result, 'nfcTag', undefined)
            })
        })
    })
})
