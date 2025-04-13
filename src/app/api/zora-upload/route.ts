import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { erc1155Abi } from "@/lib/abis/erc1155";

export async function POST(request: Request) {
  // Protect the route
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { ipfsUri, userAddress } = await request.json();

    if (!ipfsUri || !userAddress) {
      return NextResponse.json(
        { error: "Missing ipfsUri or userAddress" },
        { status: 400 },
      );
    }

    // Create wallet client with private key
    const account = privateKeyToAccount(
      process.env.PRIVATE_KEY as `0x${string}`,
    );
    const client = createWalletClient({
      account,
      chain: sepolia,
      transport: http(),
    });

    // Contract interaction
    const contractAddress = process.env.CONTRACT_ADDRESS as `0x${string}`;
    const mintTx = await client.writeContract({
      address: contractAddress,
      abi: erc1155Abi,
      functionName: "mint",
      args: [
        userAddress, // recipient address
        0, // token id (0 for new token)
        1, // amount to mint
        ipfsUri, // metadata URI
        "0x", // data (empty bytes)
      ],
    });

    return NextResponse.json({
      success: true,
      transactionHash: mintTx,
    });
  } catch (error) {
    console.error("Error minting token:", error);
    return NextResponse.json({ error: "Error minting token" }, { status: 500 });
  }
}
