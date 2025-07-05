import {
  bytesToStr,
  SmartContract,
  JsonRpcProvider,
} from '@massalabs/massa-web3';
import 'dotenv/config';

// Paste the address of the deployed contract here
const CONTRACT_ADDR = 'AS1v9uvjX6FeFaUhhC39Righz1vDeSYxmawxA2qQ9BYLYN6PGHtx';

// Here we only use the read method of the contract so we don't need an account
// provider will be a JsonRpcPublicProvider instance
const provider = JsonRpcProvider.buildnet();

const payStream = new SmartContract(provider, CONTRACT_ADDR);

const messageBin = await payStream.read('getStreamLength');
console.log(`Message in bytes: ${messageBin.value}`);

// deserialize message
const message = bytesToStr(messageBin.value);

console.log(`Received from the contract: ${message}`);
