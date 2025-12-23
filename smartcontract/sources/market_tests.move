#[test_only]
module marketplace::digital_assets_tests {
    use std::signer;
    use aptos_framework::account;
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use aptos_framework::coin;
    use marketplace::digital_assets;

    /// Mock asset for testing
    struct MockNFT has key, store { id: u64 }

    #[test(marketplace_owner = @0x1, seller = @0x123, buyer = @0x456, aptos_framework = @0x1)]
    fun test_marketplace_lifecycle(
        marketplace_owner: &signer,
        seller: &signer,
        buyer: &signer,
        aptos_framework: &signer
    ) {
        // 1. Setup Accounts and Coins
        let seller_addr = signer::address_of(seller);
        let buyer_addr = signer::address_of(buyer);
        account::create_account_for_test(seller_addr);
        account::create_account_for_test(buyer_addr);

        // Initialize APT coin and mint 1000 to the buyer
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);
        coin::register<AptosCoin>(buyer);
        coin::register<AptosCoin>(seller);
        let coins = coin::mint<AptosCoin>(1000, &mint_cap);
        coin::deposit(buyer_addr, coins);

        // 2. Seller lists an item
        let nft = MockNFT { id: 777 };
        digital_assets::list_item<MockNFT>(seller, nft, 500);

        // 3. Buyer purchases the item
        digital_assets::buy_item<MockNFT>(buyer, seller_addr, 0);

        // 4. Verify Final State
        // Buyer should have 500 coins left
        assert!(coin::balance<AptosCoin>(buyer_addr) == 500, 1);
        // Seller should have 500 coins gained
        assert!(coin::balance<AptosCoin>(seller_addr) == 500, 2);

        // Clean up caps
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }
}