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
var express = require('express');
var network = 'https://api.mainnet-beta.solana.com'; // change your rpc if you want to retry often
var iqHost = "https://solanacontractapi.uc.r.appspot.com";
var app = express();
app.use(express.json());
function getDBPDA(userKey) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_1;
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
                    error_1 = _a.sent();
                    console.error('Error fetching PDA:', error_1);
                    return [2 /*return*/, "null"];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function convertTextToEmoji(text) {
    return text.replace(/\/u([0-9A-Fa-f]{4,6})/g, function (match, code) {
        return String.fromCodePoint(parseInt(code, 16));
    });
}
function getTransactionInfoOnServer(txId) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_2, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, fetch(iqHost + "/get_transaction_info/".concat(txId))];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 5];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    return [2 /*return*/, data.argData];
                case 4:
                    error_2 = _a.sent();
                    console.error('Error creating transaction:', error_2);
                    return [2 /*return*/, null];
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_3 = _a.sent();
                    console.error('Error creating initTransactionOnServer:', error_3);
                    return [2 /*return*/, null];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function _getTransactionData(transactionData) {
    return __awaiter(this, void 0, void 0, function () {
        var encodedChunk;
        return __generator(this, function (_a) {
            if ('code' in transactionData) {
                encodedChunk = {
                    code: transactionData.code,
                    method: transactionData.method,
                    decode_break: transactionData.decode_break,
                };
                return [2 /*return*/, {
                        data: encodedChunk,
                        before_tx: transactionData.before_tx,
                    }];
            }
            else {
                return [2 /*return*/, {
                        data: "fail",
                        before_tx: "fail"
                    }];
            }
            return [2 /*return*/];
        });
    });
}
function bringCommit_msg(dataTxid) {
    return __awaiter(this, void 0, void 0, function () {
        var txInfo, type_field, offset;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getTransactionInfoOnServer(dataTxid)];
                case 1:
                    txInfo = _a.sent();
                    type_field = txInfo.type_field;
                    if (type_field === "json") {
                        offset = txInfo.offset;
                        return [2 /*return*/, offset.split("commit: ")[1]];
                    }
                    else {
                        return [2 /*return*/, "null"];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function bringCode(dataTxid) {
    return __awaiter(this, void 0, void 0, function () {
        var txInfo, tail_tx, offset, encodedChunks, before_tx, chunk, chunkData, textList, textData, commit_message, finalresult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getTransactionInfoOnServer(dataTxid)];
                case 1:
                    txInfo = _a.sent();
                    tail_tx = txInfo.tail_tx;
                    offset = txInfo.offset;
                    encodedChunks = [];
                    before_tx = tail_tx;
                    _a.label = 2;
                case 2:
                    if (!(before_tx != "Genesis")) return [3 /*break*/, 7];
                    if (!(before_tx != undefined)) return [3 /*break*/, 5];
                    return [4 /*yield*/, getTransactionInfoOnServer(before_tx)];
                case 3:
                    chunk = _a.sent();
                    if (chunk == undefined) {
                        console.log("No chunk found.");
                        return [2 /*return*/, {
                                json_data: "false",
                                commit_message: "false"
                            }];
                    }
                    return [4 /*yield*/, _getTransactionData(chunk)];
                case 4:
                    chunkData = _a.sent();
                    encodedChunks.push(chunkData.data.code);
                    before_tx = chunkData.before_tx;
                    return [3 /*break*/, 6];
                case 5:
                    console.error("before data undefined");
                    return [2 /*return*/, {
                            json_data: "false",
                            commit_message: "false"
                        }];
                case 6: return [3 /*break*/, 2];
                case 7:
                    textList = encodedChunks.reverse();
                    textData = textList.join();
                    commit_message = offset;
                    finalresult = convertTextToEmoji(textData);
                    return [2 /*return*/, {
                            json_data: finalresult,
                            commit_message: commit_message
                        }];
            }
        });
    });
}
function fetchAllSignatures(stringDBAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var connection, allSignatures, dbAddress, signatures, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    connection = new web3_js_1.Connection(network, 'confirmed');
                    allSignatures = [];
                    dbAddress = new web3_js_1.PublicKey(stringDBAddress);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, connection.getSignaturesForAddress(dbAddress, {
                            limit: 30,
                        })];
                case 2:
                    signatures = _a.sent();
                    allSignatures.push.apply(allSignatures, signatures.map(function (sig) { return sig.signature; }));
                    return [2 /*return*/, allSignatures];
                case 3:
                    error_4 = _a.sent();
                    console.error("Error fetching signatures:", error_4);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function bringWalletsRecentJson(stringAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var dbAddress, signatures, commit, _i, signatures_1, signature;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDBPDA(stringAddress)];
                case 1:
                    dbAddress = _a.sent();
                    return [4 /*yield*/, fetchAllSignatures(dbAddress)];
                case 2:
                    signatures = _a.sent();
                    commit = 'null';
                    _i = 0, signatures_1 = signatures;
                    _a.label = 3;
                case 3:
                    if (!(_i < signatures_1.length)) return [3 /*break*/, 6];
                    signature = signatures_1[_i];
                    return [4 /*yield*/, bringCommit_msg(signature)];
                case 4:
                    commit = _a.sent();
                    if (commit != 'null') {
                        return [2 /*return*/, signature];
                    }
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/, 'null'];
            }
        });
    });
}
function bringAgentWithWalletAddress(stringAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var recent, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, bringWalletsRecentJson("FPSYQmFh1WhbrgNKoQCDBcrf3YLc9eoNCpTyAjHXrf1c")];
                case 1:
                    recent = _a.sent();
                    return [4 /*yield*/, bringCode(recent)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
//--------------------------Example Code--------------------------------
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var codedata;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, bringAgentWithWalletAddress("FPSYQmFh1WhbrgNKoQCDBcrf3YLc9eoNCpTyAjHXrf1c")];
                case 1:
                    codedata = _a.sent();
                    console.log("Result Transaction: " + codedata.json_data);
                    return [2 /*return*/];
            }
        });
    });
}
run();
