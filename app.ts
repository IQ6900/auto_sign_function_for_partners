import {Keypair, Transaction,SystemProgram, PublicKey,Connection} from "@solana/web3.js";
import bs58 from 'bs58';

const anchor = require('@coral-xyz/anchor');
const express = require('express');
const cors = require('cors');
const idl = require("../idl.json");  // Make sure this is the correct path to your IDL file
const network ='https://api.mainnet-beta.solana.com'
const iqHost = "https://solanacontractapi.uc.r.appspot.com";
const web3 = anchor.web3;

const expected_receiver =  new PublicKey("GbgepibVcKMbLW6QaFrhUGG34WDvJ2SKvznL2HUuquZh");
const secretKeyBase58 = "personalKeyFromPhantom"; //paste your transaction
const secretKey = bs58.decode(secretKeyBase58);
const keypair = Keypair.fromSecretKey(secretKey);
const chunkSize = 850;

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

async function txSend(tx: Transaction): Promise<string> {
    const connection = new Connection(network, 'confirmed');
    const { blockhash } = await connection.getRecentBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = keypair.publicKey;
    tx.sign(keypair);
    const txid =  await web3.sendAndConfirmTransaction(connection, tx, [keypair]);

    console.log('Transaction sent, txid:', txid);
    return txid;

}

async function createSendTransaction(code:string, before_tx:string, method:number, decode_break:number) {
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
        return txSend(tx);
    } catch (error) {
        console.error(error);
        throw new Error("Failed to create instruction: " + error);
    }
}

async function createDbCodeTransaction(handle:string, tail_tx:string, type:string, offset:string) {
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
        return txSend(tx);
    } catch (error) {
        throw new Error("Failed to create instruction: " + error);
    }
}

async function getChunk(textData:string): Promise<string[]>  {
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
async function makeTextTransactions(chunkList:Array<string>, handle:string, type:string, offset:string) {
    let beforeHash: string  = "Genesis";
    let method = 0;
    let decode_break = 0;

    for (let text of chunkList) {
        beforeHash = await createSendTransaction(text,beforeHash,method,decode_break)
    }
    const resultHash = await createDbCodeTransaction(handle,beforeHash,type,offset)
    return resultHash;
}


// //--------------------------Example Code--------------------------------
async function run() {
    const textdata = "longtext  longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext longtext "
    const chunkList = await getChunk(textdata)
    const result = await makeTextTransactions(chunkList, "binary", "text", "no offset")
    console.log("Result Transaction: "+result);
}
run()

