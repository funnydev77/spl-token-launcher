import { 
    createFungible,
    mplTokenMetadata
} from '@metaplex-foundation/mpl-token-metadata';
import {
    createTokenIfMissing,
    findAssociatedTokenPda,
    getSplAssociatedTokenProgramId,
    mintTokensTo,
    mplToolbox
} from '@metaplex-foundation/mpl-toolbox';
import {
    generateSigner,
    percentAmount,
    createGenericFile,
    signerIdentity,
    sol,
    keypairIdentity
} from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys';
import { base58 } from '@metaplex-foundation/umi/serializers';
import fs from 'fs';
import { config } from 'dotenv';

config();

const createAndMintTokens = async (amount, decimals) => {
    /*** Creating a new wallet */
    // const umi = createUmi('https://api.devnet.solana.com')
    //     .use(mplTokenMetadata())
    //     .use(irysUploader());

    // const signer = generateSigner(umi);
    // umi.use(signerIdentity(signer));

    /*** Use an Existing wallet stored locally */
    // const umi = createUmi('https://api.devnet.solana.com')
    //     .use(mplTokenMetadata())
    //     .use(mplToolbox())
    //     .use(irysUploader());

    // // Convert your walletFile onto a keypair.
    // let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(base58.serialize(process.env.PK)));

    // // Load the keypair into umi.
    // umi.use(keypairIdentity(keypair));

    // console.log('Airdrop 1 SOL to the umi identity');
    // await umi.rpc.airdrop(umi.identity.publicKey, sol(1));

    // const imageFile = fs.readFileSync("./img.png");
    // const umiImageFile = createGenericFile(imageFile, "img.png", {
    //     tags: [
    //         {
    //             name: "Content-Type",
    //             value: "image/png"
    //         }
    //     ]
    // });

    // console.log("Uploading image to Arweave via Irys");
    // const imageUri = await umi.uploader.upload([umiImageFile]).catch((err) => {
    //     throw new Error(err);
    // });
 
    // console.log(imageUri[0]);

    const imageUri = await uploadImage();

    const metadata = {
        name: "The NJ Coin",
        symbol: "NJC",
        description: "The NJ Coin is a token created on the Solana blockchain",
        image: imageUri
    };

    
    console.log("Uploading metadata to Arweave via Irys");
    // const metadataUri = await umi.uploader.uploadJson(metadata).catch((err) => {
    //     throw new Error(err);
    // });
        
    const metadataUri = await getMetadataUri(metadata);
   
    // Creating the mintIx
    const mintSigner = generateSigner(umi);
    const createFungibleIx = createFungible(umi, {
        mint: mintSigner,
        name: metadata.name,
        uri: metadataUri,
        sellerFeeBasisPoints: percentAmount(0),
        decimals: decimals
    });

    const createTokenIx = createTokenIfMissing(umi, {
        mint: mintSigner.publicKey,
        owner: umi.identity.publicKey,
        ataProgram: getSplAssociatedTokenProgramId(umi)
    });

    const mintTokensIx = mintTokensTo(umi, {
        mint: mintSigner.publicKey,
        token: findAssociatedTokenPda(umi, {
            mint: mintSigner.publicKey,
            owner: umi.identity.publicKey
        }),
        amount: BigInt(amount)
    });

    console.log("Sending transaction");
    const tx = await createFungibleIx
        .add(createTokenIx)
        .add(mintTokensIx)
        .sendAndConfirm(umi);

    const signature = base58.deserialize(tx.signature)[0];

    console.log('\nTransaction Complete')
    console.log('View Transaction on Solana Explorer')
    console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`)
    console.log('View Token on Solana Explorer')
    console.log(`https://explorer.solana.com/address/${mintSigner.publicKey}?cluster=devnet`)
}

const airdropSol = async (umi, amount) => {
    await umi.rpc.airdrop(umi.identity.publicKey, sol(amount));
}

const generateNewWallet = async () => {
    const umi = createUmi('https://api.devnet.solana.com')
        .use(mplTokenMetadata())
        .use(irysUploader());

    const signer = generateSigner(umi);
    umi.use(signerIdentity(signer));

    return umi;
}

const useExistWallet = async () => {
    const umi = createUmi('https://api.devnet.solana.com')
        .use(mplTokenMetadata())
        .use(mplToolbox())
        .use(irysUploader());

    // Convert your walletFile onto a keypair.
    let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(base58.serialize(process.env.PK)));

    // Load the keypair into umi.
    umi.use(keypairIdentity(keypair));

    return umi;
}

const uploadImage = async (path = './uploads/image/bg-coin.png') => {
    const imageFile = fs.readFileSync(path);
    const umiImageFile = createGenericFile(imageFile, "img.png", {
        tags: [
            {
                name: "Content-Type",
                value: "image/png"
            }
        ]
    });

    console.log("Uploading image to Arweave via Irys");
    const imageUri = await umi.uploader.upload([umiImageFile]).catch((err) => {
        throw new Error(err);
    });
 
    console.log('imageUri: ', imageUri);

    return imageUri;
}

const getMetadataUri = async (metadata) => {
    const uri = await umi.uploader.uploadJson(metadata).catch((err) => {
        throw new Error(err);
    });

    return uri;
}

const umi = await useExistWallet();

createAndMintTokens(1000000000, 0);