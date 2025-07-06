import { Context, generateEvent, Storage, transferCoins, Address } from "@massalabs/massa-as-sdk";
import { Args, stringToBytes } from "@massalabs/as-types";


const STREAM_LENGTH_KEY = "stream_length";

/**
 * This function is meant to be called only one time: when the contract is deployed.
 *
 * @param binaryArgs - Arguments serialized with Args
 */

export function constructor(binaryArgs: StaticArray<u8>): void {
  // This line is important. It ensures that this function can't be called in the future.
  // If you remove this check, someone could call your constructor function and reset your smart contract.
  assert(Context.isDeployingContract());

  const argsDeser = new Args(binaryArgs);
  const streamLength = <u64>parseInt(argsDeser.nextU64().expect('Number argument is missing or invalid').toString());
  Storage.set(STREAM_LENGTH_KEY, (streamLength + 1).toString());
  generateEvent(`Constructor called with name ${streamLength}`);
}


export function getStreamLength(_: StaticArray<u8>): StaticArray<u8> {
  assert(Storage.has(STREAM_LENGTH_KEY), 'Stream length is not set');
  const streamLength = Storage.get(STREAM_LENGTH_KEY);
  generateEvent(streamLength);
  // <u64>parseInt(Storage.get(STREAM_LENGTH_KEY));
  return stringToBytes(streamLength);
}


// //////////////////////////////////////////////////////////////
// /////////////////////////Stream//////////////////////////////
// //////////////////////////////////////////////////////////////


function key(streamId: string, field: string): string {
  return `${streamId}_${field}`;
}


// Stream status values 
const STATUS_ACTIVE = 'active';
const STATUS_PAUSED = 'paused';
const STATUS_CANCELED = 'canceled';

export function createStream(binaryArgs: StaticArray<u8>): void {

  const streamLength = Storage.get(STREAM_LENGTH_KEY);
  const streamIds = (parseInt(streamLength) + 1).toString();
  const args = new Args(binaryArgs);

  const payer = Context.caller();
  const payee = args.nextString().expect('payee is missing');
  const amount = args.nextU64().expect('amount is missing');
  const interval = args.nextU64().expect('interval is missing');
  const now = Context.timestamp();

  assert(!Storage.has(key(streamIds, "payer")), 'Stream already exists');

  Storage.set(key(streamIds, "payer"), payer.toString());
  Storage.set(key(streamIds, "payee"), payee);
  Storage.set(key(streamIds, "interval"), interval.toString());
  Storage.set(key(streamIds, "status"), STATUS_ACTIVE);
  Storage.set(key(streamIds, "amount"), amount.toString());
  Storage.set(key(streamIds, "createdAt"), now.toString());
  Storage.set(key(streamIds, "nextPaymentAt"), (now + interval).toString());

  // Update the stream length counter
  Storage.set(STREAM_LENGTH_KEY, streamIds);

  generateEvent(`Stream created: ${streamIds}`);
}


/**
 * Execute payment for a specific stream
 */

export function executePayment(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const streamId = args.nextString().expect('streamId is missing');

  const status = Storage.get(key(streamId, "status"));
  if (status != STATUS_ACTIVE) return;

  const now = Context.timestamp();

  const nextTime = <u64>parseInt(Storage.get(key(streamId, "nextPaymentAt")));
  if (now < nextTime) return;

  const payee = Storage.get(key(streamId, "payee"));

  const amount = <u64>parseInt(Storage.get(key(streamId, "amount")));

  transferCoins(new Address(payee), amount);

  const interval = <u64>parseInt(Storage.get(key(streamId, "interval")));
  Storage.set(key(streamId, "nextPaymentAt"), (now + interval).toString());

  generateEvent(`Payment executed for stream: ${streamId} at ${now}`);
}

/**
 * Pause a stream (only payer can do this)
 */
export function pauseStream(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);

  const streamId = args.nextString().expect('streamId is missing');

  assert(Context.caller().toString() == Storage.get(key(streamId, "payer")), 'Only payer can pause');

  Storage.set(key(streamId, "status"), STATUS_PAUSED);
  generateEvent(`Stream paused: ${streamId}`);
}

/**
 * Resume a stream (only payer can do this)
 */
export function resumeStream(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const streamId = args.nextString().expect('streamId is missing');
  const payer = Storage.get(key(streamId, "payer"));

  assert(Context.caller().toString() == payer, "only payer can resume");

  Storage.set(key(streamId, "status"), STATUS_ACTIVE);
  generateEvent(`Stream resumed: ${streamId}`);
}

/**
 * Cancel a stream (only payer can do this)
 */
export function cancelStream(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const streamId = args.nextString().expect('streamId is missing');

  const payer = Storage.get(key(streamId, "payer"));
  assert(Context.caller().toString() == payer, 'Only payer can cancel');

  Storage.set(key(streamId, "status"), STATUS_CANCELED);
  generateEvent(`Stream cancelled: ${streamId}`);
}


/**
 * Get stream information
 */
export function getStreamInfo(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const streamId = args.nextString().expect('streamId is missing');

  // Check if the stream exists
  if (!Storage.has(key(streamId, "payer"))) {
    // Return empty data if stream doesn't exist
    return new Args().serialize();
  }

  const payer = Storage.get(key(streamId, "payer"));
  const payee = Storage.get(key(streamId, "payee"));
  const amount = Storage.get(key(streamId, "amount"));
  const interval = Storage.get(key(streamId, "interval"));
  const status = Storage.get(key(streamId, "status"));
  const nextPaymentAt = Storage.get(key(streamId, "nextPaymentAt"));

  return new Args()
    .add(payer)
    .add(payee)
    .add(amount)
    .add(interval)
    .add(status)
    .add(nextPaymentAt)
    .serialize();
}