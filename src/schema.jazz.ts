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
  completed = co.boolean;
  dueDate = co.optional.Date;
  notes = co.optional.string;
  deleted = co.boolean;
  photo = co.optional.ref(ImageDefinition);
  createdBy = co.string;
}

export class TodoItemList extends CoList.Of(co.ref(TodoItem)) {}

export class TodoList extends CoMap {
  title = co.string;
  emoji = co.optional.string;
  backgroundColor = co.optional.string;
  items = co.ref(TodoItemList);
  isPrivate = co.boolean;
  createdBy = co.string;
  deleted = co.boolean;
}

export class TodoListList extends CoList.Of(co.ref(TodoList)) {}

export class Couple extends CoMap {
  anniversary = co.optional.Date;
  backgroundPhoto = co.optional.ref(ImageDefinition);
  partnerA = co.ref(PartnerProfile);
  partnerB = co.optional.ref(PartnerProfile);
  myTodoLists = co.ref(TodoListList);
  partnerTodoLists = co.ref(TodoListList);
  ourTodoLists = co.ref(TodoListList);
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

    // Create empty todo lists
    const myTodoLists = TodoListList.create([], privateGroup);
    const partnerTodoLists = TodoListList.create([], privateGroup);
    const ourTodoLists = TodoListList.create([], privateGroup);

    // Create a sample personal todo list
    const myTodoList = TodoList.create(
      {
        title: 'My To-Dos',
        emoji: '📝',
        createdBy: this.id,
        items: TodoItemList.create(
          [
            TodoItem.create(
              {
                title: 'Welcome to your todo list!',
                completed: false,
                dueDate: null,
                notes: null,
                deleted: false,
                createdBy: this.id,
              },
              privateGroup
            ),
          ],
          privateGroup
        ),
        isPrivate: true,
        deleted: false,
      },
      privateGroup
    );

    // Add the sample list to personal lists
    myTodoLists.push(myTodoList);

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
        myTodoLists,
        partnerTodoLists,
        ourTodoLists,
        deleted: false,
      },
      privateGroup
    );

    // Now create the proper partner profile using the createPartnerProfile helper
    const partnerProfile = createPartnerProfile(
      initialCouple,
      this.profile?.name || 'New Partner',
      this.id
    );

    // Replace the temporary profile with the proper one
    initialCouple.partnerA = partnerProfile;

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

  createTodoList(title: string, isPrivate: boolean = true): TodoList | null {
    if (!this.root?.couple) throw new Error('No couple found');

    const couple = this.root.couple;
    const coupleGroup = couple._owner;
    if (!coupleGroup) throw new Error('No couple group found');

    const newList = TodoList.create(
      {
        title,
        emoji: '📝',
        createdBy: this.id,
        items: TodoItemList.create([], { owner: coupleGroup }),
        isPrivate,
        deleted: false,
      },
      { owner: coupleGroup }
    );

    if (isPrivate) {
      const myProfile = getMyPartnerProfile(couple, this.id);
      if (myProfile === couple.partnerA && couple.myTodoLists) {
        couple.myTodoLists.push(newList);
      }
      if (myProfile === couple.partnerB && couple.partnerTodoLists) {
        couple.partnerTodoLists.push(newList);
      }
      return null;
    }
    if (couple.ourTodoLists) {
      couple.ourTodoLists.push(newList);
    }

    return newList;
  }

  addTodoItem(list: TodoList, title: string, dueDate?: Date, notes?: string): TodoItem | null {
    if (!list.items) return null;

    const owner = list._owner;
    if (!owner) return null;

    const newItem = TodoItem.create(
      {
        title,
        completed: false,
        dueDate: dueDate || null,
        notes: notes || null,
        deleted: false,
        createdBy: this.id,
      },
      { owner }
    );

    list.items.push(newItem);
    return newItem;
  }

  toggleTodoItem(item: TodoItem): boolean {
    item.completed = !item.completed;
    return item.completed;
  }

  getTodoLists(listType: 'my' | 'partner' | 'our'): TodoListList | null {
    if (!this.root?.couple) return null;

    const couple = this.root.couple;

    if (listType === 'my') {
      const myProfile = getMyPartnerProfile(couple, this.id);
      if (myProfile === couple.partnerA) {
        return couple.myTodoLists;
      }
      if (myProfile === couple.partnerB) {
        return couple.partnerTodoLists;
      }
    }
    if (listType === 'partner') {
      const myProfile = getMyPartnerProfile(couple, this.id);
      if (myProfile === couple.partnerA) return couple.partnerTodoLists;
      if (myProfile === couple.partnerB) return couple.myTodoLists;
    }
    if (listType === 'our') return couple.ourTodoLists;

    return null;
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
  // Get the group that owns the couple
  const coupleGroup = couple._owner.castAs(Group);

  // Create a new profile owned by the couple's group
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
 * Gets the current user's partner profile from a couple.
 *
 * @param couple The couple instance
 * @param currentAccountId The current user's account ID
 * @returns The partner profile for the current user, or null if not found
 */
export const getMyPartnerProfile = (
  couple: Couple,
  currentAccountId: string
): PartnerProfile | null => {
  const partnerA = couple.partnerA;
  const partnerB = couple.partnerB;

  if (partnerA && partnerA.accountId === currentAccountId) {
    return partnerA;
  }
  if (partnerB && partnerB.accountId === currentAccountId) {
    return partnerB;
  }
  return null;
};

/**
 * Gets the partner's profile (the other person in the couple).
 *
 * @param couple The couple instance
 * @param currentAccountId The current user's account ID
 * @returns The other partner's profile, or null if not found
 */
export const getPartnerProfile = (
  couple: Couple,
  currentAccountId: string
): PartnerProfile | null => {
  const partnerA = couple.partnerA;
  const partnerB = couple.partnerB;

  if (partnerA && partnerA.accountId === currentAccountId) {
    return partnerB || null;
  }
  if (partnerB && partnerB.accountId === currentAccountId) {
    return partnerA;
  }
  return null;
};
