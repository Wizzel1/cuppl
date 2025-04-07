import { createInviteLink, useAccount, useCoState } from 'jazz-expo';
import { co, CoMap, Group, ImageDefinition } from 'jazz-tools';

import { Events } from './eventSchema.jazz';
import { PartnerProfile } from './partnerProfile.jazz';
import { CoupleAccount } from './schema.jazz';
import { ShoppingLists } from './shoppingSchema';
import { DefaultTodoList, TodoItems, TodoList, TodoLists } from './todoSchema';

export const useCouple = () => {
  const { me } = useAccount();
  const couple = useCoState(Couple, me?.root?.couple?.id);

  return couple;
};
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
  shoppingLists = co.ref(ShoppingLists);
  events = co.ref(Events);

  getPartners() {
    return this._owner
      .castAs(Group)
      .members.filter((member) => member.role === 'admin' || member.role === 'writer');
  }

  getInviteLink() {
    if (this._owner) {
      return createInviteLink(this, 'admin', { baseURL: 'invite' });
    }
  }
}

export function createCouple(account: CoupleAccount, owner: Group) {
  return Couple.create(
    {
      partnerA: PartnerProfile.create(
        {
          name: account.profile?.name || 'New Partner',
          mood: '😊',
          accountId: account.id,
        },
        owner
      ),
      ourTodos: TodoList.create({
        title: 'Our To-Dos',
        assignedTo: 'us',
        isHidden: false,
        creatorAccID: account.id,
        deleted: false,
        emoji: '🖊',
        backgroundColor: '#FFFFFF',
        items: TodoItems.create([], owner),
      }),
      partnerATodos: DefaultTodoList.create(
        {
          items: TodoItems.create([], owner),
        },
        owner
      ),
      partnerBTodos: DefaultTodoList.create(
        {
          items: TodoItems.create([], owner),
        },
        owner
      ),
      deleted: false,
      events: Events.create([], owner),
      shoppingLists: ShoppingLists.create([], owner),
      todoLists: TodoLists.create([], owner),
    },
    owner
  );
}
