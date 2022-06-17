import "hardhat/types/config";
declare module "hardhat/types/config" {
    interface HttpNetworkUserConfig {
        kmsKeyId?: string;
        hardfork?: string;
        priorityGasFee?: string;
    }
    interface HardhatNetworkUserConfig {
        kmsKeyId?: string;
        priorityGasFee?: string;
    }
    interface HttpNetworkConfig {
        kmsKeyId?: string;
        hardfork?: string;
        priorityGasFee?: string;
    }
    interface HardhatNetworkConfig {
        kmsKeyId?: string;
        priorityGasFee?: string;
    }
}
//# sourceMappingURL=type-extensions.d.ts.map