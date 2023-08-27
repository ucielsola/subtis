import { describe, it } from "vitest";

import { ReleaseGroupNames } from "../release-groups";
import { getOpenSubtitlesSubtitle } from "../opensubtitles";

describe("getOpenSubtitlesSubtitle", () => {
  it("should return a subtitle link giving a movie, release group and quality", async ({
    expect,
  }) => {
    const movieData = {
      name: "Meg 2 The Trench",
      searchableMovieName: "Meg 2 The Trench (2023)",
      year: 2023,
      resolution: "1080p",
      searchableSubDivXName: "YTS MX",
      searchableArgenteamName: "YIFY",
      searchableOpenSubtitlesName: "YTS.MX",
      releaseGroup: "YTS-MX" as ReleaseGroupNames,
    };

    const subtitle = await getOpenSubtitlesSubtitle(movieData, 9224104);

    expect(subtitle).toEqual({
      fileExtension: "srt",
      subtitleLink:
        "https://www.opensubtitles.com/download/3E56B9ACBFB53063B1A115DA429C507CE20D4867FDF8D5808537E198738A0F980BFB6634A0FE6DCCC4F940D272010289BB58EB38663B8B155CC80202C87369942110542A01FDE03B8135550E932B1A9EB0D4B4DC5613C73B49F231BD9BDB5DE8525494A8156772EB7CF954D9A59FBD5D889FF6711CA79D3753D379781045D154C6789E4F9287155AEFF1D9A29D3031FD7FE40D2001470C5C402D1B9A7EAAB9831B4EB1769E3B668A742A6A1AFD41EF92E164C9908E9D678AE4BA866DA69BA1D942FD8F3EC5B21A9F2587DA1EFBBF1ABD2F5F0DB20608554E04E8C315AAAC5C598CCEE960299EEA4452C0855188FD0A440163B1D757D5BB772F3C8E16617029B319F11DB068854844799E1FF7E79762635474499F670D33855E885E0F15060BACD8E5EB4C3AB702FC31CFBF6076066BA10B968D6B5B65B327/subfile/Meg.2.The.Trench.2023.1080p.WEBRip.x264.AAC5.1-%5BYTS.MX%5D-spa.srt",
      subtitleGroup: "OpenSubtitles",
      subtitleSrtFileName: "meg-2-the-trench-1080p-yts-mx-opensubtitles.srt",
      subtitleCompressedFileName:
        "meg-2-the-trench-1080p-yts-mx-opensubtitles.srt",
      subtitleFileNameWithoutExtension:
        "meg-2-the-trench-1080p-yts-mx-opensubtitles",
    });
  });
});
