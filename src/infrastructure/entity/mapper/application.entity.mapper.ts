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
        if (item.institution !== undefined) result.institution = item.institution.id
        if (item.application_name !== undefined) result.application_name = item.application_name
        if (item.last_login) result.last_login = item.last_login
        if (item.scopes) result.scopes = item.scopes

        return result
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
            else {
                result.institution = new Institution()
                result.institution.id = json.institution
            }
        }
        if (json.application_name !== undefined) result.application_name = json.application_name
        if (json.last_login !== undefined) result.last_login = json.last_login
        if (json.scopes !== undefined) result.scopes = json.scopes

        return result
    }
}
