function markdownToHtml(markdown){
    if(markdown.includes('<')){
        let cursor = 0;

        while(markdown.includes('<', cursor)){
            const start = markdown.indexOf('<', cursor);
            markdown = markdown.slice(0, start)+'&lt;'+markdown.slice(start+1);
        }
    }

    markdown = wrapEmails(wrapLinks(markdown));

    const paragraphs = markdown.split('\n\n');
    let inCodeBlock = false;
    let codeLanguage;
    let codeLines = [];

    const htmlParagraphs = paragraphs.map((paragraph) => {
        const lines = paragraph.split('\n');
        let processedLines = [];
        let i = 0;
        
        while(i < lines.length){
            let line = lines[i];
            
            //HANDLE CODE BLOCKS
            if(line.startsWith('```')){
                inCodeBlock = !inCodeBlock;

                if(inCodeBlock){
                    if(processedLines.length > 0){
                        processedLines[processedLines.length-1] += '</p>';
                    }

                    codeLanguage = (line.slice(3) == '') ? 'plain' : line.slice(3).split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                    const previousLine = lines[i+1];
                    
                    const uuid = uniqid();
                    codeLines.push(`<code-header>${getLanguageKey(codeLanguage)}<button copy-id='${uuid}' class='copy' type='button' action='copy'><svg viewBox='0 0 24 24'><path d='M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z' /></svg></button></code-header>`);
                    codeLines.push(`<pre id='${uuid}' language='${codeLanguage}'><code>${tokenizeLine(codeLanguage, previousLine)}</code>`);
                    i += 2;
                    continue;
                }

                codeLanguage = '';
                codeLines[codeLines.length-1] += '</pre>';
                processedLines.push.apply(processedLines, codeLines);
                codeLines = [];

                if(line.length > 3){
                    processedLines.push('<p>');
                    lines[i] = line.slice(3);
                    continue;
                }

                if(i < lines.length-1){
                    processedLines.push('<p>');
                }

                i++;
                continue;
            }
            
            if(inCodeBlock){
                codeLines.push(`<code>${tokenizeLine(codeLanguage, line)}</code>`);
                i++;
                continue;
            }

            if(line.endsWith('  ')){
                line = line.slice(0, line.length-2)+'<br>';
            }

            //HANDLE SPACES
            if(line.includes('$~')){
                let insideDollar = false;
                let result = '';

                for(let i = 0; i < line.length; i++){
                    const char = line.charAt(i);

                    if(char === '$'){
                        insideDollar = !insideDollar;

                    }else if(insideDollar && char === '~'){
                        result += '&nbsp;';

                    }else{
                        result += char;
                    }
                }

                line = result;
            }

            //HANDLE BULLET LISTS
            if(/^[-+*] /.test(line)){
                const isUsed = processedLines.length > 0;
                if(isUsed){
                    processedLines.push('</p>');
                }
                
                let listItems = [];
                while(i < lines.length && /^[-+*] /.test(lines[i])){
                    listItems.push(`<li>${lines[i].slice(2)}</li>`);
                    i++;
                }
                processedLines.push(`<ul>${listItems.join('')}</ul>`);
                
                if(lines.length > i){
                    processedLines.push('<p>');
                }

                continue;
            }

            //HANDLE NUMBERED
            if(/^\d+\.\s/.test(line)){
                const isUsed = processedLines.length > 0;
                if(isUsed){
                    processedLines.push('</p>');
                }

                let listItems = [];
                while(i < lines.length && /^\d+\.\s/.test(lines[i])){
                    listItems.push(`<li>${lines[i].slice(lines[i].indexOf(' ')+1)}</li>`);
                    i++;
                }
                processedLines.push(`<ol>${listItems.join('')}</ol>`);

                if(lines.length > i){
                    processedLines.push('<p>');
                }

                continue;
            }

            //HANDLE BLOCKQUOTES
            if(line.startsWith('> ')){
                processedLines.push(`<blockquote>${line.slice(2)}</blockquote>`);
                i++;
                continue;
            }

            //HANDLE UNDERLINES FOR H1 & H2
            if(i < lines.length){
                let nextLine = lines[i+1];

                if(typeof nextLine != 'undefined'){
                    nextLine = lines[i+1].trim();

                    if(/^=+$/.test(nextLine)){
                        const isUsed = processedLines.length > 0;
                        if(isUsed){
                            processedLines.push('</p>');
                        }
                        const slug = line.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
                        processedLines.push(`<h1 id='${slug}'><a href='#${slug}' target='_blank'><svg viewBox='0 0 24 24'><path d='M20 10V8h-4V4h-2v4h-4V4H8v4H4v2h4v4H4v2h4v4h2v-4h4v4h2v-4h4v-2h-4v-4h4zm-6 4h-4v-4h4v4z' /></svg>${line}</a></h1>`);
                        i += 2;

                        if(lines.length > i){
                            processedLines.push('<p>');
                        }
                        continue;
    
                    }else if(/^-+$/.test(nextLine)){
                        const isUsed = processedLines.length > 0;
                        if(isUsed){
                            processedLines.push('</p>');
                        }
                        const slug = line.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
                        processedLines.push(`<h2 id='${slug}'><a href='#${slug}' target='_blank'><svg viewBox='0 0 24 24'><path d='M20 10V8h-4V4h-2v4h-4V4H8v4H4v2h4v4H4v2h4v4h2v-4h4v4h2v-4h4v-2h-4v-4h4zm-6 4h-4v-4h4v4z' /></svg>${line}</a></h2>`);
                        i += 2;

                        if(lines.length > i){
                            processedLines.push('<p>');
                        }
                        continue;
                    }
                }
            }

            //HANDLE HEADERS
            if(line.startsWith('### ')){
                const isUsed = processedLines.length > 0;
                if(isUsed){
                    processedLines.push('</p>');
                }
                const slug = line.slice(4).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
                processedLines.push(`<h3 id='${slug}'><a href='#${slug}' target='_blank'><svg viewBox='0 0 24 24'><path d='M20 10V8h-4V4h-2v4h-4V4H8v4H4v2h4v4H4v2h4v4h2v-4h4v4h2v-4h4v-2h-4v-4h4zm-6 4h-4v-4h4v4z' /></svg>${line.slice(4)}</a></h3>`);
                i++;

                if(lines.length > i){
                    processedLines.push('<p>');
                }
                continue;

            }else if(line.startsWith('## ')){
                const isUsed = processedLines.length > 0;
                if(isUsed){
                    processedLines.push('</p>');
                }
                const slug = line.slice(3).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
                processedLines.push(`<h2 id='${slug}'><a href='#${slug}' target='_blank'><svg viewBox='0 0 24 24'><path d='M20 10V8h-4V4h-2v4h-4V4H8v4H4v2h4v4H4v2h4v4h2v-4h4v4h2v-4h4v-2h-4v-4h4zm-6 4h-4v-4h4v4z' /></svg>${line.slice(3)}</a></h2>`);
                i++;

                if(lines.length > i){
                    processedLines.push('<p>');
                }
                continue;

            }else if(line.startsWith('# ')){
                const isUsed = processedLines.length > 0;
                if(isUsed){
                    processedLines.push('</p>');
                }
                const slug = line.slice(2).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
                processedLines.push(`<h1 id='${slug}'><a href='#${slug}' target='_blank'><svg viewBox='0 0 24 24'><path d='M20 10V8h-4V4h-2v4h-4V4H8v4H4v2h4v4H4v2h4v4h2v-4h4v4h2v-4h4v-2h-4v-4h4zm-6 4h-4v-4h4v4z' /></svg>${line.slice(2)}</a></h1>`);
                i++;
                
                if(lines.length > i){
                    processedLines.push('<p>');
                }
                continue;
            }

            line = markDownText(line);

            //HANDLE EXAMPLE
            if(line.includes('`')){
                while(line.includes('`')){
                    const start = line.indexOf('`');
                    const end = line.indexOf('`', start+1);

                    if(end === -1){
                        break;
                    }

                    const italicText = line.substring(start+1, end);
                    line = line.slice(0, start)+`<code>${italicText}</code>`+line.slice(end + 1);
                }
            }

            processedLines.push(line);
            i++;
        }

        if(inCodeBlock){
            codeLines.push('<code></code>');
        }

        //HANDLE TABLE
        if(lines.some((line) => line.startsWith('|'))){
            let tableHtml = '<table>';
            let isHeaderRow = true;
            let bodyHtml = '';
        
            lines.forEach((tableLine, index) => {
                if(tableLine.startsWith('|')){
                    const cells = tableLine.split('|').map(cell => cell.trim());
                    const filteredCells = cells.filter(cell => cell !== '');

                    if(index > 0 && filteredCells.every(cell => /^-+$/.test(cell))){
                        return;
                    }
        
                    if(isHeaderRow){
                        tableHtml += '<thead><tr>';
                        filteredCells.forEach(cell => {
                            tableHtml += '<th>'+markDownText(cell)+'</th>';
                        });
                        tableHtml += '</tr></thead>';
                        isHeaderRow = false;

                    }else{
                        bodyHtml += '<tr>';
                        filteredCells.forEach(cell => {
                            bodyHtml += '<td>'+markDownText(cell)+'</td>';
                        });
                        bodyHtml += '</tr>';
                    }
                }
            });
        
            if(bodyHtml){
                tableHtml += `<tbody>${bodyHtml}</tbody>`;
            }
            
            tableHtml += '</table>';
            return tableHtml;
        }

        //HANDLE LIST WRAPPING
        const isList = processedLines.every(line => line.startsWith('<li>'));
        if(isList){
            return `<ul>${processedLines.join('')}</ul>`;
        }

        const joinedLines = processedLines.join('\n');
        if(!inCodeBlock && !joinedLines.startsWith('<code-header>')){
            if(joinedLines.startsWith('<h') || joinedLines.startsWith('<ol') || joinedLines.startsWith('<ul')){
                return `${joinedLines}</p>`;
            }
            return `<p>${joinedLines}</p>`;
        }

        return joinedLines;
    });

    return htmlParagraphs.join('\n\n');
}

function wrapLinks(input){
    var urlRegex = /(?<![\(\[])(https?:\/\/[^\s"']+)/gi;
    return input.replace(urlRegex, function(url){
        return `<a class='link' href="${url}" target='_blank'>${url}</a>`;
    });
}

function wrapEmails(input){
    var emailRegex = /([a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    return input.replace(emailRegex, function(url){
        return `<a class='link' href="mailto:${url}" target='_blank'>${url}</a>`;
    });
}

function markDownText(line){
    //HANDLE IMAGES
    while(line.includes('![') && line.includes('](')){
        const startText = line.indexOf('![');
        const endText = line.indexOf('](', startText);
        const startUrl = line.indexOf('(', endText);
        const endUrl = line.indexOf(')', startUrl);

        if(startText !== -1 && endText !== -1 && startUrl !== -1 && endUrl !== -1){
            const url = line.substring(startUrl+1, endUrl);
            const pattern = new RegExp(
                '^(' +
                '([a-zA-Z]+:\\/\\/)?' + // protocol
                '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
                '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IP (v4) address
                '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
                '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
                '(\\#[-a-z\\d_]*)?' + // fragment locator
                '|' +
                '(\\/[-a-z\\d%_.~+]+(\\/[-a-z\\d%_.~+]+)*\\/?)' + // relative path with optional trailing slash
                '|' +
                '(\\#[-a-z\\d_]*)' + // fragment link
                ')$',
            'i');

            if(!pattern.test(url)){
                break;
            }

            const linkHtml = `<img src="${url}">`;

            line = line.slice(0, startText)+linkHtml+line.slice(endUrl+1);

        }else{
            break;
        }
    }

    //HANDLE LINKS
    while(line.includes('[') && line.includes('](')){
        const startText = line.indexOf('[');
        const endText = line.indexOf('](', startText);
        const startUrl = line.indexOf('(', endText);
        const endUrl = line.indexOf(')', startUrl);

        if(startText !== -1 && endText !== -1 && startUrl !== -1 && endUrl !== -1){
            const linkText = line.substring(startText+1, endText);
            const url = line.substring(startUrl+1, endUrl);
            const pattern = new RegExp(
                '^(' +
                '([a-zA-Z]+:\\/\\/)?' + // protocol
                '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
                '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IP (v4) address
                '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
                '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
                '(\\#[-a-z\\d_]*)?' + // fragment locator
                '|' +
                '(\\/[-a-z\\d%_.~+]*)*' + // path
                '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
                '(\\#[-a-z\\d_]*)?' + // fragment locator
                '|' +
                '(\\#[-a-z\\d_]*)' + // fragment link
                ')$',
            'i');

            if(!pattern.test(url)){
                break;
            }

            const linkHtml = `<a class='link' href="${url}" target='_blank'>${linkText}</a>`;

            line = line.slice(0, startText)+linkHtml+line.slice(endUrl+1);

        }else{
            break;
        }
    }

    //HANDLE BOLD
    if(line.includes('**')){
        while(line.includes('**')){
            const start = line.indexOf('**');
            const end = line.indexOf('**', start+2);

            if(end === -1){
                break;
            }

            const boldText = line.substring(start+2, end);
            line = line.slice(0, start)+`<strong>${boldText}</strong>`+line.slice(end + 2);
        }
    }

    //HANDLE ITALIC
    if(line.includes('*')){
        while(line.includes('*')){
            const start = line.indexOf('*');
            const end = line.indexOf('*', start+1);

            if(end === -1){
                break;
            }

            const italicText = line.substring(start+1, end);
            line = line.slice(0, start)+`<em>${italicText}</em>`+line.slice(end + 1);
        }
    }

    return line;
}

function getLanguageKey(language){
    switch(language){
        case 'java':
            return 'Java';

        case 'rust':
            return 'Rust';

        case 'json':
            return 'JSON';

        default:
            return 'Plain text';
    }
}

function tokenizeLine(language, line){
    let tokens;
    switch(language){
        case 'java':
            tokens = tokenizeJava(line);
            break;

        case 'rust':
            tokens = tokenizeRust(line);
            break;

        case 'json':
            tokens = tokenizeJson(line);
            break;

        default:
            return line;
    }
    
    return tokens
        .map(({ type, value }) => {
            const className = `code-${type}`;
            const escapedValue = value
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            return `<span class='${className}'>${escapedValue}</span>`;
        })
        .join('');
}

function tokenizeJava(line){
    const regex = /\b(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|if|implements|import|instanceof|int|interface|long|native|new|null|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while)\b|\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)'|\b\d+\b|[{}();,]|\n/g;

    const types = {
        keyword: /\b(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|if|implements|import|instanceof|int|interface|long|native|new|null|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while)\b/,
        comment: /\/\/[^\n]*|\/\*[\s\S]*?\*\//,
        string: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)'/,
        number: /\b\d+\b/,
        punctuation: /[{}();,]/
    };

    let match;
    let lastIndex = 0;

    const tokens = [];

    while((match = regex.exec(line)) !== null){
        const value = match[0];
        const type = Object.keys(types).find((key) => types[key].test(value)) || 'text';

        if(match.index > lastIndex){
            const plainText = line.slice(lastIndex, match.index);
            tokens.push({
                type: 'text',
                value: plainText,
            });
        }

        tokens.push({ type, value });

        lastIndex = regex.lastIndex;
    }

    if(lastIndex < line.length){
        tokens.push({
            type: 'text',
            value: line.slice(lastIndex),
        });
    }

    return tokens;
}

function tokenizeRust(line){
    const regex = /\b(abstract|alignof|as|become|box|break|const|continue|crate|dyn|else|enum|extern|false|fn|for|if|impl|in|let|loop|match|mod|move|mut|not|once|option|panic|priv|pub|ref|return|self|Self|static|struct|super|trait|true|type|unsafe|use|where|while)\b|\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)'|\b\d+\b|[{}();,|&:<>=_\-+*/%^!~?^,]/g;

    const types = {
        keyword: /\b(abstract|alignof|as|become|box|break|const|continue|crate|dyn|else|enum|extern|false|fn|for|if|impl|in|let|loop|match|mod|move|mut|not|once|option|panic|priv|pub|ref|return|self|Self|static|struct|super|trait|true|type|unsafe|use|where|while)\b/,
        comment: /\/\/[^\n]*|\/\*[\s\S]*?\*\//,
        string: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)'/,
        number: /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/,
        punctuation: /[{}();,|&:<>=_\-+*/%^!~?^,]/,
    };

    let match;
    let lastIndex = 0;

    const tokens = [];

    while((match = regex.exec(line)) !== null){
        const value = match[0];
        const type = Object.keys(types).find((key) => types[key].test(value)) || 'text';

        if(match.index > lastIndex){
            const plainText = line.slice(lastIndex, match.index);
            tokens.push({
                type: 'text',
                value: plainText,
            });
        }

        tokens.push({ type, value });

        lastIndex = regex.lastIndex;
    }

    if(lastIndex < line.length){
        tokens.push({
            type: 'text',
            value: line.slice(lastIndex),
        });
    }

    return tokens;
}

function tokenizeJson(line){
    const regex = /"(?:[^"\\]|\\.)*"|\b(?:true|false|null)\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b|[{}\[\]:,]|[\s]+/g;

    const types = {
        key: /"(?:[^"\\]|\\.)*"/,
        string: /"(?:[^"\\]|\\.)*"/,
        boolean: /\b(?:true|false)\b/,
        null: /\bnull\b/,
        number: /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/,
        punctuation: /[{}\[\]:,]/,
        whitespace: /[\s]+/,
    };

    let match;
    let lastIndex = 0;
    const tokens = [];
    let tokenId = 0;
    let isKey = true;

    while((match = regex.exec(line)) !== null){
        const value = match[0];
        let type = 'text';

        if(types.key.test(value)){
            type = isKey ? 'key' : 'string';
            isKey = !isKey;
        }else{
            type = Object.keys(types).find((key) => types[key].test(value)) || 'text';
        }

        if(match.index > lastIndex){
            const plainText = line.slice(lastIndex, match.index);
            tokens.push({
                id: `text_${tokenId++}`,
                type: 'text',
                value: plainText,
            });
        }

        tokens.push({
            id: `${type}_${tokenId++}`,
            type,
            value,
        });

        lastIndex = regex.lastIndex;
    }

    if(lastIndex < line.length){
        tokens.push({
            id: `text_${tokenId++}`,
            type: 'text',
            value: line.slice(lastIndex),
        });
    }

    return tokens;
}

const uniqid = function(){
    return Date.now().toString(36)+Math.random().toString(36).substr(2);
};
