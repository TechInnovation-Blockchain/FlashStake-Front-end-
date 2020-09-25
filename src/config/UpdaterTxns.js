import React, { useEffect, useCallback, useState } from "react";
import { connect } from "react-redux";
import { useWeb3React } from "@web3-react/core";

import { useDebouncedValue } from "../utils/debounceFunc";
import { updateTxnStatus } from "../redux/actions/txnsActions";

function UpdaterTxns({ queue, updateTxnStatus }) {
  const { library, chainId } = useWeb3React();
  const [currentBlockState, setCurrentBlockState] = useState({
    chainId,
    blockNumber: null,
  });

  const blockNumber = useCallback(
    (blockNumber) => {
      setCurrentBlockState((_currentBlockState) => {
        if (chainId === _currentBlockState.chainId) {
          if (typeof _currentBlockState.blockNumber !== "number")
            return { chainId, blockNumber };
          return {
            chainId,
            blockNumber: Math.max(blockNumber, _currentBlockState.blockNumber),
          };
        }
        return _currentBlockState;
      });
    },
    [chainId]
  );

  useEffect(() => {
    if (library && chainId) {
      setCurrentBlockState({ chainId, blockNumber: null });

      library
        .getBlockNumber()
        .then(blockNumber)
        .catch((e) => console.error("ERROR UpdaterTxns getBlockNumber -> ", e));

      library.on("block", blockNumber);
      return () => {
        library.removeListener("block", blockNumber);
      };
    }
  }, [blockNumber, chainId, library]);

  const debouncedState = useDebouncedValue(currentBlockState, 100);

  useEffect(() => {
    if (
      debouncedState.chainId &&
      debouncedState.blockNumber &&
      Object.keys(queue).length
    ) {
      Object.keys(queue)
        .filter((hash) =>
          Number(queue[hash]?.lastChecked)
            ? debouncedState.blockNumber - queue[hash]?.lastChecked > 0
            : true
        )
        .forEach((hash) => {
          library
            .getTransactionReceipt(hash)
            .then((receipt) => {
              if (receipt) {
              } else {
                updateTxnStatus(hash, {
                  lastChecked: debouncedState.blockNumber,
                });
              }
            })
            .catch((error) => {
              console.error(`failed to check transaction hash: ${hash}`, error);
            });
        });
    }
  }, [
    debouncedState.blockNumber,
    debouncedState.chainId,
    queue,
    library,
    updateTxnStatus,
  ]);

  return null;
}

const mapStateToProps = ({ txns: { queue } }) => ({ queue });

export default connect(mapStateToProps, { updateTxnStatus })(UpdaterTxns);
