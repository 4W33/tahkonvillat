export type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  topic: "villa" | "apartment" | "general";
  message: string;
  locale: string;
};

export type StoredContact = ContactPayload & {
  id: string;
  createdAt: string;
  read: boolean;
};
