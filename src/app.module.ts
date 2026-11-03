import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  buildDataSourceOptions,
  createDataSource,
} from './shared/config/database.config.js';
import { UsersModule } from './modules/users/users.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { NodesModule } from './modules/nodes/nodes.module.js';
import { VpnModule } from './modules/vpn/vpn.module.js';
import { SessionsModule } from './modules/sessions/sessions.module.js';
import { PlansModule } from './modules/plans/plans.module.js';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module.js';
import { InvoicesModule } from './modules/invoices/invoices.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ...buildDataSourceOptions(config),
        autoLoadEntities: true,
      }),
      dataSourceFactory: (options) => createDataSource(options!),
    }),
    UsersModule,
    AuthModule,
    NodesModule,
    VpnModule,
    SessionsModule,
    PlansModule,
    SubscriptionsModule,
    InvoicesModule,
  ],
})
export class AppModule {}
