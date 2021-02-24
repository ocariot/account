import { injectable } from 'inversify'
import { IEntityMapper } from '../../port/entity.mapper.interface'
import { Institution } from '../../../application/domain/model/institution'
import { Child } from '../../../application/domain/model/child'
import { ChildEntity } from '../child.entity'

@injectable()
export class ChildEntityMapper implements IEntityMapper<Child, ChildEntity> {
    public transform(item: any): any {
        if (item instanceof Child) return this.modelToModelEntity(item)
        return this.jsonToModel(item) // json
    }

    /**
     * Convert {Child} for {ChildEntity}.
     *
     * @see Creation Date should not be mapped to the type the repository understands.
     * Because this attribute is created automatically by the database.
     * Therefore, if a null value is passed at update time, an exception is thrown.
     * @param item
     */
    public modelToModelEntity(item: Child): ChildEntity {
        const result: ChildEntity = new ChildEntity()
        if (item.id) result.id = item.id
        if (item.username) result.username = item.username
        if (item.password) result.password = item.password
        if (item.type) result.type = item.type
        if (item.institution !== undefined) result.institution = item.institution.id
        if (item.gender) result.gender = item.gender
        if (item.age) result.age = item.age
        if (item.age_calc_date) result.age_calc_date = item.age_calc_date
        if (item.fitbit_status) result.fitbit_status = item.fitbit_status
        if (item.nfcTag) result.nfc_tag = item.nfcTag
        if (item.tag_ass_time) result.tag_ass_time = item.tag_ass_time

        return result
    }

    /**
     * Convert JSON for {Child}.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param json
     */
    public jsonToModel(json: any): Child {
        const result: Child = new Child()
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
        if (json.gender !== undefined) result.gender = json.gender
        if (json.age !== undefined) result.age = json.age
        if (json.age_calc_date !== undefined) result.age_calc_date = json.age_calc_date
        if (json.last_login !== undefined) result.last_login = json.last_login
        if (json.last_sync !== undefined) result.last_sync = json.last_sync
        if (json.fitbit_status !== undefined) result.fitbit_status = json.fitbit_status
        if (json.nfc_tag !== undefined) result.nfcTag = json.nfc_tag
        if (json.tag_ass_time !== undefined) result.tag_ass_time = json.tag_ass_time

        return result
    }
}
