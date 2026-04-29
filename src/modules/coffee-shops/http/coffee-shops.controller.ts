import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ErrorResponseDto } from '../../../common/http/error-response.dto';
import { CoffeeShopsService } from '../business/coffee-shops.service';
import { GetNearbyCoffeeShopsQueryDto } from './dto/get-nearby-coffee-shops-query.dto';
import { NearbyCoffeeShopResponseDto } from './dto/nearby-coffee-shop-response.dto';
import { NearbyCoffeeShopsResponseDto } from './dto/nearby-coffee-shops-response.dto';

@ApiTags('coffee-shops')
@Controller('coffee-shops')
export class CoffeeShopsController {
  constructor(private readonly coffeeShopsService: CoffeeShopsService) {}

  @Get('nearby')
  @ApiOperation({
    summary: 'Return coffee shops near a specific location.',
  })
  @ApiOkResponse({
    type: NearbyCoffeeShopsResponseDto,
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
  })
  async findNearby(
    @Query() query: GetNearbyCoffeeShopsQueryDto,
  ): Promise<NearbyCoffeeShopsResponseDto> {
    const coffeeShops = await this.coffeeShopsService.findNearby(query);

    return {
      data: coffeeShops.map<NearbyCoffeeShopResponseDto>((coffeeShop) => ({
        name: coffeeShop.name,
        location: {
          x: coffeeShop.x,
          y: coffeeShop.y,
        },
        distance: Number(coffeeShop.distance.toFixed(4)),
      })),
    };
  }
}
