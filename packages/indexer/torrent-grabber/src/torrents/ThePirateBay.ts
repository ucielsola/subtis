import needle from 'needle';
import xray from '../utils/xray';
import type { TorrentItem, TorrentProvider } from '../types';

export default class ThePirateBay implements TorrentProvider {
  name: string;
  active: boolean;
  checked: boolean;
  requireLogin: boolean;
  readonly BASE_LINK: string;

  constructor() {
    this.name = "ThePirateBay";
    this.active = false;
    this.checked = false;
    this.requireLogin = false;

    this.BASE_LINK = "https://piratebay.live";
  }

  async search(query: string): Promise<TorrentItem[]> {
    const resp = await needle(
      "get",
      `${this.BASE_LINK}/search/${encodeURI(query)}/0/99/0`
    );

    const items = await xray(resp.body, "#searchResult tr", [
      {
        title: "a.detLink@text",
        size: '.detDesc@text | match: "Size.(.+?)," | fixSize',
        seeds: "td:nth-child(3)@text | int",
        trackerId: "td:nth-child(2) > a:nth-child(2)@href"
      }
    ]) as TorrentItem[];

    return items;
  }

  async getMagnet(torrentId: string): Promise<string> {
    return torrentId;
  }

  async activate(): Promise<void> {
    const resp = await needle("get", this.BASE_LINK);

    if (resp.statusCode !== 200) {
      throw new Error();
    }
  }
}
