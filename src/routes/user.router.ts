import { Router, Request, Response } from 'express'
import { IRouter } from './router.interface'
import { UserController } from '../controllers/user.controller';
import { UserFitibitProfileController } from '../controllers/user.fitibit.profile.controller';
import { UserFirebaseProfileController } from '../controllers/user.firebase.profile.controller';

import { User } from '../models/user';
import { Fitbit } from '../models/fitbit';
import { Firebase } from '../models/firebase';

import { Auth } from '../../config/passport'

/**
 * Class that defines the routes of the User resource.
 * 
 * @author Douglas Rafael <douglas.rafael@nutes.uepb.edu.br>
 */
class UserRouter implements IRouter<UserController> {
    router: Router
    userController: UserController
    userFitibitProfileController: UserFitibitProfileController
    userFirebaseProfileController: UserFirebaseProfileController


    constructor() {
        this.router = Router()
        this.userController = new UserController(User)
        this.userFitibitProfileController = new UserFitibitProfileController(Fitbit)
        this.userFirebaseProfileController = new UserFirebaseProfileController(Firebase)

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
        this.router.delete('/:user_id', (req: Request, res: Response) => this.userController.removeUser(req, res))
        this.router.put('/:user_id', (req: Request, res: Response) => this.userController.updateUser(req, res))
        this.router.get('/:user_id', (req: Request, res: Response) => this.userController.getUserById(req, res))
        this.router.post('/auth', (req: Request, res: Response) => this.userController.userAuthentication(req, res))

        // fitbit
        this.router.post('/:user_id/profiles/fitbit', (req: Request, res: Response) => this.userFitibitProfileController.addFitbitProfile(req, res))
        this.router.get('/:user_id/profiles/fitbit', (req: Request, res: Response) => this.userFitibitProfileController.getFitbitProfile(req, res))
        this.router.delete('/:user_id/profiles/fitbit/:profile_id', (req: Request, res: Response) => this.userFitibitProfileController.removeFitbitProfile(req, res))
        this.router.get('/profiles/fitbit', (req: Request, res: Response) => this.userFitibitProfileController.getAllFitbitProfile(req, res))

        // firebase
        this.router.post('/:user_id/profiles/fcm', (req: Request, res: Response) => this.userFirebaseProfileController.addFirebaseProfile(req, res))
        this.router.get('/:user_id/profiles/fcm', (req: Request, res: Response) => this.userFirebaseProfileController.getFirebaseProfile(req, res))
        this.router.delete('/:user_id/profiles/fcm', (req: Request, res: Response) => this.userFirebaseProfileController.removeFirebaseProfile(req, res))
        this.router.get('/profiles/fcm', (req: Request, res: Response) => this.userFirebaseProfileController.getAllFirebaseProfile(req, res))

        return this.router
    }
}

export default new UserRouter().router

