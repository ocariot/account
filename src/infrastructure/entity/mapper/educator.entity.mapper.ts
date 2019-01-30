import { injectable } from 'inversify'
import { IEntityMapper } from '../../port/entity.mapper.interface'
import { Institution } from '../../../application/domain/model/institution'
import { Educator } from '../../../application/domain/model/educator'
import { EducatorEntity } from '../educator.entity'
import { ChildrenGroup } from '../../../application/domain/model/children.group'

@injectable()
export class EducatorEntityMapper implements IEntityMapper<Educator, EducatorEntity> {
    public transform(item: any): any {
        if (item instanceof Educator) return this.modelToModelEntity(item)
        return this.jsonToModel(item) // json
    }

    /**
     * Convert {Educator} for {EducatorEntity}.
     *
     * @see Creation Date should not be mapped to the type the repository understands.
     * Because this attribute is created automatically by the database.
     * Therefore, if a null value is passed at update time, an exception is thrown.
     * @param item
     */
    public modelToModelEntity(item: Educator): EducatorEntity {
        const result: EducatorEntity = new EducatorEntity()
        if (item.id) result.id = item.id
        if (item.username) result.username = item.username
        if (item.password) result.password = item.password
        if (item.type) result.type = item.type
        if (item.institution) result.institution = item.institution.id
        if (item.children_groups) {
            const childrenGroupsTemp: Array<string> = []
            item.children_groups.forEach(elem => {
                if (elem.id) childrenGroupsTemp.push(elem.id)
            })
            result.children_groups = childrenGroupsTemp
        }
        if (item.scopes) result.scopes = item.scopes

        return result
    }

    /**
     * Convert {EducatorEntity} for {Educator}.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param item
     */
    public modelEntityToModel(item: EducatorEntity): Educator {
        throw Error('Not implemented!')
    }

    /**
     * Convert JSON for {Educator}.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param json
     */
    public jsonToModel(json: any): Educator {
        const result: Educator = new Educator()
        if (!json) return result

        if (json.id !== undefined) result.id = json.id
        if (json.username !== undefined) result.username = json.username
        if (json.password !== undefined) result.password = json.password
        if (json.type !== undefined) result.type = json.type
        if (json.institution !== undefined) {
            if (json.institution === null) result.institution = undefined
            else result.institution = new Institution().fromJSON(json.institution)
        }
        if (json.children_groups !== undefined) {
            result.children_groups = json.children_groups.map(item => new ChildrenGroup().fromJSON(item))
        }
        if (json.scopes !== undefined) result.scopes = json.scopes

        return result
    }
}
