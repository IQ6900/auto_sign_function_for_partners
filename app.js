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
var bs58_1 = require("bs58");
var ascii_genetate_1 = require("./ascii_genetate");
var compress_1 = require("./compress");
var anchor = require('@coral-xyz/anchor');
var express = require('express');
var cors = require('cors');
var idl = require("../idl.json"); // Make sure this is the correct path to your IDL file
var network = "https://mainnet.helius-rpc.com/?api-key=ab814e2b-59a3-4ca9-911a-665f06fb5f09";
var iqHost = "https://solanacontractapi.uc.r.appspot.com";
var web3 = anchor.web3;
var secretKeyBase58 = "Your Secret Key"; //paste your transaction
var secretKey = bs58_1.decode(secretKeyBase58);
var keypair = web3_js_1.Keypair.fromSecretKey(secretKey);
var transactionSizeLimit = 850;
var sizeLimitForSplitCompression = 10000;
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
function getMerkleRootFromServer(dataList) {
    return __awaiter(this, void 0, void 0, function () {
        var url, requestData, response, responseData, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = iqHost + "/generate-merkle-root";
                    requestData = {
                        data: dataList, // 데이터 배열
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch(url, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(requestData),
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Error: ".concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    responseData = _a.sent();
                    console.log("Merkle Root:", responseData.merkleRoot);
                    return [2 /*return*/, responseData.merkleRoot];
                case 4:
                    error_3 = _a.sent();
                    console.error("Failed to get Merkle Root:", error_3);
                    throw error_3;
                case 5: return [2 /*return*/];
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
                    return [4 /*yield*/, connection.getLatestBlockhash()];
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
        var userKey, PDA, program, tx, ix, error_4;
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
                    return [2 /*return*/, tx];
                case 4:
                    error_4 = _a.sent();
                    console.error(error_4);
                    throw new Error("Failed to create instruction: " + error_4);
                case 5: return [2 /*return*/];
            }
        });
    });
}
function createDbCodeTransaction(handle, tail_tx, type, offset) {
    return __awaiter(this, void 0, void 0, function () {
        var userKey, DBPDA, program, tx, dbcodefreeix, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    userKey = keypair.publicKey;
                    return [4 /*yield*/, getDBPDA(userKey.toString())];
                case 1:
                    DBPDA = _a.sent();
                    program = new anchor.Program(idl, userKey);
                    tx = new web3.Transaction({
                        feePayer: userKey, // 수수료 지불자 설정
                    });
                    return [4 /*yield*/, program.methods
                            .dbCodeInForFree(handle, tail_tx, type, offset)
                            .accounts({
                            user: userKey,
                            dbAccount: DBPDA,
                            systemProgram: web3_js_1.SystemProgram.programId,
                        }).instruction()];
                case 2:
                    dbcodefreeix = _a.sent();
                    return [4 /*yield*/, tx.add(dbcodefreeix)];
                case 3:
                    _a.sent();
                    return [2 /*return*/, tx];
                case 4:
                    error_5 = _a.sent();
                    throw new Error("Failed to create instruction: " + error_5);
                case 5: return [2 /*return*/];
            }
        });
    });
}
function getChunk(textData, chunkSize) {
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
        var beforeHash, method, decode_break, _i, chunkList_1, text, tx_1, tx;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    beforeHash = "Genesis";
                    method = 0;
                    decode_break = 0;
                    _i = 0, chunkList_1 = chunkList;
                    _a.label = 1;
                case 1:
                    if (!(_i < chunkList_1.length)) return [3 /*break*/, 5];
                    text = chunkList_1[_i];
                    return [4 /*yield*/, createSendTransaction(text, beforeHash, method, decode_break)];
                case 2:
                    tx_1 = _a.sent();
                    return [4 /*yield*/, txSend(tx_1)];
                case 3:
                    beforeHash = _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5: return [4 /*yield*/, createDbCodeTransaction(handle, beforeHash, type, offset)];
                case 6:
                    tx = _a.sent();
                    return [4 /*yield*/, txSend(tx)];
                case 7: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function makeAsciiTransactions(chunkList, handle, type, offset) {
    return __awaiter(this, void 0, void 0, function () {
        var beforeHash, _i, chunkList_2, chunks, textList, method, decode_break, i, _a, textList_1, text, tx_2, tx_3, tx;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    beforeHash = "Genesis";
                    _i = 0, chunkList_2 = chunkList;
                    _b.label = 1;
                case 1:
                    if (!(_i < chunkList_2.length)) return [3 /*break*/, 11];
                    chunks = chunkList_2[_i];
                    textList = chunks.text_list;
                    method = chunks.method;
                    decode_break = 0;
                    i = 0;
                    _a = 0, textList_1 = textList;
                    _b.label = 2;
                case 2:
                    if (!(_a < textList_1.length)) return [3 /*break*/, 10];
                    text = textList_1[_a];
                    if (i == textList.length - 1) {
                        decode_break = 1;
                    }
                    if (!(i < textList.length)) return [3 /*break*/, 5];
                    return [4 /*yield*/, createSendTransaction(text, beforeHash, method, decode_break)];
                case 3:
                    tx_2 = _b.sent();
                    return [4 /*yield*/, txSend(tx_2)];
                case 4:
                    beforeHash = _b.sent();
                    return [3 /*break*/, 8];
                case 5: return [4 /*yield*/, createSendTransaction(text, beforeHash, method, decode_break)];
                case 6:
                    tx_3 = _b.sent();
                    return [4 /*yield*/, txSend(tx_3)];
                case 7:
                    beforeHash = _b.sent();
                    _b.label = 8;
                case 8:
                    i += 1;
                    if (beforeHash === "error") {
                        alert("error on transaction");
                        return [2 /*return*/, false];
                    }
                    _b.label = 9;
                case 9:
                    _a++;
                    return [3 /*break*/, 2];
                case 10:
                    _i++;
                    return [3 /*break*/, 1];
                case 11: return [4 /*yield*/, createDbCodeTransaction(handle, beforeHash, type, offset)];
                case 12:
                    tx = _b.sent();
                    return [4 /*yield*/, txSend(tx)];
                case 13: return [2 /*return*/, _b.sent()];
            }
        });
    });
}
function _makeAsciiChunks(asciiArt, width) {
    return __awaiter(this, void 0, void 0, function () {
        var textChunks, compressedChunks, totalChunks, chunkSize, innerOffset, full_msg, merkleRoot, _i, textChunks_1, textChunk, _compressChunk, _a, compressedChunks_1, compressChunk, _contractchunks, chunkObj;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    textChunks = [];
                    compressedChunks = [];
                    totalChunks = [];
                    chunkSize = 0;
                    innerOffset = "[ width: " + width.toString() + " ]";
                    full_msg = innerOffset + asciiArt;
                    return [4 /*yield*/, getChunk(full_msg, sizeLimitForSplitCompression)];
                case 1:
                    textChunks = _b.sent();
                    return [4 /*yield*/, getMerkleRootFromServer(textChunks)];
                case 2:
                    merkleRoot = _b.sent();
                    _i = 0, textChunks_1 = textChunks;
                    _b.label = 3;
                case 3:
                    if (!(_i < textChunks_1.length)) return [3 /*break*/, 6];
                    textChunk = textChunks_1[_i];
                    return [4 /*yield*/, (0, compress_1.compressText)(textChunk)];
                case 4:
                    _compressChunk = _b.sent();
                    compressedChunks.push(_compressChunk);
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    _a = 0, compressedChunks_1 = compressedChunks;
                    _b.label = 7;
                case 7:
                    if (!(_a < compressedChunks_1.length)) return [3 /*break*/, 11];
                    compressChunk = compressedChunks_1[_a];
                    return [4 /*yield*/, getChunk(compressChunk.result, transactionSizeLimit)];
                case 8:
                    _contractchunks = _b.sent();
                    chunkObj = {
                        text_list: _contractchunks,
                        method: compressChunk.method, //offset
                    };
                    return [4 /*yield*/, totalChunks.push(chunkObj)];
                case 9:
                    _b.sent();
                    chunkSize += _contractchunks.length;
                    _b.label = 10;
                case 10:
                    _a++;
                    return [3 /*break*/, 7];
                case 11: return [2 /*return*/, {
                        chunkList: totalChunks,
                        chunkSize: chunkSize,
                        merkleRoot: merkleRoot,
                    }];
            }
        });
    });
}
function OnChainCodeIn(asciiArt) {
    return __awaiter(this, void 0, void 0, function () {
        var handle, chunkObj, chunkList, chunkSize, merkleRoot, offset, dataType, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    handle = "anonymous";
                    return [4 /*yield*/, _makeAsciiChunks(asciiArt.result, asciiArt.width)];
                case 1:
                    chunkObj = _a.sent();
                    chunkList = chunkObj.chunkList;
                    chunkSize = chunkObj.chunkSize;
                    merkleRoot = chunkObj.merkleRoot;
                    offset = merkleRoot;
                    dataType = "image";
                    console.log("Chunk size: ", chunkSize);
                    return [4 /*yield*/, makeAsciiTransactions(chunkList, handle, dataType, offset)];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    error_6 = _a.sent();
                    console.error("Error signing or sending transaction: ", error_6);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// //--------------------------Example Code--------------------------------
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var image, asciiArt, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, ascii_genetate_1.default)("./images/700.png")];
                case 1:
                    image = _a.sent();
                    asciiArt = {
                        result: image.result,
                        width: image.width
                    };
                    return [4 /*yield*/, OnChainCodeIn(asciiArt)];
                case 2:
                    result = _a.sent();
                    console.log("Db Trx", result);
                    return [2 /*return*/];
            }
        });
    });
}
run();
