function parseKeyValue(str) {
    if (!str) {
        return '';
    }
    if (str.match(/(^\{)|(\}$)/g)) {
        return parseKeyValue(str.replace(/(^\{)|(\}$)/g, ''));
    }
    let objectRegex = /.*:.*\{(.|\n)*?\}(?=(\,|$))/g;
    let objectRegexM = /.*:.*\{(.|\n)*?\}(?=(\,|$))/gm;
    let keyRegex = /\{(.|\n)*?\}(?=\,|$)/g;

    let allKeyValues = str.trim().replace(objectRegex, '@').split(',');
    let simpleKeyValues = allKeyValues
        .map(item => item.trim())
        .filter(item => item)
        .map(item => {
            if (!item.match(/@/g)) {
                let keyValue = item.split(':').map(item => item.trim());
                return {
                    [keyValue[0]]: keyValue[1]
                };
            }
            return item;
        });
    let objects = (str.trim().match(objectRegex) || []);
    simpleKeyValues = simpleKeyValues.map((item) => {
        if (typeof item === 'string' && item.match(/@/g)) {
            let obj = objects.shift();
            let key = obj.match(/^.*(?=\:)/)[0].trim();
            return {
                [key]: new DictArr(obj.replace(/^.*:/, '').trim())
            };
        }
        return item;
    });

    return [...simpleKeyValues];
}

let objectStr = `{
    obj: {
        ke1: 'va',
        ke2: 'va'
    },
    foo: 'bar',
    2: 'two',
    obj1: {
        ke1: 'va1',
        ke2: 'va2',
        ob: {
	 	    itm1: 1,
            itm2: 2, 
            obb: {
                ittm1: 2,
                ittm2: 3
            }
        }
    },
    three: 3,
    obj2: {
        ke1: 'va1',
        ke2: 'va2'
    },
    four: 'foo'
}`;

function DictionaryFactory(arr) {
    class Dictionary extends Array {
        constructor(...args) {
            super(...args);
        }
    }
    return new Dictionary(...arr);
}

function DictArr(str) {
    this.dict = parseKeyValue(str);

    for (let i = 0; i < this.dict.length; i++) {
        let key = Object.keys(this.dict[i])[0];
        let value = this.dict;
        Object.defineProperty(this.dict, key, {
            enumerable: false,
            get () {
                return value[i][key];
            },
            set (val) {
                value[i][key] = val;
            }
        });
    }

    DictArr[Symbol.iterator] = function* () {
        for (let i = 0; i < this.dict.length; i++) {
            let value = this.dict[i];
            yield value;
        }
    };

    return this.dict;
}

DictArr.prototype = Object.create(Array.prototype);
DictArr.prototype.constructor = DictArr;

DictArr.prototype.toString = function () {
    return this.dict;
}
let res = new DictArr(objectStr);

console.log(Object.keys(res));
