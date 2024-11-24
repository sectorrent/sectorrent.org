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

            if(line.endsWith('  ')){
                line = line.slice(0, line.length-2)+'<br>';
            }
            
            //HANDLE CODE BLOCKS
            if(line.startsWith('```')){
                inCodeBlock = !inCodeBlock;

                if(inCodeBlock){
                    codeLanguage = (line.slice(3) == '') ? 'plain' : line.slice(3).toLowerCase();
                    const previousLine = lines[i+1];
                    codeLines.push(`<pre language='${codeLanguage}'><copy></copy><code>`+tokenizeLine(codeLanguage, previousLine));
                    i += 2;
                    continue;
                }

                codeLanguage = '';
                codeLines[codeLines.length-1] += '</code></pre>'+line.slice(3);
                processedLines.push.apply(processedLines, codeLines);
                codeLines = [];
                i++;
                continue;
            }
            
            if(inCodeBlock){
                codeLines.push(tokenizeLine(codeLanguage, line));
                i++;
                continue;
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
                let listItems = [];
                while(i < lines.length && /^[-+*] /.test(lines[i])){
                    listItems.push(`<li>${lines[i].slice(2)}</li>`);
                    i++;
                }
                processedLines.push(`<ul>${listItems.join('')}</ul>`);
                continue;
            }

            //HANDLE NUMBERED
            if(/^\d+\.\s/.test(line)){
                let listItems = [];
                while(i < lines.length && /^\d+\.\s/.test(lines[i])){
                    listItems.push(`<li>${lines[i].slice(lines[i].indexOf(' ')+1)}</li>`);
                    i++;
                }
                processedLines.push(`<ol>${listItems.join('')}</ol>`);
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
                        const slug = line.split(/\s/).join('-').toLowerCase();
                        processedLines.push(`<h1 id='${slug}'>${line}</h1>`);
                        i += 2;
                        continue;
    
                    }else if(/^-+$/.test(nextLine)){
                        const slug = line.split(/\s/).join('-').toLowerCase();
                        processedLines.push(`<h2 id='${slug}'>${line}</h2>`);
                        i += 2;
                        continue;
                    }
                }
            }

            //HANDLE HEADERS
            if(line.startsWith('### ')){
                const slug = line.slice(4).split(/\s/).join('-').toLowerCase();
                processedLines.push(`<h3 id='${slug}'>${line.slice(4)}</h3>`);
                i++;
                continue;

            }else if(line.startsWith('## ')){
                const slug = line.slice(3).split(/\s/).join('-').toLowerCase();
                processedLines.push(`<h2 id='${slug}'>${line.slice(3)}</h2>`);
                i++;
                continue;

            }else if(line.startsWith('# ')){
                const slug = line.slice(2).split(/\s/).join('-').toLowerCase();
                processedLines.push(`<h1 id='${slug}'>${line.slice(2)}</h1>`);
                i++;
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
            codeLines.push('');
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
        if(!inCodeBlock && !joinedLines.startsWith('<h') && !joinedLines.startsWith('<pre>')){
            return `<p>${joinedLines}</p>`;
        }

        return joinedLines;
    });

    return htmlParagraphs.join('\n\n');
}

function wrapLinks(input){
    var urlRegex = /(?<!\()https?:\/\/[^\s]+/gi;
    return input.replace(urlRegex, function(url){
        return `<a href="${url}">${url}</a>`;
    });
}

function wrapEmails(input){
    var emailRegex = /([a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    return input.replace(emailRegex, function(url){
        return `<a href="mailto:${url}">${url}</a>`;
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
            if(url.includes('"')){
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
            if(!/^(#|\/|https?:\/\/)[^\s]+/.test(url)){
                break;
            }
            const linkHtml = `<a href="${url}">${linkText}</a>`;

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

function tokenizeLine(language, line){
    let tokens;
    switch(language){
        case 'java':
            tokens = tokenizeJava(line);
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
