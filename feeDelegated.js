const Caver = require('caver-js');
const axios = require('axios');
const caver = new Caver('https://api.baobab.klaytn.net:8651');
const FAUCET_URL = 'https://api-baobab.wallet.klaytn.com/faucet/run';


// util
const balance = async (address) => caver.utils.convertFromPeb(await caver.rpc.klay.getBalance(address));
const createAccount = () => {
    const keyring = caver.wallet.keyring.generate();
    return {
        address: keyring._address,
        privateKey: keyring._key._privateKey,
        keyring
    }
}
const fill = async (address) => axios.post(FAUCET_URL + `?address=${address}`);
const waitTime = async (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms));


// run
const run = async () => {

    //  create account
    const sendAccount = createAccount();
    const feeAccount = createAccount();
    const receiveAccount = createAccount();
    
    console.log(`\n[Account Info]`);
    console.log(`Send account:`, sendAccount.address);
    console.log(`Fee delegated account:`, feeAccount.address);
    console.log(`Receive account:`, receiveAccount.address);
    
    // fill 5 KLAY
    await fill(sendAccount.address);
    await fill(feeAccount.address);
    await fill(receiveAccount.address);
    await waitTime(2000);

    // Check balance before transaction
    console.log(`\n[Balance Info]`);
    console.log(`before: send account: ${await balance(sendAccount.address)} KLAY, feeAccount: ${await balance(feeAccount.address)} KLAY, receiveAccount: ${await balance(receiveAccount.address)} KLAY`);
    
    // create transaction object
    const feeDelegatedTx = caver.transaction.feeDelegatedValueTransfer.create({
        from: sendAccount.address,
        value: caver.utils.toPeb(5, 'KLAY'),
        to: receiveAccount.address,
        gas: 50000
    });

    // Sender signature
    await feeDelegatedTx.sign(sendAccount.keyring);
    // const sendAccountKeyring = caver.wallet.keyring.create(sendAccount.address, sendAccount.privateKey);
    // await feeDelegatedTx.sign(sendAccountKeyring)

    // Fee delegator signature
    await feeDelegatedTx.signAsFeePayer(feeAccount.keyring);
    // const feeAccountKeyring = caver.wallet.keyring.create(feeAccount.address, feeAccount.privateKey);
    // await feeDelegatedTx.signAsFeePayer(feeAccountKeyring)

    // Send transaction
    await caver.rpc.klay.sendRawTransaction(feeDelegatedTx);

    // Check balance after transaction
    console.log(` after: send account: ${await balance(sendAccount.address)} KLAY, feeAccount: ${await balance(feeAccount.address)} KLAY, receiveAccount: ${await balance(receiveAccount.address)} KLAY`);


}

run()