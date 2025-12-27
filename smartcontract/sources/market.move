// module marketplace::market_v6 { // <--- V6
//     use std::string::String;
//     use std::vector;
//     use std::signer;
//     use aptos_framework::coin;
//     use aptos_framework::aptos_coin::AptosCoin;

//     struct MarketItem has store, copy, drop {
//         name: String,
//         content_uri: String,
//         id: u64,
//     }

//     struct MyItems has key {
//         items: vector<MarketItem>
//     }

//     struct Listing has store, copy, drop {
//         id: u64,
//         asset: MarketItem,
//         price: u64,
//         seller: address,
//     }

//     struct Listings has key {
//         items: vector<Listing>,
//         next_id: u64,
//     }

//     public entry fun init_market(admin: &signer) {
//         let listings = Listings { items: vector::empty(), next_id: 0 };
//         move_to(admin, listings);
//     }

//     // 1. MINTING
//     public entry fun list_item_with_uri(
//         seller: &signer,
//         name: String,
//         content_uri: String,
//         price: u64
//     ) acquires Listings {
//         let listings = borrow_global_mut<Listings>(@marketplace);
//         let id = listings.next_id;
//         listings.next_id = id + 1;

//         let asset = MarketItem { name, content_uri, id };

//         vector::push_back(&mut listings.items, Listing {
//             id,
//             asset,
//             price,
//             seller: signer::address_of(seller),
//         });
//     }

//     // 2. BUYING (Atomic Swap)
//     public entry fun buy_item(buyer: &signer, listing_id: u64) acquires Listings, MyItems {
//         let listings = borrow_global_mut<Listings>(@marketplace);
//         let items = &mut listings.items;
        
//         let len = vector::length(items);
//         let i = 0;
        
//         while (i < len) {
//             let item = vector::borrow(items, i);
//             if (item.id == listing_id) {
//                 let listing = vector::remove(items, i);
                
//                 coin::transfer<AptosCoin>(buyer, listing.seller, listing.price);

//                 let buyer_addr = signer::address_of(buyer);
//                 if (!exists<MyItems>(buyer_addr)) {
//                     move_to(buyer, MyItems { items: vector::empty() });
//                 };
                
//                 let my_items = borrow_global_mut<MyItems>(buyer_addr);
//                 vector::push_back(&mut my_items.items, listing.asset);
//                 break
//             };
//             i = i + 1;
//         };
//     }

//     // 3. RESELLING (The New Logic)
//     public entry fun resell_item(seller: &signer, item_id: u64, price: u64) acquires MyItems, Listings {
//         let seller_addr = signer::address_of(seller);
//         let my_items = borrow_global_mut<MyItems>(seller_addr);
//         let items = &mut my_items.items;
        
//         let len = vector::length(items);
//         let i = 0;
        
//         while (i < len) {
//             let item = vector::borrow(items, i);
            
//             // Find the item in user's wallet
//             if (item.id == item_id) {
//                 // Remove from User's Wallet
//                 let asset = vector::remove(items, i);
                
//                 // Add back to Market Listings
//                 let listings = borrow_global_mut<Listings>(@marketplace);
//                 vector::push_back(&mut listings.items, Listing {
//                     id: asset.id, 
//                     asset,
//                     price,
//                     seller: seller_addr,
//                 });
//                 break
//             };
//             i = i + 1;
//         };
//     }
// }

module marketplace::market_v6 {
    use std::string::String;
    use std::vector;
    use std::signer;
    
    use cedra_framework::coin;
    use cedra_framework::cedra_coin::CedraCoin; 

    struct MarketItem has store, copy, drop {
        name: String,
        content_uri: String,
        id: u64,
    }

    struct MyItems has key {
        items: vector<MarketItem>
    }

    struct Listing has store, copy, drop {
        id: u64,
        asset: MarketItem,
        price: u64,
        seller: address,
    }

    struct Listings has key {
        items: vector<Listing>,
        next_id: u64,
    }

    public entry fun init_market(admin: &signer) {
        let listings = Listings { items: vector::empty(), next_id: 0 };
        move_to(admin, listings);
    }

    public entry fun list_item_with_uri(
        seller: &signer,
        name: String,
        content_uri: String,
        price: u64
    ) acquires Listings {
        let listings = borrow_global_mut<Listings>(@marketplace);
        let id = listings.next_id;
        listings.next_id = id + 1;

        let asset = MarketItem { name, content_uri, id };

        vector::push_back(&mut listings.items, Listing {
            id,
            asset,
            price,
            seller: signer::address_of(seller),
        });
    }

    public entry fun buy_item(buyer: &signer, listing_id: u64) acquires Listings, MyItems {
        let listings = borrow_global_mut<Listings>(@marketplace);
        let items = &mut listings.items;
        
        let len = vector::length(items);
        let i = 0;
        
        while (i < len) {
            let item = vector::borrow(items, i);
            if (item.id == listing_id) {
                let listing = vector::remove(items, i);
                
                coin::transfer<CedraCoin>(buyer, listing.seller, listing.price);

                let buyer_addr = signer::address_of(buyer);
                if (!exists<MyItems>(buyer_addr)) {
                    move_to(buyer, MyItems { items: vector::empty() });
                };
                
                let my_items = borrow_global_mut<MyItems>(buyer_addr);
                vector::push_back(&mut my_items.items, listing.asset);
                break
            };
            i = i + 1;
        };
    }

    public entry fun resell_item(seller: &signer, item_id: u64, price: u64) acquires MyItems, Listings {
        let seller_addr = signer::address_of(seller);
        let my_items = borrow_global_mut<MyItems>(seller_addr);
        let items = &mut my_items.items;
        
        let len = vector::length(items);
        let i = 0;
        
        while (i < len) {
            let item = vector::borrow(items, i);
            
            if (item.id == item_id) {
                let asset = vector::remove(items, i);
                
                let listings = borrow_global_mut<Listings>(@marketplace);
                vector::push_back(&mut listings.items, Listing {
                    id: asset.id, 
                    asset,
                    price,
                    seller: seller_addr,
                });
                break
            };
            i = i + 1;
        };
    }
}