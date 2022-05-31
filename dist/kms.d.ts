/// <reference types="node" />
import Common from "@ethereumjs/common";
import { KMS } from "aws-sdk";
import * as EthUtil from "ethereumjs-util";
export declare const kms: KMS;
export interface SignParams {
    keyId: KMS.SignRequest["KeyId"];
    message: Buffer;
}
export declare type CreateSignatureParams = SignParams & {
    address: string;
    txOpts?: Common;
};
export declare const recoverPubKeyFromSig: (msg: Buffer, r: EthUtil.BN, s: EthUtil.BN, v: number, chainId?: number | undefined) => string;
export declare const getEthAddressFromPublicKey: (publicKey: KMS.PublicKeyType) => string;
export declare const getPublicKey: (KeyId: KMS.GetPublicKeyRequest["KeyId"]) => Promise<import("aws-sdk/lib/request").PromiseResult<KMS.GetPublicKeyResponse, import("aws-sdk").AWSError>>;
export declare const getEthAddressFromKMS: (keyId: KMS.GetPublicKeyRequest["KeyId"]) => Promise<string>;
export declare const sign: (signParams: SignParams) => Promise<import("aws-sdk/lib/request").PromiseResult<KMS.SignResponse, import("aws-sdk").AWSError>>;
export declare const createSignature: (sigParams: CreateSignatureParams) => Promise<{
    r: Buffer;
    s: Buffer;
    v: EthUtil.BN;
}>;
//# sourceMappingURL=kms.d.ts.map