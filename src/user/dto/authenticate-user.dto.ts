import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, Validate } from 'class-validator';
import { UnencryptedPasswordValidator } from '../../common/validators/unencrypted-password-validator';
export class AuthenticateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @ApiProperty()
  @IsNotEmpty()
  @Validate(UnencryptedPasswordValidator)
  public password: string;
}
