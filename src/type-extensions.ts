import "hardhat/types/config";

declare module "hardhat/types/config" {
  export interface HttpNetworkUserConfig {
    kmsKeyId?: string;
    hardfork? : string;
  }

  export interface HardhatNetworkUserConfig {
    kmsKeyId?: string;
  }
  export interface HttpNetworkConfig {
    kmsKeyId?: string;
    hardfork?: string
  }
  export interface HardhatNetworkConfig {
    kmsKeyId?: string;
  }
}
