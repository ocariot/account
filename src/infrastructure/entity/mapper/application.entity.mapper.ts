import { injectable } from 'inversify'
import { IEntityMapper } from '../../port/entity.mapper.interface'
import { Institution } from '../../../application/domain/model/institution'
import { Application } from '../../../application/domain/model/application'
import { ApplicationEntity } from '../application.entity'

@injectable()
export class ApplicationEntityMapper implements IEntityMapper<Application, ApplicationEntity> {
    public transform(item: any): any {
        if (item instanceof Application) return this.modelToModelEntity(item)
        return this.jsonToModel(item) // json
    }

    /**
     * Convert {Application} for {ApplicationEntity}.
     *
     * @see Creation Date should not be mapped to the type the repository understands.
     * Because this attribute is created automatically by the database.
     * Therefore, if a null value is passed at update time, an exception is thrown.
     * @param item
     */
    public modelToModelEntity(item: Application): ApplicationEntity {
        const result: ApplicationEntity = new ApplicationEntity()
        if (item.id) result.id = item.id
        if (item.username) result.username = item.username
        if (item.password) result.password = item.password
        if (item.type) result.type = item.type
        if (item.institution) result.institution = item.institution.id
        if (item.application_name) result.application_name = item.application_name

        return result
    }

    /**
     * Convert {ApplicationEntity} for {Application}.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param item
     */
    public modelEntityToModel(item: ApplicationEntity): Application {
        throw Error('Not implemented!')
    }

    /**
     * Convert JSON for {Application}.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param json
     */
    public jsonToModel(json: any): Application {
        const result: Application = new Application()
        if (!json) return result

        if (json.id !== undefined) result.id = json.id
        if (json.username !== undefined) result.username = json.username
        if (json.password !== undefined) result.password = json.password
        if (json.type !== undefined) result.type = json.type
        if (json.institution !== undefined) {
            if (json.institution === null) result.institution = undefined
            else result.institution = new Institution().fromJSON(json.institution)
        }
        if (json.application_name !== undefined) result.application_name = json.application_name

        return result
    }
}
