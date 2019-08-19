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
            'healthprofessionals:read',
            'healthprofessionals:update',
            'childrengroups:create',
            'childrengroups:read',
            'childrengroups:update',
            'childrengroups:delete',
            'institutions:read',
            'institutions:readAll',
            'institutions:update',
            'questionnaires:read',
            'foodrecord:read',
            'physicalactivities:read',
            'sleep:read',
            'measurements:read',
            'environment:read',
            'missions:read',
            'gamificationprofile:read'
        ]
    }
}
