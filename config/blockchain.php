<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Blockchain Network Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the configuration for connecting to the blockchain network
    | and interacting with smart contracts.
    |
    */

    // Network configuration
    'network' => env('BLOCKCHAIN_NETWORK', 'sepolia'),
    'node_url' => env('BLOCKCHAIN_NODE_URL', 'https://sepolia.infura.io/v3/your-project-id'),
    'chain_id' => env('BLOCKCHAIN_CHAIN_ID', 11155111), // Sepolia chain ID

    // Contract configuration
    'contract_address' => env('BLOCKCHAIN_CONTRACT_ADDRESS', '0x9F14abd0c83a1e95E52CBB927BD009B04D46e800'),
    
    // Account configuration
    'owner_address' => env('BLOCKCHAIN_OWNER_ADDRESS'),
    'private_key' => env('BLOCKCHAIN_PRIVATE_KEY'),
]; 