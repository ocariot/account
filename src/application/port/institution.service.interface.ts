import { IService } from './service.interface'
import { Institution } from '../domain/model/institution'

/**
 * Institution service interface.
 *
 * @extends {IService<Institution>}
 */
export interface IInstitutionService extends IService<Institution> {
    /**
     * Returns the total of institutions.
     *
     * @return {Promise<number>}
     * @throws {RepositoryException}
     */
    count(): Promise<number>
}
