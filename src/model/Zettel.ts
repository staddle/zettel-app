export type Zettel = {
  id: string;
  title: string;
  owner: string;
  done: boolean;
  invitees: string[];
  items: Item[];
};

export type Item = {
  id: string;
  name: string;
  date: number;
  itemType: ItemType;
  store: Store;
  done: boolean;
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
