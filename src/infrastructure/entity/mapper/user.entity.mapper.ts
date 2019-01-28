import { injectable } from 'inversify'
import { IEntityMapper } from '../../port/entity.mapper.interface'
import { Institution } from '../../../application/domain/model/institution'
import { UserType } from '../../../application/domain/model/user'
import { UserEntity } from '../user.entity'
import { Child } from '../../../application/domain/model/child'
import { Family } from '../../../application/domain/model/family'
import { ChildEntity } from '../child.entity'

@injectable()
export class UserEntityMapper implements IEntityMapper<Child | Family, ChildEntity> {
    public transform(item: any): any {
        if (item instanceof Child || Family) return this.modelToModelEntity(item)
        if (item instanceof ChildEntity) return this.modelEntityToModel(item)
        return this.jsonToModel(item) // json
    }

    /**
     * Convert {User} for {UserEntity}.
     *
     * @see Creation Date should not be mapped to the type the repository understands.
     * Because this attribute is created automatically by the database.
     * Therefore, if a null value is passed at update time, an exception is thrown.
     * @param item
     */
    public modelToModelEntity(item: Child | Family): ChildEntity | UserEntity {
        let result: any
        if (item.type === UserType.CHILD) {
            result = new ChildEntity()
            item = item as Child
            if (item.gender) result.gender = item.gender
            if (item.age) result.age = item.age
        } else if (item.type === UserType.FAMILY) {
            item = item as Family
            // if (item.children && item.children instanceof Array) {
            //     const childrenTemp: Array<string> = item.children
            //     item.children.forEach(elem => childrenTemp.push(elem.id))
            //     result.children = childrenTemp
            // }
        }

        if (item.id) result.id = item.id
        if (item.username) result.username = item.username
        if (item.password) result.password = item.password
        if (item.type) result.type = item.type
        if (item.institution) result.institution = item.institution.id

        // if (item.gender) result.gender = item.gender
        // if (item.age) result.age = item.age
        // if (item.application_name) result.application_name = item.application_name
        //
        // if (item.children && item.children.constructor === Array) {
        //     const childrenTemp: Array<string> = item.children
        //     item.children.forEach(elem => childrenTemp.push(elem.id))
        //     result.children = childrenTemp
        // }
        //
        // if (item.children_groups && item.children_groups.constructor === Array) {
        //     const childrenGroupsTemp: Array<string> = item.children
        //     item.children.forEach(elem => childrenGroupsTemp.push(elem.id))
        //     result.children_groups = childrenGroupsTemp
        // }

        return result
    }

    /**
     * Convert {UserEntity} for {User}.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param item
     */
    public modelEntityToModel(item: ChildEntity): Child | Family {
        throw Error('Not implemented!')
    }

    /**
     * Convert JSON for {User}.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param json
     */
    public jsonToModel(json: any): Child | Family {
        let result: any
        if (json.type !== undefined && json.type === UserType.CHILD) {
            result = new Child()
            if (json.gender !== undefined) result.gender = json.gender
            if (json.age !== undefined) result.age = json.age
        }

        if (json.id !== undefined) result.id = json.id
        if (json.username !== undefined) result.username = json.username
        if (json.type !== undefined) result.type = json.type
        if (json.institution !== undefined) result.institution = new Institution().fromJSON(result.institution)

        return result
    }
}
