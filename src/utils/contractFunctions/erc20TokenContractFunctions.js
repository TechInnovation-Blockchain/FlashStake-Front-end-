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
} from "../../redux/actions/flashstakeActions";

let contract;
let isContractInitialized = false;

export const initializeErc20TokenContract = async (address) => {
  contract = erc20TokenContract(address);
  isContractInitialized = true;
};

export const initializeErc20TokenInfuraContract = async (address) => {
  contract = erc20TokenInfuraContract(address);
  isContractInitialized = true;
};

export const symbol = async () => {
  try {
    checkContractInitialized();

    const symbol = await contract.methods.symbol().call();
    return symbol;
  } catch (e) {
    console.error("ERROR symbol -> ", e);
  }
};

export const decimals = async () => {
  try {
    checkContractInitialized();

    const decimals = await contract.methods.decimals().call();
    return decimals;
  } catch (e) {
    console.error("ERROR symbol -> ", e);
  }
};

export const approve = async (address, tab, amount) => {
  try {
    tab === "stake"
      ? setDialogStepIndep("pendingApproval")
      : setSwapDialogStepIndep("pendingApproval");
    setLoadingIndep({ approval: true });
    showSnackbarIndep("Awaiting Approval.", "info");
    checkContractInitialized();

    const walletAddress = getWalletAddressReduxState();
    if (!walletAddress) {
      throw new Error("Wallet not activated.");
    }
    let gasAmount;
    try {
      gasAmount = await contract.methods
        .approve(address, amount ? amount : MaxUint256._hex)
        .estimateGas({ gas: 10000000, from: walletAddress });
    } catch (e) {
      console.error("ERROR Approve gasAmount -> ", e);
    }
    const _approve = await contract.methods
      .approve(address, amount ? amount : MaxUint256._hex)
      .send({
        from: walletAddress,
        gasLimit: gasAmount || 400000,
        gasPrice: "10000000000",
      })
      .then(function (receipt) {
        showSnackbarIndep("Approval Successful.", "success");
        tab === "stake"
          ? setDialogStepIndep("flashstakeProposal")
          : setSwapDialogStepIndep("swapProposal");
        // setDialogStepIndep("successApproval");
      })
      .catch((e) => {
        if (e.code === 4001) {
          showSnackbarIndep("Approval Rejected.", "error");
          tab === "stake"
            ? setDialogStepIndep("rejectedApproval")
            : setSwapDialogStepIndep("rejectedApproval");
        } else {
          showSnackbarIndep("Approval Failed.", "error");
          tab === "stake"
            ? setDialogStepIndep("failedApproval")
            : setSwapDialogStepIndep("failedApproval");
        }
        setLoadingIndep({ approval: false });
        console.error("ERROR approve -> ", e);
      });

    // setDialogStepIndep("successApproval");
    // setLoadingIndep({ approval: false });
    return _approve;
  } catch (e) {
    if (e.code === 4001) {
      showSnackbarIndep("Approval Rejected.", "error");
      tab === "stake"
        ? setDialogStepIndep("rejectedApproval")
        : setSwapDialogStepIndep("rejectedApproval");
    } else {
      showSnackbarIndep("Approval Failed.", "error");
      tab === "stake"
        ? setDialogStepIndep("failedApproval")
        : setSwapDialogStepIndep("failedApproval");
    }
    setLoadingIndep({ approval: false });
    console.error("ERROR approve -> ", e);
  }
};

export const allowance = async (spenderAddress, loading) => {
  try {
    checkContractInitialized();
    const walletAddress = getWalletAddressReduxState();
    if (!walletAddress) {
      // throw new Error("Wallet not activated.");
      return "0";
    }

    const _allowance = await contract.methods
      .allowance(walletAddress, spenderAddress)
      .call();
    console.log({ _allowance });
    return _allowance;
  } catch (e) {
    console.error("ERROR allowance -> ", e);
  }
};

export const balanceOf = async () => {
  try {
    checkContractInitialized();
    const walletAddress = getWalletAddressReduxState();
    if (!walletAddress) {
      // throw new Error("Wallet not activated.");
      return "0";
    }

    const _balance = await contract.methods.balanceOf(walletAddress).call();
    return _balance;
  } catch (e) {
    console.error("ERROR balanceOf -> ", e);
  }
};

const checkContractInitialized = () => {
  if (!isContractInitialized) {
    throw new Error("PublicPortalContract not initialized.");
  }
};
