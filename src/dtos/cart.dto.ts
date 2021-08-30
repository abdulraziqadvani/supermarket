import { IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';

export class addProductIntoCart {
  @IsNumber()
  public product_id: number;

  @IsNumber()
  public count: number;
}

export class addOffer {
  @IsNumber()
  public product_id: number;

  @IsString()
  @IsOptional()
  @ValidateIf((object, value) => value !== null)
  public offer_key: number;
}
