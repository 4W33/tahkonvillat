export type InquiryPayload = {
  villaSlug: string;
  villaName: string;
  name: string;
  email: string;
  phone?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  message: string;
  locale: string;
};

export type StoredInquiry = InquiryPayload & {
  id: string;
  createdAt: string;
  read: boolean;
};
