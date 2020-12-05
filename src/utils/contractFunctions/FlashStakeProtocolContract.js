import {
  xioFlashstakeContract,
  xioFlashstakeInfuraContract,
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
  setCreateDialogStepIndep,
  setLiquidityTxnHashIndep,
  setWithdrawLiquidityTxnHash,
} from "../../redux/actions/flashstakeActions";
import { addToTxnQueueIndep } from "../../redux/actions/txnsActions";
import { analytics } from "../../config/App";
import Web3 from "web3";
import { _error, _log } from "../log";

let contract;
let isContractInitialized = false;

export const initializeFlashstakeProtocolContract = () => {
  contract = xioFlashstakeContract();
  if (!contract) {
    contract = xioFlashstakeInfuraContract();
  }
  isContractInitialized = true;
};

const checkContractInitialized = () => {
  if (!isContractInitialized) {
    throw new _error("ERROR Flashstake contract not initialized.");
  }
};

// const walletAddress = getWalletAddressReduxState();
// if (!walletAddress) {
//   throw new _error("Wallet not activated.");
// }

export const stake = async (_token, xioQuantity, days, reward) => {
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
      .stake(_token, xioQuantity, days, reward)
      .estimateGas(
        { gas: 10000000, from: walletAddress },
        async function (error, gasAmount) {
          // const txHash = await web3.utils.sha3(
          //   contract.methods.stake(_token, xioQuantity, days, reward)
          // );
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

              // const data = {
              //   _id: txnHash,
              //   txn: {
              //     amount: xioQuantity,
              //     days: days,
              //     selctedToken: _token,
              //   },
              //   type: "stake",
              // };

              // axios.post(CONSTANTS.TXN_SERVER, data).then((res) => {
              //   _log("Transaction Hash Added", res);
              // });
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
        }
      );
  } catch (e) {
    if (e.code === 4001) {
      setStakeDialogStepIndep("rejectedStake");
      showSnackbarIndep("Stake Transaction Rejected.", "error");
    } else {
      analytics.logEvent("USER_STAKE_FAILED", {
        address: `Address -> ${walletAddress}`,
        amount: xioQuantity,
        days: days,
        selctedToken: _token,
      });
      setStakeDialogStepIndep("failedStake");
      showSnackbarIndep("Stake Transaction Failed.", "error");
    }
    setLoadingIndep({ stake: false });
    _error("ERROR stake -> ", e);
  }
};

export const unstake = async (_expiredIds) => {
  setLoadingIndep({ unstake: true });
  const walletAddress = getWalletAddressReduxState();
  try {
    setStakeDialogStepIndep("pendingUnstake");
    showSnackbarIndep("Transaction Pending.", "info");
    checkContractInitialized();

    if (!walletAddress) {
      throw new _error("Wallet not activated.");
    }
    contract.methods
      .unstake(_expiredIds)
      .estimateGas(
        { gas: 10000000, from: walletAddress },
        function (error, gasAmount) {
          contract.methods
            .unstake(_expiredIds)
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

              // const data = {
              //   _id: txnHash,
              //   txn: {
              //     _expiredIds,
              //   },
              //   type: "unstake",
              // };

              // axios.post(CONSTANTS.TXN_SERVER, data).then((res) => {
              //   _log("Transaction Hash Added", res);
              // });
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
              _error("ERROR stake -> ", e);
            });
        }
      );
  } catch (e) {
    if (e.code === 4001) {
      setStakeDialogStepIndep("rejectedUnstake");
      showSnackbarIndep("Unstake Transaction Rejected.", "error");
    } else {
      analytics.logEvent("USER_UNSTAKE_FAILED", {
        address: `Address -> ${walletAddress}`,
        _expiredIds,
        // _xioQuantity,
      });
      setStakeDialogStepIndep("failedUnstake");
      showSnackbarIndep("Unstake Transaction Failed.", "error");
    }
    setLoadingIndep({ unstake: false });
    _error("ERROR Unstake -> ", e);
  }
};

export const swap = async (_altQuantity, _token, _expectedOutput) => {
  setLoadingIndep({ swap: true });
  const walletAddress = getWalletAddressReduxState();
  try {
    setSwapDialogStepIndep("pendingSwap");
    showSnackbarIndep("Transaction Pending.", "info");
    checkContractInitialized();

    if (!walletAddress) {
      throw new _error("Wallet not activated.");
    }
    contract.methods
      .swap(_altQuantity, _token, _expectedOutput)
      .estimateGas(
        { gas: 10000000, from: walletAddress },
        function (error, gasAmount) {
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

              // const data = {
              //   _id: txnHash,
              //   txn: {
              //     _altQuantity,
              //     _token,
              //     _expectedOutput,
              //   },
              //   type: "swap",
              // };

              // axios.post(CONSTANTS.TXN_SERVER, data).then((res) => {
              //   _log("Transaction Hash Added", res);
              // });
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
              _error("ERROR swap -> ", e);
            });
        }
      );
  } catch (e) {
    if (e.code === 4001) {
      setSwapDialogStepIndep("rejectedSwap");
      showSnackbarIndep("Swap Transaction Rejected.", "error");
    } else {
      analytics.logEvent("USER_SWAP_FAILED", {
        address: `Address -> ${walletAddress}`,
        _altQuantity,
        _token,
        _expectedOutput,
      });
      setSwapDialogStepIndep("failedSwap");
      showSnackbarIndep("Swap Transaction Failed.", "error");
    }
    setLoadingIndep({ swap: false });
    _error("ERROR Swap -> ", e);
  }
};

export const paused = async () => {
  try {
    const _paused = await contract.methods.paused().call();
    return _paused;
  } catch (e) {
    _error("ERROR paused -> ", e);
    return true;
  }
};

export const calculateXPY = async (xioQuantity, days) => {
  try {
    checkContractInitialized();

    const xpy = await contract.methods
      .getMintAmountFromProtocol(xioQuantity, days)
      .call();
    return xpy;
  } catch (e) {
    _error("ERROR calculateXPY -> ", e);
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
      throw new _error("Wallet not activated.");
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

              _error("ERROR unstakeALT -> ", e);
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
    _error("ERROR unstakeALT -> ", e);
  }
};

export const addLiquidityInPool = (
  _amountFLASH,
  _amountALT,
  _amountFLASHMin,
  _amountALTMin,
  _token
) => {
  setLoadingIndep({ pool: true });

  try {
    showSnackbarIndep("Transaction Pending.", "info");
    setPoolDialogStepIndep("pendingLiquidity");
    checkContractInitialized();

    const walletAddress = getWalletAddressReduxState();
    if (!walletAddress) {
      throw new _error("Wallet not activated.");
    }

    contract.methods
      .addLiquidityInPool(
        _amountFLASH,
        _amountALT,
        _amountFLASHMin,
        _amountALTMin,
        _token
      )
      .estimateGas(
        { gas: 10000000, from: walletAddress },
        (error, gasAmount) => {
          contract.methods
            .addLiquidityInPool(
              _amountFLASH,
              _amountALT,
              _amountFLASHMin,
              _amountALTMin,
              _token
            )
            .send({
              from: walletAddress,
              gasLimit: gasAmount || 400000,
              gasPrice: "10000000000",
            })
            .on("transactionHash", (txnHash) => {
              setLiquidityTxnHashIndep(txnHash);
              showSnackbarTxnIndep(
                "Transaction Pending.",
                "info",
                "txnEtherScan",
                txnHash,
                true
              );
            })
            .then(function (receipt) {
              setPoolDialogStepIndep("successLiquidity");
              showSnackbarTxnIndep(
                "Liquidity Deposit Transaction Successful.",
                "success",
                "txnEtherScan",
                receipt.transactionHash,
                false
              );
              setRefetchIndep(true);
              setLoadingIndep({ pool: false });

              return receipt;
            })
            .catch((e) => {
              if (e.code === 4001) {
                setPoolDialogStepIndep("rejectedLiquidity");
                showSnackbarIndep(
                  "Liquidity Deposit Transaction Rejected.",
                  "error"
                );
              } else {
                setPoolDialogStepIndep("failedLiquidity");
                showSnackbarIndep(
                  "Liquidity Deposit Transaction Failed.",
                  "error"
                );
              }
              setLoadingIndep({ pool: false });

              _error("ERROR addLiquidityInPool -> ", e);
            });
        }
      );
  } catch (e) {
    if (e.code === 4001) {
      setDialogStepIndep("rejectedLiquidity");
      showSnackbarIndep("Liquidity Deposit Transaction Rejected.", "error");
    } else {
      setDialogStepIndep("failedLiquidity");
      showSnackbarIndep("Liquidity Deposits Transaction Failed.", "error");
    }
    _error("ERROR addLiquidityInPool -> ", e);
  }
};

export const removeLiquidityInPool = (_liquidity, _token) => {
  setLoadingIndep({ withdrawPool: true });

  try {
    showSnackbarIndep("Transaction Pending.", "info");
    setPoolDialogStepIndep("pendingWithdrawLiquidity");
    checkContractInitialized();

    const walletAddress = getWalletAddressReduxState();
    if (!walletAddress) {
      throw new _error("Wallet not activated.");
    }

    contract.methods
      .removeLiquidityInPool(_liquidity, _token)
      .estimateGas(
        { gas: 10000000, from: walletAddress },
        (error, gasAmount) => {
          contract.methods
            .removeLiquidityInPool(_liquidity, _token)
            .send({
              from: walletAddress,
              gasLimit: gasAmount || 400000,
              gasPrice: "10000000000",
            })
            .on("transactionHash", (txnHash) => {
              setWithdrawLiquidityTxnHash(txnHash);
              showSnackbarTxnIndep(
                "Transaction Pending.",
                "info",
                "txnEtherScan",
                txnHash,
                true
              );
            })
            .then(function (receipt) {
              setPoolDialogStepIndep("successWithdrawLiquidity");
              showSnackbarTxnIndep(
                "Withdraw Liquidity Transaction Successful.",
                "success",
                "txnEtherScan",
                receipt.transactionHash,
                false
              );
              setRefetchIndep(true);
              setLoadingIndep({ withdrawPool: false });

              return receipt;
            })
            .catch((e) => {
              if (e.code === 4001) {
                setPoolDialogStepIndep("rejectedWithdrawLiquidity");
                showSnackbarIndep(
                  "Withdraw Liquidity Transaction Rejected.",
                  "error"
                );
              } else {
                setPoolDialogStepIndep("failedWithdrawLiquidity");
                showSnackbarIndep(
                  "Withdraw Liquidity Transaction Failed.",
                  "error"
                );
              }
              setLoadingIndep({ withdrawPool: false });

              _error("ERROR removeLiquidityInPool -> ", e);
            });
        }
      );
  } catch (e) {
    if (e.code === 4001) {
      setDialogStepIndep("rejectedWithdrawLiquidity");
      showSnackbarIndep("Withdraw Liquidity Transaction Rejected.", "error");
    } else {
      setDialogStepIndep("failedWithdrawLiquidity");
      showSnackbarIndep("Withdraw Liquidity Transaction Failed.", "error");
    }
    _error("ERROR removeLiquidityInPool -> ", e);
  }
};

export const createPool = (_token) => {
  setLoadingIndep({ withdrawPool: true });

  try {
    showSnackbarIndep("Transaction Pending.", "info");
    setCreateDialogStepIndep("pendingCreatePool");
    checkContractInitialized();

    const walletAddress = getWalletAddressReduxState();
    if (!walletAddress) {
      throw new _error("Wallet not activated.");
    }

    contract.methods
      .createPool(_token)
      .estimateGas(
        { gas: 10000000, from: walletAddress },
        (error, gasAmount) => {
          contract.methods
            .createPool(_token)
            .send({
              from: walletAddress,
              gasLimit: gasAmount || 400000,
              gasPrice: "10000000000",
            })
            .on("transactionHash", (txnHash) => {
              setWithdrawLiquidityTxnHash(txnHash);
              showSnackbarTxnIndep(
                "Transaction Pending.",
                "info",
                "txnEtherScan",
                txnHash,
                true
              );
            })
            .then(function (receipt) {
              setCreateDialogStepIndep("successCreatePool");
              showSnackbarTxnIndep(
                "Create Pool Transaction Successful.",
                "success",
                "txnEtherScan",
                receipt.transactionHash,
                false
              );
              setRefetchIndep(true);
              setLoadingIndep({ withdrawPool: false });
              _log(receipt);
              return receipt;
            })
            .catch((e) => {
              if (e.code === 4001) {
                setCreateDialogStepIndep("rejectedCreatePool");
                showSnackbarIndep("Create Pool Transaction Rejected.", "error");
              } else {
                setCreateDialogStepIndep("failedCreatePool");
                showSnackbarIndep("Create Pool Transaction Failed.", "error");
              }
              setLoadingIndep({ withdrawPool: false });

              _error("ERROR CreatePool  -> ", e);
            });
        }
      );
  } catch (e) {
    if (e.code === 4001) {
      setCreateDialogStepIndep("rejectedCreatePool");
      showSnackbarIndep("Create Pool Transaction Rejected.", "error");
    } else {
      setCreateDialogStepIndep("failedCreatePool");
      showSnackbarIndep("Create Pool Transaction Failed.", "error");
    }
    _error("ERROR CreatePool -> ", e);
  }
};
