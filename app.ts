import {Connection, Keypair, PublicKey, SystemProgram, Transaction} from "@solana/web3.js";
import bs58 from 'bs58';
import imgToAsciiArt from "./ascii_genetate"
import {compressText} from "./compress"
import * as fs from "fs";
import * as path from "path";

const anchor = require('@coral-xyz/anchor');
const express = require('express');
const cors = require('cors');
const idl = require("./idl.json");  // Make sure this is the correct path to your IDL file
const network = "https://mainnet.helius-rpc.com/?api-key=ab814e2b-59a3-4ca9-911a-665f06fb5f09"
const iqHost = "https://solanacontractapi.uc.r.appspot.com";
const web3 = anchor.web3;

const secretKeyBase58 = "secret code"; //paste your secret key
const secretKey = bs58.decode(secretKeyBase58);
const keypair = Keypair.fromSecretKey(secretKey);
const transactionSizeLimit = 850;
const sizeLimitForSplitCompression = 10000;

const amountToSend = 0.003 * web3.LAMPORTS_PER_SOL;
const app = express();


app.use(express.json());


async function getTransactionResult(tailTx: string): Promise<string | undefined> {
    try {
        const response = await fetch(`${iqHost}/get_transaction_result/${tailTx}`);
        const data = await response.json();
        if (response.ok) {
            return data as string;
        } else {
            throw new Error(data.error || 'Failed to fetch PDA');
        }
    } catch (error) {
        console.error('Error fetching PDA:', error);
        return undefined;
    }
}

async function getPDA(userKey: string): Promise<string | undefined> {
    try {
        const response = await fetch(`${iqHost}/getPDA/${userKey}`);
        const data = await response.json();
        if (response.ok) {
            return data.PDA as string;
        } else {
            throw new Error(data.error || 'Failed to fetch PDA');
        }
    } catch (error) {
        console.error('Error fetching PDA:', error);
        return undefined;
    }
}

async function getDBPDA(userKey: string): Promise<string> {
    try {
        const response = await fetch(`${iqHost}/getDBPDA/${userKey}`);
        const data = await response.json();
        if (response.ok) {
            return data.DBPDA as string;
        } else {
            throw new Error(data.error || 'Failed to fetch PDA');
        }
    } catch (error) {
        console.error('Error fetching PDA:', error);
        return "null";
    }
}

async function makeMerkleRootFromServer(dataList: Array<string>) {
    const url = iqHost + "/generate-merkle-root"; // 서버 URL
    const requestData = {
        data: dataList, // 데이터 배열
    };
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log("Merkle Root:", responseData.merkleRoot);
        return responseData.merkleRoot;

    } catch (error) {
        console.error("Failed to get Merkle Root:", error);
        throw error;
    }
}

async function getTransactionInfoOnServer(txId: string) {
    try {
        const response = await fetch(iqHost + `/get_transaction_info/${txId}`);
        if (response.ok) {
            try {
                const data = await response.json();
                return data.argData;
            } catch (error) {
                console.error('Error creating transaction:', error);
                return null;
            }
        }
    } catch (error) {
        console.error('Error creating initTransactionOnServer:', error);
        return null;
    }
}

async function bringOffset(dataTxid: string) {
    const txInfo = await getTransactionInfoOnServer(dataTxid);
    if (txInfo == undefined) {
        return false;
    }
    const type_field = txInfo.type_field;
    if (type_field === "image"|| type_field === "text") {
        return txInfo.offset;
    } else {
        return false;
    }
}

async function txSend(tx: Transaction): Promise<string> {
    let connection = new Connection(network, 'confirmed');
    let blockHash = await connection.getLatestBlockhash();
    while (blockHash == undefined) {
        connection = new Connection(network, 'confirmed');
        blockHash = await connection.getLatestBlockhash();
    }
    tx.recentBlockhash = blockHash.blockhash;
    tx.lastValidBlockHeight = blockHash.lastValidBlockHeight;
    tx.feePayer = keypair.publicKey;
    tx.sign(keypair);

    const txid = await web3.sendAndConfirmTransaction(connection, tx, [keypair]);
    if (txid == undefined) {
        return "null";
    } else {
        console.log('Transaction sent, txid:', txid);
        return txid;
    }
}

async function createSendTransaction(code: string, before_tx: string, method: number, decode_break: number) {
    try {
        const userKey = keypair.publicKey;
        const PDA = await getPDA(userKey.toString());
        const program = new anchor.Program(idl, userKey);
        const tx = new web3.Transaction({
            feePayer: userKey,
        });
        const ix = await program.methods
            .sendCode(code, before_tx, method, decode_break)
            .accounts({
                user: userKey,
                codeAccount: PDA,
                systemProgram: SystemProgram.programId,
            }).instruction();

        await tx.add(ix);
        return tx;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to create instruction: " + error);
    }
}

async function createDbCodeTransaction(handle: string, tail_tx: string, type: string, offset: string) {
    try {
        const userKey = keypair.publicKey;
        const DBPDA = await getDBPDA(userKey.toString());

        const program = new anchor.Program(idl, userKey);
        const tx = new web3.Transaction({
            feePayer: userKey, // 수수료 지불자 설정
        });
        const dbcodefreeix = await program.methods
            .dbCodeInForFree(handle, tail_tx, type, offset)
            .accounts({
                user: userKey,
                dbAccount: DBPDA,
                systemProgram: SystemProgram.programId,
            }).instruction();

        await tx.add(dbcodefreeix);
        return tx;
    } catch (error) {
        throw new Error("Failed to create instruction: " + error);
    }
}

async function getChunk(textData: string, chunkSize: number): Promise<string[]> {
    const datalength = textData.length;
    const totalChunks = Math.ceil(datalength / chunkSize);
    let chunks = [];
    for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, datalength);
        await chunks.push(textData.slice(start, end));
    }
    if (chunks.length < 1) {
        return ["null"];
    } else {
        return chunks;
    }
}

async function makeTextTransactions(chunkList: Array<string>, handle: string, type: string, offset: string) {
    let beforeHash: string = "Genesis";
    let method = 0;
    let decode_break = 0;

    for (let text of chunkList) {
        const tx = await createSendTransaction(text, beforeHash, method, decode_break);
        beforeHash = await txSend(tx);

    }
    const tx = await createDbCodeTransaction(handle, beforeHash, type, offset);
    return await txSend(tx);
}

interface chunkObj {
    text_list: Array<string>;
    method: number;
}

async function makeAsciiTransactions(chunkList: Array<chunkObj>, handle: string, type: string, offset: string) {
    let beforeHash = "Genesis";

    for (let chunks of chunkList) {
        let textList = chunks.text_list;
        let method = chunks.method;
        let decode_break = 0;
        let i = 0;

        for (let text of textList) {
            if (i == textList.length - 1) {
                decode_break = 1;
            }
            if (i < textList.length) {
                const tx = await createSendTransaction(text, beforeHash, method, decode_break);
                beforeHash = await txSend(tx);


            } else {
                const tx = await createSendTransaction(text, beforeHash, method, decode_break);
                beforeHash = await txSend(tx);

            }
            i += 1;
            if (beforeHash === "error") {
                console.log("error on transaction");
                return false;
            }

        }
    }
    const last_tx = await createDbCodeTransaction(handle, beforeHash, type, offset);
    const resultHash = await txSend(last_tx);
    if (resultHash === "error") {
        alert("error on transaction");
        return false;
    } else {
        return resultHash;
    }
}


async function _makeAsciiChunks(asciiArt: string, width: number) {
    let textChunks = []
    let compressedChunks = []
    let totalChunks = []
    let chunkSize = 0;
    let innerOffset = "[ width: " + width.toString() + " ]"
    let full_msg = innerOffset + asciiArt;


    textChunks = await getChunk(full_msg, sizeLimitForSplitCompression);

    const merkleRoot = await makeMerkleRootFromServer(textChunks);

    for (let textChunk of textChunks) {
        let _compressChunk = await compressText(textChunk);
        compressedChunks.push(_compressChunk);
    }
    for (let compressChunk of compressedChunks) {
        let _contractchunks = await getChunk(compressChunk.result, transactionSizeLimit);
        const chunkObj = {
            text_list: _contractchunks,
            method: compressChunk.method,//offset
        }
        await totalChunks.push(chunkObj);
        chunkSize += _contractchunks.length;
    }
    return {
        chunkList: totalChunks,
        chunkSize: chunkSize,
        merkleRoot: merkleRoot,
    };
}

interface AsciiArt {
    result: string;
    width: number;
}

async function OnChainCodeIn(asciiArt: AsciiArt) {

    try {

        const handle = "anonymous"; // edit with twitter api

        let chunkObj = await _makeAsciiChunks(asciiArt.result, asciiArt.width);
        const chunkList = chunkObj.chunkList;
        const chunkSize = chunkObj.chunkSize;
        const merkleRoot = chunkObj.merkleRoot;
        const offset = merkleRoot;

        const dataType = "image";
        console.log("Chunk size: ", chunkSize);

        return await makeAsciiTransactions(chunkList, handle, dataType, offset);


    } catch (error) {
        console.error("Error signing or sending transaction: ", error);
    }

}
async function onChainTextIn(data:string, handle: string) {
    const chunkList = await getChunk(data, transactionSizeLimit);
    const merkleRoot = await makeMerkleRootFromServer(chunkList);
    //you can adjust your type for binary data.. etc but you need to change your site's function.
    console.log("Chunk size: ", chunkList.length + 1);
    return await makeTextTransactions(chunkList, handle, "text", merkleRoot);
}


async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function naturalSort(files: string[]): string[] {
    return files.sort((a, b) => {
        const aMatch = a.match(/\d+/);
        const bMatch = b.match(/\d+/);

        const aNum = aMatch ? parseInt(aMatch[0], 10) : 0;
        const bNum = bMatch ? parseInt(bMatch[0], 10) : 0;

        return aNum - bNum || a.localeCompare(b);
    });
}

async function fetchDataSignatures(address: string, max = 475) {

    try {
        const DBPDA = new PublicKey(address);

        const connection = new Connection(network, 'confirmed');

        const signaturesInfo = await connection.getSignaturesForAddress(DBPDA, {
            limit: max,
        });
        const signatures = signaturesInfo.map(info => info.signature);

        return signatures;

    } catch (error) {
        console.error("Error fetching signatures:", error);
        return [];
    }
}
async function dataValidationForText(folderPath: string) {
    let notFind = [];
    const files = fs.readdirSync(folderPath); // 폴더의 파일 목록 읽기
    const sortedFiles = naturalSort(files); // 파일명 자연 정렬
    const totalFiles = sortedFiles.length;
    let successCount = 0;
    const userKey = keypair.publicKey;
    const DBPDA = await getDBPDA(userKey.toString());
    let onChainMerkleRoot = ""
    const onChainDbPdaData = await fetchDataSignatures(DBPDA);

    const signatures = onChainDbPdaData.reverse().slice(1);

    for (let i = 0; i < totalFiles; i++) {
        const file = sortedFiles[i];
        const filePath = path.join(folderPath, file);

        if (!fs.statSync(filePath).isFile()) {
            console.log(`Skipping non-file: ${file}`);
            continue;
        }
        const data = fs.readFileSync(filePath, 'utf8'); // 'utf8'로 인코딩 설정
        if (data != null) {
            console.log(`Processing ${i + 1}/${totalFiles}: ${file}`);

            const chunkList = await getChunk(data, transactionSizeLimit);
            const merkleRoot = await makeMerkleRootFromServer(chunkList);


             onChainMerkleRoot = await bringOffset(signatures[successCount]);
            //we save merkle root in offset, bring on-chain merkle root here

            console.log("merkleRoot:" + merkleRoot + "," + "onChainMerkleRoot: " + onChainMerkleRoot)

            if (merkleRoot == onChainMerkleRoot) {
                console.log(`Data is Same. ${successCount}/${totalFiles} files processed successfully.`);
                successCount++;
            } else {
                console.log(`not found`, filePath); //333.png is missed lets see
                notFind.push(filePath);
            }
        }else{
            console.log(`not found from local`, filePath);
            notFind.push(filePath);
        }
    }
    if(notFind.length > 0) {
        console.log(`this file not found: ${notFind}`);
    }else{
        console.log(`Every data is saved`);
    }

}

async function dataValidation(folderPath: string) {
    try {
        let notFind = []
        const files = fs.readdirSync(folderPath);
        const sortedFiles = naturalSort(files);
        const totalFiles = sortedFiles.length;
        let successCount = 0;
        const userKey = keypair.publicKey;
        const DBPDA = await getDBPDA(userKey.toString());

        const onChainDbPdaData = await fetchDataSignatures(DBPDA);

        const signatures = onChainDbPdaData.reverse().slice(1);


        let signatureIndex = 0
        for (let i = 0; i < totalFiles; i++) {
            const file = sortedFiles[i];
            const filePath = path.join(folderPath, file);

            if (!fs.statSync(filePath).isFile()) {
                console.log(`Skipping non-file: ${file}`);
                continue;
            }
            console.log(`Processing ${i + 1}/${totalFiles}: ${file}`);

            const image = await imgToAsciiArt(filePath);
            const asciiArt: AsciiArt = {
                result: image.result,
                width: image.width,
            };

            let innerOffset = "[ width: " + asciiArt.width.toString() + " ]"
            let full_msg = innerOffset + asciiArt.result;
            const textChunks = await getChunk(full_msg, sizeLimitForSplitCompression);

            const merkleRoot = await makeMerkleRootFromServer(textChunks); // make merkle root with image
            let onChainMerkleRoot = await bringOffset(signatures[successCount]);
            //we save merkle root in offset, bring on-chain merkle root here

            console.log("merkleRoot:" + merkleRoot + "," + "onChainMerkleRoot: " + onChainMerkleRoot)

            if (merkleRoot == onChainMerkleRoot) {
                console.log(`Data is Same. ${successCount}/${totalFiles} files processed successfully.`);
            successCount++;
            } else {
                console.log(`not found`, filePath); //333.png is missed lets see
                notFind.push(filePath);
            }
        }
        if(notFind.length > 0) {
            console.log(`this file not found: ${notFind}`);
        }else{
            console.log(`Every data is saved`);
        }

    } catch (error) {
        console.error("Error validation:", error);
    }

}

async function processImagesInFolder(folderPath: string) {
    try {
        const files = fs.readdirSync(folderPath); // 폴더의 파일 목록 읽기
        const sortedFiles = naturalSort(files); // 파일명 자연 정렬
        const totalFiles = sortedFiles.length;
        let successCount = 0;

        for (let i = 0; i < totalFiles; i++) {
            const file = sortedFiles[i];
            const filePath = path.join(folderPath, file);

            if (!fs.statSync(filePath).isFile()) {
                console.log(`Skipping non-file: ${file}`);
                continue;
            }

            try {
                console.log(`Processing ${i + 1}/${totalFiles}: ${file}`);
                const image = await imgToAsciiArt(filePath);

                const asciiArt: AsciiArt = {
                    result: image.result,
                    width: image.width,
                };

                const result = await OnChainCodeIn(asciiArt);
                if (result == false) {
                    console.log("false on trx");
                    return false;
                }
                console.log(`Processed ${file} - DB Trx Result:`, result);
                successCount++;
            } catch (error) {
                console.error(`Error processing ${file}:`, error);
                return false;
            }

            console.log(`${i + 1}/${totalFiles} completed - ${successCount} success`);
            await sleep(3000); // 3초 대기
        }

        console.log(`Processing complete. ${successCount}/${totalFiles} files processed successfully.`);
    } catch (error) {
        console.error("Error reading folder:", error);
    }
}

async function processMetaDataInFolder(folderPath: string) {
    try {
        const files = fs.readdirSync(folderPath);
        const sortedFiles = naturalSort(files);
        const totalFiles = sortedFiles.length;
        let successCount = 0;

        for (let i = 0; i < totalFiles; i++) {
            const file = sortedFiles[i];
            const filePath = path.join(folderPath, file);

            if (!fs.statSync(filePath).isFile()) {
                console.log(`Skipping non-file: ${file}`);
                continue;
            }
            try {
                const data = fs.readFileSync(filePath, 'utf8'); // 'utf8'로 인코딩 설정
                if (data != null) {
                    console.log(`Processing ${i + 1}/${totalFiles}: ${file}`);

                    const result = await onChainTextIn(data,"IQ6900");

                    if (result == "null") {
                        console.log("false on trx");
                        return false;
                    }
                    console.log(`Processed ${file} - DB Trx Result:`, result);
                    successCount++;
                }else{
                    console.log("No Data");
                    return false;
                }
            } catch (error) {
                console.error(`Error processing ${file}:`, error);
                return false;
            }

            console.log(`${i + 1}/${totalFiles} completed - ${successCount} success`);
            await sleep(3000); // 3초 대기
        }

        console.log(`Processing complete. ${successCount}/${totalFiles} files processed successfully.`);
        return true;
    } catch (error) {
        console.error("Error reading folder:", error);
    }
}


//--------------------------Example Code--------------------------------

async function run() {
    // const signatures =  await onChainTextIn("your data","your handle");
    // console.log("signatures",signatures);

    const result = await getTransactionResult("2cJnqQZ3WwswYLSWwLCjjw9nvRP3gs8P9yNMqikoj9rjjEWbpgsG7FH3ms41Cqzn8pCJGs4mm4H6R3xMw4aZneR1")
    console.log("result",result);
}
run()

