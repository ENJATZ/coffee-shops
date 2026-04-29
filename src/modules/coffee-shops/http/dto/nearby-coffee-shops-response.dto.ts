import { ApiProperty } from '@nestjs/swagger';

import { NearbyCoffeeShopResponseDto } from './nearby-coffee-shop-response.dto';

export class NearbyCoffeeShopsResponseDto {
  @ApiProperty({ type: NearbyCoffeeShopResponseDto, isArray: true })
  data!: NearbyCoffeeShopResponseDto[];
}
