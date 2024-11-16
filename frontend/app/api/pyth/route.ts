import { NextRequest, NextResponse } from "next/server";
import { PythHttpClient } from "@pythnetwork/client";
import { Connection, PublicKey } from "@solana/web3.js";

// Read environment variables
const PYTH_PROGRAM_KEY = process.env.PYTH_PROGRAM_KEY;
const SOLANA_RPC_URL = process.env.BASE_SEPOLIA_URL; // New environment variable for connection

export async function GET(req: NextRequest) {
  try {
    if (!PYTH_PROGRAM_KEY) {
      throw new Error("PYTH_PROGRAM_KEY is not defined in the environment variables.");
    }
    if (!SOLANA_RPC_URL) {
      throw new Error("BASE_SEPOLIA_URL is not defined in the environment variables.");
    }

    // Create a connection to the specified Solana cluster
    const connection = new Connection(SOLANA_RPC_URL);

    // Initialize the Pyth client
    const pythPublicKey = new PublicKey(PYTH_PROGRAM_KEY);
    const pythClient = new PythHttpClient(connection, pythPublicKey);

    // Fetch the price data from Pyth
    const data = await pythClient.getData();

    // Return the data as a JSON response
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching Pyth data:", error);
    return NextResponse.json({ error: "Failed to fetch Pyth data" }, { status: 500 });
  }
}
