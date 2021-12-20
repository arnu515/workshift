import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PrismaModule } from "@/prisma/prisma.module";
import { MongoModule } from "@/mongo/mongo.module";

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [PrismaModule, MongoModule]
})
export class AuthModule {}
