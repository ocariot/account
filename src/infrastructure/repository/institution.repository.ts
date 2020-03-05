import { inject, injectable } from 'inversify'
import { BaseRepository } from './base/base.repository'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { ILogger } from '../../utils/custom.logger'
import { Identifier } from '../../di/identifiers'
import { Query } from './query/query'
import { Institution } from '../../application/domain/model/institution'
import { InstitutionEntity } from '../entity/institution.entity'
import { IInstitutionRepository } from '../../application/port/institution.repository.interface'

/**
 * Implementation of the institution repository.
 *
 * @implements {IInstitutionRepository}
 */
@injectable()
export class InstitutionRepository extends BaseRepository<Institution, InstitutionEntity>
    implements IInstitutionRepository {

    constructor(
        @inject(Identifier.INSTITUTION_REPO_MODEL) readonly institutionModel: any,
        @inject(Identifier.INSTITUTION_ENTITY_MAPPER) readonly institutionMapper: IEntityMapper<Institution, InstitutionEntity>,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
        super(institutionModel, institutionMapper, logger)
    }

    public checkExist(institution: Institution): Promise<boolean> {
        const query: Query = new Query()
        if (institution.id) query.filters = { _id: institution.id }
        else query.filters = { name: institution.name }

        return new Promise<boolean>((resolve, reject) => {
            super.findOne(query)
                .then((result: Institution) => {
                    if (result) return resolve(true)
                    return resolve(false)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public count(): Promise<number> {
        return super.count(new Query())
    }
}
