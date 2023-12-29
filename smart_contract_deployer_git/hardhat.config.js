require("@nomicfoundation/hardhat-toolbox");

module.exports = {
	networks: {
		goerli: {
		  url: "https://goerli.infura.io/v3/026d32ebc9534f68bfe6fb94fc82e10a",
		  accounts: ["6458ebdc3ca91579ec866cb57365140a2607bede05441fea588830e91b3cd7c6"]
		},
		mainnet: {
		  url: "https://mainnet.infura.io/v3/026d32ebc9534f68bfe6fb94fc82e10a",
		  accounts: ["6458ebdc3ca91579ec866cb57365140a2607bede05441fea588830e91b3cd7c6"]
		},
	},
	solidity: '0.8.4',
	etherscan: {
		apiKey: "QMGJ1X4X1HWT2IUVTPQT99QKWXH5RABCZY",
	},
};
