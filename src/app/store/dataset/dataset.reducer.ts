import { Item, Category, Recipe, Entities, ItemId, NEntities } from '~/models';
import { DatasetAction, DatasetActionType } from './dataset.actions';
import { Icon } from '~/models/icon';

export interface DatasetState {
  categories: Category[];
  categoryIds: string[];
  categoryEntities: Entities<Category>;
  categoryItemRows: Entities<string[][]>;
  icons: Icon[];
  iconIds: string[];
  iconEntities: Entities<Icon>;
  items: Item[];
  itemIds: string[];
  itemEntities: Entities<Item>;
  itemN: Entities<number>;
  itemI: NEntities<string>;
  beltIds: ItemId[];
  recipes: Recipe[];
  recipeIds: string[];
  recipeEntities: Entities<Recipe>;
  recipeN: Entities<number>;
  recipeI: NEntities<string>;
}

export const initialDatasetState: DatasetState = {
  categories: [],
  categoryIds: [],
  categoryEntities: {},
  categoryItemRows: {},
  icons: [],
  iconIds: [],
  iconEntities: {},
  items: [],
  itemIds: [],
  itemEntities: {},
  itemN: {},
  itemI: {},
  beltIds: [],
  recipes: [],
  recipeIds: [],
  recipeEntities: {},
  recipeN: {},
  recipeI: {},
};

export function datasetReducer(
  state: DatasetState = initialDatasetState,
  action: DatasetAction
): DatasetState {
  switch (action.type) {
    case DatasetActionType.LOAD: {
      const categoryItemRows: Entities<string[][]> = {};

      for (const category of action.payload.categories) {
        const rows: string[][] = [[]];
        const items = action.payload.items
          .filter((p) => p.category === category.id)
          .sort((a, b) => a.row - b.row);
        let index = items[0].row;
        for (const item of items) {
          if (item.row > index) {
            rows.push([]);
            index = item.row;
          }
          rows[rows.length - 1].push(item.id);
        }
        categoryItemRows[category.id] = rows;
      }

      const itemEntities = action.payload.items.reduce(
        (e: Entities<Item>, i) => {
          return { ...e, ...{ [i.id]: i } };
        },
        {}
      );

      // Fill in missing recipe names
      const recipes: Recipe[] = [];
      for (const recipe of action.payload.recipes) {
        if (!recipe.name) {
          recipes.push({
            ...recipe,
            ...{ name: itemEntities[recipe.id].name },
          });
        } else {
          recipes.push(recipe);
        }
      }

      return {
        categories: action.payload.categories,
        categoryIds: action.payload.categories.map((c) => c.id),
        categoryEntities: action.payload.categories.reduce(
          (e: Entities<Category>, c) => {
            return { ...e, ...{ [c.id]: c } };
          },
          {}
        ),
        categoryItemRows,
        icons: action.payload.icons,
        iconIds: action.payload.icons.map((i) => i.id),
        iconEntities: action.payload.icons.reduce((e: Entities<Icon>, c) => {
          return { ...e, ...{ [c.id]: c } };
        }, {}),
        items: action.payload.items,
        itemIds: action.payload.items.map((i) => i.id),
        itemEntities,
        itemN: action.payload.items.reduce((e: Entities<number>, i, z) => {
          return { ...e, ...{ [i.id]: z } };
        }, {}),
        itemI: action.payload.items.reduce((e: NEntities<string>, i, z) => {
          return { ...e, ...{ [z]: i.id } };
        }, {}),
        beltIds: action.payload.items
          .filter((i) => i.belt || i.id === ItemId.Pipe)
          .map((i) => i.id),
        recipes,
        recipeIds: recipes.map((r) => r.id),
        recipeEntities: recipes.reduce((e: Entities<Recipe>, r) => {
          return { ...e, ...{ [r.id]: r } };
        }, {}),
        recipeN: recipes.reduce((e: Entities<number>, i, z) => {
          return { ...e, ...{ [i.id]: z } };
        }, {}),
        recipeI: recipes.reduce((e: NEntities<string>, i, z) => {
          return { ...e, ...{ [z]: i.id } };
        }, {}),
      };
    }
    default:
      return state;
  }
}
