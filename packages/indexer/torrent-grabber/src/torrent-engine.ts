// @ts-nocheck

import { readdirSync } from "fs";
import path from "path";

export default class TorrentEngine {
  constructor() {
    this.torrents = new Map();

    this.loadTorrents();
  }

  loadTorrents() {
    const torrentsPath = path.join(__dirname, "torrents");

    readdirSync(torrentsPath).forEach((file) => {
      const TorrentClass = require(path.join(torrentsPath, file)).default;
      const torrent = new TorrentClass();

      this.torrents.set(torrent.name, torrent);
    });
  }

  activate(...torrents) {
    const promises = [];

    torrents.forEach((torrent) => {
      let name;
      let login;
      let pass;

      if (Array.isArray(torrent)) {
        name = torrent[0];
        login = torrent[1].login;
        pass = torrent[1].pass;
      } else {
        name = torrent;
      }

      const torrentObj = this.torrents.get(name);

      if (!torrentObj) {
        throw new Error(`Torrent ${name} not found.`);
      }

      if (!torrentObj.active) {
        if (!torrentObj.checked) {
          promises.push(
            torrentObj.activate(login, pass).then(() => {
              torrentObj.active = true;
              torrentObj.checked = true;

              return torrentObj.name;
            }),
          );
        } else {
          torrentObj.active = true;
        }
      }
    });

    return Promise.all(promises);
  }

  deactivate(...torrents) {
    torrents.forEach((torrent) => {
      let name;

      if (Array.isArray(torrent)) {
        name = torrent[0];
      } else {
        name = torrent;
      }

      const torrentObj = this.torrents.get(name);

      if (!torrentObj) {
        throw new Error(`Torrent ${name} not found.`);
      }

      if (torrentObj.active) {
        torrentObj.active = false;
      }
    });
  }

  async search(query, opts = {}) {
    const requests = [];

    for (const [key, torrent] of this.torrents) {
      if (torrent.active) {
        requests.push(
          torrent.search(query).then((i) =>
            i.map((i) => {
              return { tracker: torrent.name, ...i };
            }),
          ),
        );
      }
    }

    let results = await Promise.all(requests);

    if (opts.groupByTracker) {
      const trackerMap = new Map();

      results.forEach((arr) => {
        trackerMap.set(arr[0].tracker, arr);
      });

      results = trackerMap;
    } else {
      results = results
        .reduce((acc, val) => acc.concat(val))
        .sort((a, b) => a.seeds - b.seeds)
        .reverse();
    }

    return results;
  }

  async getMagnet(item) {
    const tracker = this.torrents.get(item.tracker);

    return await tracker.getMagnet(item.trackerId);
  }
}
