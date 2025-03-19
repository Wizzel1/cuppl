import { useAccount, useCoState } from 'jazz-react-native';
import {
  Account,
  co,
  CoList,
  CoMap,
  createInviteLink,
  Group,
  ID,
  ImageDefinition,
  Profile,
} from 'jazz-tools';
import { useMemo } from 'react';
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

export class TodoItem extends CoMap {
  title = co.string;
  description = co.optional.string;
  completed = co.boolean;
  dueDate = co.optional.Date;
  notes = co.optional.string;
  deleted = co.boolean;
  photo = co.optional.ref(ImageDefinition);
  creatorAccID = co.string;
  assignedTo = co.literal('me', 'partner', 'us');
}

export class TodoItems extends CoList.Of(co.ref(TodoItem)) {}

export class TodoList extends CoMap {
  title = co.string;
  emoji = co.optional.string;
  backgroundColor = co.optional.string;
  items = co.ref(TodoItems);
  isHidden = co.boolean;
  creatorAccID = co.string;
  assignedTo = co.literal('me', 'partner', 'us');
  deleted = co.boolean;
}

export class TodoLists extends CoList.Of(co.ref(TodoList)) {}
export class DefaultTodoList extends CoMap {
  items = co.ref(TodoItems);
}

export class Couple extends CoMap {
  anniversary = co.optional.Date;
  backgroundPhoto = co.optional.ref(ImageDefinition);
  partnerA = co.ref(PartnerProfile);
  partnerB = co.optional.ref(PartnerProfile);
  // Default todo lists
  partnerATodos = co.ref(DefaultTodoList);
  partnerBTodos = co.ref(DefaultTodoList);
  ourTodos = co.ref(TodoList);
  // Additional todo lists
  todoLists = co.ref(TodoLists);
  deleted = co.boolean;

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

/**
 * Main account class for the Couple app.
 * Contains only the profile and root properties.
 * Handles data initialization and migrations.
 */
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
      return;
    }

    try {
      // Load the root reference if it exists but isn't loaded
      if (this._refs.root && !this.root) {
        await this._refs.root.load();
      }

      // Apply partner profile setup directly, without version checking
      if (this.root) {
        // Make sure to load the couple reference as well
        if (this.root._refs?.couple && !this.root.couple) {
          console.log('Loading couple reference');
          await this.root._refs.couple.load();
        }

        // await this.ensurePartnerProfiles();
      } else {
        console.log('Root still not available after load attempt');
      }
    } catch (error) {
      console.error('Error during migration:', error);
    }
  }

  /**
   * Ensures that partner profiles are properly set up.
   * This combines the logic of both migrations into a single operation.
   */
  private async ensurePartnerProfiles() {
    // We must have a root object at this point
    if (!this.root) return;

    // Make sure the couple reference is loaded
    try {
      // If we have a reference to couple but couple isn't loaded
      if (this.root._refs?.couple && !this.root.couple) {
        console.log('Loading couple reference in ensurePartnerProfiles');
        await this.root._refs.couple.load();
      }
    } catch (error) {
      console.error('Error loading couple reference:', error);
    }

    // Now check if couple exists
    if (!this.root.couple) {
      console.log('Couple not found in root');
      return;
    }

    // We'll trust that the couple is loaded at this point
    const couple = this.root.couple;

    // Get the group that owns the couple
    const coupleOwner = couple._owner;
    if (!coupleOwner) {
      console.log('Couple has no owner');
      return;
    }

    // Get group members to determine if we have two partners
    const groupMembers = couple.getPartners();
    console.log(`Found ${groupMembers.length} members in couple group`);

    // 1. Make sure partnerA exists
    if (!couple.partnerA) {
      // Create a partner profile for the first account
      const partnerProfile = createPartnerProfile(
        couple,
        this.profile?.name || 'Partner A',
        this.id
      );

      // Set as partnerA
      couple.partnerA = partnerProfile;
    }

    // 2. Check if we need to set partnerB (couple has two members but partnerB is not set)
    if (!couple.partnerB && groupMembers.length >= 2) {
      console.log('Couple has two members but partnerB is not set, creating partnerB profile');

      // Find the second member's account ID
      // This would be the account that's not partnerA
      const secondMemberAccount = groupMembers.find(
        (member) => member.account?.id && member.account.id !== couple.partnerA?.accountId
      );

      if (secondMemberAccount?.account?.id) {
        // Create a partner profile for the second account
        const secondPartnerProfile = createPartnerProfile(
          couple,
          'Partner B', // Use a generic name since we can't access the member's name
          secondMemberAccount.account.id
        );

        // Set as partnerB
        couple.partnerB = secondPartnerProfile;
        console.log('Set partnerB profile for existing second member');
      }
    }

    // 3. Make sure accountId fields are set for all partners
    // For partnerA
    if (couple.partnerA && !couple.partnerA.accountId) {
      // If we have at least one member, assume it's the first partner
      if (groupMembers.length > 0 && groupMembers[0].account?.id) {
        couple.partnerA.accountId = groupMembers[0].account.id;
      } else {
        // Fallback to current account ID if no members found
        couple.partnerA.accountId = this.id;
      }
    }

    // For partnerB if it exists
    if (couple.partnerB && !couple.partnerB.accountId) {
      // If we have at least two members, assume the second is partnerB
      if (groupMembers.length > 1 && groupMembers[1].account?.id) {
        couple.partnerB.accountId = groupMembers[1].account.id;
      } else if (
        groupMembers.length === 1 &&
        groupMembers[0].account?.id &&
        couple.partnerA?.accountId !== groupMembers[0].account.id
      ) {
        // If only one member and it's not partnerA, use it for partnerB
        couple.partnerB.accountId = groupMembers[0].account.id;
      } else {
        // Fallback - set a placeholder ID that can be updated later
        couple.partnerB.accountId = 'unknown-partner-b';
      }
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

    // Create a private group for the user profile (no longer public)
    const profileGroup = Group.create({ owner: this });

    // Create the user profile with validated data - now private
    this.profile = UserProfile.create({ name, ...other }, { owner: profileGroup });

    // Create a private group for couple data
    const privateGroup = Group.create({ owner: this });

    // Create a sample personal todo list
    const myTodoList = this.createTodoList({
      title: 'My To-Dos',
      isHidden: false,
      owner: 'me',
      emoji: '📝',
      backgroundColor: '#000000',
    });
    if (!myTodoList) return;
    myTodoList!.items!.push(
      TodoItem.create(
        {
          title: 'Welcome to your todo list!',
          completed: false,
          dueDate: null,
          notes: null,
          deleted: false,
          creatorAccID: this.id,
          assignedTo: 'me',
        },
        privateGroup
      )
    );

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
    const invitedCouple = await Couple.load(coupleId as ID<Couple>, []);
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
        const originalCouple = await Couple.load(originalCoupleId, { owner: this });
        if (originalCouple) originalCouple.deleted = true;
      } catch (error) {
        console.error('Could not mark original couple as deleted', error);
      }
    }

    return invitedCouple;
  }

  createTodoList(args: {
    title: string;
    isHidden: boolean;
    owner: 'me' | 'partner' | 'us';
    emoji: string;
    backgroundColor: string;
  }): TodoList | null {
    console.log('createTodoList', args);
    if (!this.root?.couple) return null;

    const couple = this.root.couple;
    const coupleGroup = couple._owner;
    if (!coupleGroup) throw new Error('No couple group found');

    const newList = TodoList.create(
      {
        title: args.title,
        emoji: args.emoji,
        backgroundColor: args.backgroundColor,
        creatorAccID: this.id,
        items: TodoItems.create([], { owner: coupleGroup }),
        isHidden: args.isHidden,
        assignedTo: args.owner,
        deleted: false,
      },
      { owner: coupleGroup }
    );

    if (couple.todoLists) {
      couple.todoLists.push(newList);
    } else {
      throw new Error('No todo lists found');
    }

    return newList;
  }
}

export const shareCouple = (couple: Couple): string | null => {
  if (couple._owner) {
    return createInviteLink(couple, 'admin', 'invite');
  }
  return null;
};

/**
 * Creates a new partner profile for a member of the couple.
 * The profile will be owned by the couple's group, making it editable by both partners.
 *
 * @param couple The couple instance the profile belongs to
 * @param name The name for the profile
 * @param accountId The ID of the account this profile represents
 * @param options Additional optional profile information
 * @returns The created partner profile
 */
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
