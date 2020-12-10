import {
  erc20TokenContract,
  erc20TokenInfuraContract,
} from "../../contracts/getContract";
import { MaxUint256 } from "@ethersproject/constants";
import { getWalletAddressReduxState } from "../../redux/state";
import {
  showSnackbarIndep,
  setLoadingIndep,
} from "../../redux/actions/uiActions";
import {
  setDialogStepIndep,
  setSwapDialogStepIndep,
  setPoolDialogStepIndep,
  checkAllowance,
} from "../../redux/actions/flashstakeActions";
import { store } from "../../config/reduxStore";
import { _error } from "../log";

let contract;
let isContractInitialized = false;

export const initializeErc20TokenContract = async (address) => {
  contract = erc20TokenContract(address);
  if (!contract) {
    contract = erc20TokenInfuraContract(address);
  }
  isContractInitialized = true;
};

export const symbol = async () => {
  try {
    checkContractInitialized();

    const symbol = await contract.methods.symbol().call();
    return symbol;
  } catch (e) {
    _error("ERROR symbol -> ", e);
  }
};
export const name = async () => {
  try {
    checkContractInitialized();

    const name = await contract.methods.name().call();
    return name;
  } catch (e) {
    _error("ERROR name -> ", e);
  }
};

export const decimals = async () => {
  try {
    checkContractInitialized();

    const decimals = await contract.methods.decimals().call();
    return decimals;
  } catch (e) {
    _error("ERROR symbol -> ", e);
  }
};

export const approve = async (address, tab, step, success = false, amount) => {
  try {
    if (tab === "stake") {
      setDialogStepIndep("pendingApproval");
    }
    if (tab === "swap") {
      setSwapDialogStepIndep("pendingApproval");
    }
    if (tab === "pool") {
      setPoolDialogStepIndep("pendingApproval");
    }
    setLoadingIndep({ approval: true });
    showSnackbarIndep("Awaiting Approval.", "info");
    checkContractInitialized();

    const walletAddress = getWalletAddressReduxState();
    if (!walletAddress) {
      throw new _error("Wallet not activated.");
    }
    let gasAmount;
    try {
      //
      gasAmount = await contract.methods
        .approve(address, amount ? amount : MaxUint256._hex)
        .estimateGas({ gas: 10000000, from: walletAddress });
    } catch (e) {
      _error("ERROR Approve gasAmount -> ", e);
    }
    //amount ? amount : MaxUint256._hex.
    const _approve = await contract.methods
      .approve(address, amount ? amount : MaxUint256._hex)
      .send({
        from: walletAddress,
        gasLimit: gasAmount || 400000,
        gasPrice: "10000000000",
      })
      .then(function (receipt) {
        store.dispatch(checkAllowance());
        showSnackbarIndep("Approval Successful.", "success");
        if (tab === "stake") {
          setDialogStepIndep("flashstakeProposal");
        }
        if (tab === "swap") {
          setSwapDialogStepIndep("swapProposal");
        }
        if (tab === "pool") {
          if (step) {
            setPoolDialogStepIndep("approvalTokenProposal");
          }
          if (success) {
            setPoolDialogStepIndep("successApproval");
          } else {
            setPoolDialogStepIndep("poolProposal");
          }
        }

        setLoadingIndep({ approval: false });

        // tab === "stake"
        //   ? setDialogStepIndep("flashstakeProposal")
        //   : setSwapDialogStepIndep("swapProposal");
        // setDialogStepIndep("successApproval");
      })
      .catch((e) => {
        if (e.code === 4001) {
          showSnackbarIndep("Approval Rejected.", "error");

          if (tab === "stake") {
            setDialogStepIndep("rejectedApproval");
          }
          if (tab === "swap") {
            setSwapDialogStepIndep("rejectedApproval");
          }
          if (tab === "pool") {
            setPoolDialogStepIndep("rejectedApproval");
          }

          // tab === "stake"
          //   ? setDialogStepIndep("rejectedApproval")
          //   : setSwapDialogStepIndep("rejectedApproval");
        } else {
          showSnackbarIndep("Approval Failed.", "error");

          if (tab === "stake") {
            setDialogStepIndep("failedApproval");
          }
          if (tab === "swap") {
            setSwapDialogStepIndep("failedApproval");
          }
          if (tab === "pool") {
            setPoolDialogStepIndep("failedApproval");
          }

          // tab === "stake"
          //   ? setDialogStepIndep("failedApproval")
          //   : setSwapDialogStepIndep("failedApproval");
        }
        setLoadingIndep({ approval: false });
        _error("ERROR approve -> ", e);
      });

    // setDialogStepIndep("successApproval");
    // setLoadingIndep({ approval: false });
    return _approve;
  } catch (e) {
    if (e.code === 4001) {
      showSnackbarIndep("Approval Rejected.", "error");

      if (tab === "stake") {
        setDialogStepIndep("rejectedApproval");
      }
      if (tab === "swap") {
        setSwapDialogStepIndep("rejectedApproval");
      }
      if (tab === "pool") {
        setPoolDialogStepIndep("rejectedApproval");
      }

      // tab === "stake"
      //   ? setDialogStepIndep("rejectedApproval")
      //   : setSwapDialogStepIndep("rejectedApproval");
    } else {
      showSnackbarIndep("Approval Failed.", "error");

      if (tab === "stake") {
        setDialogStepIndep("failedApproval");
      }
      if (tab === "swap") {
        setSwapDialogStepIndep("failedApproval");
      }
      if (tab === "pool") {
        setPoolDialogStepIndep("failedApproval");
      }

      // tab === "stake"
      //   ? setDialogStepIndep("failedApproval")
      //   : setSwapDialogStepIndep("failedApproval");
    }
    setLoadingIndep({ approval: false });
    _error("ERROR approve -> ", e);
  }
};

export const allowance = async (spenderAddress, loading) => {
  try {
    checkContractInitialized();
    const walletAddress = getWalletAddressReduxState();
    if (!walletAddress) {
      // throw new _error("Wallet not activated.");
      return "0";
    }

    const _allowance = await contract.methods
      .allowance(walletAddress, spenderAddress)
      .call();
    return _allowance;
  } catch (e) {
    _error("ERROR allowance -> ", e);
    return "0";
  }
};

export const balanceOf = async () => {
  try {
    checkContractInitialized();
    const walletAddress = getWalletAddressReduxState();
    if (!walletAddress) {
      // throw new _error("Wallet not activated.");
      return "0";
    }

    const _balance = await contract.methods.balanceOf(walletAddress).call();
    return _balance;
  } catch (e) {
    _error("ERROR balanceOf -> ", e);
  }
};

export const totalSupply = async () => {
  try {
    checkContractInitialized();

    const _totalSupply = await contract.methods.totalSupply().call();
    return _totalSupply;
  } catch (e) {
    _error("ERROR totalSupply ->", e);
  }
};

const checkContractInitialized = () => {
  if (!isContractInitialized) {
    throw new _error("PublicPortalContract not initialized.");
  }
};
