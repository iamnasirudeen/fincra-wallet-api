import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ListAllEntities } from 'src/common/entities/entitied.dto';
import {
  CreateUserDto,
  CreateUserResponseDto,
  GetAllUsersResponseDto,
} from './dtos/user.dto';
import { UserService } from './user.service';
import { User as CurrentUser } from '../common/decorators/user.decorator';
import { Types } from 'mongoose';
import { User } from './schemas/user.schema';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get all users in the platform incase of transfer
   */
  @Get()
  async getAllUser(
    @Query() query: ListAllEntities,
  ): Promise<GetAllUsersResponseDto> {
    return this.userService.getAllUser(query);
  }

  @Get('me')
  async getLoggedinUser(
    @CurrentUser('id') currentUserId: Types.ObjectId,
  ): Promise<User> {
    return this.userService.getLoggedinUser(currentUserId);
  }

  @Post('signup')
  async createUser(
    @Body() payload: CreateUserDto,
  ): Promise<CreateUserResponseDto> {
    return await this.userService.createUser(payload);
  }
}
