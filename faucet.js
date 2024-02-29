import express from 'express';
import * as path from 'path'

import { exec } from "child_process"
import { StargateClient } from "@cosmjs/stargate";
import conf from './config.js'
import { FrequencyChecker } from './checker.js';

// load config
console.log("loaded config: ", conf)

const app = express()

const checker = new FrequencyChecker(conf)

let faucetAddress = null;

(async () => {
  try {
    const addr = await getAccountAddress()
    faucetAddress = addr
  } catch (err) {
    throw new Error(err)
  }
})();

app.get('/', (_, res) => {
  res.sendFile(path.resolve('./index.html'));
})

app.get('/config.json', async (_, res) => {
  const sample = {}
  const chainConf = conf.blockchain
  sample[chainConf.name] = faucetAddress


  const project = conf.project
  project.sample = sample
  project.blockchain = conf.blockchain.name

  const tokens = []
  for (var i = 0; i < conf.blockchain.tx.length; i++) {
    tokens.push(conf.blockchain.tx[i].amount)
  }

  project.tokens = tokens
  project.endpoint = conf.blockchain.endpoint
  project.prefix = conf.blockchain.addressPrefix
  project.currencies = conf.blockchain.currencies

  res.send(project);
})

app.get('/balance/:denom', async (req, res) => {
  
  const {denom} = req.params;
  let balance = {}

  if (!denom) {
    res.send({ result: 'denom is required' });
    return
  }

  let index = getIndexByDenom(denom)

  if (index == null) {
    res.send({ result: 'denom not found' });
    return
  }

  let currencyIndex = getIndexByMinimalDenom(denom)

  if (currencyIndex == null) {
    res.send({ result: 'currencies denom not found' });
    return
  }

  try{
    const chainConf = conf.blockchain
    if(chainConf) {
      const rpcEndpoint = chainConf.endpoint.rpc;
      const client = await StargateClient.connect(rpcEndpoint);
      await client.getBalance(faucetAddress, chainConf.tx[index].amount.denom).then(x => {
        const dec = conf.blockchain.currencies[currencyIndex].coinDecimals
        if (dec != 0) {
          x.amount = (parseInt(x.amount) / Math.pow(10, dec)).toFixed(dec)
          x.denom = conf.blockchain.currencies[currencyIndex].coinDenom
        }
        return balance = x
      }).catch(e => console.error(e));
    }
  } catch(err) {
    console.log(err)
  }
  res.send(balance);
})

app.get('/send/:address/:denom', async (req, res) => {
  const {denom, address} = req.params;
  const ip = req.headers['x-real-ip'] || req.headers['X-Real-IP'] || req.headers['X-Forwarded-For'] || req.ip
  console.log('request tokens to ', address, ip, denom)
  
  if (!address) {
    res.send({ result: 'address is required' });
    return
  }

  if (!denom) {
    res.send({ result: 'denom is required' });
    return
  }

  let index = getIndexByDenom(denom)

  if (index == null) {
    res.send({ result: 'denom not found' });
    return
  }
  
  try {
    const chainConf = conf.blockchain
    if (chainConf && address.startsWith(chainConf.addressPrefix)) {
      if( await checker.checkAddress(address) && await checker.checkIp(`${index}${ip}`) ) {
        checker.update(`${index}${ip}`) // get ::1 on localhost
        sendCosmosTx(address, index).then(ret => {

          checker.update(address)
          res.send({ result: ret })
        }).catch(err => {
          res.send({ result: `err: ${err}`})
        });
      }else {
        res.send({ result: "You requested too often" })
      }
    } else {
      res.send({ result: `Address [${address}] is not supported.` })
    }
  } catch (err) {
    console.error(err);
    res.send({ result: 'Failed, Please contact to admin.' })
  }
})

app.listen(conf.port, () => {
  console.log(`Faucet app listening on port ${conf.port}`)
})

function getIndexByDenom(denom) {
  const chainConf = conf.blockchain

  for ( var i = 0; i < chainConf.tx.length; i++ ) {
    if (chainConf.tx[i].amount.denom == denom) {
      return i
    }
  } 

  return null
}

function getIndexByMinimalDenom(MinimalDenom) {
  const chainConf = conf.blockchain

  for ( var i = 0; i < chainConf.tx.length; i++ ) {
    if (chainConf.currencies[i].coinMinimalDenom == MinimalDenom) {
      return i
    }
  } 

  return null
}

async function myExec(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        return reject(err)
      }
      if (stderr) {
        return reject(stderr)
      }
      return resolve(stdout.replace("\n", ""))
    })
  })
}

async function getAccountAddress() {
  const chainConf = conf.blockchain
  if(!chainConf) {
    throw new Error(`Blockchain Config [${chain}] not found`)
  }

  if (!chainConf.sender.accountName) {
    throw new Error(`Sender account name not found`)
  }

  // if (!chainConf.sender.keyRingPass) {
  //   throw new Error(`Sender keyring password not found`)
  // }

  return myExec(`echo '${chainConf.sender.keyRingPass}' | fairyringd keys show ${chainConf.sender.accountName} -a`);
}

async function fairyringdBankSendTx(to, amount) {
  const chainConf = conf.blockchain
  if(!chainConf) {
    throw new Error(`Blockchain Config [${chain}] not found`)
  }

  if (!chainConf.sender.accountName) {
    throw new Error(`Sender account name not found`)
  }

  if (!chainConf.sender.keyRingPass) {
    throw new Error(`Sender keyring password not found`)
  }

  if (!faucetAddress) {
    throw new Error("Faucet address not found")
  }

  try {
    const out = await myExec(`echo ${chainConf.sender.keyRingPass} | fairyringd tx bank send ${faucetAddress} ${to} ${amount} --from ${chainConf.sender.accountName} -y -o json`);
    const jsonOut = JSON.parse(out)
    console.log(`${new Date().toLocaleString()} Sent ${amount} to ${to}, result: ${out}`)
    return jsonOut
  } catch (err) {
     throw new Error(err)
  };
};

async function sendCosmosTx(recipient, amountIndex) {
  const chainConf = conf.blockchain
  if(!chainConf) {
    throw new Error(`Blockchain Config [${chain}] not found`)
  }
  
  const tx = chainConf.tx[amountIndex];
  console.log("Recipient & Amount: ", recipient, `${tx.amount.amount}${tx.amount.denom}`)
  return fairyringdBankSendTx(recipient, `${tx.amount.amount}${tx.amount.denom}`)
}
