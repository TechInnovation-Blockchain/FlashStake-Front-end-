import _ from "lodash";
import axios from "axios";

export const ogTrunc = (val, test) => {
  if (!Number(val)) {
    return 0;
  }
  const _val = val - Math.trunc(val);
  if (!_val) {
    return Math.trunc(val);
  }
  let decimal = 0;
  if (_val < 0.000001) {
    decimal = 7;
    return parseFloat(val).toFixed(4);
  } else if (_val < 0.00001) {
    decimal = 4;
  } else if (_val < 0.0001) {
    decimal = 4;
  } else if (_val < 0.001) {
    decimal = 4;
  } else if (_val < 0.01) {
    decimal = 3;
  } else if (_val < 1) {
    decimal = 2;
  } else {
    return Math.trunc(val).toString();
  }
  return (
    Math.trunc(val) +
    parseFloat(
      _val
        .toString()
        .match(new RegExp("^-?\\d+(?:.\\d{0," + decimal + "})?"))[0]
    )
  ).toFixed(decimal);
};

export const trunc = (val, test) => {
  let _val = ogTrunc(val, test).toString();
  const _val2 = _val.split(".");
  if (_val2[0].length > 10) {
    const _val = _val2[0].slice(0, 4);
    const __val = _val2[0].slice(_val2.length - 4, -1);

    const joined = [_val, __val].join("..");
    return joined;
  }
  if (_val.includes(".")) {
    const splitedVal = _val.split(".");

    if (val < 0.0001) {
      return "<0.0001";
    }

    return [
      splitedVal[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","),
      splitedVal[1],
    ].join(".");
  } else {
    return _val;
  }
};

export const stringToFixed = (number) => {
  return number.toString().match(/^-?\d+(?:\.\d{0,18})?/)[0];
};

export const getExtendedFloatValue = (val) => {
  if (Number(val)) {
    return parseFloat(val).toFixed(18);
  }
  return 0;
};

export const toFixedDec4 = (val) => {
  try {
    return String(val).match(/^-?\d+(?:\.\d{0,4})?/)[0];
  } catch (e) {
    return "";
  }
};

export const fetchTokenList = _.memoize(async (_tokenListUri) => {
  const response = await axios.get(_tokenListUri);
  return response;
});

export const getPercentageAmount = (total, outOf) => {
  const calculatedPercentage = (outOf / total) * 100;
  return trunc(calculatedPercentage);
};
