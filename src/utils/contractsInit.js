import Web3 from "web3";

export default class ContractInit {
  static init = async () => {
    try {
      this.web3js = new Web3(window.web3.currentProvider);
      this.accounts = await this.web3js.eth.getAccounts();
      this.getNetwork = await this.web3js.eth.net.getNetworkType();
      return {
        web3js: this.web3js,
        address: this.accounts[0],
        network: this.getNetwork,
      };
    } catch (e) {
      _error("ERROR ContractsInit -> ", e);
    }
  };
}
