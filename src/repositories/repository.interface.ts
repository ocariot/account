/**
 * Interface Repository
 * 
 * @template T 
 * @author Douglas Rafael <douglas.rafael@nutes.uepb.edu.br>
 */
export interface IRepository<T> {
    save(item: T): Promise<T>
    getAll(params?: Object): Promise<Array<T>>
    getById(id: string, params?: Object): Promise<T>
    update(item: T): Promise<T>
    delete(id: string): Promise<boolean>
}