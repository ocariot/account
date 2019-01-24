/**
 * Implementation of the activity repository.
 *
 * @implements {IActivityRepository}
 */
import { injectable } from 'inversify'
import { BaseRepository } from './base/base.repository'
import { User } from '../../application/domain/model/user'
import { UserEntity } from '../entity/user.entity'

@injectable()
export class ActivityRepository extends BaseRepository<User, UserEntity> implements IActivityRepository {

}
