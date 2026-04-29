import { ApiProperty } from '@nestjs/swagger';

class CoffeeShopLocationResponseDto {
  @ApiProperty({ example: 47.6 })
  x!: number;

  @ApiProperty({ example: -122.4 })
  y!: number;
}

export class NearbyCoffeeShopResponseDto {
  @ApiProperty({ example: 'Starbucks Seattle' })
  name!: string;

  @ApiProperty({ type: CoffeeShopLocationResponseDto })
  location!: CoffeeShopLocationResponseDto;

  @ApiProperty({ example: 0.0861 })
  distance!: number;
}
