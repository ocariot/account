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
     * Retrieves the Health Professional according to ID.
     *
     * @param healthProfessionalId
     * @return {Promise<Educator>}
     * @throws {ValidationException | RepositoryException}
     */
    findById(healthProfessionalId: string): Promise<HealthProfessional>

    /**
     * Checks if healthProfessional already has a registration.
     * If the object to be verified has id, it will be considered
     * as character in the verification, otherwise the username will be used.
     *
     * @param healthProfessional
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    checkExist(healthProfessional: HealthProfessional): Promise<boolean>

    /**
     * Returns the total of health professionals.
     *
     * @return {Promise<number>}
     * @throws {RepositoryException}
     */
    count(): Promise<number>

    /**
     * Returns the total of children groups in a health professional.
     *
     * @param healthProfessionalId
     * @return {Promise<number>}
     * @throws {RepositoryException}
     */
    countChildrenGroups(healthProfessionalId: string): Promise<number>
}
