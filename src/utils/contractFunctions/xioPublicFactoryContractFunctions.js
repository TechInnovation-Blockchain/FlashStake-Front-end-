import { xioPublicFactoryContract } from "../../contracts/getContract";

let contract;

export const initXioPublicFactoryContract = (address) => {
  contract = xioPublicFactoryContract(address);
};

export const baseInterestRate = async () => {
  try {
    const _baseInterestRate = await contract.methods
      .getBaseInterestRate()
      .call();
    return _baseInterestRate;
  } catch (e) {
    console.error("ERROR baseInterestRate -> ", e);
    return 0;
  }
};
