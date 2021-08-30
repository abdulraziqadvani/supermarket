import { IsArray, IsNumber, IsOptional, IsString, ValidateIf, ValidateNested } from 'class-validator';

// export class CreateOrderProductsDto {
//   @IsNumber()
//   public productId: Number;

//   @IsNumber()
//   public count: Number;

//   @IsNumber()
//   public offerId: Number;
// }

// export class CreateOrderDto {
//   @IsArray()
//   // @ValidateNested({ each: true })
//   public products: CreateOrderProductsDto[];
// }

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
