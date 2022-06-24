const { deploy, expectToThrow, getAddress, setMockupNow } = require('@completium/completium-cli');
const assert = require('assert');

const test = async () => {
    try {
        const [counter, _] = await deploy('examples/counter/counter.arl');
        await counter.increment({});
        const storage = await counter.getStorage();
        const count = storage.toNumber();
        assert(count == 3, "Invalid counter value");
        console.log("count", count)
    } catch (e) {
        console.log(e);
    }
}

const contractTest = async () => {
    try {
        const [contractTest, _] = await deploy('contractTest.arl')
        await contractTest.addString({ arg: { newString: "titi" } })
        const storage = await contractTest.getStorage();
        console.log(storage.stringVar)
        console.log(storage.count.toNumber())
        await contractTest.addString({ arg: { newString: "tata" } })
        const storage2 = await contractTest.getStorage();
        console.log(storage2.stringVar)
        console.log(storage2.count.toNumber())
    } catch (e) {
        console.log(e)
    }
}

const verifications = async () => {
    try {
        const [verifications, _] = await deploy('verifications.arl')
        await verifications.increment({ arg: { val: 8 }, as: "alice" })
        const storage = await verifications.getStorage();
        assert(storage.lastAccount == getAddress("alice"), "lastAccount should be alice");
        assert(storage.counter.toNumber() == 8, "counter should be 8");
        await verifications.increment({ arg: { val: 6 } })
        const storage2 = await verifications.getStorage();
        assert(storage2.lastAccount == getAddress("carl"), "lastAccount should be carl");
        assert(storage2.counter.toNumber() == 14, "counter should be 14");
        await verifications.decrement({ arg: { val: 24 } })
        const storage3 = await verifications.getStorage();
        assert(storage3.counter.toNumber() == -10, "counter should be -10");
        await verifications.reset()
        const storage4 = await verifications.getStorage();
        assert(storage4.counter.toNumber() == 0, "counter should be 0");
        await expectToThrow(async () => {
            await verifications.increment({ arg: { val: 12 } });
        }, '"Too big"')
        await expectToThrow(async () => {
            await verifications.increment({ arg: { val: 2 } });
        }, '"Wait your turn"')
        await expectToThrow(async () => {
            await verifications.decrement({ arg: { val: 12 }, as: "alice" });
        }, '"Only owner"')
        await expectToThrow(async () => {
            await verifications.reset({ arg: { val: 2 }, as: "alice" });
        }, '"Only owner"')
    } catch (e) {
        console.log(e)
    }
}

const transactions = async () => {
    try {
        const aliceAddr = getAddress("alice");
        const [transactions, _] = await deploy('transactions.arl', {parameters : { owner : aliceAddr }});
        await expectToThrow(async () => {
            await transactions.donate({ as: "carl", amount : "1000tz" });
        }, '"Max 100"')
        await transactions.donate({ as: "alice", amount: "10tz" })
        const balance = await transactions.getBalance()
        assert(balance.toNumber() == 10*10**6)
        await transactions.donate({ as: "bob", amount: "5tz" })
        const balance2 = await transactions.getBalance()
        assert(balance2.toNumber() == 15*10**6)

        const newDate = Math.floor(Date.now() / 1000) + 200
        setMockupNow(newDate)
        
        await expectToThrow(async () => {
            await transactions.withdraw({ as: "carl", arg : { amount : "5tz" } });
        }, '"Only owner"')
        await expectToThrow(async () => {
            await transactions.withdraw({ as: "alice", arg : { amount : "15tz" } });
        }, '"Limited to 10"')
        await transactions.withdraw({ as: "alice", arg : { amount : "10tz" } })
        const balance3 = await transactions.getBalance()
        assert(balance3.toNumber() == 5*10**6)
        await expectToThrow(async () => {
            await transactions.withdraw({ as: "alice", arg : { amount : "5tz" } });
        }, '"Too early"')
        await transactions.changeLimitAmount({ as: "alice", arg : { amount : "8tz" } });
        const storage = await transactions.getStorage();
        assert(storage.limitedAmount.toNumber() == 8*10**6, "limitedAmount should be 8");
        await expectToThrow(async () => {
            await transactions.changeLimitAmount({ as: "alice", arg : { amount : "2utz" } });
        }, '"Not less than 1"')
        await expectToThrow(async () => {
            await transactions.changeLimitAmount({ as: "carl", arg : { amount : "5tz" } });
        }, '"Only owner"')
    } catch (e) {
        console.log(e)
    }
}

const transactions2 = async () => {
    try {
        const carlAddr = getAddress("carl");
        const [transactions2, _] = await deploy('transactions2.arl', {parameters : { owner : carlAddr }});
        await transactions2.donate({ amount: "100tz" })
        const balance = await transactions2.getBalance()
        assert(balance.toNumber() == 100*10**6)

        const newDate = Math.floor(Date.now() / 1000) + 200
        setMockupNow(newDate)
        await expectToThrow(async () => {
            await transactions2.withdraw({ as: "carl", arg : { amount : "15tz" } });
        }, '"Limited to 10%"')
        await transactions2.withdraw({ as: "carl", arg : { amount : "10tz" } })
        await expectToThrow(async () => {
            await transactions2.changeLimitAmount({ as: "carl", arg : { amount : -5 } });
        }, '"Not less than 1%"')
        const balance2 = await transactions2.getBalance()
        assert(balance2.toNumber() == 90*10**6)
        console.log("toto")
    } catch (e) {
        console.log(e)
    }
}

const visitors = async () => {
    try {
        const [visitors, _] = await deploy('examples/visitors/visitors.arl');
        await visitors.register({ arg: { l: "toto", n: "tata" } })
        await visitors.visit({ arg: {  l: "toto" } })
        await visitors.visit({ arg: {  l: "toto" } })
        await visitors.visit({ arg: {  l: "toto" } })
        const storage = await visitors.getStorage();
        assert(storage.get("toto"))
        assert(storage.get("toto").nbvisits.toNumber() == 3)
        console.log("fin")
    } catch (e) {
        console.log(e)
    }
}

const visitors2 = async () => {
    try {
        const carlAddr = getAddress("carl");
        const aliceAddr = getAddress("alice");
        const bobAddr = getAddress("bob");
        const [visitors, _] = await deploy('visitors.arl');
        const newDate = Math.floor(Date.now() / 1000) + 9999999
        setMockupNow(newDate)
        await visitors.register({ arg: { l: carlAddr, n: "carl" } })
        await visitors.register({ arg: { l: aliceAddr, n: "alice" } })
        await visitors.register({ arg: { l: bobAddr, n: "bob" } })
        await expectToThrow(async () => {
            await visitors.visit({ arg: {  l: aliceAddr }, amount : "10tz" })
        }, '"5tz to entry"')
        await visitors.visit({ arg: {  l: aliceAddr }, amount : "5tz" })
        await expectToThrow(async () => {
            await visitors.visit({ arg: {  l: aliceAddr }, amount : "3tz" })
        }, '"Too early"')
        await expectToThrow(async () => {
            await visitors.visit({ arg: {  l: aliceAddr }, amount : "5tz", as: "bob" })
        }, '"3tz to entry"')
        // const storage = await visitors.getStorage();
        console.log(storage)
        // assert(storage.get("toto"))
        // assert(storage.get("toto").nbvisits.toNumber() == 3)
        console.log("fin")
    } catch (e) {
        console.log(e)
    }
}

// TESTS
// test();
// contractTest();
// verifications()
// transactions()
// transactions2()
// visitors()
// visitors2()