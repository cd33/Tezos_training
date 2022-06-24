const assert = require('assert');
const { deploy, getAddress } = require('@completium/completium-cli');

const test = async () => {
  const start = Date.now().toString();
  const stop  = (Date.now() + 5 * 60 * 1000).toString();
  const [auction, _] = await deploy('auction.arl', {
    parameters : {  owner : getAddress("alice"), deadline : stop },
    test : true
  });
  await auction._setNow(start);
  await auction.bid({ as : "bob", amount : "10tz" });
  await auction.bid({ as : "carl", amount : "15tz" });
  await auction._setNow(stop);
  await auction.collectTopBid({ as : "alice" });
  await auction.claim({ as : "bob" });
}
test();