'use strict';

const fs = require('fs');

class persistent_state_t {
	constructor(file_path)
	{
		this.file_path = file_path;
		this._load();

		process.on('exit', code => {
			this._save();
		});
	}

	add(e)
	{
		this.dirty = true;
		this.s.push(e);
	}

	get(match)
	{
		for (const e of this.s) {
			if (match(e)) {
				return new Proxy(e, {
					set: (...args) => {
						this.dirty = true;
						return Reflect.set(...args);
					}
				});
			}
		}
	}

	_load()
	{
		try {
			this.s = JSON.parse(
				fs.readFileSync(this.file_path, {encoding:'utf-8'})
			);
		}
		catch (e) {
			this.s = [];
		}
	}

	_save()
	{
		if (!this.dirty) return;
		this.dirty = false;

		console.log(`save as ${this.file_path}`);
		fs.writeFileSync(this.file_path, JSON.stringify(this.s, null, 4));
	}
}


module.exports = persistent_state_t;

if (require.main === module) {
	const s = new persistent_state_t('./test_state.json');
	
	//s.add({name: 'hAAPLb'});
	
	const x = s.get(e => e.name === 'hAAPLb');
	x.updated = false;
}
