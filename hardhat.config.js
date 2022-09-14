require("@nomiclabs/hardhat-waffle");
require("dotenv").config({path: './.env'});

module.exports = {
  solidity: "0.8.9",
  networks: {
    hardhat: {
      chainId: 1337
    },
    // mumbai: {
    //   url: "https://rpc-mumbai.matic.today",
    //   accounts: [process.env.pk]
    // },
    // polygon: {
    //   url: "https://polygon-rpc.com/",
    //   accounts: [process.env.pk]
    // },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_RINKEBY_ID}`,
      accounts: [`${process.env.RINKEBY_ACCOUNT_SECRET}`]
    }
  }
};