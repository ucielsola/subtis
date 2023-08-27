import { describe, it } from "vitest";

import { getSubDivXSearchParams } from "../subdivx";

describe("getSubDivXSearchParams", () => {
  it('should return an search params for "Kinderfanger (2023)" for page 1', ({
    expect,
  }) => {
    const searchParams = getSubDivXSearchParams("Kinderfanger (2023)");
    expect(searchParams).toEqual({
      pg: "1",
      buscar2: "Kinderfanger (2023)",
      accion: "5",
      masdesc: "",
      realiza_b: "1",
      subtitulos: "1",
    });
  });

  it('should return an search params for "Stories Not To Be Told (2022)" for page 1', ({
    expect,
  }) => {
    const searchParams = getSubDivXSearchParams(
      "Stories Not To Be Told (2022)",
    );
    expect(searchParams).toEqual({
      pg: "1",
      buscar2: "Stories Not To Be Told (2022)",
      accion: "5",
      masdesc: "",
      realiza_b: "1",
      subtitulos: "1",
    });
  });

  it('should return an search params for "A Long Way To Come Home (2023)" for page 4', ({
    expect,
  }) => {
    const searchParams = getSubDivXSearchParams(
      "A Long Way To Come Home (2023)",
      "4",
    );
    expect(searchParams).toEqual({
      pg: "4",
      buscar2: "A Long Way To Come Home (2023)",
      accion: "5",
      masdesc: "",
      realiza_b: "1",
      subtitulos: "1",
    });
  });
});
