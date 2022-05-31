"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KMSSigner = void 0;
const common_1 = __importStar(require("@ethereumjs/common"));
const tx_1 = require("@ethereumjs/tx");
const ethereumjs_util_1 = require("ethereumjs-util");
const base_types_1 = require("hardhat/internal/core/jsonrpc/types/base-types");
const transactionRequest_1 = require("hardhat/internal/core/jsonrpc/types/input/transactionRequest");
const validation_1 = require("hardhat/internal/core/jsonrpc/types/input/validation");
const chainId_1 = require("hardhat/internal/core/providers/chainId");
const lodash_1 = require("lodash");
const kms_1 = require("./kms");
class KMSSigner extends chainId_1.ProviderWrapperWithChainId {
    constructor(provider, kmsKeyId) {
        super(provider);
        this.kmsKeyId = kmsKeyId;
    }
    async request(args) {
        const method = args.method;
        const params = this._getParams(args);
        if (method === "eth_sendTransaction") {
            const tx = params[0];
            if (tx !== undefined && tx.from === undefined) {
                tx.from = await this._getSender();
            }
            const [txRequest] = validation_1.validateParams(params, transactionRequest_1.rpcTransactionRequest);
            if (txRequest.nonce === undefined) {
                txRequest.nonce = await this._getNonce(txRequest.from);
            }
            const txOptions = common_1.default.custom({
                chainId: await this._getChainId(),
            }, {
                hardfork: common_1.Hardfork.London
            });
            const txParams = lodash_1.pick(txRequest, [
                "from",
                "to",
                "value",
                "nonce",
                "data",
                "chainId",
                "maxFeePerGas",
                "maxPriorityFeePerGas",
            ]);
            txParams.gasLimit = txRequest.gas;
            const txf = tx_1.FeeMarketEIP1559Transaction.fromTxData(txParams, {
                common: txOptions,
            });
            const txSignature = await kms_1.createSignature({
                keyId: this.kmsKeyId,
                message: txf.getMessageToSign(),
                address: tx.from,
                txOpts: txOptions,
            });
            const signedTx = tx_1.FeeMarketEIP1559Transaction.fromTxData(Object.assign(Object.assign({}, txParams), txSignature), {
                common: txOptions,
            });
            const rawTx = `0x${signedTx.serialize().toString("hex")}`;
            return this._wrappedProvider.request({
                method: "eth_sendRawTransaction",
                params: [rawTx],
            });
        }
        else if (args.method === "eth_accounts" ||
            args.method === "eth_requestAccounts") {
            return [await this._getSender()];
        }
        return this._wrappedProvider.request(args);
    }
    async _getSender() {
        if (!this.ethAddress) {
            this.ethAddress = await kms_1.getEthAddressFromKMS(this.kmsKeyId);
        }
        return this.ethAddress;
    }
    async _getNonce(address) {
        const response = (await this._wrappedProvider.request({
            method: "eth_getTransactionCount",
            params: [ethereumjs_util_1.bufferToHex(address), "pending"],
        }));
        return base_types_1.rpcQuantityToBN(response);
    }
}
exports.KMSSigner = KMSSigner;
//# sourceMappingURL=provider.js.map