export default class BalanceProviders {
    constructor() {
        this.MASQ_CONTRACT = '0x02ba9b528425f9de08f961b88a10b03be8b8b998';
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
        //address = '0xF123808Ce09016bF90072357Ce233FfA82F65c74';
        //apiKey = 'freekey';

        resp = await fetch(`https://api.ethplorer.io/getAddressInfo/${address}?apiKey=${apiKey}`);
        data = await resp.json();

        ethBalance = data.ETH.balance;

        // search for MASQ token
        results = data.hasOwnProperty('tokens') ? data.tokens.filter(t => t.tokenInfo.address == this.MASQ_CONTRACT) : [];
        masqBalance = results.length > 0 ? (results[0].balance).toLocaleString('fullwide', {useGrouping: false}) / 1000000000000000000 : 0;

        return {
            eth: ethBalance,
            masq: masqBalance
        }
    }
}