import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { OrganisationsModule } from './organisations/organisations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ cache: true }),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    AuthModule,
    OrganisationsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
