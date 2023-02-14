// Script made to test Alchemy service providing the list of NFTs owns by a a specific wallet
// yarn hardhat run ./scripts/alchemyRequest.js

const { axios } = require('axios/dist/node/axios.cjs');

// Wallet address Goerli
const address = '0xA770487d72Baad096729965011b90FFEDfecB1b4'

// Alchemy URL built with ApiKey and the specific service requested getNFTs
//const baseURL = process.env.ALCHEMY_GOERLI_API_KEY
const baseURL = "https://eth-goerli.g.alchemy.com/nft/v2/bev_Q4k6sp9JT2RqsYJ_FfZmYhauKyFo"
const url = `${baseURL}/getNFTs/?owner=${address}`;

const config = {
  method: 'get',
  url: url,
};

// Axios is used to manage the request and display the response
axios(config)
  .then(response => {
    const nfts = response['data'];

    // Parse output
    // const numNfts = nfts['totalCount'];
    // const nftList = nfts['ownedNfts'];

    // console.log(`Total NFTs owned by ${address}: ${numNfts} \n`);

    // for (let i = 0; i < nftList.length; i++) {
    //   console.log(`${i + 1}. ${nftList[i]['metadata']['name']}`)
    //   i++;
    // }
  })
  .catch(error => console.log('error', error));
