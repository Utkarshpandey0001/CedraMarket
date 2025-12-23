// 1. CHANGE THIS NAME TO MARKET_V2
module marketplace::market_v2 {
    use std::signer;
    use std::vector;
    use std::string::String;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;

    const E_LISTING_NOT_FOUND: u64 = 1;

    // Added drop and copy to fix the error in your screenshot
    struct MarketItem has key, store, drop, copy { 
        name: String, 
        id: u64 
    }

    struct Listing<T: key + store + drop + copy> has store, drop, copy {
        id: u64,
        asset: T,
        price: u64,
        seller: address,
    }

    struct Listings<T: key + store + drop + copy> has key {
        next_id: u64,
        items: vector<Listing<T>>,
    }

    public entry fun init_market<T: key + store + drop + copy>(admin: &signer) {
        move_to(admin, Listings<T> {
            next_id: 0,
            items: vector::empty(),
        });
    }

    public entry fun list_item_with_name(
        seller: &signer,
        name: String,
        price: u64
    ) acquires Listings {
        let asset = MarketItem { name, id: 0 };
        
        // FIX: Look for the 'Listings' box at the MARKETPLACE address, not the user's address.
        let listings = borrow_global_mut<Listings<MarketItem>>(@marketplace);

        let id = listings.next_id;
        listings.next_id = id + 1;

        vector::push_back(&mut listings.items, Listing {
            id,
            asset,
            price,
            seller: signer::address_of(seller),
        });
    }

    // Buy function now compiles because T has 'drop'
    public entry fun buy_item(
        buyer: &signer,
        listing_id: u64,
    ) acquires Listings {
        let listings = borrow_global_mut<Listings<MarketItem>>(@marketplace);
        let len = vector::length(&listings.items);
        let i = 0;
        while (i < len) {
            if (vector::borrow(&listings.items, i).id == listing_id) {
                let Listing { id: _, asset: _, price, seller } = vector::remove(&mut listings.items, i);
                coin::transfer<AptosCoin>(buyer, seller, price);
                return
            };
            i = i + 1;
        };
        abort E_LISTING_NOT_FOUND
    }
}