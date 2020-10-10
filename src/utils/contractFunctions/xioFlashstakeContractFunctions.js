import {
  xioFlashstakeContract,
  xioFlashstakeInfuraContract,
} from "../../contracts/getContract";
import {
  initializeErc20TokenInfuraContract,
  symbol,
} from "./erc20TokenContractFunctions";
import { getWalletAddressReduxState } from "../../redux/state";
import {
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
  setStakeTxnHashIndep,
  setResetIndep,
} from "../../redux/actions/flashstakeActions";
import { addToTxnQueueIndep } from "../../redux/actions/txnsActions";

let contract;
let infuraContract;
let isContractInitialized = false;

export const initializeFlashstakeContract = () => {
  contract = xioFlashstakeContract();
  if (!contract) {
    contract = xioFlashstakeInfuraContract();
  }
  infuraContract = xioFlashstakeInfuraContract();
  isContractInitialized = true;
};

export const baseInterestRate = async () => {
  try {
    const _baseInterestRate = await infuraContract.methods
      .getInterestRate()
      .call();
    return _baseInterestRate;
  } catch (e) {
    console.error("ERROR baseInterestRate -> ", e);
    return "0";
  }
};

export const paused = async () => {
  try {
    const _paused = await infuraContract.methods.paused().call();
    return _paused;
  } catch (e) {
    console.error("ERROR paused -> ", e);
    return true;
  }
};

export const getRewardTokens = async () => {
  let rewardTokens = [];
  try {
    checkContractInitialized();

    let _count = await infuraContract.methods.getRewardTokenListLength().call();
    let i = 0;
    for (i = 0; i < _count; i++) {
      const _address = await infuraContract.methods.rewardTokenList(i).call();
      await initializeErc20TokenInfuraContract(_address);
      const _symbol = await symbol();
      rewardTokens.push({
        address: _address,
        symbol: _symbol,
      });
    }
  } catch (e) {
    rewardTokens = [];
    console.error("ERROR getRewardTokens -> ", e);
  }
  return rewardTokens;
};

export const getMaxDays = async () => {
  let _maxDays = "0";
  try {
    checkContractInitialized();
    _maxDays = await infuraContract.methods.MAX_DAYS().call();
  } catch (e) {
    _maxDays = "0";
    console.error("ERROR getMaxDays -> ", e);
  }
  return _maxDays;
};

export const getMaxStake = async () => {
  let _maxStake = "0";
  try {
    checkContractInitialized();
    _maxStake = await infuraContract.methods.MAX_STAKE().call();
  } catch (e) {
    _maxStake = "0";
    console.error("ERROR getMaxDays -> ", e);
  }
  return _maxStake;
};

const checkContractInitialized = () => {
  if (!isContractInitialized) {
    throw new Error("ERROR Flashstake contract not initialized.");
  }
};

export const stakeALT = async (
  inputXIO,
  calculatedReward,
  rewardTokenAddress,
  expiredIDs = [],
  days
) => {
  try {
    setStakeDialogStepIndep("pendingStake");
    showSnackbarIndep("Transaction Pending.", "info");
    checkContractInitialized();

    const walletAddress = getWalletAddressReduxState();
    if (!walletAddress) {
      throw new Error("Wallet not activated.");
    }
    contract.methods
      .stakeALT(
        inputXIO,
        calculatedReward,
        rewardTokenAddress,
        expiredIDs,
        days
      )
      .send({
        from: walletAddress,
      })
      .on("transactionHash", async (txnHash) => {
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
        setRefetchIndep(true);
        setStakeDialogStepIndep("successStake");
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
          showSnackbarIndep("Flashstake Transaction Rejected.", "error");
        } else {
          setStakeDialogStepIndep("failedStake");
          showSnackbarIndep("Flashstake Transaction Failed.", "error");
        }
        console.error("ERROR stakeALT -> ", e);
      });
  } catch (e) {
    if (e.code === 4001) {
      setStakeDialogStepIndep("rejectedStake");
      showSnackbarIndep("Flashstake Transaction Rejected.", "error");
    } else {
      setStakeDialogStepIndep("failedStake");
      showSnackbarIndep("Flashstake Transaction Failed.", "error");
    }
    console.error("ERROR stakeALT -> ", e);
  }
};

export const unstakeALT = async (portalTimestamps = [], amount = 0) => {
  try {
    showSnackbarIndep("Transaction Pending.", "info");
    setDialogStepIndep("pending");
    checkContractInitialized();

    const walletAddress = getWalletAddressReduxState();
    if (!walletAddress) {
      throw new Error("Wallet not activated.");
    }

    contract.methods
      .unstakeALT(portalTimestamps, amount)
      .send({
        from: walletAddress,
      })
      .on("transactionHash", (txnHash) => {
        setWithdrawTxnHashIndep(txnHash);
        showSnackbarTxnIndep(
          "Transaction Pending.",
          "info",
          "txnEtherScan",
          txnHash,
          true
        );
      })
      .then(function (receipt) {
        setDialogStepIndep("success");
        showSnackbarTxnIndep(
          "Withdraw Transaction Successful.",
          "success",
          "txnEtherScan",
          receipt.transactionHash,
          false
        );
        setRefetchIndep(true);
        return receipt;
      })
      .catch((e) => {
        if (e.code === 4001) {
          setDialogStepIndep("rejected");
          showSnackbarIndep("Withdraw Transaction Rejected.", "error");
        } else {
          setDialogStepIndep("failed");
          showSnackbarIndep("Withdraw Transaction Failed.", "error");
        }
        console.error("ERROR unstakeALT -> ", e);
      });
    // .on("confirmation", (confirmationNumber, reciept) => {
    //   if (confirmationNumber === 1) {
    //   }
    // });
  } catch (e) {
    if (e.code === 4001) {
      setDialogStepIndep("rejected");
      showSnackbarIndep("Withdraw Transaction Rejected.", "error");
    } else {
      setDialogStepIndep("failed");
      showSnackbarIndep("Withdraw Transaction Failed.", "error");
    }
    console.error("ERROR unstakeALT -> ", e);
  }
};
