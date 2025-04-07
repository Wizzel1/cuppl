import { useAccount, useCoState } from 'jazz-expo';
import { Account, co, CoMap, Group, ID, Profile } from 'jazz-tools';
import { useMemo } from 'react';

import { Couple, createCouple } from './coupleSchema.jazz';
import { createPartnerProfile } from './partnerProfile.jazz';

export class UserProfile extends Profile {
  name = co.string;

  static validate(data: { name?: string; email?: string }) {
    const errors: string[] = [];
    if (!data.name?.trim()) {
      errors.push('Please enter a name.');
    }
    return { errors };
  }
}
export class CoupleAccountRoot extends CoMap {
  couple = co.ref(Couple);
  version = co.optional.number;
}
export class CoupleAccount extends Account {
  profile = co.ref(UserProfile);
  root = co.ref(CoupleAccountRoot);

  get coupleId() {
    return this.root?.couple?.id;
  }

  /**
   * The migrate method is called on account creation and login.
   * If the root is not initialized, it runs the initial migration.
   * Otherwise, ensures that partner profiles are properly set up.
   */
  async migrate(creationProps?: { name: string; other?: Record<string, unknown> }) {
    // Check if the root exists in _refs (internal reference storage)
    if (!this._refs.root && creationProps) {
      await this.initialMigration(creationProps);
    }
  }

  private async initialMigration(creationProps: { name: string; other?: Record<string, unknown> }) {
    const { name, other } = creationProps;
    const profileErrors = UserProfile.validate({ name, ...other });
    if (profileErrors.errors.length > 0) {
      throw new Error('Invalid profile data: ' + profileErrors.errors.join(', '));
    }

    // Create a private group for the profile
    const profileGroup = Group.create({ owner: this });
    this.profile = UserProfile.create({ name, ...other }, { owner: profileGroup });

    const coupleGroup = Group.create({ owner: this });
    this.root = CoupleAccountRoot.create(
      {
        couple: createCouple(this.profile, coupleGroup),
        version: 0,
      },
      { owner: this }
    );
  }

  async acceptCoupleInvite(coupleId: string) {
    const invitedCouple = await Couple.load(coupleId as ID<Couple>);
    if (!invitedCouple) throw new Error('Could not load the couple you were invited to');
    if (invitedCouple.partnerB) throw new Error('This couple already has two partners');
    const myProfile = createPartnerProfile(
      invitedCouple,
      this.profile?.name || 'New Partner',
      this.id
    );

    invitedCouple.partnerB = myProfile;
    if (this.root) this.root.couple = invitedCouple;

    const originalCoupleId = this.coupleId;
    if (originalCoupleId) {
      try {
        const originalCouple = await Couple.load(originalCoupleId);
        if (originalCouple) originalCouple.deleted = true;
      } catch (error) {
        console.error('Could not mark original couple as deleted', error);
      }
    }

    return invitedCouple;
  }
}

export const usePartnerProfiles = () => {
  const { me } = useAccount();
  const couple = useCoState(Couple, me?.root?.couple?.id);

  const profiles = useMemo(() => {
    if (!couple || !me?.id) {
      return { myProfile: null, partnerProfile: null };
    }

    const partnerA = couple.partnerA;
    const partnerB = couple.partnerB;

    if (partnerA && partnerA.accountId === me.id) {
      return { myProfile: partnerA, partnerProfile: partnerB || null };
    } else if (partnerB && partnerB.accountId === me.id) {
      return { myProfile: partnerB, partnerProfile: partnerA || null };
    }

    return { myProfile: null, partnerProfile: null };
  }, [couple?.partnerA?.id, couple?.partnerB?.id, me?.id]);
  return profiles;
};
