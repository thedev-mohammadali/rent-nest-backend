import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { SubmitRentalRequestPayload } from "./tenant.validate";

const submitRentalRequest = async (
  tenantId: string,
  payload: SubmitRentalRequestPayload,
) => {
  const { propertyId, message, requestedMoveInDate, durationInMonths } =
    payload;

  const availableProperty = await prisma.property.findFirst({
    where: {
      id: propertyId,
      isAvailable: true,
    },
  });

  if (!availableProperty) {
    throw new AppError(status.NOT_FOUND, "Property is not available", null);
  }

  const existingRequest = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId,
      status: {
        in: ["PENDING", "APPROVED"],
      },
    },
  });

  if (existingRequest) {
    throw new AppError(
      status.CONFLICT,
      "You already have an active rental request for this property",
      null,
    );
  }

  return prisma.rentalRequest.create({
    data: {
      tenantId,
      propertyId,
      message,
      requestedMoveInDate,
      durationInMonths,
    },
  });
};

export const tenantService = {
  submitRentalRequest,
};
