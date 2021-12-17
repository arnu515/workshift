import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import {
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsUrl,
  IsOptional,
} from 'class-validator';
import httpError from 'http-errors';

class CreateOrganisationBody {
  @MinLength(4)
  @MaxLength(128)
  @IsNotEmpty()
  name: string;

  @MinLength(4)
  @MaxLength(2048)
  @IsNotEmpty()
  description: string;

  @IsUrl({ require_protocol: true })
  @IsNotEmpty()
  imageUrl: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  website?: string;

  @IsOptional()
  @MaxLength(2048)
  address?: string;

  @IsOptional()
  @MaxLength(2048)
  location?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

@Controller('organisations')
export class OrganisationsController {
  constructor(private organisationsService: OrganisationsService) {}

  @Get(':id')
  async getOrgById(@Param('id') id: string) {
    const org = await this.organisationsService.getOrgById(id);
    if (!org) {
      return httpError(404, 'Organisation not found');
    }
    return org;
  }

  @Post('/')
  async createOrganisation(@Body() body: CreateOrganisationBody) {
    const org = await this.organisationsService.createOrganisation(body);

    if (typeof org === 'string') {
      return httpError(400, org);
    }

    return org;
  }
}
