export default {
    port: 8668, // http port
    db: {
        path: "./db/faucet.db" // save request states
    },
    project: {
        name: "FairyRing",
        logo: "https://pbs.twimg.com/profile_images/1674527932956409860/ja7Woiz6_400x400.jpg",
        deployer: `<a href="https://fairblock.network" target="_blank">Fairblock</a>`
    },
    blockchain: {
        name: "fairytest-3",
        endpoint: {
            // make sure that CORS is enabled in rpc section in config.toml
            // cors_allowed_origins = ["*"]
            rpc: "http://34.80.93.133:26657",
            api: "http://34.80.93.133:1317"
        },
        addressPrefix: "fairy",
        sender: {
           accountName: "faucet",
           keyRingPass: "your_key_ring_password"
        },
        tx: [
            {
                amount: {
                    denom: "ufairy",
                    amount: "3000000"
                },
                fee: {
                    amount: [],
                    gas: "200000"
                },
            },
            {
                amount: {
                    denom: "stake",
                    amount: "1000000000000"
                },
                fee: {
                    amount: [],
                    gas: "200000"
                },
            }
        ],
        currencies: [
            { coinDenom: "STAKE", coinDecimals: 0, coinMinimalDenom: "stake" },
            { coinDenom: "FAIRY", coinDecimals: 6, coinMinimalDenom: "ufairy" },
        ],
        limit: {
            // how many times each wallet address is allowed in a window(24h)
            address: 1,
            // how many times each ip is allowed in a window(24h),
            // if you use proxy, double check if the req.ip is return client's ip.
            ip: 1
        }
    },
}