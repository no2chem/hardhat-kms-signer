import { ProviderWrapperWithChainId } from "hardhat/internal/core/providers/chainId";
import { EIP1193Provider, RequestArguments } from "hardhat/types";
export declare class KMSSigner extends ProviderWrapperWithChainId {
    kmsKeyId: string;
    ethAddress?: string;
    constructor(provider: EIP1193Provider, kmsKeyId: string);
    request(args: RequestArguments): Promise<unknown>;
    private _getSender;
    private _getNonce;
}
//# sourceMappingURL=provider.d.ts.map