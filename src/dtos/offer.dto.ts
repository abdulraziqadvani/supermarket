import config from 'config';
import { IsString, IsNumber, IsIn } from 'class-validator';

export class CreateOfferDto {
  @IsString()
  @IsIn(Object.values(config.get('offers')))
  public key: string;

  @IsNumber()
  public product_id: number;
}
