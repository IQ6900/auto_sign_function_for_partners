import {Connection, PublicKey} from "@solana/web3.js";
const express = require('express');
const network ='https://api.mainnet-beta.solana.com' // change your rpc if you want to retry often
const iqHost = "https://solanacontractapi.uc.r.appspot.com";
const app = express();
app.use(express.json());

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

function convertTextToEmoji(text: string) {
    return text.replace(/\/u([0-9A-Fa-f]{4,6})/g, (match, code) => {
        return String.fromCodePoint(parseInt(code, 16));
    });
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

async function _getTransactionData(transactionData: {
    method: string,
    code: string,
    decode_break: number,
    before_tx: string
}) {
    if ('code' in transactionData) {
        const encodedChunk = {
            code: transactionData.code,
            method: transactionData.method,
            decode_break: transactionData.decode_break,
        };
        return {
            data: encodedChunk,
            before_tx: transactionData.before_tx,
        };

    } else {
        return {
            data: "fail",
            before_tx: "fail"
        };
    }
}

async function bringCommit_msg(dataTxid: string) {
    const txInfo = await getTransactionInfoOnServer(dataTxid);
    if (txInfo == undefined){
        return "null";
    }
    const type_field = txInfo.type_field;

    if (type_field === "json") {
        const offset = txInfo.offset;
        return offset.split("commit: ")[1];
    } else {
        return "null";
    }

}

async function bringCode(dataTxid: string) {
    let txInfo = await getTransactionInfoOnServer(dataTxid);

    const tail_tx = txInfo.tail_tx;
    const offset = txInfo.offset;
    const encodedChunks = []
    let before_tx = tail_tx;
    while (before_tx != "Genesis") {
        if (before_tx != undefined) {
            const chunk = await getTransactionInfoOnServer(before_tx);
            if (chunk == undefined) {
                console.log("No chunk found.");
                return {
                    json_data: "false",
                    commit_message: "false"
                };
            }

            let chunkData: any = await _getTransactionData(chunk);
            encodedChunks.push(chunkData.data.code);
            before_tx = chunkData.before_tx;
        } else {
            console.error("before data undefined")
            return {
                json_data: "false",
                commit_message: "false"
            };
        }
    }
    const textList = encodedChunks.reverse();
    const textData = textList.join();

    const commit_message = offset;

    const finalresult = convertTextToEmoji(textData);
    return {
        json_data: finalresult,
        commit_message: commit_message
    };
}

async function fetchAllSignatures(stringDBAddress: string) {
    const connection = new Connection(network, 'confirmed');
    const allSignatures = [];
    const dbAddress = new PublicKey(stringDBAddress);

    try {

        const signatures = await connection.getSignaturesForAddress(dbAddress, {
            limit: 30,
        });
        allSignatures.push(...signatures.map((sig) => sig.signature));

        return allSignatures;
    } catch (error) {
        console.error("Error fetching signatures:", error);
        return [];
    }
}

async function bringWalletsRecentJson(stringAddress: string) {

    const dbAddress = await getDBPDA(stringAddress);
    const signatures = await fetchAllSignatures(dbAddress)
    let commit = 'null'
    for (const signature of signatures) {
        commit = await bringCommit_msg(signature);
        if (commit != 'null') {
            return signature
        }
    }
    return 'null';
}

async function bringAgentWithWalletAddress(stringAddress: string) {
    const recent = await bringWalletsRecentJson("FPSYQmFh1WhbrgNKoQCDBcrf3YLc9eoNCpTyAjHXrf1c");
    const result: any = await bringCode(recent);
    return result
}

//--------------------------Example Code--------------------------------
async function run() {
    const codedata: any = await bringAgentWithWalletAddress("FPSYQmFh1WhbrgNKoQCDBcrf3YLc9eoNCpTyAjHXrf1c");
    console.log("Result Transaction: " + codedata.json_data);
}
run()

