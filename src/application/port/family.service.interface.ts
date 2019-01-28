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
     *
     * @param familyId
     * @param query
     * @return {Promise<Array<Child>>}
     * @throws {RepositoryException}
     */
    getAllChildren(familyId: string, query: IQuery): Promise<Array<Child>>

    /**
     * Associates a child with a family.
     *
     * @param familyId
     * @param childId
     * @return {Promise<Family>}
     * @throws {RepositoryException}
     */
    associateChild(familyId: string, childId: string): Promise<Family>

    /**
     * Dissociates a child from a family.
     *
     * @param familyId
     * @param childId
     * @return {Promise<boolean>}
     * @throws {RepositoryException}
     */
    disassociateChild(familyId: string, childId: string): Promise<boolean>
}
