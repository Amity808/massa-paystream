import 'dotenv/config';
import {
  Account,
  Args,
  Mas,
  SmartContract,
  JsonRpcProvider,
} from '@massalabs/massa-web3';
import { getScByteCode } from './utils';

const account = await Account.fromEnv();
const provider = JsonRpcProvider.buildnet(account);

console.log('Deploying contract...');
console.log('Admin address will be:', account.address.toString());

const byteCode = getScByteCode('build', 'main.wasm');

const byteCodeArray = new Uint8Array(getScByteCode('build', 'main.wasm'));

const name = 'Massa';
const constructorArgs = new Args().addString(account.address.toString());

console.log('Note: Make sure you have at least 0.1 MAS for deployment + storage costs.');
console.log('Get test tokens from: https://faucet.massa.net/');

const contract = await SmartContract.deploy(
  provider,
  byteCodeArray,
  constructorArgs,
  { coins: Mas.fromString('0.1') },
);

console.log('Contract deployed at:', contract.address);

const events = await provider.getEvents({
  smartContractAddress: contract.address,
});

for (const event of events) {
  console.log('Event message:', event.data);
}

// Contract deployed at: AS1YGnZa9trz13AdDyZx2Gj49xmt4UgKzwP3kZEn73rAPb2ar3NS
// Event message: Carbon Credit Platform initialized with admin: AU1pucMsWWBjL6pKt4YTmRobWQJgZciHSNA6Hr5CrZcwTfm2RfzX