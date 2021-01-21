import _ from "lodash";
import axios from "axios";
import { client } from "../config/apolloGraphQl";
// import { client } from "../apollo/client";
// import { PAIRS_TOKENS } from "../apollo/queries";
import { utils } from "ethers";
import { protocolsQuery } from "../graphql/queries/userStakesQuery";

export const getTokenPrices = _.memoize(async () => {
  const _reserves = await axios.get(
    "https://server.flashstake.io:2053/getReserves"
  );
  const _pairs = await client.query({
    query: protocolsQuery,
  });
  const _tokenPrices = {};
  const _daiPairAddress = "0x92f0d856ef5be5e3ce58072d43a14320f8f3a4dc";
  const _flashAddress = "0xb4467e8d621105312a914f1d42f10770c0ffe3c8";

  if (_pairs?.data?.protocols[0]?.pools && _reserves?.data) {
    const {
      reserveFlashAmount: reserveFlash,
      reserveAltAmount: reserveAlt,
    } = _reserves?.data[_daiPairAddress];
    const _flashPrice =
      utils.formatUnits(reserveAlt, 18) / utils.formatUnits(reserveFlash, 18);
    _tokenPrices[_flashAddress] = { usd: _flashPrice };
    const temp = _pairs?.data?.protocols[0]?.pools?.map((_pair) => {
      if (!_reserves?.data[_pair.id]) {
        return;
      }
      const { reserveFlashAmount, reserveAltAmount } = _reserves?.data[
        _pair.id
      ];
      _tokenPrices[_pair.tokenB.id] = {
        usd:
          (utils.formatUnits(reserveFlashAmount, 18) /
            utils.formatUnits(reserveAltAmount, _pair.tokenB.decimal)) *
            _flashPrice || 0,
      };
    });
  }
  return { data: _tokenPrices };
});
