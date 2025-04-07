import { useAccount, useCoState } from 'jazz-expo';
import { Account, co, CoMap, Group, ID, Profile } from 'jazz-tools';
import { useMemo } from 'react';

import { Couple } from './coupleSchema.jazz';
import { Events } from './eventSchema.jazz';
import { createPartnerProfile, PartnerProfile } from './partnerProfile.jazz';
import { ShoppingLists } from './shoppingSchema';
import { DefaultTodoList, TodoItems, TodoList, TodoLists } from './todoSchema';

export class CoupleAccountRoot extends CoMap {
  couple = co.ref(Couple);
  version = co.optional.number;
}

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

  /**
   * Executes the initial migration logic when the account is first created:
   *  - Validates the user's profile data.
   *  - Sets up a private group for the user's profile (no longer public).
   *  - Sets up a private group for the couple data.
   *  - Creates an initial Couple.
   *  - Initializes the account root with version 0.
   */
  private async initialMigration(creationProps: { name: string; other?: Record<string, unknown> }) {
    const { name, other } = creationProps;
    const profileErrors = UserProfile.validate({ name, ...other });
    if (profileErrors.errors.length > 0) {
      throw new Error('Invalid profile data: ' + profileErrors.errors.join(', '));
    }

    const profileGroup = Group.create({ owner: this });
    this.profile = UserProfile.create({ name, ...other }, { owner: profileGroup });
    const privateGroup = Group.create({ owner: this });
    const partnerATodos = DefaultTodoList.create(
      {
        items: TodoItems.create([], privateGroup),
      },
      privateGroup
    );

    const partnerBTodos = DefaultTodoList.create(
      {
        items: TodoItems.create([], privateGroup),
      },
      privateGroup
    );

    const ourTodos = TodoList.create(
      {
        title: 'Our To-Dos',
        assignedTo: 'us',
        isHidden: false,
        items: TodoItems.create([], privateGroup),
        creatorAccID: this.id,
        deleted: false,
      },
      privateGroup
    );
    // Create a temporary partner profile first - we'll replace it with the proper one after
    const tempPartnerProfile = PartnerProfile.create(
      {
        name: this.profile?.name || 'New Partner',
        nickname: null,
        birthday: null,
        avatar: null,
        mood: '😊',
        accountId: this.id,
      },
      { owner: privateGroup }
    );

    // Create an initial couple with the temporary partner profile
    const initialCouple = Couple.create(
      {
        anniversary: new Date(),
        partnerA: tempPartnerProfile, // Use temporary profile initially
        partnerB: null, // Second partner is null until someone joins
        ourTodos,
        partnerATodos,
        partnerBTodos,
        todoLists: TodoLists.create([], privateGroup),
        events: Events.create([], privateGroup),
        shoppingLists: ShoppingLists.create([], privateGroup),
        deleted: false,
      },
      privateGroup
    );

    // Now create the proper partner profile using the createPartnerProfile helper
    const myProfile = createPartnerProfile(
      initialCouple,
      this.profile?.name || 'New Partner',
      this.id
    );

    // Replace the temporary profile with the proper one
    initialCouple.partnerA = myProfile;

    // Initialize the account root with version tracking and the couple
    this.root = CoupleAccountRoot.create(
      {
        couple: initialCouple,
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

export const useCouple = () => {
  const { me } = useAccount();
  const couple = useCoState(Couple, me?.root?.couple?.id);

  return couple;
};

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
