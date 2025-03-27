import { co, CoList, CoMap, ImageDefinition } from 'jazz-tools';

class ShoppingItem extends CoMap {
  name = co.string;
  quantity = co.optional.number;
  unit = co.literal('kg', 'g', 'l', 'ml', 'pcs');
  category = co.literal('food', 'household', 'other');
  isHidden = co.boolean;
  creatorAccID = co.string;
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

  get liveItems() {
    const items: ShoppingItem[] = [];

    for (const item of this.items ?? []) {
      if (item?.deleted) continue;
      if (item?.deleted === undefined) continue;
      items.push(item);
    }
    return items;
  }
}

export class ShoppingLists extends CoList.Of(co.ref(ShoppingList)) {}
