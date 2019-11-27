import { injectable } from 'inversify'
import { IEntityMapper } from '../../port/entity.mapper.interface'
import { Child } from '../../../application/domain/model/child'
import { ChildrenGroup } from '../../../application/domain/model/children.group'
import { ChildrenGroupEntity } from '../children.group.entity'
import { User } from '../../../application/domain/model/user'

@injectable()
export class ChildrenGroupEntityMapper implements IEntityMapper<ChildrenGroup, ChildrenGroupEntity> {
    public transform(item: any): any {
        if (item instanceof ChildrenGroup) return this.modelToModelEntity(item)
        return this.jsonToModel(item) // json
    }

    /**
     * Convert {ChildrenGroup} for {ChildrenGroupEntity}.
     *
     * @see Creation Date should not be mapped to the type the repository understands.
     * Because this attribute is created automatically by the database.
     * Therefore, if a null value is passed at update time, an exception is thrown.
     * @param item
     */
    public modelToModelEntity(item: ChildrenGroup): ChildrenGroupEntity {
        const result: ChildrenGroupEntity = new ChildrenGroupEntity()
        if (item.id) result.id = item.id
        if (item.name) result.name = item.name
        if (item.school_class !== undefined) result.school_class = item.school_class
        if (item.children) {
            const childrenTemp: Array<string> = []
            item.children.forEach(elem => {
                if (elem.id) childrenTemp.push(elem.id)
            })
            result.children = childrenTemp
        }
        if (item.user) result.user_id = item.user.id

        return result
    }

    /**
     * Convert JSON for {ChildrenGroup}.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param json
     */
    public jsonToModel(json: any): ChildrenGroup {
        const result: ChildrenGroup = new ChildrenGroup()
        if (!json) return result

        if (json.id !== undefined) result.id = json.id
        if (json.name !== undefined) result.name = json.name
        if (json.school_class !== undefined) result.school_class = json.school_class
        if (json.children !== undefined) {
            result.children = json.children.map(item => {
                const child: Child = new Child().fromJSON(item)
                if (item.last_sync !== undefined) child.last_sync = item.last_sync
                if (item.last_login !== undefined) child.last_login = item.last_login
                child.fitbit_status = item.fitbit_status
                child.cve_status = item.cve_status
                return child
            })
        }
        if (json.user_id) {
            const user: User = new User()
            user.id = json.user_id
            result.user = user
        }

        return result
    }
}
