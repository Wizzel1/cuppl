import { co, CoMap, Group, ID, ImageDefinition } from 'jazz-tools';

import { Couple } from './coupleSchema.jazz';
import { CoupleAccount } from './schema.jazz';

export class PartnerProfile extends CoMap {
  name = co.string;
  nickname = co.optional.string;
  birthday = co.optional.Date;
  avatar = co.optional.ref(ImageDefinition);
  mood = co.string;
  accountId = co.string;

  static validate(data: { name?: string; nickname?: string }) {
    const errors: string[] = [];
    if (!data.name?.trim()) {
      errors.push('Please enter a name.');
    }
    return { errors };
  }
}

export const createPartnerProfile = (
  couple: Couple,
  name: string,
  accountId: ID<CoupleAccount>,
  options?: { nickname?: string; birthday?: Date; avatar?: ImageDefinition }
): PartnerProfile => {
  const coupleGroup = couple._owner.castAs(Group);
  return PartnerProfile.create(
    {
      name,
      nickname: options?.nickname || null,
      birthday: options?.birthday || null,
      avatar: options?.avatar || null,
      mood: '😊',
      accountId,
    },
    { owner: coupleGroup }
  );
};
