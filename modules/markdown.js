exports.parse = (markdown) => {
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
                    const previousLine = lines[i+1];
                    processedLines.push('<pre><code>'+previousLine);
                    i += 2;
                    continue;
                }

                processedLines[processedLines.length-1] = processedLines[processedLines.length-1]+'</code></pre>';
                i++;
                continue;
            }
            
            if(inCodeBlock){
                processedLines.push(line);
                i++;
                continue;
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
};

function wrapLinks(input){
    var urlRegex = /(https?:\/\/[^\s]+)/gi;
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
            if(url.includes('"')){
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
