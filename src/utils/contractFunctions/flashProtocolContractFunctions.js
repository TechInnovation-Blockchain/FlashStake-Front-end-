import {
  flashProtocolContract,
  flashProtocolInfuraContract,
} from "../../contracts/getContract";
import { getWalletAddressReduxState } from "../../redux/state";
import {
  setLoadingIndep,
  showSnackbarIndep,
  showSnackbarTxnIndep,
} from "../../redux/actions/uiActions";
import {
  setDialogStepIndep,
  setRefetchIndep,
  setWithdrawTxnHashIndep,
} from "../../redux/actions/dashboardActions";
import {
  setDialogStepIndep as setStakeDialogStepIndep,
  setSwapDialogStepIndep,
  setStakeTxnHashIndep,
  setResetIndep,
  setPoolDialogStepIndep,
  setLiquidityTxnHashIndep,
  setWithdrawLiquidityTxnHash,
} from "../../redux/actions/flashstakeActions";
import { addToTxnQueueIndep } from "../../redux/actions/txnsActions";
import { analytics } from "../../config/App";
import Web3 from "web3";
import { _error } from "../log";
import { CONSTANTS } from "../constants";

let contract;
let isContractInitialized = false;

export const initializeFlashProtocolContract = (_address) => {
  contract = flashProtocolContract(_address);
  if (!contract) {
    contract = flashProtocolInfuraContract(_address);
  }
  isContractInitialized = true;
};

const checkContractInitialized = () => {
  if (!isContractInitialized) {
    throw new _error("ERROR Flash contract not initialized.");
  }
};

export const getOneDay = async () => {
  try {
    checkContractInitialized();

    // const _oneDay = await contract.methods.ONE_DAY().call();
    // // return parseFloat(_oneDay);
    return 60;
  } catch (e) {
    _error("ERROR getOneDay -> ", e);
  }
  return 60;
};

export const stake = async (_amountIn, _expiry, _data) => {
  setLoadingIndep({ stake: true });
  const walletAddress = getWalletAddressReduxState();
  try {
    setStakeDialogStepIndep("pendingStake");
    showSnackbarIndep("Transaction Pending.", "info");
    checkContractInitialized();

    if (!walletAddress) {
      throw new _error("Wallet not activated.");
    }
    contract.methods
      .stake(
        _amountIn,
        _expiry,
        CONSTANTS.FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS,
        _data
      )
      .estimateGas({ gas: 10000000, from: walletAddress }, async function (
        error,
        gasAmount
      ) {
        contract.methods
          .stake(
            _amountIn,
            _expiry,
            CONSTANTS.FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS,
            _data
          )
          .send({
            from: walletAddress,
            gasLimit: gasAmount || 400000,
            gasPrice: "10000000000",
          })
          .on("transactionHash", async (txnHash) => {
            analytics.logEvent("USER_STAKE_TXN", {
              address: `Address -> ${walletAddress}`,
              txnHash,
              _amountIn,
              _expiry,
              _data,
            });
            addToTxnQueueIndep(txnHash);
            setStakeTxnHashIndep(txnHash);
            showSnackbarTxnIndep(
              "Transaction Pending.",
              "info",
              "txnEtherScan",
              txnHash,
              true
            );
          })
          .then(function (receipt) {
            setTimeout(() => {
              setRefetchIndep(true);
            }, 5000);
            setStakeDialogStepIndep("successStake");
            setLoadingIndep({ stake: false });

            setResetIndep(true);
            showSnackbarTxnIndep(
              "Stake Transaction Successful.",
              "success",
              "txnEtherScan",
              receipt.transactionHash,
              false
            );
          })
          .catch((e) => {
            if (e.code === 4001) {
              setStakeDialogStepIndep("rejectedStake");
              showSnackbarIndep("Stake Transaction Rejected.", "error");
            } else {
              setStakeDialogStepIndep("failedStake");
              showSnackbarIndep("Stake Transaction Failed.", "error");
            }
            setLoadingIndep({ stake: false });
            _error("ERROR stake -> ", e);
          });
      });
  } catch (e) {
    if (e.code === 4001) {
      setStakeDialogStepIndep("rejectedStake");
      showSnackbarIndep("Stake Transaction Rejected.", "error");
    } else {
      analytics.logEvent("USER_STAKE_FAILED", {
        address: `Address -> ${walletAddress}`,
        _amountIn,
        _expiry,
        _data,
      });
      setStakeDialogStepIndep("failedStake");
      showSnackbarIndep("Stake Transaction Failed.", "error");
    }
    setLoadingIndep({ stake: false });
    _error("ERROR stake -> ", e);
  }
};
