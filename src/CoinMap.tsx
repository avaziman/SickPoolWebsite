interface Coin {
    symbol: string,
    name: string,
    explorer_url: string,
    multi_chain: boolean,
    logo: string,
    algo: string,
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
        explorer_url: 'https://book.sinovate.io',
        multi_chain: false,
        logo: 'zano.svg',
        algo: 'progpow',
    }
}

export default function ToCoin(pretty: string){
    return CoinMap[pretty];
}