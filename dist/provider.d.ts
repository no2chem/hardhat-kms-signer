import { ProviderWrapperWithChainId } from "hardhat/internal/core/providers/chainId";
import { EIP1193Provider, NetworkConfig, RequestArguments } from "hardhat/types";
export declare class KMSSigner extends ProviderWrapperWithChainId {
    config: NetworkConfig;
    ethAddress?: string;
    constructor(provider: EIP1193Provider, config: NetworkConfig);
    request(args: RequestArguments): Promise<unknown>;
    private _getSender;
    private _getNonce;
}
//# sourceMappingURL=provider.d.ts.map