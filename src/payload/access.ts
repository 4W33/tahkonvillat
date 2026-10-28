import type { Access, FieldAccess } from "payload";

export const authenticated: Access = ({ req }) => Boolean(req.user);
export const authenticatedField: FieldAccess = ({ req }) => Boolean(req.user);
