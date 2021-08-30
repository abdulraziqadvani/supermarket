import { NextFunction, Request, Response } from 'express';
import { CreateOfferDto } from '@/dtos/offer.dto';
import OfferService from '@services/offers.service';
import { Offer } from '@/interfaces/offer.interface';

class OffersController {
  public offerService = new OfferService();

  /**
   * Creates a new user in a Database.
   *
   * @param req - Request response along with User data.
   * @param res - Response to be sent to a user.
   * @param next - For Triggering the next function.
   */
  public createOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const offerData: CreateOfferDto = req.body;
      const result: Offer = await this.offerService.createOffer(offerData.key, offerData.product_id);

      res.status(201).json({ data: result, message: 'Offer has been created.' });
    } catch (error) {
      next(error);
    }
  };
}

export default OffersController;
