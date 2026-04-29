import { ApiProperty } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import { IsNumber } from 'class-validator';

const toNumber = ({ value }: TransformFnParams): number => Number(value);

export class GetNearbyCoffeeShopsQueryDto {
  @ApiProperty({
    example: 47.6,
    description: 'X coordinate of the location to search around.',
  })
  @Transform(toNumber)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  x!: number;

  @ApiProperty({
    example: -122.4,
    description: 'Y coordinate of the location to search around.',
  })
  @Transform(toNumber)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  y!: number;
}
