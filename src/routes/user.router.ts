import { Router, Request, Response } from 'express'
import { IRouter } from './router.interface'
import { UserController } from '../controllers/user.controller';
import { User } from '../models/user';

/**
 * Class that defines the routes of the User resource.
 * 
 * @author Douglas Rafael <douglas.rafael@nutes.uepb.edu.br>
 */
class UserRouter implements IRouter<UserController> {
    router: Router
    userController: UserController



    constructor() {
        this.router = Router()
        this.userController = new UserController(User)
        this.initialize()
    }

    /**
     * Initialize routes.
     * 
     * @returns Router
     */
    initialize(): Router {
        this.router = Router()

        // api/v1/users
        this.router.post('/', (req: Request, res: Response) => this.userController.addUser(req, res))
        this.router.get('/', (req: Request, res: Response) => this.userController.getAllUsers(req, res))
        this.router.get('/:user_id', (req: Request, res: Response) => this.userController.getUserById(req, res))
        this.router.post('/auth', (req: Request, res: Response) => this.userController.authUser(req, res))

        return this.router
    }
}

export default new UserRouter().router

