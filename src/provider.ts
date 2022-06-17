import Common, { Hardfork } from "@ethereumjs/common";
import {
  Capability,
  FeeMarketEIP1559Transaction,
  FeeMarketEIP1559TxData,
  Transaction
} from "@ethereumjs/tx";
import { BN, bufferToHex } from "ethereumjs-util";
import { rpcQuantityToBN } from "hardhat/internal/core/jsonrpc/types/base-types";
import { rpcTransactionRequest } from "hardhat/internal/core/jsonrpc/types/input/transactionRequest";
import { validateParams } from "hardhat/internal/core/jsonrpc/types/input/validation";
import { JsonRpcTransactionData } from "hardhat/internal/core/providers/accounts";
import { ProviderWrapperWithChainId } from "hardhat/internal/core/providers/chainId";
import { EIP1193Provider, NetworkConfig, RequestArguments } from "hardhat/types";
import { pick } from "lodash";

import { createSignature, getEthAddressFromKMS } from "./kms";

export class KMSSigner extends ProviderWrapperWithChainId {
  public ethAddress?: string;

  constructor(provider: EIP1193Provider, public config : NetworkConfig) {
    super(provider);
  }

  public async request(args: RequestArguments): Promise<unknown> {
    const method = args.method;
    const params = this._getParams(args);

    if (method === "eth_sendTransaction") {
      const tx: JsonRpcTransactionData = params[0];

      if (tx !== undefined && tx.from === undefined) {
        tx.from = await this._getSender();
      }
      const [txRequest] = validateParams(params, rpcTransactionRequest);

      if (txRequest.nonce === undefined) {
        txRequest.nonce = await this._getNonce(txRequest.from);
      }

      const txOptions = Common.custom({
        chainId: await this._getChainId(),
      }, {
        hardfork: this.config.hardfork ? this.config.hardfork : Hardfork.London
      });

      let signedTx;

      if (txOptions.isActivatedEIP(1559)) {
        const txParams: FeeMarketEIP1559TxData = pick(txRequest, [
          "from",
          "to",
          "value",
          "nonce",
          "data",
          "chainId",
          "maxFeePerGas",
          "maxPriorityFeePerGas",
        ]);
        txParams.maxFeePerGas = txParams.maxFeePerGas ? txParams.maxFeePerGas : txRequest.gasPrice;
        txParams.gasLimit = txRequest.gas?.muln(this.config.gasMultiplier);
        txParams.maxFeePerGas = this.config.priorityGasFee ? (txParams.maxFeePerGas! as BN).add(new BN(this.config.priorityGasFee)) : txParams.maxFeePerGas;
        txParams.maxPriorityFeePerGas = this.config.priorityGasFee? (txParams.maxPriorityFeePerGas! as BN).add(new BN(this.config.priorityGasFee)) : txParams.maxPriorityFeePerGas;
        const txf = FeeMarketEIP1559Transaction.fromTxData(txParams, {
          common: txOptions,
        });

        const txSignature = await createSignature({
          keyId: this.config.kmsKeyId!,
          message: txf.getMessageToSign(),
          address: tx.from!,
          txOpts: txOptions,
        });

        signedTx = FeeMarketEIP1559Transaction.fromTxData(
          {
            ...txParams,
            ...txSignature,
          },
          {
            common: txOptions,
          }
        );
      } else {
        const txParams = Object.assign({
          gasLimit: txRequest.gas?.muln(this.config.gasMultiplier)
        }, txRequest);

        const txf = Transaction.fromTxData(txParams, {
          common : txOptions
        });

        const txSignature = await createSignature({
          keyId: this.config.kmsKeyId!,
          message: txf.getMessageToSign(),
          address: tx.from!,
          txOpts: txOptions,
        });

        txSignature.v = txSignature.v.addn(35).add(txOptions.chainIdBN().muln(2));

        signedTx = Transaction.fromTxData({
          ...txParams,
          ...txSignature
        }, {
          common: txOptions
        })
      }

      const rawTx = `0x${signedTx.serialize().toString("hex")}`;
      return this._wrappedProvider.request({
        method: "eth_sendRawTransaction",
        params: [rawTx],
      });
    } else if (
      args.method === "eth_accounts" ||
      args.method === "eth_requestAccounts"
    ) {
      return [await this._getSender()];
    }

    return this._wrappedProvider.request(args);
  }

  private async _getSender(): Promise<string | undefined> {
    if (!this.ethAddress) {
      this.ethAddress = await getEthAddressFromKMS(this.config.kmsKeyId!);
    }
    return this.ethAddress;
  }

  private async _getNonce(address: Buffer): Promise<BN> {
    const response = (await this._wrappedProvider.request({
      method: "eth_getTransactionCount",
      params: [bufferToHex(address), "pending"],
    })) as string;

    return rpcQuantityToBN(response);
  }
}
