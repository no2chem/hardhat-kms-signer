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
exports.createSignature = exports.sign = exports.getEthAddressFromKMS = exports.getPublicKey = exports.getEthAddressFromPublicKey = exports.recoverPubKeyFromSig = exports.kms = void 0;
const asn1 = __importStar(require("asn1.js"));
const aws_sdk_1 = require("aws-sdk");
const EthUtil = __importStar(require("ethereumjs-util"));
exports.kms = new aws_sdk_1.KMS();
const EcdsaSigAsnParse = asn1.define("EcdsaSig", function () {
    this.seq().obj(this.key("r").int(), this.key("s").int());
});
const EcdsaPubKey = asn1.define("EcdsaPubKey", function () {
    this.seq().obj(this.key("algo").seq().obj(this.key("a").objid(), this.key("b").objid()), this.key("pubKey").bitstr());
});
exports.recoverPubKeyFromSig = (msg, r, s, v, chainId) => {
    const rBuffer = r.toBuffer();
    const sBuffer = s.toBuffer();
    const pubKey = EthUtil.ecrecover(msg, v, rBuffer, sBuffer, chainId);
    const addrBuf = EthUtil.pubToAddress(pubKey);
    const RecoveredEthAddr = EthUtil.bufferToHex(addrBuf);
    return RecoveredEthAddr;
};
const getRS = async (signParams) => {
    const signature = await exports.sign(signParams);
    if (signature.Signature === undefined) {
        throw new Error("Signature is undefined.");
    }
    const decoded = EcdsaSigAsnParse.decode(signature.Signature, "der");
    const r = decoded.r;
    let s = decoded.s;
    const secp256k1N = new EthUtil.BN("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141", 16);
    const secp256k1halfN = secp256k1N.div(new EthUtil.BN(2));
    if (s.gt(secp256k1halfN)) {
        s = secp256k1N.sub(s);
        return { r, s };
    }
    return { r, s };
};
const getV = (msg, r, s, expectedEthAddr) => {
    let v = 27;
    let pubKey = exports.recoverPubKeyFromSig(msg, r, s, v);
    if (pubKey !== expectedEthAddr) {
        v = 28;
        pubKey = exports.recoverPubKeyFromSig(msg, r, s, v);
    }
    return new EthUtil.BN(v - 27);
};
exports.getEthAddressFromPublicKey = (publicKey) => {
    const res = EcdsaPubKey.decode(publicKey, "der");
    let pubKeyBuffer = res.pubKey.data;
    pubKeyBuffer = pubKeyBuffer.slice(1, pubKeyBuffer.length);
    const address = EthUtil.keccak256(pubKeyBuffer);
    const EthAddr = "0x" + address.slice(-20).toString("hex");
    return EthAddr;
};
exports.getPublicKey = (KeyId) => exports.kms.getPublicKey({ KeyId }).promise();
exports.getEthAddressFromKMS = async (keyId) => {
    const KMSKey = await exports.getPublicKey(keyId);
    if (!KMSKey.PublicKey) {
        throw new Error("Failed to get PublicKey from KMS");
    }
    return exports.getEthAddressFromPublicKey(KMSKey.PublicKey);
};
exports.sign = (signParams) => {
    const { keyId, message } = signParams;
    return exports.kms
        .sign({
        KeyId: keyId,
        Message: message,
        SigningAlgorithm: "ECDSA_SHA_256",
        MessageType: "DIGEST",
    })
        .promise();
};
exports.createSignature = async (sigParams) => {
    const { keyId, message, address } = sigParams;
    const { r, s } = await getRS({ keyId, message });
    const v = getV(message, r, s, address);
    return {
        r: r.toBuffer(),
        s: s.toBuffer(),
        v,
    };
};
//# sourceMappingURL=kms.js.map