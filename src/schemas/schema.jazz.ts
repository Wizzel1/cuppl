import { useAccount } from 'jazz-react-native';
import {
  Account,
  co,
  CoMap,
  createInviteLink,
  Group,
  ID,
  ImageDefinition,
  Profile,
} from 'jazz-tools';
import { useMemo } from 'react';

import { Events } from './eventSchema.jazz';
import { ShoppingLists } from './shoppingSchema';
import { DefaultTodoList, TodoItems, TodoList, TodoLists } from './todoSchema';
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

export class Couple extends CoMap {
  anniversary = co.optional.Date;
  backgroundPhoto = co.optional.ref(ImageDefinition);
  partnerA = co.ref(PartnerProfile);
  partnerB = co.optional.ref(PartnerProfile);
  // Default todo lists
  partnerATodos = co.ref(DefaultTodoList);
  partnerBTodos = co.ref(DefaultTodoList);
  sharedTodos = co.ref(TodoList);
  // Additional todo lists
  todoLists = co.ref(TodoLists);
  deleted = co.boolean;
  shoppingLists = co.ref(ShoppingLists);
  events = co.ref(Events);

  getPartners() {
    return this._owner
      .castAs(Group)
      .members.filter((member) => member.role === 'admin' || member.role === 'writer');
  }
}

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

  private async initialMigration(creationProps: { name: string; other?: Record<string, unknown> }) {
    console.log('initialMigration', creationProps);
    const { name, other } = creationProps;
    const profileErrors = UserProfile.validate({ name, ...other });
    if (profileErrors.errors.length > 0) {
      throw new Error('Invalid profile data: ' + profileErrors.errors.join(', '));
    }

    const privateProfileGroup = Group.create({ owner: this });
    this.profile = UserProfile.create(
      {
        name,
        ...other,
      },
      { owner: privateProfileGroup }
    );
    console.log('profile', this.profile);
    const coupleGroup = Group.create({ owner: this });
    const partnerATodos = DefaultTodoList.create(
      { items: TodoItems.create([], { owner: coupleGroup }) },
      { owner: coupleGroup }
    );
    const partnerBTodos = DefaultTodoList.create(
      { items: TodoItems.create([], { owner: coupleGroup }) },
      { owner: coupleGroup }
    );
    const sharedTodos = TodoList.create(
      {
        deleted: false,
        creatorAccID: this.id,
        assignedTo: 'us',
        items: TodoItems.create([], { owner: coupleGroup }),
        title: 'Shared Todos',
        isHidden: false,
      },
      { owner: coupleGroup }
    );
    const todoLists = TodoLists.create([], { owner: coupleGroup });
    const events = Events.create([], { owner: coupleGroup });
    const shoppingLists = ShoppingLists.create([], { owner: coupleGroup });

    const partnerA = PartnerProfile.create(
      {
        accountId: this.id,
        name,
        mood: '😊',
        nickname: 'Partner A',
      },
      { owner: coupleGroup }
    );

    const couple = Couple.create(
      {
        todoLists,
        shoppingLists,
        events,
        partnerATodos,
        partnerBTodos,
        sharedTodos,
        deleted: false,
        partnerA,
      },
      { owner: coupleGroup }
    );
    console.log('couple', couple);
    this.root = CoupleAccountRoot.create(
      {
        couple,
        version: 0,
      },
      { owner: coupleGroup }
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

export const shareCouple = (couple: Couple): string | null => {
  if (couple._owner) {
    return createInviteLink(couple, 'admin', 'invite');
  }
  return null;
};

export const createPartnerProfile = (
  couple: Couple,
  name: string,
  accountId: ID<Account>,
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

/**
 * Custom hook that returns the couple that the current user is in.
 *
 * This hook simplifies access to the couple data and handles the loading state.
 * It automatically retrieves the couple from the user's account root.
 *
 * @returns The couple instance or undefined if not loaded yet
 */
export const useCouple = () => {
  const { me } = useAccount({ resolve: { root: { couple: true } } });
  return me?.root.couple;
};

export const usePartnerProfiles = () => {
  const { me } = useAccount({ resolve: { root: { couple: true } } });
  const couple = me?.root.couple;
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
