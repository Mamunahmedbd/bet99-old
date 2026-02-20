import { Router } from 'express'
import { T10ResultController } from '../controllers/T10ResultController'

export class T10ResultRoutes {
  public router: Router
  public T10ResultController: T10ResultController = new T10ResultController()

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.get('/set-t10-fancy-over-run-result', this.T10ResultController.fancyOverRunResult)
  }
}
