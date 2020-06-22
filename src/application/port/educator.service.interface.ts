import { IService } from './service.interface'
import { Educator } from '../domain/model/educator'
import { ChildrenGroup } from '../domain/model/children.group'
import { IQuery } from './query.interface'

/**
 * Educator service interface.
 *
 * @extends {IService<Educator>}
 */
export interface IEducatorService extends IService<Educator> {

    /**
     * Register a group of children associating it with the educator.
     *
     * @param educatorId
     * @param childrenGroup
     * @return {Promise<ChildrenGroup>}
     * @throws {ValidationException | RepositoryException}
     */
    saveChildrenGroup(educatorId: string, childrenGroup: ChildrenGroup): Promise<ChildrenGroup>

    /**
     * Recovers all groups of children associated with an educator.
     *
     * @param educatorId
     * @param query
     * @return {Promise<Array<ChildrenGroup>>}
     * @throws {ValidationException | RepositoryException}
     */
    getAllChildrenGroups(educatorId: string, query: IQuery): Promise<Array<ChildrenGroup>>

    /**
     * Recovers children group data from educator.
     *
     * @param educatorId
     * @param childrenGroupId
     * @param query
     * @return {Promise<ChildrenGroup>}
     * @throws {ValidationException | RepositoryException}
     */
    getChildrenGroupById(educatorId: string, childrenGroupId: string, query: IQuery): Promise<ChildrenGroup | undefined>

    /**
     * Updates data from the educator's group of children.
     *
     * @param educatorId
     * @param childrenGroup
     * @return {Promise<ChildrenGroup>}
     * @throws {ValidationException | RepositoryException}
     */
    updateChildrenGroup(educatorId: string, childrenGroup: ChildrenGroup): Promise<ChildrenGroup | undefined>

    /**
     * Removes the group of children associated with the educator.
     *
     * @param educatorId
     * @param childrenGroupId
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    deleteChildrenGroup(educatorId: string, childrenGroupId: string): Promise<boolean>

    /**
     * Returns the total of educators.
     *
     * @return {Promise<number>}
     * @throws {RepositoryException}
     */
    count(): Promise<number>

    /**
     * Returns the total of children groups in an educator.
     *
     * @param educatorId
     * @return {Promise<number>}
     * @throws {RepositoryException}
     */
    countChildrenGroups(educatorId: string): Promise<number>
}
