import { Tenant } from "@prisma/client";
import { prisma } from "../common/services/sql";

export const getTenant = async (tenantId: string): Promise<Tenant | null> => {
  "use server";

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });
  return tenant;
};
