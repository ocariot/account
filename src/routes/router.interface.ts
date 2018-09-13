import { Router } from 'express';

/**
 * Interface that represents the base types of a Router.
 * 
 * @template T 
 * @author Douglas Rafael <douglas.rafael@nutes.uepb.edu.br>
 */
export interface IRouter<T> {
    router: Router
    controller?: T
    initialize(): any
}