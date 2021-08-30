import { Router } from 'express';
import OffersController from '@controllers/offers.controller';
import { Routes } from '@interfaces/routes.interface';
import { CreateOfferDto } from '@/dtos/offer.dto';
import validationMiddleware from '@/middlewares/validation.middleware';

class OffersRoute implements Routes {
  public path = '/offers';
  public router = Router();
  public offersController = new OffersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, validationMiddleware(CreateOfferDto, 'body'), this.offersController.createOffer);
  }
}

export default OffersRoute;
