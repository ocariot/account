import { controller, httpGet, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Child } from '../../application/domain/model/child'

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
            id: '5a62be07de34500146d9c544',
            username: 'elvisaaron',
            gender: 'male',
            age: 11,
            institution: {
                id: '5a62be07de34500146d9c544',
                type: 'Institute of Scientific Research',
                name: 'NUTES - UEPB',
                address: 'Av. Juvêncio Arruda, S/N - Universitário, Campina Grande - PB, 58429-600',
                latitude: -7.2100766,
                longitude: -35.9175756
            }
        }

        console.log(`DES`, new Child().deserialize(json1))
        console.log(`SER`, new Child().deserialize(json1).serialize())
        return res.send(new Child().deserialize(json1).serialize())
    }

}
