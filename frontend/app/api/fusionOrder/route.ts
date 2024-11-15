import { NextRequest, NextResponse } from "next/server"
import { uint8ArrayToHex } from "@1inch/byte-utils"
import { HashLock, PresetEnum, SDK } from "@1inch/cross-chain-sdk"
import { randomBytes } from "crypto";


function getRandomBytes32(): string {
  return uint8ArrayToHex(randomBytes(32))
}
export async function POST(req: NextRequest) {


  try {
    const {
      // sourceChain,
      // destinationChain,
      // srcTokenAddress,
      // dstTokenAddress,
      // amount,
      // walletAddress,
      // client,
      pvd
    } = await req.json();

    // console.log(client, "client");

    // Ensure the client is a valid provider conforming to EIP-1193
    // const provider = new Web3(client);


    // // const blockprovider = new Web3ProviderConnector(provider);
    // // Creating Web3ProviderConnector with the validated provider

    // console.log(provider, "provider");


    // const makerPrivateKey = "0x";
    // const makerAddress = "0x...";

    // const pvtkey = new PrivateKeyProviderConnector(makerPrivateKey, client);

    

    const sdk = new SDK({
      url: "https://api.1inch.dev/fusion-plus",
      authKey: process.env.ONE_INCH,
      blockchainProvider: pvd,
    });

    const params = {
      // srcChainId: sourceChain,
      // dstChainId: destinationChain,
      // srcTokenAddress: srcTokenAddress,
      // dstTokenAddress: dstTokenAddress,
      // amount: amount,
      // enableEstimate: true,
      amount: '100000000000000000',
      srcChainId: 56,
      dstChainId: 137,
      enableEstimate: true,
      srcTokenAddress: '0xfb6115445bff7b52feb98650c87f44907e58f802', // USDT  
      dstTokenAddress: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', // BNB  
      walletAddress: '0x9452BCAf507CD6547574b78B810a723d8868C85a'
    };

    const quote = await sdk.getQuote(params);
  

    console.log(quote, "quote");

    const preset = PresetEnum.fast

    // const secretsCount = q?.getPreset().secretsCount;

    // const secrets = Array.from({ length: secretsCount }).map(() =>
    //   getRandomBytes32()
    // );
    // const secretHashes = secrets.map((x) => HashLock.hashSecret(x));

    // const hashLock =
    //   secretsCount === 1
    //     ? HashLock.forSingleFill(secrets[0])
    //     : HashLock.forMultipleFills(
    //       secretHashes.map((secretHash, i) =>
    //         solidityPackedKeccak256(
    //           ["uint64", "bytes32"],
    //           [i, secretHash.toString()]
    //         )
    //       ) as (string & {
    //         _tag: "MerkleLeaf";
    //       })[]
    //     );

    // let placeSuccess = false;

    // const secrets = Array.from({
    //   length: quote.presets[preset].secretsCount
    // }).map(() => '0x' + randomBytes(32).toString('hex'))


    const secretsCount = quote?.getPreset().secretsCount;

    const secrets = Array.from({ length: secretsCount }).map(() =>
      getRandomBytes32()
    );

    console.log("Secrets ", secrets)


    const hashLock =
      secrets.length === 1
        ? HashLock.forSingleFill(secrets[0])
        : HashLock.forMultipleFills(HashLock.getMerkleLeaves(secrets))

    const secretHashes = secrets.map((s) => HashLock.hashSecret(s))

    const source = 'sdk-tutorial'

    // create order  
    const { hash, quoteId, order } = await sdk.createOrder(quote, {
      walletAddress: '0x9452BCAf507CD6547574b78B810a723d8868C85a',
      hashLock,
      preset,
      source,
      secretHashes
    })
    console.log({ hash }, 'order created')

    // submit order  
    const _orderInfo = await sdk.submitOrder(
      quote.srcChainId,
      order,
      quoteId,
      secretHashes
    )
    console.log({ hash }, 'order submitted')
    console.log({ _orderInfo }, '_orderInfo')


    // const place = await sdk
    //   .placeOrder(q, {
    //     walletAddress: walletAddress,
    //     hashLock,
    //     secretHashes,
    //     // fee is an optional field
    //     // fee: {
    //     //   takingFeeBps: 100, // 1% as we use bps format, 1% is equal to 100bps
    //     //   takingFeeReceiver: "0x0000000000000000000000000000000000000000", //  fee receiver address
    //     // },
    //   })
    //   .then((orderInfo) => {
    //     console.log("Order placed", orderInfo);

    //     placeSuccess = true;
    //   })
    //   .catch((error) => {
    //     console.error("Failed to place order", error);
    //   });

    // console.log('Order placed:', placeSuccess ? 'Success' : 'Failed');

    return NextResponse.json({ result: 'Order placed successfully' }, { status: 200 });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
