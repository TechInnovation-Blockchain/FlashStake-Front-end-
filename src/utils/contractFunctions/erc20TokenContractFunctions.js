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
import { setDialogStepIndep } from "../../redux/actions/flashstakeActions";

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

export const approve = async (address, amount) => {
  try {
    setDialogStepIndep("pendingApproval");
    setLoadingIndep({ approval: true });
    showSnackbarIndep("Awaiting Approval.", "info");
    checkContractInitialized();

    const walletAddress = getWalletAddressReduxState();
    if (!walletAddress) {
      throw new Error("Wallet not activated.");
    }

    const _approve = await contract.methods
      .approve(address, amount ? amount : MaxUint256._hex)
      .send({
        from: walletAddress,
      })
      .then(function (receipt) {
        showSnackbarIndep("Approval Successful.", "success");
        setDialogStepIndep("flashstakeProposal");
      })
      .catch((e) => {
        if (e.code === 4001) {
          showSnackbarIndep("Approval Rejected.", "error");
          setDialogStepIndep("rejectedApproval");
        } else {
          showSnackbarIndep("Approval Failed.", "error");
          setDialogStepIndep("failedApproval");
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
      setDialogStepIndep("rejectedApproval");
    } else {
      showSnackbarIndep("Approval Failed.", "error");
      setDialogStepIndep("failedApproval");
    }
    setLoadingIndep({ approval: false });
    console.error("ERROR approve -> ", e);
  }
};

export const allowance = async (spenderAddress) => {
  try {
    checkContractInitialized();
    const walletAddress = getWalletAddressReduxState();
    if (!walletAddress) {
      throw new Error("Wallet not activated.");
    }

    const _allowance = await contract.methods
      .allowance(walletAddress, spenderAddress)
      .call();
    setLoadingIndep({ approval: false });
    return _allowance;
  } catch (e) {
    setLoadingIndep({ approval: false });
    console.error("ERROR allowance -> ", e);
  }
};

export const balanceOf = async () => {
  try {
    checkContractInitialized();
    const walletAddress = getWalletAddressReduxState();
    if (!walletAddress) {
      throw new Error("Wallet not activated.");
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
