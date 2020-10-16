import {
  xioFlashstakeContract,
  xioFlashstakeInfuraContract,
} from "../../contracts/getContract";
// import { baseInterestRate } from "./xioPublicFactoryContractFunctions";
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
} from "../../redux/actions/flashstakeActions";
import { addToTxnQueueIndep } from "../../redux/actions/txnsActions";
import axios from "axios";
import { CONSTANTS } from "../constants";
import { analytics } from "../../config/App";
import Web3 from "web3";

let contract;
let infuraContract;
let isContractInitialized = false;

export const initializeFlashstakeProtocolContract = () => {
  contract = xioFlashstakeContract();
  if (!contract) {
    contract = xioFlashstakeInfuraContract();
  }
  infuraContract = xioFlashstakeInfuraContract();
  isContractInitialized = true;
};

const checkContractInitialized = () => {
  if (!isContractInitialized) {
    throw new Error("ERROR Flashstake contract not initialized.");
  }
};

// const walletAddress = getWalletAddressReduxState();
// if (!walletAddress) {
//   throw new Error("Wallet not activated.");
// }

export const stake = async (_token, xioQuantity, days, reward) => {
  setLoadingIndep({ stake: true });
  try {
    setStakeDialogStepIndep("pendingStake");
    showSnackbarIndep("Transaction Pending.", "info");
    checkContractInitialized();

    const walletAddress = getWalletAddressReduxState();
    if (!walletAddress) {
      throw new Error("Wallet not activated.");
    }
    contract.methods
      .stake(_token, xioQuantity, days, reward)
      .estimateGas({ gas: 10000000, from: walletAddress }, async function (
        error,
        gasAmount
      ) {
        // const txHash = await web3.utils.sha3(
        //   contract.methods.stake(_token, xioQuantity, days, reward)
        // );
        // console.log(txHash);
        contract.methods
          .stake(_token, xioQuantity, days, reward)
          .send({
            from: walletAddress,
            gasLimit: gasAmount || 400000,
            gasPrice: "10000000000",
          })
          .on("transactionHash", async (txnHash) => {
            analytics.logEvent("USER_STAKE_TXN", {
              address: `Address -> ${walletAddress}`,
              txnHash,
              amount: xioQuantity,
              days: days,
              selctedToken: _token,
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

            const data = {
              _id: txnHash,
              txn: {
                amount: xioQuantity,
                days: days,
                selctedToken: _token,
              },
              type: "stake",
            };

            axios.post(CONSTANTS.TXN_SERVER, data).then((res) => {
              console.log("Transaction Hash Added", res);
            });
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
            console.error("ERROR stake -> ", e);
          });
      });
  } catch (e) {
    if (e.code === 4001) {
      setStakeDialogStepIndep("rejectedStake");
      showSnackbarIndep("Stake Transaction Rejected.", "error");
    } else {
      setStakeDialogStepIndep("failedStake");
      showSnackbarIndep("Stake Transaction Failed.", "error");
    }
    setLoadingIndep({ stake: false });
    console.error("ERROR stake -> ", e);
  }
};

export const unstake = async (_expiredIds, _xioQuantity) => {
  setLoadingIndep({ unstake: true });
  try {
    setStakeDialogStepIndep("pendingUnstake");
    showSnackbarIndep("Transaction Pending.", "info");
    checkContractInitialized();

    const walletAddress = getWalletAddressReduxState();
    if (!walletAddress) {
      throw new Error("Wallet not activated.");
    }
    contract.methods
      .unstake(_expiredIds, _xioQuantity)
      .estimateGas({ gas: 10000000, from: walletAddress }, function (
        error,
        gasAmount
      ) {
        contract.methods
          .unstake(_expiredIds, _xioQuantity)
          .send({
            from: walletAddress,
            gasLimit: gasAmount || 400000,
            gasPrice: "10000000000",
          })
          .on("transactionHash", async (txnHash) => {
            analytics.logEvent("USER_UNSTAKE_TXN", {
              address: `Address -> ${walletAddress}`,
              txnHash,
              _expiredIds,
              _xioQuantity,
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

            const data = {
              _id: txnHash,
              txn: {
                _expiredIds,
                _xioQuantity,
              },
              type: "unstake",
            };

            axios.post(CONSTANTS.TXN_SERVER, data).then((res) => {
              console.log("Transaction Hash Added", res);
            });
          })
          .then(function (receipt) {
            setTimeout(() => {
              setRefetchIndep(true);
            }, 5000);
            setStakeDialogStepIndep("successUnstake");
            setLoadingIndep({ unstake: false });

            setResetIndep(true);
            showSnackbarTxnIndep(
              "Unstake Transaction Successful.",
              "success",
              "txnEtherScan",
              receipt.transactionHash,
              false
            );
          })
          .catch((e) => {
            if (e.code === 4001) {
              setStakeDialogStepIndep("rejectedUnstake");
              showSnackbarIndep("Unstake Transaction Rejected.", "error");
            } else {
              setStakeDialogStepIndep("failedUnstake");
              showSnackbarIndep("Unstake Transaction Failed.", "error");
            }
            setLoadingIndep({ unstake: false });
            console.error("ERROR stake -> ", e);
          });
      });
  } catch (e) {
    if (e.code === 4001) {
      setStakeDialogStepIndep("rejectedUnstake");
      showSnackbarIndep("Unstake Transaction Rejected.", "error");
    } else {
      setStakeDialogStepIndep("failedUnstake");
      showSnackbarIndep("Unstake Transaction Failed.", "error");
    }
    setLoadingIndep({ unstake: false });
    console.error("ERROR Unstake -> ", e);
  }
};

export const swap = async (_altQuantity, _token, _expectedOutput) => {
  setLoadingIndep({ swap: true });
  try {
    setSwapDialogStepIndep("pendingSwap");
    showSnackbarIndep("Transaction Pending.", "info");
    checkContractInitialized();

    const walletAddress = getWalletAddressReduxState();
    if (!walletAddress) {
      throw new Error("Wallet not activated.");
    }
    contract.methods
      .swap(_altQuantity, _token, _expectedOutput)
      .estimateGas({ gas: 10000000, from: walletAddress }, function (
        error,
        gasAmount
      ) {
        contract.methods
          .swap(_altQuantity, _token, _expectedOutput)
          .send({
            from: walletAddress,
            gasLimit: gasAmount || 400000,
            gasPrice: "10000000000",
          })
          .on("transactionHash", async (txnHash) => {
            analytics.logEvent("USER_SWAP_TXN", {
              address: `Address -> ${walletAddress}`,
              txnHash,
              _altQuantity,
              _token,
              _expectedOutput,
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

            const data = {
              _id: txnHash,
              txn: {
                _altQuantity,
                _token,
                _expectedOutput,
              },
              type: "swap",
            };

            axios.post(CONSTANTS.TXN_SERVER, data).then((res) => {
              console.log("Transaction Hash Added", res);
            });
          })
          .then(function (receipt) {
            setTimeout(() => {
              setRefetchIndep(true);
            }, 2000);
            setSwapDialogStepIndep("successSwap");
            setLoadingIndep({ swap: false });

            setResetIndep(true);
            showSnackbarTxnIndep(
              "Swap Transaction Successful.",
              "success",
              "txnEtherScan",
              receipt.transactionHash,
              false
            );
          })
          .catch((e) => {
            if (e.code === 4001) {
              setSwapDialogStepIndep("rejectedSwap");
              showSnackbarIndep("Swap Transaction Rejected.", "error");
            } else {
              setSwapDialogStepIndep("failedSwap");
              showSnackbarIndep("Swap Transaction Failed.", "error");
            }
            setLoadingIndep({ swap: false });
            console.error("ERROR swap -> ", e);
          });
      });
  } catch (e) {
    if (e.code === 4001) {
      setSwapDialogStepIndep("rejectedSwap");
      showSnackbarIndep("Swap Transaction Rejected.", "error");
    } else {
      setSwapDialogStepIndep("failedSwap");
      showSnackbarIndep("Swap Transaction Failed.", "error");
    }
    setLoadingIndep({ swap: false });
    console.error("ERROR Swap -> ", e);
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

export const calculateXPY = async (xioQuantity, days) => {
  try {
    checkContractInitialized();

    const xpy = await infuraContract.methods
      .calculateXPY(xioQuantity, days)
      .call();
    return xpy;
  } catch (e) {
    console.error("ERROR calculateXPY -> ", e);
  }
  return 0;
};

export const getXPY = async () => {
  try {
    checkContractInitialized();

    const xpy = await infuraContract.methods
      .getXPY(Web3.utils.toWei("1"))
      .call();
    return xpy;
  } catch (e) {
    console.error("ERROR getXPY -> ", e);
  }
  return 0;
};

export const unstakeALT = (expiredIds = [], xioQuantity) => {
  setLoadingIndep({ unstake: true });

  try {
    showSnackbarIndep("Transaction Pending.", "info");
    setDialogStepIndep("pending");
    checkContractInitialized();

    const walletAddress = getWalletAddressReduxState();
    if (!walletAddress) {
      throw new Error("Wallet not activated.");
    }

    contract.methods
      .unstakeALT(expiredIds, xioQuantity)
      .estimateGas(
        { gas: 10000000, from: walletAddress },
        (error, gasAmount) => {
          unstakeALT(expiredIds, xioQuantity)
            .send({
              from: walletAddress,
              gasLimit: gasAmount || 400000,
              gasPrice: "10000000000",
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
              setLoadingIndep({ unstake: false });

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
              setLoadingIndep({ unstake: false });

              console.error("ERROR unstakeALT -> ", e);
            });
        }
      );
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
