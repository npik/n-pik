const Web3 = require('web3');

// Infura를 사용하여 Ethereum 네트워크에 연결
const web3 = new Web3('https://eth.drpc.org');

// 토큰의 스마트 컨트랙트 주소
const tokenAddress = '0x35F8E5124D6f4B1404D92cA3F986dDaf6D9e3267';

// ERC-20 토큰의 ABI에 있는 totalSupply 함수
const tokenABI = [
  {
    "constant":true,
    "inputs":[],
    "name":"totalSupply",
    "outputs":[{"name":"","type":"uint256"}],
    "payable":false,
    "stateMutability":"view",
    "type":"function"
  }
];

// 스마트 컨트랙트에 연결
const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);

// totalSupply 함수 호출
tokenContract.methods.totalSupply().call()
  .then(supply => {
    console.log(`Total Supply: ${supply}`);
  })
  .catch(error => {
    console.error(`An error occurred: ${error}`);
  });
