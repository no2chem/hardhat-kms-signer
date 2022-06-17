import "hardhat/types/config";

declare module "hardhat/types/config" {
  export interface HttpNetworkUserConfig {
    kmsKeyId?: string;
    hardfork? : string;
    priorityGasFee? : string;
  }

  export interface HardhatNetworkUserConfig {
    kmsKeyId?: string;
    priorityGasFee? : string;
  }
  export interface HttpNetworkConfig {
    kmsKeyId?: string;
    hardfork?: string
    priorityGasFee? : string;
  }
  export interface HardhatNetworkConfig {
    kmsKeyId?: string;
    priorityGasFee? : string;
  }
}
