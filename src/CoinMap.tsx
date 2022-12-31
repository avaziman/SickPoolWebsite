export interface Coin {
    symbol: string,
    name: string,
    explorer_url: string,
    explorer_tx_prefix: string,
    multi_chain: boolean,
    logo: string,
    algo: string,
    satoshis: number
}

export const CoinMap: { [pretty: string]: Coin } = {
    // "verus": {
    //     symbol: "VRSC",
    //     name: "verus",
    //     explorer_url: '',
    //     multi_chain: true,
    //     logo: 'zano.svg',
    //     algo: 'progpow',
    // },
    // "verustest": {
    //     symbol: "VRSCTEST",
    //     name: "verus",
    //     explorer_url: '',
    //     multi_chain: false,
    //     logo: 'zano.svg',
    //     algo: 'progpow',
    // },
    // "verustestlocal": {
    //     symbol: "VRSCTESTLOCAL",
    //     name: "verus",
    //     explorer_url: '',
    //     multi_chain: false,
    //     logo: 'zano.svg',
    //     algo: 'progpow',
    // },
    // "sinovate": {
    //     symbol: "SIN",
    //     name: "sinovate",
    //     explorer_url: 'https://book.sinovate.io',
    //     multi_chain: false,
    //     logo: 'sin_white.svg',
    //     algo: 'progpow',
    // },
    "zano": {
        symbol: "ZANO",
        name: "Zano",
        explorer_url: 'https://testnet-explorer.zano.org',
        explorer_tx_prefix: 'transaction',
        multi_chain: false,
        logo: 'zano.svg',
        algo: 'progpow',
        satoshis: 1e10,
    }
}

export default function ToCoin(pretty: string){
    return CoinMap[pretty];
}