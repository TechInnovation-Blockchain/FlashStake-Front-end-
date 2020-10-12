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
  setStakeTxnHashIndep,
  setResetIndep,
} from "../../redux/actions/flashstakeActions";
import { addToTxnQueueIndep } from "../../redux/actions/txnsActions";

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
      .estimateGas({ gas: 10000000, from: walletAddress }, function (
        error,
        gasAmount
      ) {
        console.log(gasAmount);
        contract.methods
          .stake(_token, xioQuantity, days, reward)
          .send({
            from: walletAddress,
            gasLimit: gasAmount || 400000,
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
        gasAmount
      ) {
        console.log("Unstake gasAmount ->", gasAmount);
        contract.methods
          .unstake(_expiredIds, _xioQuantity)
          .send({
            from: walletAddress,
            gasLimit: gasAmount || 400000,
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
    setStakeDialogStepIndep("pendingSwap");
    showSnackbarIndep("Transaction Pending.", "info");
    checkContractInitialized();

    const walletAddress = getWalletAddressReduxState();
    if (!walletAddress) {
      throw new Error("Wallet not activated.");
    }
    contract.methods
      .swap(_altQuantity, _token, _expectedOutput)
      .estimateGas({ gas: 10000000, from: walletAddress }, function (
        gasAmount
      ) {
        console.log("Swap gasAmount ->", gasAmount);
        contract.methods
          .swap(_altQuantity, _token, _expectedOutput)
          .send({
            from: walletAddress,
            gasLimit: gasAmount || 400000,
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
            setTimeout(() => {
              setRefetchIndep(true);
            }, 2000);
            setStakeDialogStepIndep("successSwap");
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
              setStakeDialogStepIndep("rejectedSwap");
              showSnackbarIndep("Swap Transaction Rejected.", "error");
            } else {
              setStakeDialogStepIndep("failedSwap");
              showSnackbarIndep("Swap Transaction Failed.", "error");
            }
            setLoadingIndep({ swap: false });
            console.error("ERROR swap -> ", e);
          });
      });
  } catch (e) {
    if (e.code === 4001) {
      setStakeDialogStepIndep("rejectedSwap");
      showSnackbarIndep("Swap Transaction Rejected.", "error");
    } else {
      setStakeDialogStepIndep("failedSwap");
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

    const xpy = await infuraContract.methods.getXPY().call();
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
      .estimateGas({ gas: 10000000, from: walletAddress }, (gasAmount) => {
        console.log("unstakeAlt gasAmount ->", gasAmount);

        unstakeALT(expiredIds, xioQuantity)
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

// export const initializePublicPortalContract = (address) => {
//   contract = xioPublicPortalContract(address);
//   isContractInitialized = true;
// };

// export const getPublicPortalData = async () => {
//   let publicPortalData = {};
//   try {
//     checkContractInitialized();

//     const portalAddress = contract.options.address;
//     const maxDays = await contract.methods.MAX_DAYS().call();
//     const maxStake = await contract.methods.MAX_STAKE().call();
//     const rewardType = await contract.methods.rewardType().call();
//     const status = await contract.methods.status().call();
//     const tokenB = await contract.methods.tokenB().call();

//     //TokenB Symbol from TokenB Address
//     initializeErc20TokenContract(tokenB);
//     const tokenBSymbol = await symbol(tokenB);

//     const interestRate = await baseInterestRate();

//     publicPortalData = {
//       portalAddress,
//       maxDays,
//       maxStake,
//       rewardType,
//       status,
//       tokenASymbol: "XIO",
//       tokenB,
//       tokenBSymbol,
//       interestRate: parseFloat(
//         Web3.utils.fromWei(interestRate.toString())
//       ).toFixed(18),
//     };
//   } catch (e) {
//     console.error("ERROR getPublicPortalData -> ", e);
//   }
//   return publicPortalData;
// };

// export const tokenB = async () => {
//   try {
//     checkContractInitialized();

//     const tokenB = await contract.methods.tokenB().call();
//     return tokenB;
//   } catch (e) {
//     console.error("ERROR tokenB -> ", e);
//   }
// };

// export const stakeALT = async (
//   xioQuantity,
//   tokensBought,
//   days,
//   expiredTimestamps = []
// ) => {
//   try {
//     setStakeDialogStepIndep("pendingStake");
//     showSnackbarIndep("Transaction Pending.", "info");
//     checkContractInitialized();

//     const walletAddress = getWalletAddressReduxState();
//     if (!walletAddress) {
//       throw new Error("Wallet not activated.");
//     }
//     let _txnHash = "";
//     const _stakeALT = await contract.methods
//       .stakeALT(xioQuantity, tokensBought, expiredTimestamps, days)
//       .send({
//         from: walletAddress,
//       })
//       .on("transactionHash", async (txnHash) => {
//         _txnHash = txnHash;
//         setStakeTxnHashIndep(txnHash);
//         showSnackbarTxnIndep(
//           "Transaction Pending.",
//           "info",
//           "txnEtherScan",
//           txnHash,
//           true
//         );
//       });
//     setStakeDialogStepIndep("successStake");
//     setResetIndep(true);
//     showSnackbarTxnIndep(
//       "Stake Transaction Successful.",
//       "success",
//       "txnEtherScan",
//       _stakeALT.transactionHash,
//       false
//     );
//     //   .on("confirmation", (confirmationNumber, reciept) => {
//     //     if (confirmationNumber === 1) {
//     //       showSnackbarTxnIndep(
//     //         "Stake Transaction Successful.",
//     //         "success",
//     //         "txnEtherScan",
//     //         _stakeALT.transactionHash,
//     //         false
//     //       );

//     //       return _stakeALT;
//     //     }
//     //   });
//     // // .once("receipt", (receipt) => alert("receipt"));
//     // .once("confirmation", (confirmationNumber, reciept) =>
//     //   // console.log(confirmationNumber, reciept)
//     // );
//     // // console.log("_stakeALT", _stakeALT);
//   } catch (e) {
//     if (e.code === 4001) {
//       setStakeDialogStepIndep("rejectedStake");
//       showSnackbarIndep("Flashstake Transaction Rejected.", "error");
//     } else {
//       setStakeDialogStepIndep("failedStake");
//       showSnackbarIndep("Flashstake Transaction Failed.", "error");
//     }
//     console.error("ERROR stakeALT -> ", e);
//   }
// };

// export const unstakeALT = async (portalTimestamps = [], amount = 0) => {
//   try {
//     showSnackbarIndep("Transaction Pending.", "info");
//     setDialogStepIndep("pending");
//     checkContractInitialized();

//     const walletAddress = getWalletAddressReduxState();
//     if (!walletAddress) {
//       throw new Error("Wallet not activated.");
//     }

//     const _unstakeALT = await contract.methods
//       .unstakeALT(portalTimestamps, amount)
//       .send({
//         from: walletAddress,
//       })
//       .on("transactionHash", (txnHash) => {
//         setWithdrawTxnHashIndep(txnHash);
//         showSnackbarTxnIndep(
//           "Transaction Pending.",
//           "info",
//           "txnEtherScan",
//           txnHash,
//           true
//         );
//       });
//     // .on("confirmation", (confirmationNumber, reciept) => {
//     //   if (confirmationNumber === 1) {
//     //   }
//     // });
//     setDialogStepIndep("success");
//     showSnackbarTxnIndep(
//       "Withdraw Transaction Successful.",
//       "success",
//       "txnEtherScan",
//       _unstakeALT.transactionHash,
//       false
//     );
//     setRefetchIndep(true);
//     return _unstakeALT;
//   } catch (e) {
//     if (e.code === 4001) {
//       setDialogStepIndep("rejected");
//       showSnackbarIndep("Withdraw Transaction Rejected.", "error");
//     } else {
//       setDialogStepIndep("failed");
//       showSnackbarIndep("Withdraw Transaction Failed.", "error");
//     }
//     console.error("ERROR unstakeALT -> ", e);
//   }
// };

// export const withdrawReward = async (portalTimestamps = [], amount = 0) => {
//   try {
//     showSnackbarIndep("Transaction Pending.", "info");
//     checkContractInitialized();

//     const walletAddress = getWalletAddressReduxState();
//     if (!walletAddress) {
//       throw new Error("Wallet not activated.");
//     }

//     const _withdrawReward = await contract.methods
//       .withdrawReward(portalTimestamps, amount)
//       .send({
//         from: walletAddress,
//       })
//       .on("transactionHash", (txnHash) => {
//         showSnackbarTxnIndep(
//           "Transaction Pending.",
//           "info",
//           "txnEtherScan",
//           txnHash,
//           true
//         );
//       })
//       .on("confirmation", (confirmationNumber, reciept) => {
//         if (confirmationNumber === 1) {
//           showSnackbarTxnIndep(
//             "Withdraw Transaction Successful.",
//             "success",
//             "txnEtherScan",
//             _withdrawReward.transactionHash,
//             false
//           );
//           return _withdrawReward;
//         }
//       });
//   } catch (e) {
//     showSnackbarIndep("Withdraw Transaction Failed.", "error");
//     console.error("ERROR unstakeALT -> ", e);
//   }
// };

// const checkContractInitialized = () => {
//   if (!isContractInitialized) {
//     throw new Error("PublicPortalContract not initialized.");
//   }
// };
