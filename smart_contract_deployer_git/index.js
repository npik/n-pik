'use strict';

const path = require('path');
const fs = require('fs');

const ethers = require('ethers');
const {NonceManager} = require('@ethersproject/experimental');

const prompt = require('password-prompt');

const persist_state_t = require('./persist_state');

const gasSuggestions = require('./estimator');

const meta = require('./artifacts/contracts/ERC20Token.sol/ERC20Token.json');

class config_t {
	constructor(conf) {
		Object.assign(this, conf);

		const {def_isupply, name_pat, tokens} = this.token_info;

		for (const t in tokens) {


			tokens[t].symbol = t;
			
			if (tokens[t].isupply) continue;
			tokens[t].isupply = def_isupply;
		}
		console.log("tokens :", tokens);
	}
}

const config = {
	init(file_path) {
		if (this._inst) return;

		let conf = fs.readFileSync(file_path);
		conf = JSON.parse(conf);
		this._inst = new config_t(conf);
	},

	inst() {
		return this._inst;
	}
};

const signer_t = {
	init(url, pk_or_signer) {
		try {
			const provider = new ethers.providers.JsonRpcProvider({url});
			let signer;
			if (ethers.Signer.isSigner(pk_or_signer)) {
				signer = pk_or_signer.connect(provider);
			}
			else {
				signer = new ethers.Wallet(pk_or_signer, provider);
			}

			this._signer = new NonceManager(signer);
		}
		catch (e) {
			console.log("e :", e)
			throw new Error('Invalid Private Key');
		}
	},
	inst() {
		return this._signer;
	}
};

class addrs_t extends persist_state_t {
	constructor(file_path)
	{
		super(file_path);
	}

	get(symbol)
	{
		return super.get(e => e.symbol === symbol);
	}
}

const addrs = {
	init(file_path)
	{
		if (this._inst) return;

		this._inst = new addrs_t(file_path);
	},
	inst()
	{
		return this._inst;
	}
};

async function deploy(token, gas)
{
	const {
		name,
		symbol,
		isupply
	} = token;

	console.log(`deploy ${symbol}... ${isupply} `);

	const signer = signer_t.inst();
	const factory = new ethers.ContractFactory(
		meta.abi,
		meta.bytecode, 
		signer
	);


	const contract = await factory.deploy(
		name,
		symbol,
		ethers.BigNumber.from(isupply).mul(ethers.BigNumber.from('10').pow(18)),
		// ethers.BigNumber.from(isupply),
		gas
	);

	

	await contract.deployed();

	// record
	addrs.inst().add({
		symbol,
		addr: contract.address,
	});

	console.log(`${symbol} deployed: ${contract.address}`);
}

//async function is_deployed(addr)
//{
//	try {
//		new ethers.Contract(addr, meta.abi, signer_t.inst().provider);
//		return true;
//	}
//	catch {
//		return false;
//	}
//}

async function prod_init()
{
	const conf_file = await prompt('config file (def: config.json): ', {default: './config.json'});
	config.init(path.join(process.cwd(), conf_file));

	const addr_file = await prompt('addrs file (def: addrs.json): ', {default: './addrs.json'});
	addrs.init(path.join(process.cwd(), addr_file));

	const pk = await prompt('pk: ', {method:'hide'});
	signer_t.init(config.inst().endpoint, pk);
}

// hardhat node (truffle ganache)
async function dev_init()
{
	const conf_file = await prompt('config file (def: config.json): ', {default: './config.json'});
	config.init(path.join(process.cwd(), conf_file));
	config.inst().endpoint = 'http://localhost:8545';

	const addr_file = await prompt('addrs file (def: addrs-dev.json): ', {default: './addrs-dev.json'});
	addrs.init(path.join(process.cwd(), addr_file));

	// hardhat node account
	const mnemonic = 'test test test test test test test test test test test junk';
	const hd_path = "m/44'/60'/0'/0/";
	const signer = ethers.Wallet.fromMnemonic(
		mnemonic,
		hd_path + '0'
	);

	signer_t.init(config.inst().endpoint, signer);
}

async function estimate_gas()
{
	const _gas = await gasSuggestions(signer_t.inst().provider);

	_gas.priorityFeePerGas = _gas.priorityFeePerGas.map(p => {
		return p || 2500000000;
	});
	
	//console.dir(_gas);
	const {
		priorityFeePerGas,
		baseFeePerGas
	} = _gas;

	const gas = {
		maxPriorityFeePerGas: ethers.BigNumber.from(priorityFeePerGas[1]),
		maxFeePerGas: ethers.BigNumber.from(priorityFeePerGas[1] + baseFeePerGas)
	};

	return gas;
}

async function init()
{
	const prod = process.env.NODE_ENV !== 'development';

	const _init = prod? prod_init: dev_init;

	try {
		await _init();
	}
	catch (e) {
		throw e;
	}
}

async function main()
{
	try {
		await init();

		const gas = await estimate_gas();

		const {tokens} = config.inst().token_info;

		const p_tokens = Object.keys(tokens).map(t => deploy(tokens[t], gas));

		addrs.inst().add({
			symbol: 'endpoint',
			addr: config.inst().endpoint
		});

		await Promise.all(p_tokens);
		
	}
	catch (e) {
		throw e;
	}
}

main().then(() => process.exit(0))
	.catch(e => {
		console.error(e);
		process.exit(1);
	});
