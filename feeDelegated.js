const Caver = require('caver-js');
const axios = require('axios');

const caver = new Caver('https://api.baobab.klaytn.net:8651');
const balance = async (address) => caver.utils.convertFromPeb(await caver.rpc.klay.getBalance(address));

const createAccount = () => {
    const keyring = caver.wallet.keyring.generate();
    return {
        address: keyring._address,
        privateKey: keyring._key._privateKey,
        keyring
    }
}
const fill = async (address) => axios.post(FAUCET_URL + `?address=${address}`)

const waitTime = async (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms));

const FAUCET_URL = 'https://api-baobab.wallet.klaytn.com/faucet/run';

// 실행
const run = async () => {

    //  account 생성
    const sendAccount = createAccount();
    const feeAccount = createAccount();
    const receiveAccount = createAccount();
    
    console.log(`\n[Account Info]`);
    console.log(`Send account:`, sendAccount.address);
    console.log(`Fee delegated account:`, feeAccount.address);
    console.log(`Receive account:`, receiveAccount.address);
    
    // 5 KLAY 채우기
    await fill(sendAccount.address);
    await fill(feeAccount.address);
    await fill(receiveAccount.address);
    await waitTime(2000);

    // tx 이전 잔액 확인
    console.log(`\n[Balance Info]`);
    console.log(`before: send account: ${await balance(sendAccount.address)} KLAY, feeAccount: ${await balance(feeAccount.address)} KLAY, receiveAccount: ${await balance(receiveAccount.address)} KLAY`);
    
    // tx 생성
    const feeDelegatedTx = caver.transaction.feeDelegatedValueTransfer.create({
        from: sendAccount.address,
        value: caver.utils.toPeb(5, 'KLAY'),
        to: receiveAccount.address,
        gas: 50000
    })

    // 출금 서명
    await feeDelegatedTx.sign(sendAccount.keyring)
    // const sendAccountKeyring = caver.wallet.keyring.create(sendAccount.address, sendAccount.privateKey);
    // await feeDelegatedTx.sign(sendAccountKeyring)

    // 대납 서명
    await feeDelegatedTx.signAsFeePayer(feeAccount.keyring)
    // const feeAccountKeyring = caver.wallet.keyring.create(feeAccount.address, feeAccount.privateKey);
    // await feeDelegatedTx.signAsFeePayer(feeAccountKeyring)

    // // tx 전송
    await caver.rpc.klay.sendRawTransaction(feeDelegatedTx);

    // tx 이후 잔액 확인
    console.log(` after: send account: ${await balance(sendAccount.address)} KLAY, feeAccount: ${await balance(feeAccount.address)} KLAY, receiveAccount: ${await balance(receiveAccount.address)} KLAY`);


}

run()