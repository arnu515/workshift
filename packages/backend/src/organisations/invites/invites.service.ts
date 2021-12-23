import { PrismaService } from "@/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

@Injectable()
export class InvitesService {
  invites: Prisma.OrganisationInvitesDelegate<
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;

  constructor(db: PrismaService) {
    this.invites = db.organisationInvites;
  }

  getUserInvites(userId: string) {
    return this.invites.findMany({
      where: { user_id: userId },
      include: { organisation: { include: { owner: true } } }
    });
  }

  getOrgInvites(orgId: string) {
    return this.invites.findMany({ where: { organisation_id: orgId } });
  }
}
