import { IRepository } from './repository.interface'
import { ChildrenGroup } from '../domain/model/children.group'

/**
 * Interface of the Children Group repository.
 * Must be implemented by the user repository at the infrastructure layer.
 *
 * @see {@link ChildrenGroupRepository} for further information.
 * @extends {IRepository<ChildrenGroup>}
 */
export interface IChildrenGroupRepository extends IRepository<ChildrenGroup> {
    /**
     * Checks if an Children Group already has a registration.
     *
     * @param chidrenGroup
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    checkExist(chidrenGroup: ChildrenGroup): Promise<boolean>

    /**
     * Delete all children groups associated with an user.
     *
     * @param userId
     * @returns True if the deletion was successfully, false otherwise.
     */
    deleteMany(userId: string): Promise<boolean>
}
