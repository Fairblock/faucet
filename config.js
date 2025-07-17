export default {
    port: 8668, // http port
    db: {
        path: "./db/faucet.db" // save request states
    },
    project: {
        name: "Fairyring",
        logo: "https://pbs.twimg.com/profile_images/1674527932956409860/ja7Woiz6_400x400.jpg",
        deployer: `<a href="https://fairblock.network" target="_blank">Fairblock</a>`
    },
    blockchain: {
        name: "fairyring-testnet-3",
        endpoint: {
            // make sure that CORS is enabled in rpc section in config.toml
            // cors_allowed_origins = ["*"]
            rpc: "https://testnet-rpc.fairblock.network",
            api: "https://testnet-api.fairblock.network"
        },
        addressPrefix: "fairy",
        sender: {
           accountName: "faucet",
           keyRingPass: "your_password"
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
            }
        ],
        currencies: [
            { coinDenom: "FAIRY", coinDecimals: 6, coinMinimalDenom: "ufairy" },
        ],
        limit: {
            // how many times each wallet address is allowed in a window(24h)
            address: 3,
            // how many times each ip is allowed in a window(24h),
            // if you use proxy, double check if the req.ip is return client's ip.
            ip: 3
        }
    },
}
