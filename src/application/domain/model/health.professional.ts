import { Educator } from './educator'
import { UserType } from './user'

/**
 * Implementation of the health professional entity.
 *
 * @extends {Educator}
 */
export class HealthProfessional extends Educator {
    constructor() {
        super()
        super.type = UserType.HEALTH_PROFESSIONAL
        super.scopes = [
            'children:read',
            'children:readAll',
            'healthprofessionals:read',
            'healthprofessionals:update',
            'childrengroups:create',
            'childrengroups:read',
            'childrengroups:update',
            'childrengroups:delete',
            'institutions:read',
            'institutions:readAll',
            'institutions:update',
            'physicalactivities:read',
            'sleep:read',
            'measurements:read',
            'environment:read',
            'socioquest:read',
            'healthquest:read',
            'parentphyquest:read',
            'childrenphyquest:create',
            'childrenphyquest:read',
            'childrenphyquest:update',
            'habitsquest:read',
            'foodhabitsquest:read',
            'perceptionquest:read',
            'foodtracking:create',
            'foodtracking:read',
            'foodtracking:update',
            'foodtracking:delete',
            'missions:read',
            'gamificationprofile:read',
            'external:sync',
            'notifications:create',
            'notifications:read',
            'notifications:delete'
        ]
    }
}
