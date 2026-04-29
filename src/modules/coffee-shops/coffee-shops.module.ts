import { Module } from '@nestjs/common';

import { CoffeeShopsService } from './business/coffee-shops.service';
import { CoffeeShopsDataSource } from './data-sources/coffee-shops.ds.service';
import { CoffeeShopsController } from './http/coffee-shops.controller';

@Module({
  controllers: [CoffeeShopsController],
  providers: [
    CoffeeShopsService,
    CoffeeShopsDataSource,
  ],
})
export class CoffeeShopsModule { }
