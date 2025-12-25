// export const MODULE_ADDRESS = process.env.NEXT_PUBLIC_MODULE_ADDRESS;


// export const GENERIC_TYPE = `${MODULE_ADDRESS}::market_v6::MarketItem`;







export const MODULE_ADDRESS = 
  process.env.NEXT_PUBLIC_MODULE_ADDRESS || 
  "0x2af00cec9331ad1402032cf0612b904ed51eb2d7c401e38011c7e6b08cffc8f8"; 

export const GENERIC_TYPE = `${MODULE_ADDRESS}::market_v6::MarketItem`;