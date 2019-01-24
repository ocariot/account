import { controller, httpGet, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { HealthProfessional } from '../../application/domain/model/health.professional'

/**
 * Controller that implements Home feature operations.
 * @remarks
 * To define paths, we use library inversify-express-utils.
 *
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/')
export class HomeController {
    /**
     * REST API Reference.
     *
     * @returns void
     */
    @httpGet('/')
    public getReference(@request() req: Request, @response() res: Response): any {
        const json1 = {
            username: 'elvisaaron',
            password: 'mys3cr3tp4ss',
            children_groups: [
                '5a62be07de34500146d9c544'
            ],
            institution_id: '5a62be07de34500146d9c624'
        }

        console.log(`DES`, new HealthProfessional().deserialize(json1))
        console.log(`SER`, new HealthProfessional().deserialize(json1).serialize())
        return res.send(new HealthProfessional().deserialize(json1).serialize())
    }

}
