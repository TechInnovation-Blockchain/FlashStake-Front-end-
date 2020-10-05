import Web3 from "web3";

import {
  xioFlashstakeContract,
  xioFlashstakeInfuraContract,
} from "../../contracts/getContract";
// import { baseInterestRate } from "./xioPublicFactoryContractFunctions";
import {
  initializeErc20TokenContract,
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

let _txnHash = "";

export const stakeALT = async (address_token, xioQuantity, days) => {
  try {
    setStakeDialogStepIndep("pendingStake");
    showSnackbarIndep("Transaction Pending.", "info");
    checkContractInitialized();

    const walletAddress = getWalletAddressReduxState();
    if (!walletAddress) {
      throw new Error("Wallet not activated.");
    }
    let _txnHash = "";
    contract.methods
      .stakeALT(address_token, xioQuantity, days, "0x")
      .send({
        from: walletAddress,
      })
      .on("transactionHash", async (txnHash) => {
        _txnHash = txnHash;
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
