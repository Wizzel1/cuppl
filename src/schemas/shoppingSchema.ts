import { co, CoList, CoMap } from 'jazz-tools';

class ShoppingItem extends CoMap {
  name = co.string;
  age = co.number;
}

export class ShoppingItems extends CoList.Of(co.ref(ShoppingItem)) {}
export class ShoppingList extends CoMap {
  title = co.string;
  items = co.ref(ShoppingItems);
  creatorAccID = co.string;
  assignedTo = co.literal('me', 'partner', 'us');
  deleted = co.boolean;
  isHidden = co.boolean;
}
