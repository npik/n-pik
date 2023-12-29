'use strict';

const ethers = require('ethers');

// https://docs.alchemy.com/alchemy/guides/eip-1559/gas-estimator
async function getFeeHistory(
	provider,
	blockCount,
	newestBlock,
	rewardPercentiles)
{
	return provider.send('eth_feeHistory', [
		`0x${Number(blockCount).toString(16)}`,
		newestBlock,
		rewardPercentiles
	]);
}

function formatFeeHistory(blockCount, result, includePending) {

	// TODO: check if blockCount > 0
	blockCount = Math.min(blockCount, result.gasUsedRatio.length);
	//const blockCount = 
	//const oldestBlock = ethers.BigNumber.from(result.oldestBlock);
	const endBlock = ethers.BigNumber.from(result.oldestBlock).add(
		ethers.BigNumber.from(blockCount)
	);

	let blockNum = ethers.BigNumber.from(result.oldestBlock);
	let index = 0;
	const blocks = [];
	while (blockNum.lt(endBlock)) {

		//console.log('index', index, 'block', blockNum.toNumber());

		blocks.push({
			number: blockNum.toHexString(),
			baseFeePerGas: Number(result.baseFeePerGas[index]),
			gasUsedRatio: Number(result.gasUsedRatio[index]),
			priorityFeePerGas: result.reward[index].map(x => Number(x)),
		});

		blockNum = blockNum.add(1);
		++index;
	}

	//if (!includePending) return blocks;
	if (includePending) {
		blocks.push({
			number: 'pending',
			baseFeePerGas: Number(result.baseFeePerGas[blockCount]),
			gasUsedRatio: NaN,
			priorityFeePerGas: [],
		});
	}
	
//	return { blocks,
//		baseFeePerGas: ethers.BigNumber.from(result.baseFeePerGas[result.baseFeePerGas.length-1]).toNumber()
//	};
	
//	return { blocks,
//		baseFeePerGas: Number(result.baseFeePerGas[result.baseFeePerGas.length-1])
//	};
	

	// XXX: TODO: borrow from metamask!!
	// ethers.js/abstract-provider/src.ts/index.ts::getFeeData()
	// maxPriorityFeePerGas = BigNumber.from("2500000000");
	// maxFeePerGas = block.baseFeePerGas.mul(2).add(maxPriorityFeePerGas)
	// ehters.js/abstract-signer/src.ts/index.ts::populateTransaction()
	const baseFeePerGas = Number(result.baseFeePerGas[result.baseFeePerGas.length-1]) * 2;
	return { blocks,
		baseFeePerGas,
	};

}


function mean(arr)
{
	return arr.length && arr.reduce((a,v) => a+v)/arr.length || 0;
}

function avg(arr) {
	return Math.round(mean(arr));
}

// https://stackoverflow.com/questions/7343890/standard-deviation-javascript
function std(arr)
{
	const m = mean(arr);
	return Math.sqrt(arr.map(x => Math.pow(x-m,2)).reduce((a,v) => a+v)/arr.length);
}

// https://www.kdnuggets.com/2017/02/removing-outliers-standard-deviation-python.html
function avg_95_4_percent(arr)
{
	const m = mean(arr);
	const s = std(arr);
	return avg(arr.filter(e => (m-2*s<e) && (e<m+2*s)));
}

async function gasSuggestions(provider)
{
	// TODO: EIP-1559 unsupported provider -> gasPrice
	
	const n_blocks = 20;
	//const fee_data = await getFeeHistory(provider, n_blocks, 'pending', [1, 50, 99]);
	// XXX: kovan doesn't have pending block info
	//const fee_data = await getFeeHistory(provider, n_blocks, 'pending', [20, 50, 80]);
	const fee_data = await getFeeHistory(provider, n_blocks, 'latest', [20, 50, 80]);
	//const fee_data = await getFeeHistory(provider, n_blocks, 'latest', [30, 50, 90]);

	//console.dir(fee_data);

	const {blocks, baseFeePerGas} = formatFeeHistory(n_blocks, fee_data);
	//const {blocks} = formatFeeHistory(n_blocks, fee_data);

	//const {baseFeePerGas} = await provider.getBlock('latest');

	//console.dir(blocks);

//	return {
//		priorityFeePerGas: [
//			avg(blocks.map(b=>b.priorityFeePerGas[0])),
//			avg(blocks.map(b=>b.priorityFeePerGas[1])),
//			avg(blocks.map(b=>b.priorityFeePerGas[2]))
//		],
//		baseFeePerGas
//	};

//	console.dir({
//		priorityFeePerGas: [
//			avg(blocks.map(b=>b.priorityFeePerGas[0])),
//			avg(blocks.map(b=>b.priorityFeePerGas[1])),
//			avg(blocks.map(b=>b.priorityFeePerGas[2]))
//		],
//		baseFeePerGas
//	});

	// we have noise so remove outliers
	return {
		priorityFeePerGas: [
			avg_95_4_percent(blocks.map(b=>b.priorityFeePerGas[0])),
			avg_95_4_percent(blocks.map(b=>b.priorityFeePerGas[1])),
			avg_95_4_percent(blocks.map(b=>b.priorityFeePerGas[2]))
		],
		baseFeePerGas
	};

}

module.exports = gasSuggestions; 

if (require.main === module) {
(async () => {
	const url = 'https://mainnet.infura.io/v3/81732a2db75b4d61b34133a0530c276a';
	const provider = new ethers.providers.JsonRpcProvider({url});

//	const fee_data = async provider => {
//		const rv = await provider.getFeeData();
//		return {
//			maxFeePerGas: Number(rv.maxFeePerGas.toString()),
//			maxPriorityFeePerGas: Number(rv.maxPriorityFeePerGas.toString()),
//			gasPrice: Number(rv.gasPrice.toString())
//		};
//	};
//
//	//const gas = await gasSuggestions(provider);
//	//console.dir(gas);
//	const result = await Promise.all([gasSuggestions(provider), fee_data(provider)]);
//
//	console.dir(result);
	
	const fee_data = await getFeeHistory(provider, 20, 'latest', [20, 50, 80]);
	console.dir(fee_data);

	
})();
}
