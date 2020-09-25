import { Web3Provider } from "@ethersproject/providers";

export function getLibrary(provider) {
  return new Web3Provider(provider);
}
