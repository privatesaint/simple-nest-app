import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, MaxLength, Validate } from 'class-validator';
import { UnencryptedPasswordValidator } from '../../common/validators/unencrypted-password-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(200)
  public name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(150)
  public email: string;

  @ApiProperty()
  @IsNotEmpty()
  @Validate(UnencryptedPasswordValidator)
  public password: string;
}
