# faucet

Faucet for fairyring testnet.

<img width="1052" alt="preview" src="https://user-images.githubusercontent.com/2882920/202998797-b793c52b-9ad7-47fe-a80b-a0f75eff6ba1.png">

## Prerequisite

```sh
node -v
v16.15.0
```

# Installation

 - clone code:
 
 ```sh
 git clone https://github.com/Fairblock/faucet.git
 ```
 
 - setup configs, you have to change everything you need in `./config.js`
 ```js
 {
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
      rpc_endpoint: " http://34.80.93.133:26657",
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
          amount: [],
          gas: "200000"
        },
      },
      {
        amount: {
          denom: "ufairy",
          amount: "300000"
        },
        fee: {
          amount: [],
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
 ```
 
 - Run faucet
 ```sh
 node --es-module-specifier-resolution=node faucet.js
 ```
 
 # Test
 
 visit http://localhost:8668
 
 8668 is default, you can edit it in the config.json
 
 # Donation

Your donation will help us make better products. Thanks in advance.

 - Address for ERC20: USDC, USDT, ETH
```
0x88BFec573Dd3E4b7d2E6BfD4D0D6B11F843F8aa1
```

 - You can donate any token in the Cosmos ecosystem: [here](https://ping.pub/coffee)
 
 
 
 
