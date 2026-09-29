export type PartyType =
  | 'person'
  | 'organization'
  | 'other';

export interface Party {
  id: string;
  userId: string;

  name: string;
  type: PartyType;

  phone: string | null;
  email: string | null;

  notes: string | null;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export function getPartyTypeLabel(
  type: PartyType
): string {
  switch (type) {
    case 'person':
      return 'Person';

    case 'organization':
      return 'Organization';

    case 'other':
      return 'Other';
  }
}
