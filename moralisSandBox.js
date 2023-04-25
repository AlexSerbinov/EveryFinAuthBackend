const Moralis = require('moralis').default;

const { EvmChain } = require('@moralisweb3/evm-utils');

const runApp = async () => {

  await Moralis.start({

    apiKey: "8EUKy01EddTFOyaHmHuazlJCbLxvX7zQ5E3HE3X9tAz9jmX6tSPmhYgh92Th9dun",

    // ...and any other configuration

  });

  

  const address = '0x3A0060f7e429e6a8c217B8229d232E8Da506aa57';

  const chain = EvmChain.AVALANCHE;

//   const response = await Moralis.EvmApi.token.getWalletTokenBalances({
  const response = await Moralis.EvmApi.token.getErc20Transfers({

    address,

    chain

  });

  

  console.log(response.toJSON());

}

runApp();

