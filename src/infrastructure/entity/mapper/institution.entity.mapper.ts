import { injectable } from 'inversify'
import { IEntityMapper } from '../../port/entity.mapper.interface'
import { Institution } from '../../../application/domain/model/institution'
import { InstitutionEntity } from '../institution.entity'

@injectable()
export class InstitutionEntityMapper implements IEntityMapper<Institution, InstitutionEntity> {
    public transform(item: any): any {
        if (item instanceof Institution) return this.modelToModelEntity(item)
        return this.jsonToModel(item) // json
    }

    /**
     * Convert {Institution} for {InstitutionEntity}.
     *
     * @see Creation Date should not be mapped to the type the repository understands.
     * Because this attribute is created automatically by the database.
     * Therefore, if a null value is passed at update time, an exception is thrown.
     * @param item
     */
    public modelToModelEntity(item: Institution): InstitutionEntity {
        const result: InstitutionEntity = new InstitutionEntity()
        if (item.id) result.id = item.id
        if (item.type) result.type = item.type
        if (item.name) result.name = item.name
        if (item.address !== undefined) result.address = item.address
        if (item.latitude !== undefined) result.latitude = item.latitude
        if (item.longitude !== undefined) result.longitude = item.longitude

        return result
    }

    /**
     * Convert {UserEntity} for {User}.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param item
     */
    public modelEntityToModel(item: InstitutionEntity): Institution {
        throw Error('Not implemented!')
    }

    /**
     * Convert JSON for {Institution}.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param json
     */
    public jsonToModel(json: any): Institution {
        const result: Institution = new Institution()
        if (!json) return result

        if (json.id !== undefined) result.id = json.id
        if (json.type !== undefined) result.type = json.type
        if (json.name !== undefined) result.name = json.name
        if (json.address !== undefined) result.address = json.address
        if (json.latitude !== undefined) result.latitude = json.latitude
        if (json.longitude !== undefined) result.longitude = json.longitude

        return result
    }
}
