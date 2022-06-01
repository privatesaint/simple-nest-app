import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User, Wallet } from '@prisma/client';
import { PrismaService } from '../prisma.services';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { hashPassword, matchHashedPassword } from '../common/utils/password';
import { TransferFundDto } from './dto/transfer-wallet.dto';
import { FundWalletDto } from './dto/fund-wallet.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Finds single User by id, name or email
   *
   * @param whereUnique
   * @returns User
   */
  async findUnique(
    whereUnique: Prisma.UserWhereUniqueInput,
    includeWallet = false,
  ) {
    const user = await this.prisma.user.findUnique({
      where: whereUnique,
      include: { wallet: includeWallet },
    });

    return user;
  }

  /**
   * Get user profile with wallet
   *
   * @param createUserDto
   * @returns user
   */
  async getUserProfile(id: number): Promise<User & { wallet: Wallet }> {
    return this.findUnique({ id }, true);
  }

  /**
   * Creates a new user with credentials
   *
   * @param createUserDto
   * @returns result of create
   */
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await hashPassword(createUserDto.password);

    return this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        wallet: {
          create: {},
        },
      },
    });
  }

  /**
   * Authenticates a user and returns a JWT token
   *
   * @param authenticateUserDto email and password for authentication
   * @returns a JWT token
   */
  async authenticate(authenticateUserDto: AuthenticateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: authenticateUserDto.email },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const checkedPassword = await matchHashedPassword(
      authenticateUserDto.password,
      user.password,
    );

    if (!checkedPassword) {
      throw new UnauthorizedException();
    }

    const token = this.jwtService.sign({
      id: user.id,
      username: user.email,
    });

    return { token };
  }

  /**
   * Fund user wallet
   *
   * @param id userId
   * @param fundWalletDto amount
   * @returns wallet
   */
  async fundWallet(id: number, fundWalletDto: FundWalletDto) {
    return this.prisma.wallet.update({
      where: { userId: id },
      data: {
        amount: {
          increment: fundWalletDto.amount,
        },
      },
    });
  }

  /**
   * Transfer funds to another user wallet
   *
   * @param id senderId
   * @param transferFundDto amount and receiver email
   * @returns
   */
  async transferFunds(id: number, transferFundDto: TransferFundDto) {
    const userQuery = this.findUnique({ id }, true);
    const receiverQuery = this.findUnique({ email: transferFundDto.email });
    const [user, receiver] = await Promise.all([userQuery, receiverQuery]);

    if (!user) {
      throw new NotFoundException();
    }

    // check if receiver exist
    if (!receiver) {
      throw new NotFoundException('No account found with the email address');
    }

    if (Number(user.wallet.amount) < transferFundDto.amount) {
      throw new BadRequestException(
        'can not transfer more than your current balance',
      );
    }

    const deductFund = this.prisma.wallet.update({
      where: { userId: id },
      data: { amount: { decrement: transferFundDto.amount } },
    });
    const addFund = this.prisma.wallet.update({
      where: { userId: receiver.id },
      data: { amount: { increment: transferFundDto.amount } },
    });

    await this.prisma.$transaction([deductFund, addFund]);

    return { message: 'Funds sent successfully' };
  }
}
