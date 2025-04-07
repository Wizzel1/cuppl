import { createInviteLink, useAccount, useCoState } from 'jazz-expo';
import { co, CoMap, Group, ImageDefinition } from 'jazz-tools';

import { Events } from './eventSchema.jazz';
import { PartnerProfile } from './partnerProfile.jazz';
import { ShoppingLists } from './shoppingSchema';
import { DefaultTodoList, TodoList, TodoLists } from './todoSchema';

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
