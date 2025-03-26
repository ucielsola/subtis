import needle from 'needle';
import xray from '../utils/xray';
import type { TorrentItem, TorrentProvider } from '../types';

export default class _1337x implements TorrentProvider {
  name: string;
  active: boolean;
  checked: boolean;
  requireLogin: boolean;
  readonly BASE_LINK: string;

  constructor() {
    this.name = "1337x";
    this.active = false;
    this.checked = false;
    this.requireLogin = false;

    this.BASE_LINK = "https://1337x.to";
  }

  async search(query: string): Promise<TorrentItem[]> {
    const resp = await needle(
      "get",
      `${this.BASE_LINK}/sort-search/${encodeURI(query)}/seeders/desc/1/`
    );

    const items = await xray(resp.body, "tbody > tr", [
      {
        title: "a:nth-child(2)@text",
        size: ".size@text | match: '(.+)<' | fixSize",
        seeds: ".seeds@text | int",
        trackerId: "a:nth-child(2)@href"
      }
    ]) as TorrentItem[];

    return items;
  }

  async getMagnet(torrentId: string): Promise<string> {
    const resp = await needle("get", `${this.BASE_LINK}${torrentId}`);

    return await xray(
      resp.body,
      "ul.download-links-dontblock > li:nth-child(1) > a@href"
    ) as string;
  }

  async activate(): Promise<void> {
    const resp = await needle("get", `${this.BASE_LINK}`);

    if (resp.statusCode !== 200) {
      throw new Error();
    }
  }
}
