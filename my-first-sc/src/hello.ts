import {
  bytesToStr,
  SmartContract,
  JsonRpcProvider,
  Args,
} from '@massalabs/massa-web3';
import 'dotenv/config';

// Paste the address of the deployed contract here
const CONTRACT_ADDR = 'AS12SSapyf37tsZWgYH6zxSQbhyrsiXaJaje2QSkg6hMqHpvaMpsm';

// Here we only use the read method of the contract so we don't need an account
// provider will be a JsonRpcPublicProvider instance
const provider = JsonRpcProvider.buildnet();

const payStream = new SmartContract(provider, CONTRACT_ADDR);

const messageBin = await payStream.read('getStreamLength');
console.log(`Message in bytes: ${messageBin.value}`);

// deserialize message
const message = bytesToStr(messageBin.value);



console.log(`Received from the contract: ${message}`);


// Test if the contract is working by checking if getStreamInfo returns data for non-existent streams
console.log("Testing contract functionality...");

// Test with a non-existent stream to see what the contract returns
try {
  const testArgs = new Args().addString("999"); // Non-existent stream
  const testStream = await payStream.read('getStreamInfo', testArgs);
  console.log("Test stream 999 response:", testStream.value);
  console.log("Test stream 999 length:", testStream.value.length);
} catch (error) {
  console.log("Test stream 999 error:", error);
}

// Check if the contract address is correct
console.log("Contract address:", CONTRACT_ADDR);

// Try to call a simple function to verify the contract is accessible
let lengthStr = "0";
try {
  const lengthResult = await payStream.read('getStreamLength');
  console.log("getStreamLength result:", lengthResult.value);
  lengthStr = bytesToStr(lengthResult.value);
  console.log("Stream length as string:", lengthStr);
} catch (error) {
  console.log("getStreamLength error:", error);
}

// Test if we can create a stream and then read it
console.log("\nTesting stream creation and reading...");

// First, let's check what the current stream length is
console.log("Current stream length:", lengthStr);

// Try to read stream 1 with more detailed logging
try {
  const args = new Args().addString("1");
  console.log("Calling getStreamInfo with stream ID 1...");
  const stream = await payStream.read('getStreamInfo', args);
  console.log("Raw response:", stream.value);
  console.log("Response length:", stream.value.length);

  if (stream.value.length > 0) {
    console.log("Stream 1 has data, parsing...");
    const streamData = new Args(stream.value);
    const payer = streamData.nextString();
    console.log("Payer:", payer);
  } else {
    console.log("Stream 1 has no data");
  }
} catch (error) {
  console.log("Error reading stream 1:", error);
}

// Try with .0 suffix
try {
  const args = new Args().addString("1.0");
  console.log("Calling getStreamInfo with stream ID 1.0...");
  const stream = await payStream.read('getStreamInfo', args);
  console.log("Stream 1.0 response length:", stream.value.length);

  if (stream.value.length > 0) {
    console.log("Stream 1.0 has data!");
    const streamData = new Args(stream.value);
    const payer = streamData.nextString();
    console.log("Stream 1.0 Payer:", payer);
  } else {
    console.log("Stream 1.0 has no data");
  }
} catch (error) {
  console.log("Error reading stream 1.0:", error);
}

// Try stream 2.0
try {
  const args = new Args().addString("2.0");
  console.log("Calling getStreamInfo with stream ID 2.0...");
  const stream = await payStream.read('getStreamInfo', args);
  console.log("Stream 2.0 response length:", stream.value.length);

  if (stream.value.length > 0) {
    console.log("Stream 2.0 has data!");
    const streamData = new Args(stream.value);
    const payer = streamData.nextString();
    const payee = streamData.nextString();
    const amount = streamData.nextString();
    const interval = streamData.nextString();
    const status = streamData.nextString();
    const nextPaymentAt = streamData.nextString();

    console.log("Stream 2.0 complete data:");
    console.log("Payer:", payer);
    console.log("Payee:", payee);
    console.log("Amount:", amount);
    console.log("Interval:", interval);
    console.log("Status:", status);
    console.log("NextPaymentAt:", nextPaymentAt);
  } else {
    console.log("Stream 2.0 has no data");
  }
} catch (error) {
  console.log("Error reading stream 2.0:", error);
}

// Also try stream 1.0 to see if it has data
try {
  const args = new Args().addString("1.0");
  console.log("Calling getStreamInfo with stream ID 1.0...");
  const stream = await payStream.read('getStreamInfo', args);
  console.log("Stream 1.0 response length:", stream.value.length);

  if (stream.value.length > 0) {
    console.log("Stream 1.0 has data!");
    const streamData = new Args(stream.value);
    const payer = streamData.nextString();
    const payee = streamData.nextString();
    const amount = streamData.nextString();
    const interval = streamData.nextString();
    const status = streamData.nextString();
    const nextPaymentAt = streamData.nextString();

    console.log("Stream 1.0 complete data:");
    console.log("Payer:", payer);
    console.log("Payee:", payee);
    console.log("Amount:", amount);
    console.log("Interval:", interval);
    console.log("Status:", status);
    console.log("NextPaymentAt:", nextPaymentAt);
  } else {
    console.log("Stream 1.0 has no data");
  }
} catch (error) {
  console.log("Error reading stream 1.0:", error);
}

try {
  const args = new Args().addString("3.0");
  console.log("Calling getStreamInfo with stream ID 3.0...");
  const stream = await payStream.read('getStreamInfo', args);
  console.log("Stream 3.0 response length:", stream.value.length);

  if (stream.value.length > 0) {
    console.log("Stream 3.0 has data!");
    const streamData = new Args(stream.value);
    const payer = streamData.nextString();
    const payee = streamData.nextString();
    const amount = streamData.nextString();
    const interval = streamData.nextString();
    const status = streamData.nextString();
    const nextPaymentAt = streamData.nextString();

    console.log("Stream 3.0 complete data:");
    console.log("Payer:", payer);
    console.log("Payee:", payee);
    console.log("Amount:", amount);
    console.log("Interval:", interval);
    console.log("Status:", status);
    console.log("NextPaymentAt:", nextPaymentAt);
  } else {
    console.log("Stream 3.0 has no data");
  }
} catch (error) {
  console.log("Error reading stream 3.0:", error);
}