import { UserRole } from "../../generated/prisma/enums";

export type RegistrationRole = Exclude<UserRole, typeof UserRole.ADMIN>;

export interface IRegistrationPayload {
  name: string;
  email: string;
  password: string;
  role: RegistrationRole;
}
