import { co, CoList, CoMap, ImageDefinition } from 'jazz-tools';

class ShoppingItem extends CoMap {
  name = co.string;
  age = co.number;
  quantity = co.optional.number;
  price = co.optional.number;
  isHidden = co.boolean;
  creatorAccID = co.string;
  assignedTo = co.literal('me', 'partner', 'us');
  deleted = co.boolean;
  photo = co.optional.ref(ImageDefinition);
  notes = co.optional.string;
}

export class ShoppingItems extends CoList.Of(co.ref(ShoppingItem)) {}
export class ShoppingList extends CoMap {
  title = co.string;
  emoji = co.optional.string;
  backgroundColor = co.optional.string;
  items = co.ref(ShoppingItems);
  isHidden = co.boolean;
  creatorAccID = co.string;
  assignedTo = co.literal('me', 'partner', 'us');
  deleted = co.boolean;
}
