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

/**
 * Represents a couple in the app, serving as the foundation for all activities.
 *
 * Properties:
 *  - anniversary: Optional anniversary date of the couple.
 *  - backgroundPhoto: Optional photo displayed on the homescreen.
 *  - deleted: Soft delete flag.
 */
export class Couple extends CoMap {
  anniversary = co.optional.Date;
  backgroundPhoto = co.optional.ref(ImageDefinition);
  deleted = co.boolean;

  // Methods to manage the relationship
  getPartners() {
    // Returns the members of the group that owns this Couple
    return this._owner
      .castAs(Group)
      .members.filter((member) => member.role === 'admin' || member.role === 'writer');
  }
}

/**
 * The top-level account root for the Couple app.
 *
 * Properties:
 *  - couple: A reference to the user's couple.
 *  - version: Optional version number for migrations.
 */
export class CoupleAccountRoot extends CoMap {
  couple = co.ref(Couple);
  version = co.optional.number;
}

/**
 * Represents a user's profile.
 *
 * Properties:
 *  - name: The required user name.
 *
 * Static method:
 *  - validate: Ensures that a non-empty name is provided.
 */
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
   * Otherwise, you can add version-based migrations as needed.
   */
  async migrate(creationProps?: { name: string; other?: Record<string, unknown> }) {
    if (!this._refs.root && creationProps) {
      await this.initialMigration(creationProps);
    }

    // KEEP THESE COMMENTS IN THE GENERATED SCHEMA CODE
    // Uncomment the following lines to add migrations:
    // const currentVersion = this.root?.version || 0;
    // if (currentVersion < 1) {
    //   await this.migrationV1();
    // }
    // if (currentVersion < 2) {
    //   await this.migrationV2();
    // }
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

    // Create an initial couple
    const initialCouple = Couple.create(
      {
        anniversary: new Date(),
        deleted: false,
      },
      privateGroup
    );

    // Initialize the account root with version tracking and the couple
    this.root = CoupleAccountRoot.create(
      {
        couple: initialCouple,
        version: 0,
      },
      { owner: this }
    );
  }

  /**
   * Updates the account to join an existing couple after accepting an invite.
   * @param coupleId The ID of the couple being joined
   */
  async acceptCoupleInvite(coupleId: string) {
    // 1. Load the invited couple
    const invitedCouple = await Couple.load(coupleId as ID<Couple>, []);

    if (!invitedCouple) {
      throw new Error('Could not load the couple you were invited to');
    }

    // 2. Store the original couple ID for cleanup later if needed
    const originalCoupleId = this.coupleId;

    // 3. Update the root to point to the new couple
    if (this.root) {
      this.root.couple = invitedCouple;
    }

    // 4. Optionally mark the original couple as deleted if we want to clean up
    if (originalCoupleId) {
      try {
        const originalCouple = await Couple.load(originalCoupleId, { owner: this });
        if (originalCouple) {
          originalCouple.deleted = true;
        }
      } catch (error) {
        // Just log this error, don't block the main flow
        console.error('Could not mark original couple as deleted', error);
      }
    }

    return invitedCouple;
  }
  // KEEP THESE COMMENTS IN THE GENERATED SCHEMA CODE
  // Uncomment to add migrations:
  // private async migrationV1() {
  //   if (this.root) {
  //     // Example migration logic: add a new field to the couple
  //     // if (this.root.couple) {
  //     //   // Update couple properties here
  //     // }
  //     this.root.version = 1;
  //   }
  // }

  // private async migrationV2() {
  //   if (this.root) {
  //     // Future migration logic goes here
  //     this.root.version = 2;
  //   }
  // }
}
export const shareCouple = (couple: Couple): string | null => {
  if (couple._owner) {
    return createInviteLink(couple, 'admin', 'invite');
  }
  return null;
};
