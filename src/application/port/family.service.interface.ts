import { IService } from './service.interface'
import { Family } from '../domain/model/family'
import { IQuery } from './query.interface'
import { Child } from '../domain/model/child'

/**
 * Family service interface.
 *
 * @extends {IService<Family>}
 */
export interface IFamilyService extends IService<Family> {
    /**
     * Recovers children associated with family.
     * When the family is not found it is returning undefined.
     *
     * @param familyId
     * @param query
     * @return {Promise<<Array<Child> | undefined>}
     * @throws {ValidationException | RepositoryException}
     */
    getAllChildren(familyId: string, query: IQuery): Promise<Array<Child> | undefined>

    /**
     * Associates a child with a family.
     * When the family is not found it is returning undefined.
     *
     * @param familyId
     * @param childId
     * @return {Promise<Family>}
     * @throws {ValidationException | RepositoryException}
     */
    associateChild(familyId: string, childId: string): Promise<Family>

    /**
     * Dissociates a child from a family.
     * When the family is not found it is returning undefined.
     *
     * @param familyId
     * @param childId
     * @return {Promise<boolean>}
     * @throws {ValidationException | RepositoryException}
     */
    disassociateChild(familyId: string, childId: string): Promise<boolean | undefined>
}
