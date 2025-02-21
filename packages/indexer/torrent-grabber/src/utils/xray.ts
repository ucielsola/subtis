// @ts-nocheck

import { filesize } from "filesize";
import xRay from "x-ray";

const exp = (str, exp) => Number.parseInt(filesize(Number.parseFloat(str), { exponent: exp }));

const xray = xRay({
  filters: {
    int: (value) => {
      const intValue = Number.parseInt(value);
      return Number.isNaN(intValue) ? value : intValue;
    },
    match: (value, str) => {
      return typeof value === "string" && value.match(new RegExp(str)) !== null
        ? value.match(new RegExp(str))[1]
        : value;
    },
    fixSize: (str) => {
      if (str.match(/[gG]/)) {
        return exp(str, -3);
      }

      if (str.match(/[mM]/)) {
        return exp(str, -2);
      }
    },
  },
});

export default (...args) => {
  return new Promise((resolve, reject) => {
    xray(...args)((err, data) => {
      if (err !== null) {
        reject(err);
      }

      resolve(data);
    });
  });
};
