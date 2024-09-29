document.addEventListener('DOMContentLoaded', function () {
    const shell = document.getElementById('shell');

    const commands = {
        help: () => "Available commands: help, echo, clear, cat, ls (they all work in a very simple way, so most of the flags are not implemented and never will be)",
        echo: (args) => { 
            return args.join(' '); 
        },
        clear: () => {
            shell.innerHTML = '';
            return '';
        },
        cat: (args) => {
            let res = "";
            args.forEach(arg => {
                res += data[arg];
            });
            return res;
        },
        ls: (args) => {
            let list = Object.keys(data);
            list = list.sort();
            not_hidden = list.filter(ele => !ele.startsWith("."));
            hidden = list.filter(ele => ele.startsWith("."));
            let res_list = [];
            let res = not_hidden.join(" ");
            args.forEach(arg => {
                if (arg.startsWith("-")) {
                    if (arg.includes("a")) {
                        if (!res_list.includes(hidden)) {
                            hidden.forEach(ele => res_list.push(ele));
                        }
                    }
                    if (!res_list.includes(not_hidden)) {
                        not_hidden.forEach(ele => res_list.push(ele));
                    }
                    res = res_list.join(" ");
                    if (arg.includes("l")) {
                        res = res_list.join("<br>");
                    }
                }
            });
        
            return res;
        },
        whoami: () => "pole"
    };

    const addNewLine = () => {
        const inputLine = document.createElement('div');
        inputLine.id = 'input-line';

        const prompt = document.createElement('span');
        prompt.id = 'prompt';
        prompt.innerText = '/home/pole/posts> ';
        inputLine.appendChild(prompt);

        const userInput = document.createElement('input');
        userInput.id = 'user-input';
        userInput.type = 'text';
        userInput.autofocus = true;
        userInput.addEventListener('keydown', handleInput);
        inputLine.appendChild(userInput);

        shell.appendChild(inputLine);
        userInput.focus();
    };

    let history = [];
    let historyIndex = -1;
    
    const handleInput = (event) => {
        if (event.key === 'Enter') {
            const input = event.target.value.trim();
            history.push(input);
            historyIndex = history.length;
    
            const output = processInput(input);
            if (output !== '') {
                addOutput(output);
            }
            event.target.removeEventListener('keydown', handleInput);
            event.target.disabled = true;
            addNewLine();
        } else if (event.key === 'ArrowUp') {
            if (historyIndex > 0) {
                historyIndex--;
                event.target.value = history[historyIndex];
            }
        } else if (event.key === 'ArrowDown') {
            if (historyIndex < history.length - 1) {
                historyIndex++;
                event.target.value = history[historyIndex];
            } else {
                historyIndex = history.length;
                event.target.value = '';
            }
        }
    };

    const processInput = (input) => {
        const parts = input.split(' ');
        const command = parts[0];
        const args = parts.slice(1);

        if (commands[command]) {
            return commands[command](args);
        } else {
            return `'${command}' is not recognized as a valid command. Type 'help' for a list of commands.`;
        }
    };

    const addOutput = (output) => {
        const outputLine = document.createElement('div');
        outputLine.innerHTML = output;
        shell.appendChild(outputLine);
        microlight.reset();
        //document.getElementById("divFirst").scrollIntoView();
    };

    addNewLine();
});

