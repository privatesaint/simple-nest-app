import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, Min } from 'class-validator';

export class FundWalletDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  public amount: number;
}
