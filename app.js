"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var web3_js_1 = require("@solana/web3.js");
var anchor = require('@coral-xyz/anchor');
var express = require('express');
var cors = require('cors');
var idl = require("../idl.json"); // Make sure this is the correct path to your IDL file
var network = 'https://api.mainnet-beta.solana.com';
var iqHost = "https://solanacontractapi.uc.r.appspot.com";
var web3 = anchor.web3;
var expected_receiver = new web3_js_1.PublicKey("GbgepibVcKMbLW6QaFrhUGG34WDvJ2SKvznL2HUuquZh");
// const secretKeyBase58 = "personalKeyFromPhantom"; //paste your transaction
// const secretKey = bs58.decode(secretKeyBase58);
// const keypair = Keypair.fromSecretKey(secretKey);
var chunkSize = 850;
var amountToSend = 0.003 * web3.LAMPORTS_PER_SOL;
var app = express();
app.use(express.json());
function getPDA(userKey) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("".concat(iqHost, "/getPDA/").concat(userKey))];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (response.ok) {
                        return [2 /*return*/, data.PDA];
                    }
                    else {
                        throw new Error(data.error || 'Failed to fetch PDA');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error fetching PDA:', error_1);
                    return [2 /*return*/, undefined];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getDBPDA(userKey) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("".concat(iqHost, "/getDBPDA/").concat(userKey))];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (response.ok) {
                        return [2 /*return*/, data.DBPDA];
                    }
                    else {
                        throw new Error(data.error || 'Failed to fetch PDA');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error fetching PDA:', error_2);
                    return [2 /*return*/, "null"];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function txSend(tx) {
    return __awaiter(this, void 0, void 0, function () {
        var connection, blockhash, txid;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    connection = new web3_js_1.Connection(network, 'confirmed');
                    return [4 /*yield*/, connection.getRecentBlockhash()];
                case 1:
                    blockhash = (_a.sent()).blockhash;
                    tx.recentBlockhash = blockhash;
                    tx.feePayer = keypair.publicKey;
                    tx.sign(keypair);
                    return [4 /*yield*/, web3.sendAndConfirmTransaction(connection, tx, [keypair])];
                case 2:
                    txid = _a.sent();
                    console.log('Transaction sent, txid:', txid);
                    return [2 /*return*/, txid];
            }
        });
    });
}
function createSendTransaction(code, before_tx, method, decode_break) {
    return __awaiter(this, void 0, void 0, function () {
        var userKey, PDA, program, tx, ix, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    userKey = keypair.publicKey;
                    return [4 /*yield*/, getPDA(userKey.toString())];
                case 1:
                    PDA = _a.sent();
                    program = new anchor.Program(idl, userKey);
                    tx = new web3.Transaction({
                        feePayer: userKey,
                    });
                    return [4 /*yield*/, program.methods
                            .sendCode(code, before_tx, method, decode_break)
                            .accounts({
                            user: userKey,
                            codeAccount: PDA,
                            systemProgram: web3_js_1.SystemProgram.programId,
                        }).instruction()];
                case 2:
                    ix = _a.sent();
                    return [4 /*yield*/, tx.add(ix)];
                case 3:
                    _a.sent();
                    return [2 /*return*/, txSend(tx)];
                case 4:
                    error_3 = _a.sent();
                    console.error(error_3);
                    throw new Error("Failed to create instruction: " + error_3);
                case 5: return [2 /*return*/];
            }
        });
    });
}
function createDbCodeTransaction(handle, tail_tx, type, offset) {
    return __awaiter(this, void 0, void 0, function () {
        var userKey, DBPDA, program, tx, transix, dbcodeix, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    userKey = keypair.publicKey;
                    return [4 /*yield*/, getDBPDA(userKey.toString())];
                case 1:
                    DBPDA = _a.sent();
                    program = new anchor.Program(idl, userKey);
                    tx = new web3.Transaction({
                        feePayer: userKey,
                    });
                    return [4 /*yield*/, web3.SystemProgram.transfer({
                            fromPubkey: userKey,
                            toPubkey: new web3_js_1.PublicKey(DBPDA),
                            lamports: amountToSend,
                        })];
                case 2:
                    transix = _a.sent();
                    return [4 /*yield*/, tx.add(transix)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, program.methods
                            .dbCodeIn(handle, tail_tx, type, offset)
                            .accounts({
                            user: userKey,
                            dbAccount: DBPDA,
                            systemProgram: web3_js_1.SystemProgram.programId,
                        }).remainingAccounts([
                            { pubkey: expected_receiver, isSigner: false, isWritable: true },
                        ]).instruction()];
                case 4:
                    dbcodeix = _a.sent();
                    return [4 /*yield*/, tx.add(dbcodeix)];
                case 5:
                    _a.sent();
                    return [2 /*return*/, txSend(tx)];
                case 6:
                    error_4 = _a.sent();
                    throw new Error("Failed to create instruction: " + error_4);
                case 7: return [2 /*return*/];
            }
        });
    });
}
function getChunk(textData) {
    return __awaiter(this, void 0, void 0, function () {
        var datalength, totalChunks, chunks, i, start, end;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    datalength = textData.length;
                    totalChunks = Math.ceil(datalength / chunkSize);
                    chunks = [];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < totalChunks)) return [3 /*break*/, 4];
                    start = i * chunkSize;
                    end = Math.min(start + chunkSize, datalength);
                    return [4 /*yield*/, chunks.push(textData.slice(start, end))];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    if (chunks.length < 1) {
                        return [2 /*return*/, ["null"]];
                    }
                    else {
                        return [2 /*return*/, chunks];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function makeTextTransactions(chunkList, handle, type, offset) {
    return __awaiter(this, void 0, void 0, function () {
        var beforeHash, method, decode_break, _i, chunkList_1, text, resultHash;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    beforeHash = "Genesis";
                    method = 0;
                    decode_break = 0;
                    _i = 0, chunkList_1 = chunkList;
                    _a.label = 1;
                case 1:
                    if (!(_i < chunkList_1.length)) return [3 /*break*/, 4];
                    text = chunkList_1[_i];
                    return [4 /*yield*/, createSendTransaction(text, beforeHash, method, decode_break)];
                case 2:
                    beforeHash = _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [4 /*yield*/, createDbCodeTransaction(handle, beforeHash, type, offset)];
                case 5:
                    resultHash = _a.sent();
                    return [2 /*return*/, resultHash];
            }
        });
    });
}
function _getChunk_ForText(message) {
    return __awaiter(this, void 0, void 0, function () {
        var encoder, messageBytes, chunks, currentChunk, currentChunkSize, i, byte;
        return __generator(this, function (_a) {
            encoder = new TextEncoder();
            messageBytes = encoder.encode(message);
            chunks = [];
            currentChunk = [];
            currentChunkSize = 0;
            i = 0;
            while (currentChunkSize <= chunkSize) {
                byte = messageBytes[i];
                currentChunk.push(byte);
                currentChunkSize++;
                if (currentChunkSize >= chunkSize) {
                    chunks.push(new TextDecoder().decode(new Uint8Array(currentChunk))); // 청크를 문자열로 변환
                    currentChunk = [];
                    currentChunkSize = 0;
                }
                i++;
            }
            if (currentChunkSize > 0) {
                chunks.push(new TextDecoder().decode(new Uint8Array(currentChunk)));
            }
            return [2 /*return*/, chunks];
        });
    });
}
// //--------------------------Example Code--------------------------------
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var textdata, eng_chunkList, kor_textdata, kor_chunkList;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    textdata = "longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext ";
                    return [4 /*yield*/, _getChunk_ForText(textdata)];
                case 1:
                    eng_chunkList = _a.sent();
                    kor_textdata = "이글정말길어너무 이글정말길어너무 이글정말길어너무 이글정말길어너무 이글정말길어너무 이글정말길어너무 이글정말길어너무 이글정말길어너무 이글정말길어너무 이글정말길어너무 이글정말길어너무 이글정말길어너무 이글정말길어너무 이글정말길어너무 이글정말길어너무 이글정말길어너무 이글정말길어너무 이글정말길어너무 이글정말길어너무 이글정말길어너무 이글정말길어너무 이글정말길어너무";
                    return [4 /*yield*/, _getChunk_ForText(kor_textdata)];
                case 2:
                    kor_chunkList = _a.sent();
                    console.log("eng len: " + textdata.length);
                    console.log("eng list: " + eng_chunkList);
                    console.log("eng chunklen: " + eng_chunkList.length);
                    console.log("kor len: " + kor_textdata.length);
                    console.log("kor list: " + kor_chunkList);
                    console.log("kor chunklen: " + kor_chunkList.length);
                    return [2 /*return*/];
            }
        });
    });
}
run();
