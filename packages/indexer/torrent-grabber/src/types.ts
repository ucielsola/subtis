export type TorrentItem = {
  title: string;
  size: string | number;
  seeds: number;
  trackerId: string;
};

export interface TorrentProvider {
  name: string;
  active: boolean;
  checked: boolean;
  requireLogin: boolean;
  BASE_LINK: string;

  search(query: string): Promise<TorrentItem[]>;
  getMagnet(torrentId: string): Promise<string>;
  activate(login?: string, pass?: string): Promise<void>;
}
