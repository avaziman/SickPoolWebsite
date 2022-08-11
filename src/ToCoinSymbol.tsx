let map = {
    "verus": "VRSC",
    "verustest": "VRSCTEST",
    "verustestlocal": "VRSCTESTLOCAL"
}

export default function ToCoinSymbol(prettyName: string) : string {
    return (map as any)[prettyName];
}
