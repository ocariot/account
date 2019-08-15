import { injectable } from 'inversify'
import { IEntityMapper } from '../../port/entity.mapper.interface'
import { Institution } from '../../../application/domain/model/institution'
import { Family } from '../../../application/domain/model/family'
import { FamilyEntity } from '../family.entity'
import { Child } from '../../../application/domain/model/child'

@injectable()
export class FamilyEntityMapper implements IEntityMapper<Family, FamilyEntity> {
    public transform(item: any): any {
        if (item instanceof Family) return this.modelToModelEntity(item)
        return this.jsonToModel(item) // json
    }

    /**
     * Convert {Family} for {FamilyEntity}.
     *
     * @see Creation Date should not be mapped to the type the repository understands.
     * Because this attribute is created automatically by the database.
     * Therefore, if a null value is passed at update time, an exception is thrown.
     * @param item
     */
    public modelToModelEntity(item: Family): FamilyEntity {
        const result: FamilyEntity = new FamilyEntity()
        if (item.id) result.id = item.id
        if (item.username) result.username = item.username
        if (item.password) result.password = item.password
        if (item.type) result.type = item.type
        if (item.institution !== undefined) result.institution = item.institution.id
        if (item.children) {
            const childrenTemp: Array<string> = []
            item.children.forEach(elem => {
                if (elem.id) childrenTemp.push(elem.id)
            })
            result.children = childrenTemp
        }
        if (item.last_login) result.last_login = item.last_login
        if (item.scopes) result.scopes = item.scopes

        return result
    }

    /**
     * Convert {FamilyEntity} for {Family}.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param item
     */
    public modelEntityToModel(item: FamilyEntity): Family {
        throw Error('Not implemented!')
    }

    /**
     * Convert JSON for {Family}.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param json
     */
    public jsonToModel(json: any): Family {
        const result: Family = new Family()
        if (!json) return result

        if (json.id !== undefined) result.id = json.id
        if (json.username !== undefined) result.username = json.username
        if (json.password !== undefined) result.password = json.password
        if (json.type !== undefined) result.type = json.type
        if (json.institution !== undefined) {
            if (json.institution === null) result.institution = undefined
            else {
                result.institution = new Institution()
                result.institution.id = json.institution
            }
        }
        if (json.children !== undefined) {
            result.children = json.children.map(item => new Child().fromJSON(item))
        }
        if (json.last_login !== undefined) result.last_login = json.last_login
        if (json.scopes !== undefined) result.scopes = json.scopes

        return result
    }
}
