import { co, CoList, CoMap, ImageDefinition, Resolved } from 'jazz-tools';

export type ResolvedShoppingList = Resolved<
  ShoppingList,
  {
    items: { $each: true };
  }
>;

export class ShoppingItem extends CoMap {
  name = co.string;
  quantity = co.number;
  unit = co.literal('kg', 'g', 'l', 'ml', 'pcs');
  category = co.literal('food', 'household', 'other');
  isHidden = co.boolean;
  creatorAccID = co.string;
  deleted = co.boolean;
  photo = co.optional.ref(ImageDefinition);
  notes = co.optional.string;
  completed = co.boolean;
}

export class ShoppingItems extends CoList.Of(co.ref(ShoppingItem)) {}
export class ShoppingList extends CoMap {
  title = co.string;
  notes = co.optional.string;
  emoji = co.optional.string;
  backgroundColor = co.optional.string;
  items = co.ref(ShoppingItems);
  isHidden = co.boolean;
  creatorAccID = co.string;
  assignedTo = co.literal('me', 'partner', 'us');
  deleted = co.boolean;

  get liveItems() {
    const items = [];
    for (const item of this.items ?? []) {
      if (item?.deleted === undefined) continue;
      if (item?.deleted) continue;
      items.push(item);
    }
    return items;
  }

  get completedItems() {
    const items = [];
    for (const item of this.items ?? []) {
      if (item?.deleted) continue;
      if (item?.completed === undefined) continue;
      if (item?.completed) {
        items.push(item);
      }
    }
    return items;
  }
}

export class ShoppingLists extends CoList.Of(co.ref(ShoppingList)) {}
