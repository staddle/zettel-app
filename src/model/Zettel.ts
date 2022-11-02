export type Zettel = {
  id: string;
  title: string;
  owner: string;
  invitees: string[];
  items: Item[];
};

export type Item = {
  id: string;
  name: string;
  itemType: ItemType;
  store: Store;
};

export type ItemType = {
  id: string;
  name: string;
  icon: string;
  tags: string[];
};

export type Store = {
  id: string;
  name: string;
  icon: string;
};
