import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OrganisationsController } from "./organisations.controller";
import { OrganisationsService } from "./organisations.service";
import { Organisation, OrganisationSchema } from "./organisations.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Organisation.name, schema: OrganisationSchema }])
  ],
  exports: [
    MongooseModule.forFeature([{ name: Organisation.name, schema: OrganisationSchema }])
  ],
  controllers: [OrganisationsController],
  providers: [OrganisationsService]
})
export class OrganisationsModule {}
