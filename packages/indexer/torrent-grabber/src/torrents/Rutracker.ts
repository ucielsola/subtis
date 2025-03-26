import needle from 'needle';
import querystring from 'querystring';
import xray from '../utils/xray';
import type { TorrentItem, TorrentProvider } from '../types';

export default class Rutracker implements TorrentProvider {
  name: string;
  active: boolean;
  checked: boolean;
  requireLogin: boolean;
  cookie: string | null;
  readonly BASE_LINK: string;

  constructor() {
    this.name = "Rutracker";
    this.active = false;
    this.checked = false;
    this.requireLogin = true;
    this.cookie = null;

    this.BASE_LINK = "https://projectlensrtr.tk";
  }

  async search(query: string): Promise<TorrentItem[]> {
    const postData = querystring.stringify({
      nm: query,
      f: "-1",
      o: 10
    });

    const options = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": postData.length,
        Cookie: this.cookie
      }
    };

    const resp = await needle(
      "post",
      `${this.BASE_LINK}/forum/tracker.php`,
      postData,
      options
    );

    const items = await xray(resp.body, "#tor-tbl > tbody > tr", [
      {
        title: ".t-title > a@text",
        size: ".tor-size > u@text | int",
        seeds: "td:nth-child(7) > u@text | int",
        trackerId: ".t-title > a@href"
      }
    ]) as TorrentItem[];

    return items;
  }

  async getMagnet(torrentId: string): Promise<string> {
    const options = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": 0,
        Cookie: this.cookie
      }
    };

    const resp = await needle(
      "post",
      `${this.BASE_LINK}/forum/${torrentId}`,
      {},
      options
    );

    return await xray(resp.body, ".magnet-link-16@href") as string;
  }

  async activate(login?: string, pass?: string): Promise<void> {
    if (!login || !pass) {
      throw new Error("Requieres login credentials!");
    }

    const postData = querystring.stringify({
      login_username: login,
      login_password: pass,
      login: "Вход"
    });

    const options = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": postData.length
      }
    };

    const resp = await needle(
      "post",
      `${this.BASE_LINK}/forum/login.php`,
      postData,
      options
    );

    if (resp.statusCode.toString() === "302") {
      this.cookie = resp.headers["set-cookie"][1];
    } else {
      throw new Error("Wrong credentials!");
    }
  }
}
