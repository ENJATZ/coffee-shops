import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { configuration } from './config/configuration';
import { validateEnvironment } from './config/env.schema';
import { CoffeeShopsModule } from './modules/coffee-shops/coffee-shops.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validate: validateEnvironment,
    }),
    CoffeeShopsModule,
  ],
})
export class AppModule {}
