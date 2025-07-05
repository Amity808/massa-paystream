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

const byteCode = getScByteCode('build', 'main.wasm');

const byteCodeArray = new Uint8Array(getScByteCode('build', 'main.wasm'));

const name = 'Massa';
const constructorArgs = new Args().addU64(0n);

const contract = await SmartContract.deploy(
  provider,
  byteCodeArray,
  constructorArgs,
  { coins: Mas.fromString('0.01') },
);

console.log('Contract deployed at:', contract.address);

const events = await provider.getEvents({
  smartContractAddress: contract.address,
});

for (const event of events) {
  console.log('Event message:', event.data);
}
