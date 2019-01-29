import { IRepository } from './repository.interface'
import { HealthProfessional } from '../domain/model/health.professional'

/**
 * Interface of the Health Professional repository.
 * Must be implemented by the user repository at the infrastructure layer.
 *
 * @see {@link HealthProfessionalRepository} for further information.
 * @extends {IRepository<HealthProfessional>}
 */
export interface IHealthProfessionalRepository extends IRepository<HealthProfessional> {
    /**
     * Checks if healthProfessional already has a registration.
     *
     * @param healthProfessional
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    checkExist(healthProfessional: HealthProfessional): Promise<boolean>
}
