import { IsString, IsNumber } from 'class-validator';

export class CreateProductDto {
  @IsString()
  public name: string;

  @IsNumber()
  public price: string;

  @IsNumber()
  public available: string;
}
