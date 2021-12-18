# klaytn_fee_delegated

> 클레이튼 블록체인 수수료 위임 코드


## Summary

```
// create transaction object
const feeDelegatedTx = caver.transaction.feeDelegatedValueTransfer.create({
    from: sendAccount.address,
    value: caver.utils.toPeb(5, 'KLAY'),
    to: receiveAccount.address,
    gas: 50000
})

// sender signature
await feeDelegatedTx.sign(sendAccount.keyring)

// fee delegator signature
await feeDelegatedTx.signAsFeePayer(feeAccount.keyring)

// // transaction send
await caver.rpc.klay.sendRawTransaction(feeDelegatedTx);

```


## Result
<img width="688" alt="스크린샷 2021-12-18 오전 9 18 44" src="https://user-images.githubusercontent.com/58046372/146621801-5ce492bb-9017-45b3-acd0-fe8e75281ef2.png">
