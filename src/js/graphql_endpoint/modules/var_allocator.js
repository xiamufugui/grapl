module.exports.VarAllocator =  class VarAllocator {
    constructor() {
        // Map from predicate_name to var
        this.vars = new Map();
        this.nameToVar = new Map();
        this.varTypes = new Map();
        this.nextVar = '$a';
    }

    alloc = (predName, predValue, predType) => {
        if (!predValue) {
            return
        }
        if (this.vars[predValue]) {
            return this.vars[predValue];
        }
        this.nameToVar.set(predName, predValue);
        this.vars[predValue] = this.incrVar();

        this.varTypes[predType] = this.nextVar;
        
        return this.vars[predValue];
    }

    incrVar = () => {
        if (this.nextVar.slice(-1) === 'z') {
            this.nextVar = this.nextVar + 'a'
        } else {
            const intVar = this.nextVar.slice(-1).charCodeAt(0);
            this.nextVar = String.fromCharCode(intVar + 1) 
        }

        return this.nextVar;
    }
}


module.exports.generateFilter = (varAlloc) => {
    const filters = [];
    for (const entry of varAlloc.nameToVar.entries()) {
        filters.push(`eq(${entry[0]}, ${entry[1]})`)
    }
    return filters.join(" AND ")
}


module.exports.varTypeList = (varAlloc) => {
    const typedPairs = [];
    for (const entry of varAlloc.vars.entries()) {
        typedPairs.push(`${entry[0]}:${entry[1]}`)
    }

    return typedPairs.join(", ")
}

module.exports.reverseMap = (map) => {
    const output = {};
    for (const entry of map.entries()) {
        output[entry[1]] = entry[0];
    }
    return output
}

