import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class ListAllEntities {
  @IsNotEmpty()
  @Type(() => Number)
  readonly perPage: number;

  @IsNotEmpty()
  @Type(() => Number)
  readonly page: number;
}
