import {
  Body,
  Controller,
  Get,
  Post,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/currentUser';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { TransferFundDto } from './dto/transfer-wallet.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Profile' })
  @ApiResponse({
    status: 200,
    description: 'Return current user with wallet balance',
  })
  async currentUser(@CurrentUser() user) {
    return this.usersService.getUserProfile(user.id);
  }

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create Account' })
  @ApiResponse({ status: 201, description: 'Api to create an account' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'login' })
  @ApiResponse({ status: 200, description: 'Api to login' })
  async userAuthenticate(@Body() authenticateUserDto: AuthenticateUserDto) {
    return this.usersService.authenticate(authenticateUserDto);
  }

  @Post('wallet/fund')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fund Wallet' })
  @ApiResponse({
    status: 200,
    description: 'Return wallet balance',
  })
  async fundWallet(@Body() fundWalletDto: FundWalletDto, @CurrentUser() user) {
    return this.usersService.fundWallet(user.id, fundWalletDto);
  }

  @Post('wallet/transfer')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Transfer fund' })
  @ApiResponse({
    status: 200,
    description: '',
  })
  async transferFunds(
    @Body() transferFundDto: TransferFundDto,
    @CurrentUser() user,
  ) {
    return this.usersService.transferFunds(user.id, transferFundDto);
  }
}
