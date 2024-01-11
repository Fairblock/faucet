import express from 'express';
import * as path from 'path'

import { Wallet } from '@ethersproject/wallet'
import {
  pathToString,
} from "@cosmjs/crypto";

import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";

import conf from './config.js'
import { FrequencyChecker } from './checker.js';

// load config
console.log("loaded config: ", conf)

const app = express()

const checker = new FrequencyChecker(conf)

app.get('/', (_, res) => {
  res.sendFile(path.resolve('./index.html'));
})

app.get('/config.json', async (req, res) => {
  const sample = {}
  const chainConf = conf.blockchain
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(chainConf.sender.mnemonic, chainConf.sender.option);
  const [firstAccount] = await wallet.getAccounts();
  sample[chainConf.name] = firstAccount.address

  const wallet2 = Wallet.fromMnemonic(chainConf.sender.mnemonic, pathToString(chainConf.sender.option.hdPaths[0]));
  console.log('address:', sample[chainConf.name], wallet2.address);

  const project = conf.project
  project.sample = sample
  project.blockchain = conf.blockchain.name

  const tokens = []
  for (var i = 0; i < conf.blockchain.tx.length; i++) {
    tokens.push(conf.blockchain.tx[i].amount)
  }

  project.tokens = tokens
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


  try{
    const chainConf = conf.blockchain
    if(chainConf) {
      const rpcEndpoint = chainConf.endpoint.rpc_endpoint;
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(chainConf.sender.mnemonic, chainConf.sender.option);
      const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet);
      const [firstAccount] = await wallet.getAccounts();
      await client.getBalance(firstAccount.address, chainConf.tx[index].amount.denom).then(x => {
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
    if (chainConf && address.startsWith(chainConf.sender.option.prefix)) {
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

async function sendCosmosTx(recipient, amountIndex) {
  // const mnemonic = "surround miss nominee dream gap cross assault thank captain prosper drop duty group candy wealth weather scale put";
  const chainConf = conf.blockchain
  if(!chainConf) {
    throw new Error(`Blockchain Config [${chain}] not found`)
  }
  
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(chainConf.sender.mnemonic, chainConf.sender.option);
  const [firstAccount] = await wallet.getAccounts();

  // console.log("sender", firstAccount);

  const rpcEndpoint = chainConf.endpoint.rpc_endpoint;
  const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet);
  client.getBalance

  // const recipient = "cosmos1xv9tklw7d82sezh9haa573wufgy59vmwe6xxe5";
  const tx = chainConf.tx[amountIndex];
  const amount = tx.amount;
  const fee = tx.fee;
  return client.sendTokens(firstAccount.address, recipient, [amount], fee);
}
