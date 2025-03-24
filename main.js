import { 
    createFungible,
    mplTokenMetadata
} from '@metaplex-foundation/mpl-token-metadata';
import {
    createTokenIfMissing,
    findAssociatedTokenPda,
    getSplAssociatedTokenProgramId,
    mintTokensTo
} from '@metaplex-foundation/mpl-toolbox';
import {
    generateSigner,
    percentAmount,
    createGenericFile,
    signerIdentity,
    sol
} from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys';
import { base58 } from '@metaplex-foundation/umi/serializers';
import fs from 'fs';
import path from 'path';

const createAndMintTokens = async () => {
    
}

createAndMintTokens();