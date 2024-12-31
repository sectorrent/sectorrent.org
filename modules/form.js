//const { v4: uuidv4 } = require('uuid');
const FieldError = require('./field_error');

exports.checkMatch = (original, replace) => {
    for(const key in replace){
        if(!original.hasOwnProperty(key)){
            continue;
        }

        if(Array.isArray(replace[key])){
            original[key] = checkMatch(original[key], replace[key]);
            continue;
        }

        if(replace[key] != original[key]){
            original[key] = replace[key];
        }
    }

    return original;
};

exports.checkForm = (form, request) => {
    const response = {};

    for(const entry of form){
        if(!request.hasOwnProperty(entry.key) && entry.type != 'BOOLEAN'){
            if(entry.required){
                throw new FieldError([
                    {
                        type: entry.key,
                        message: 'is not set.'
                    }
                ]);
            }

            continue;
        }

        try{
            let check = null;

            switch(entry.type){
                case 'STRING':
                    check = checkString(entry, request[entry.key]);
                    break;

                case 'NUMBER':
                    check = checkNumber(entry, request[entry.key]);
                    break;
                    
                case 'EMAIL':
                    check = checkEmail(entry, request[entry.key]);
                    break;
                    
                case 'DATE':
                    check = checkDate(entry, request[entry.key]);
                    break;
                    
                case 'SWITCH':
                    check = checkSwitch(entry, request[entry.key]);
                    break;
                    
                case 'ARRAY':
                    check = checkArray(entry, request[entry.key]);
                    break;
                    
                case 'OBJECT':
                    check = checkObject(entry, request[entry.key]);
                    break;

                case 'BOOLEAN':
                    check = checkBoolean(entry, request[entry.key]);
                    break;

                case 'COLOR':
                    check = checkColor(entry, request[entry.key]);
                    break;
            }

            if(check != null){
                response[entry.key] = check;
            }

        }catch(error){
            if(entry.required){
                throw error;
            }
        }
    }

    return response;
};

function checkString(entry, request){
    if(entry.min && entry.min > request.length){
        throw new FieldError([
            {
                type: entry.key,
                message: 'is not long enough.'
            }
        ]);
    }

    if(entry.max && entry.max < request.length){
        throw new FieldError([
            {
                type: entry.key,
                message: 'is too long.'
            }
        ]);
    }

    if(entry.match && entry.match !== request){
        throw new FieldError([
            {
                type: entry.key,
                message: 'doesnt match required.'
            }
        ]);

    }else if(entry.pattern && !entry.pattern.test(request)){
        throw new FieldError([
            {
                type: entry.key,
                message: 'uses invalid chars.'
            }
        ]);
    }

    return request.trim();
}

function checkEmail(entry, request){
    request = checkString(entry, request);

    if(!/^\S+@\S+\.\S+$/.test(request)){
        throw new FieldError([
            {
                type: entry.key,
                message: 'is not a valid email.'
            }
        ]);
    }

    return request.toLowerCase();
}

function checkNumber(entry, request){
    if(isNaN(request)){
        throw new FieldError([
            {
                type: entry.key,
                message: 'is not numeric.'
            }
        ]);
    }

    if(entry.match && entry.match !== request){
        throw new FieldError([
            {
                type: entry.key,
                message: 'doesnt match required.'
            }
        ]);
    }

    if(entry.min && entry.min > request){
        throw new FieldError([
            {
                type: entry.key,
                message: 'less than required.'
            }
        ]);
    }

    if(entry.max && entry.max < request){
        throw new FieldError([
            {
                type: entry.key,
                message: 'is more than required.'
            }
        ]);
    }

    return parseInt(request);
}

function checkDate(entry, request){
    const date = new Date(request);
    if(isNaN(date.getTime())){
        throw new FieldError([
            {
                type: entry.key,
                message: 'requires a date.'
            }
        ]);
    }
    
    return date;
}

function checkBoolean(entry, request){
    const value = (typeof request !== 'undefined' && (request == 'on' || request));

    if(entry.match && value != match){
        throw new FieldError([
            {
                type: entry.key,
                message: 'requires value that wasnt checked.'
            }
        ]);
    }

    return value;
}

function checkColor(entry, request){
    const pattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
    return pattern.test(str);
}

function checkSwitch(entry, request){
    if(!entry.entries.includes(request)){
        if(entry.overwrite){
            return entry.overwrite[request];
        }
        throw new FieldError([
            {
                type: entry.key,
                message: 'is not within defined scope.'
            }
        ]);
    }

    return request;
}

function checkArray(entry, request){
    const response = [];

    for(const [ key, req ] of Object.entries(request)){
        let check = null;

        try{
            switch(entry.entries.type){
                case 'STRING':
                    entry.entries.key = `${entry.key} ${key}`;
                    check = checkString(entry.entries, req);
                    break;

                case 'NUMBER':
                    entry.entries.key = `${entry.key} ${key}`;
                    check = checkNumber(entry.entries, req);
                    break;

                case 'EMAIL':
                    entry.entries.key = `${entry.key} ${key}`;
                    check = checkEmail(entry.entries, req);
                    break;

                case 'DATE':
                    entry.entries.key = `${entry.key} ${key}`;
                    check = checkDate(entry.entries, req);
                    break;

                case 'SWITCH':
                    entry.entries.key = `${entry.key} ${key}`;
                    check = checkSwitch(entry.entries, req);
                    break;

                case 'ARRAY':
                    entry.entries.key = `${entry.key} ${key}`;
                    check = checkArray(entry.entries, req);
                    break;

                case 'OBJECT':
                    entry.entries.key = `${entry.key} ${key}`;
                    check = checkObject(entry.entries, req);
                    break;

                case 'BOOLEAN':
                    entry.entries.key = `${entry.key} ${key}`;
                    check = checkBoolean(entry.entries, req);
                    break;

                case 'COLOR':
                    entry.entries.key = `${entry.key} ${key}`;
                    check = checkColor(entry.entries, req);
                    break;
            }

            if(check != null){
                response[key] = check;
            }

        }catch(error){
            if(entry.entries.required){
                throw error;
            }
        }
    }

    if(entry.duplicates && !entry.duplicates &&
            Object.keys(response).length !== new Set(Object.values(response)).size){
        throw new FieldError([
            {
                type: entry.key,
                message: 'contains duplicates.'
            }
        ]);
    }

    if(entry.min && entry.min > Object.keys(request).length){
        throw new FieldError([
            {
                type: entry.key,
                message: 'has too few entries.'
            }
        ]);
    }

    if(entry.max && entry.max < Object.keys(request).length){
        throw new FieldError([
            {
                type: entry.key,
                message: 'has too many entries.'
            }
        ]);
    }

    return response;
}

function checkObject(entry, request){
    if(entry.min && entry.min > Object.keys(request[entry.entries[0].key]).length){
        throw new FieldError([
            {
                type: entry.key,
                message: 'has too few entries.'
            }
        ]);
    }

    if(entry.max && entry.max < Object.keys(request[entry.entries[0].key]).length){
        throw new FieldError([
            {
                type: entry.key,
                message: 'has too many entries.'
            }
        ]);
    }

    const response = {};

    for(const e of entry.entries){
        let check = null;

        try{
            switch(e.type){
                case 'STRING':
                    check = checkString(e, request[e.key]);
                    break;

                case 'NUMBER':
                    check = checkNumber(e, request[e.key]);
                    break;

                case 'EMAIL':
                    check = checkEmail(e, request[e.key]);
                    break;

                case 'DATE':
                    check = checkDate(e, request[e.key]);
                    break;

                case 'SWITCH':
                    check = checkSwitch(e, request[e.key]);
                    break;

                case 'COLOR':
                    check = checkColor(e, request[e.key]);
                    break;

                case 'ARRAY':
                    if(entry.keys){
                        const req = {};
                        for(const key of Object.keys(request[e.key])){
                            if(entry.keys.includes(key)){
                                req[key] = request[e.key][key];
                            }
                        }

                        if(Object.keys(req).length <= entry.keys.length){
                            request[e.key] = req;

                        }else{
                            throw new FieldError([
                                {
                                    type: e.key,
                                    message: 'is not set.'
                                }
                            ]);
                        }
                    }

                    if(!request[e.key]){
                        if(e.required){
                            throw new FieldError([
                                {
                                    type: e.key,
                                    message: 'is not set.'
                                }
                            ]);
                        }
                        break;
                    }

                    check = checkArray(e, request[e.key]);
                    break;

                case 'OBJECT':
                    check = checkObject(e, request[e.key]);
                    break;

                case 'BOOLEAN':
                    check = checkObject(e, request[e.key]);
                    break;
            }

            if(check != null){
                response[e.key] = check;
            }

        }catch(error){
            console.log(error);
            if(e.required){
                throw error;
            }
        }
    }

    return response;
}

//FOR REMOVING ODD BEHAVIOR WITH OBJECTS ON REGULAR POST
exports.removePrototype = (obj) => {
    if(typeof obj !== 'object' || obj === null){
        return obj;
    }

    const newObj = Array.isArray(obj) ? [] : {};

    for(const key in obj){
        if(Object.prototype.hasOwnProperty.call(obj, key)){
            newObj[key] = this.removePrototype(obj[key]);
        }
    }

    return newObj;
};

//CONVERTING POORLY MADE FILES ARRAY TO OBJECT THAT IS USABLE
exports.convertFilesToObject = (files) => {
    const result = {};
    
    for(const file of files){
        const parts = file.fieldname.split('[');
        let currentObj = result;

        parts.forEach((part, index) => {
            if(checkPrototypePollution(part)){
                throw new Error('Prototype pollution detected.');
            }
            const key = part.replace(']', '');

            if(index === parts.length-1){
                for(const k of Object.keys(file)){
                    if(!currentObj[k]){
                        currentObj[k] = [];
                    }
                    currentObj[k][key] = file[k];
                }

            }else{
                currentObj[key] = currentObj[key] || {};
                currentObj = currentObj[key];
            }
        });
    }

    return result;
};

exports.recursiveUpdate = (originalData, newData) => {
    for(const key of Object.keys(originalData)){
        if(typeof newData[key] == undefined || newData[key] == null){
            continue;
        }

        if(Array.isArray(originalData[key])){
            originalData[key] = newData[key];
            
        }else if(typeof originalData[key] === 'object' && originalData[key] !== null){
            originalData[key] = this.recursiveUpdate(originalData[key], newData[key]);

        }else{
            originalData[key] = newData[key];
        }
    }

    return originalData;
};

function checkPrototypePollution(proto){
    let knownProps = [
        '__proto__',
        'constructor',
        'prototype',
        'toString',
        'valueOf',
        '__defineGetter__',
        '__defineSetter__',
        'hasOwnProperty',
        '__lookupGetter__',
        '__lookupSetter__',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'toLocaleString'
    ];

    for(let prop in Object.prototype){
        if(!knownProps.includes(proto)){
            console.warn(`Unexpected prototype property found: ${prop}`);
            return true;
        }
    }
    return false;
}
