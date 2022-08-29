interface Coin {
    symbol: string,
    explorer_url: string
}

const map: { [pretty: string]: Coin } = {
    "verus": {
        symbol: "VRSC",
        explorer_url: ''
    },
    "verustest": {
        symbol: "VRSCTEST",
        explorer_url: ''
    },
    "verustestlocal": {
        symbol: "VRSCTESTLOCAL",
        explorer_url: ''
    },
    "sinovate": {
        symbol: "SIN",
        explorer_url: 'https://book.sinovate.io'
    }
}

export default function ToCoin(pretty: string){
    return map[pretty];
}