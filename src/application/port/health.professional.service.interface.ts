import { IService } from './service.interface'
import { HealthProfessional } from '../domain/model/health.professional'
import { ChildrenGroup } from '../domain/model/children.group'
import { IQuery } from './query.interface'

/**
 * Health Professional service interface.
 *
 * @extends {IService<HealthProfessional>}
 */
export interface IHealthProfessionalService extends IService<HealthProfessional> {

    /**
     * Register a group of children associating it with the health professional.
     *
     * @param healthProfessionalId
     * @param childrenGroup
     * @return {Promise<ChildrenGroup>}
     * @throws {ValidationException | RepositoryException}
     */
    saveChildrenGroup(healthProfessionalId: string, childrenGroup: ChildrenGroup): Promise<ChildrenGroup>

    /**
     * Recovers all groups of children associated with an health professional.
     *
     * @param healthProfessionalId
     * @param query
     * @return {Promise<Array<ChildrenGroup>>}
     * @throws {ValidationException | RepositoryException}
     */
    getAllChildrenGroups(healthProfessionalId: string, query: IQuery): Promise<Array<ChildrenGroup>>

    /**
     * Recovers children group data from health professional.
     *
     * @param healthProfessionalId
     * @param childrenGroupId
     * @param query
     * @return {Promise<ChildrenGroup>}
     * @throws {ValidationException | RepositoryException}
     */
    getChildrenGroupById(healthProfessionalId: string, childrenGroupId: string, query: IQuery): Promise<ChildrenGroup | undefined>

    /**
     * Updates data from the group of children related to the health professional.
     *
     * @param healthProfessionalId
     * @param childrenGroup
     * @return {Promise<ChildrenGroup>}
     * @throws {ValidationException | RepositoryException}
     */
    updateChildrenGroup(healthProfessionalId: string, childrenGroup: ChildrenGroup): Promise<ChildrenGroup>

    /**
     * Removes the group of children associated with the health professional.
     *
     * @param healthProfessionalId
     * @param childrenGroupId
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    deleteChildrenGroup(healthProfessionalId: string, childrenGroupId: string): Promise<boolean>

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
