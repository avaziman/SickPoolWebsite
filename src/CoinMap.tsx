interface Coin {
    symbol: string,
    name: string,
    explorer_url: string,
    multi_chain: boolean,
    logo: string
}

export const CoinMap: { [pretty: string]: Coin } = {
    "verus": {
        symbol: "VRSC",
        name: "verus",
        explorer_url: '',
        multi_chain: true,
        logo: 'zano.svg',
    },
    "verustest": {
        symbol: "VRSCTEST",
        name: "verus",
        explorer_url: '',
        multi_chain: false,
        logo: 'zano.svg',
    },
    "verustestlocal": {
        symbol: "VRSCTESTLOCAL",
        name: "verus",
        explorer_url: '',
        multi_chain: false,
        logo: 'zano.svg',
    },
    "sinovate": {
        symbol: "SIN",
        name: "sinovate",
        explorer_url: 'https://book.sinovate.io',
        multi_chain: false,
        logo: 'sin_white.svg',
    },
    "zano": {
        symbol: "ZANO",
        name: "zano",
        explorer_url: 'https://book.sinovate.io',
        multi_chain: false,
        logo: 'zano.svg',
    }
}

export default function ToCoin(pretty: string){
    return CoinMap[pretty];
}