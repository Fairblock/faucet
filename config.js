
import { stringToPath } from '@cosmjs/crypto'

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
        name: "fairytest-3",
        endpoint: {
            // make sure that CORS is enabled in rpc section in config.toml
            // cors_allowed_origins = ["*"]
            rpc_endpoint: " http://52.23.185.183:26657",
        },
        sender: {
            mnemonic: "wise rule method circle general over tool exhibit over group nuclear meat inform rival before short inner bind short enact team dinner swift ritual",
            option: {
                hdPaths: [stringToPath("m/44'/118'/0'/0/0")],
                prefix: "fairy"
            }
        },
        tx: [
            {
                amount: {
                    denom: "stake",
                    amount: "100000000000"
                },
                fee: {
                    amount: [
                        // {
                        //     amount: "5000",
                        //     denom: "uiris"
                        // }
                    ],
                    gas: "200000"
                },
            },
            {
                amount: {
                    denom: "ufairy",
                    amount: "300000"
                },
                fee: {
                    amount: [
                        // {
                        //     amount: "5000",
                        //     denom: "uiris"
                        // }
                    ],
                    gas: "200000"
                },
            },
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