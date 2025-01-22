import {Connection, Keypair, SystemProgram, Transaction} from "@solana/web3.js";
import bs58 from 'bs58';
import imgToAsciiArt from "./ascii_genetate"
import {compressText} from "./compress"

const anchor = require('@coral-xyz/anchor');
const express = require('express');
const cors = require('cors');
const idl = require("../idl.json");  // Make sure this is the correct path to your IDL file
const network = "https://mainnet.helius-rpc.com/?api-key=ab814e2b-59a3-4ca9-911a-665f06fb5f09"
const iqHost =  "https://solanacontractapi.uc.r.appspot.com";
const web3 = anchor.web3;

const secretKeyBase58 = "Your Secret Key"; //paste your transaction
const secretKey = bs58.decode(secretKeyBase58);
const keypair = Keypair.fromSecretKey(secretKey);
const transactionSizeLimit = 850;
const sizeLimitForSplitCompression = 10000;

const amountToSend = 0.003 * web3.LAMPORTS_PER_SOL;
const app = express();


app.use(express.json());


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

async function getMerkleRootFromServer(dataList: Array<string>) {
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

async function txSend(tx: Transaction): Promise<string> {
    const connection = new Connection(network, 'confirmed');
    const {blockhash} = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = keypair.publicKey;
    tx.sign(keypair);
    const txid = await web3.sendAndConfirmTransaction(connection, tx, [keypair]);

    console.log('Transaction sent, txid:', txid);
    return txid;

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

async function getChunk(textData: string , chunkSize:number): Promise<string[]> {
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
interface chunkObj  {
    text_list: Array<string>;
    method: number;
}
async function makeAsciiTransactions( chunkList: Array<chunkObj>, handle: string, type: string, offset: string) {
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
                alert("error on transaction");
                return false;
            }

        }
    }
     const tx =await createDbCodeTransaction(handle, beforeHash, type, offset);
    return await txSend(tx);
}


async function _makeAsciiChunks(asciiArt:string,width:number) {
    let textChunks = []
    let compressedChunks = []
    let totalChunks = []
    let chunkSize = 0;
    let innerOffset = "[ width: "+width.toString()+" ]"
    let full_msg= innerOffset+asciiArt;


    textChunks = await getChunk(full_msg, sizeLimitForSplitCompression);

    const merkleRoot = await getMerkleRootFromServer(textChunks);
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

async function OnChainCodeIn(asciiArt:AsciiArt) {

    try {

        const handle = "anonymous"; // edit with twitter api

        let chunkObj = await _makeAsciiChunks(asciiArt.result,asciiArt.width);
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

// //--------------------------Example Code--------------------------------
async function run() {
    const image = await imgToAsciiArt("./images/700.png");

    const asciiArt:AsciiArt ={
        result: image.result,
        width: image.width
    }

    const result = await OnChainCodeIn(asciiArt)
    console.log("Db Trx",result);
}

run()

