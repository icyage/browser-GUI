export default class BalanceProviders {
    constructor() {
        this.MASQ_CONTRACT = '0x06F3C323f0238c72BF35011071f2b5B7F43A054c';
        this._minTimeInterval = 300000; // ms

        this._lastTimeQueried = + new Date();
        this._lastAddressQueried = null;
    }

    async EthPlorer(address, apiKey) {
        let resp;
        let data;
        let ethBalance;
        let masqBalance;
        let results;
        // testing override
        //address = '0xb4358fEd970F0016BFf6BddfC744577F547262B3';
        //apiKey = 'freekey';

        resp = await fetch(`https://api.ethplorer.io/getAddressInfo/${address}?apiKey=${apiKey}`);
        data = await resp.json();

        ethBalance = data.ETH.balance;

        // search for MASQ token
        results = data.hasOwnProperty('tokens') ? data.tokens.filter(t => t.tokenInfo.address.toLowerCase() == this.MASQ_CONTRACT.toLowerCase()) : [];
        masqBalance = results.length > 0 ? (results[0].balance).toLocaleString('fullwide', {useGrouping: false}) / 1000000000000000000 : 0;

        return {
            eth: ethBalance,
            masq: masqBalance
        }
    }
}