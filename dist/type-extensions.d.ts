import "hardhat/types/config";
declare module "hardhat/types/config" {
    interface HttpNetworkUserConfig {
        kmsKeyId?: string;
        hardfork?: string;
    }
    interface HardhatNetworkUserConfig {
        kmsKeyId?: string;
    }
    interface HttpNetworkConfig {
        kmsKeyId?: string;
        hardfork?: string;
    }
    interface HardhatNetworkConfig {
        kmsKeyId?: string;
    }
}
//# sourceMappingURL=type-extensions.d.ts.map