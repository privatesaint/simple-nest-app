import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, Min, IsEmail } from 'class-validator';

export class TransferFundDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  public amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  public email: string;
}
