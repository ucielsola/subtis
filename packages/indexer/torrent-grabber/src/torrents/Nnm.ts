import needle from 'needle';
import querystring from 'querystring';
import xray from '../utils/xray';
import type { TorrentItem, TorrentProvider } from '../types';

export default class Nnm implements TorrentProvider {
  name: string;
  active: boolean;
  checked: boolean;
  requireLogin: boolean;
  readonly BASE_LINK: string;

  constructor() {
    this.name = "Nnm";
    this.active = false;
    this.checked = false;
    this.requireLogin = false;

    this.BASE_LINK = "https://nnmclub.to";
  }

  async search(query: string): Promise<TorrentItem[]> {
    const postData = querystring.stringify({
      nm: query,
      f: "-1",
      o: 10
    });

    const resp = await needle(
      "post",
      `${this.BASE_LINK}/forum/tracker.php?${postData}`
    );

    const items = await xray(resp.body, ".tablesorter tr", [
      {
        title: ".genmed > a > b@text",
        size: "td:nth-child(6) > u@text | int",
        seeds: ".seedmed > b@text | int",
        trackerId: ".genmed > a@href"
      }
    ]) as TorrentItem[];

    return items;
  }

  async getMagnet(torrentId: string): Promise<string> {
    const resp = await needle("get", `${this.BASE_LINK}/forum/${torrentId}`);

    return await xray(resp.body, "td.gensmall > a@href") as string;
  }

  async activate(): Promise<void> {
    const resp = await needle("get", `${this.BASE_LINK}/forum/tracker.php`);

    if (resp.statusCode !== 200) {
      throw new Error();
    }
  }
}
