import { BadRequestException, Injectable } from '@nestjs/common';
import { User, UserDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import {
  CreateUserDto,
  CreateUserResponseDto,
  GetAllUsersResponseDto,
  UsersData,
} from './dtos/user.dto';
import * as bcrypt from 'bcrypt';
import { nairaToKobo } from 'src/common/util/utils.index';
import { ListAllEntities } from 'src/common/entities/entitied.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  public async findById(id: Types.ObjectId): Promise<UserDocument> {
    return this.userModel.findById(id).select('-password'); // this is only used in my middlewares so there's no point returning password
  }

  public async findByEmail(email: string): Promise<UserDocument> {
    return await this.userModel.findOne({ email }); // at this point i'm not stripping out passsword cos where I'm only using it in login which requires that I compare passwords
  }

  async getLoggedinUser(userId: Types.ObjectId): Promise<User> {
    return this.userModel.findById(userId).select('-password');
  }

  async createUser(payload: CreateUserDto): Promise<CreateUserResponseDto> {
    const userExist = await this.userModel.findOne({ email: payload.email });
    if (userExist)
      throw new BadRequestException('A user exist with the provided email');
    /**
     * You might be wondering, what if user sends a custom walletBalance
     * from the frontend? Dont worry I've got that. I'm stripping out every data
     * that's not in the DTO even it gets to the controllers using NestJS validationPipe
     */
    const password = await this.encryptPassword(payload.password);
    const modifiedPayload = Object.assign({}, payload, {
      password,
      walletBalance: nairaToKobo(100000), // 100k converted to kobo
    });
    const user = await this.userModel.create(modifiedPayload);
    return Object.assign(payload, { password: undefined, id: user.id });
  }

  async getAllUser(query: ListAllEntities): Promise<GetAllUsersResponseDto> {
    /**
     * the query is used for pagination
     */
    const { perPage, page } = query;
    const skip = perPage * page - perPage;
    const limit = perPage;
    const users = await this.userModel
      .find()
      .select('name email id')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalUsers = await this.userModel.countDocuments();
    const pages = Math.ceil(totalUsers / perPage);
    return {
      data: users as UsersData[],
      total: totalUsers,
      pages,
      current: page,
    };
  }

  public async findOneAndUpdate(
    queryToFindBy: Record<string, any>,
    payloadToUpdate: Record<string, any>,
    sessionObject: { session: ClientSession; returnOriginal: boolean },
  ): Promise<UserDocument> {
    return this.userModel.findOneAndUpdate(
      queryToFindBy,
      payloadToUpdate,
      sessionObject,
    ) as unknown as UserDocument;
  }

  private async encryptPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }
}
