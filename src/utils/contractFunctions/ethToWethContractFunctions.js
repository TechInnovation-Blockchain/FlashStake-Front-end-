import {
  EthToWethConversionContract,
  EthToWethConversionInfuraContract,
} from "../../contracts/getContract";
import { getWalletAddressReduxState } from "../../redux/state";
import { _error, _log } from "../log";

import {
  setLoadingIndep,
  showSnackbarIndep,
  showSnackbarTxnIndep,
} from "../../redux/actions/uiActions";
import { setRefetchIndep } from "../../redux/actions/dashboardActions";
import {
  setConvertDialogStepIndep,
  setConvertTxnHashIndep,
  setResetIndep,
} from "../../redux/actions/flashstakeActions";
import { addToTxnQueueIndep } from "../../redux/actions/txnsActions";

let contract;
let isContractInitialized = false;

export const initializeEthToWethContract = async (address) => {
  contract = EthToWethConversionContract(address);
  if (!contract) {
    contract = EthToWethConversionInfuraContract(address);
  }
  isContractInitialized = true;
};

const checkContractInitialized = () => {
  if (!isContractInitialized) {
    throw new _error("ETH conversion contract not initialized.");
  }
};

export const deposit = async (_quantity, inPool = false) => {
  try {
    setConvertDialogStepIndep("pendingConvert", inPool);
    showSnackbarIndep("Conversion Pending.", "info");
    checkContractInitialized();
    const walletAddress = getWalletAddressReduxState();
    if (!walletAddress) {
      // throw new _error("Wallet not activated.");
      return "0";
    }
    console.log("In here", _quantity);
    const receivedWeth = await contract.methods
      .deposit()
      .send({
        value: _quantity,
        from: walletAddress,
      })
      .on("transactionHash", async (txnHash) => {
        addToTxnQueueIndep(txnHash);
        setConvertTxnHashIndep(txnHash);
        showSnackbarTxnIndep(
          "Conversion Pending.",
          "info",
          "txnEtherScan",
          txnHash,
          true
        );
      })
      .then(function (receipt) {
        setTimeout(() => {
          setRefetchIndep(true);
        }, 2000);
        setConvertDialogStepIndep("successConvert", inPool);
        setLoadingIndep({ convert: false });

        setResetIndep(true);
        showSnackbarTxnIndep(
          "Conversion Transaction Successful.",
          "success",
          "txnEtherScan",
          receipt.transactionHash,
          false
        );
      })
      .catch((e) => {
        if (e.code === 4001) {
          setConvertDialogStepIndep("rejectedConvert", inPool);
          showSnackbarIndep("Convert Transaction Rejected.", "error");
        } else {
          setConvertDialogStepIndep("failedConvert", inPool);
          showSnackbarIndep("Convert Transaction Failed.", "error");
        }
        setLoadingIndep({ convert: false });
        _error("ERROR convert -> ", e);
      });

    // receivedWeth
    return receivedWeth;
  } catch (e) {
    _error("ERROR deposit -> ", e);
    return "0";
  }
};
