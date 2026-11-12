document.addEventListener('DOMContentLoaded', function () {
    const shell = document.getElementById('shell');

    // ---------- virtual file system ----------
    // /home/pole/posts contains the posts (from `data`), /home/pole/games the
    // games (from `gameList`, both appended to this file by main.py).
    const HOME = "/home/pole";
    const POSTS = HOME + "/posts";
    const GAMES = HOME + "/games";
    const DIRS = { "/": ["home/"], "/home": ["pole/"], [HOME]: ["games/", "posts/"] };
    const games = typeof gameList !== "undefined" ? gameList : [];
    const startTime = Date.now();

    const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
    const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    let cwd = POSTS;
    let previousCwd = POSTS;
    let prepopulateHelp = true;
    const commandHistory = [];
    let historyIndex = 0;


    function listDir(path) {
        if (has(DIRS, path)) return DIRS[path];

        // Build the virtual directory tree from the post keys.
        if (path === POSTS || (
            path.startsWith(POSTS + "/") &&
            !has(data, path.slice(POSTS.length + 1))
        )) {            
            const prefix = path === POSTS
                ? ""
                : path.slice(POSTS.length + 1) + "/";

            const entries = new Set();

            for (const key of Object.keys(data)) {
                if (!key.startsWith(prefix)) continue;

                const remainder = key.slice(prefix.length);
                if (!remainder) continue;

                const parts = remainder.split("/");

                // A slash means this entry is a directory.
                entries.add(
                    parts.length > 1 ? parts[0] + "/" : parts[0]
                );
            }

            return [...entries].sort();
        }

        if (path === GAMES) return games.slice().sort();

        return null;
    }

    // Returns {type: "dir" | "post" | "game", ...} or null.
    function lookup(arg) {
        const path = resolvePath(arg);

        // Check for a post first.
        if (path.startsWith(POSTS + "/")) {
            const name = path.slice(POSTS.length + 1);

            if (has(data, name)) {
                return { type: "post", name, path };
            }
        }

        // Then check for directories.
        if (listDir(path) !== null) {
            return { type: "dir", path };
        }

        const i = path.lastIndexOf("/");
        const dir = path.slice(0, i) || "/";
        const name = path.slice(i + 1);

        if (dir === GAMES && games.includes(name)) {
            return { type: "game", name, path };
        }

        return null;
    }

    // Turns "../games", "~/posts", "/home/pole" ... into an absolute path
    function resolvePath(arg) {
        if (arg === undefined || arg === "") return cwd;
        let parts;
        if (arg === "~" || arg.startsWith("~/")) {
            parts = HOME.split("/").filter(Boolean);
            arg = arg.slice(1);
        } else if (arg.startsWith("/")) {
            parts = [];
        } else {
            parts = cwd.split("/").filter(Boolean);
        }
        for (const seg of arg.split("/")) {
            if (seg === "" || seg === ".") continue;
            if (seg === "..") parts.pop();
            else parts.push(seg);
        }
        return "/" + parts.join("/");
    }

    // Plain-text lines of a post (for head, tail, wc, grep)
    function postLines(name) {
        const div = document.createElement("div");
        div.innerHTML = data[name].replace(/<br\s*\/?>|<\/(p|h[1-6]|li|pre|div|tr|blockquote)>/gi, "$&\n");
        return div.textContent.split("\n").map(l => l.trim()).filter(l => l !== "");
    }

    function readText(cmd, arg) {
        const f = lookup(arg);
        if (!f) return { error: `${cmd}: ${esc(arg)}: No such file or directory` };
        if (f.type === "dir") return { error: `${cmd}: ${esc(arg)}: Is a directory` };
        if (f.type === "game") return { error: `${cmd}: ${esc(arg)}: binary file (try 'play ${esc(f.name)}')` };
        return { name: f.name, lines: postLines(f.name) };
    }

    function goTo(url, message) {
        setTimeout(() => { window.location.href = url; }, 400);
        return esc(message);
    }

    function headTail(cmd, args, fromEnd) {
        let n = 10;
        const files = [];
        for (let i = 0; i < args.length; i++) {
            if (args[i] === "-n") n = parseInt(args[++i], 10);
            else if (/^-\d+$/.test(args[i])) n = parseInt(args[i].slice(1), 10);
            else files.push(args[i]);
        }
        if (!Number.isFinite(n) || n < 0) return `${cmd}: invalid number of lines`;
        if (files.length === 0) return `usage: ${cmd} [-n N] &lt;post&gt;...`;
        return files.map(file => {
            const r = readText(cmd, file);
            if (r.error) return r.error;
            const lines = fromEnd ? (n === 0 ? [] : r.lines.slice(-n)) : r.lines.slice(0, n);
            const header = files.length > 1 ? `==&gt; ${esc(r.name)} &lt;==<br>` : "";
            return header + lines.map(esc).join("<br>");
        }).join("<br><br>");
    }

    function formatDuration(ms) {
        const s = Math.floor(ms / 1000);
        const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60;
        return (h ? `${h} h, ` : "") + `${m} min, ${s % 60} sec`;
    }

    const FORTUNES = [
        "Today's bug is tomorrow's feature.",
        "It works on my machine. Ship the machine.",
        "The best code is the code you never had to write.",
        "Your next commit will compile on the first try. Probably.",
        "Have you tried turning it off and on again?",
        "Weeks of coding can save you hours of planning.",
        "There's no place like 127.0.0.1.",
        "A clean desk is a sign of a full git stash.",
        "The oscilloscope never lies. The datasheet sometimes does.",
        "Every embedded project is 10% code and 90% finding the right pin.",
    ];

    // ---------- commands ----------
    // hidden: true keeps easter eggs out of `help`
    const commands = {
        help: {
            usage: "help [command]", desc: "list the commands, or explain one",
            run: (args) => {
                if (args.length > 0) {
                    const name = args[0].toLowerCase();
                    if (!has(commands, name)) return `help: no help topics match '${esc(args[0])}'`;
                    return `usage: ${esc(commands[name].usage)}<br>${esc(commands[name].desc)}`;
                }
                const names = Object.keys(commands).filter(n => !commands[n].hidden);
                const width = Math.max(...names.map(n => commands[n].usage.length)) + 2;
                return "<pre>" + names.map(n => esc(commands[n].usage.padEnd(width) + commands[n].desc)).join("\n") +
                    "</pre>Tab completes, ↑/↓ browse the history, Ctrl+L clears, Ctrl+C cancels.";
            }
        },
        man: { usage: "man <command>", desc: "same as help <command>", run: (args) => commands.help.run(args) },
        ls: {
            usage: "ls [-a] [-l] [dir]", desc: "list files (-a shows hidden ones, -l one per line)",
            run: (args) => {
                const flags = args.filter(a => a.startsWith("-")).join("");
                const targets = args.filter(a => !a.startsWith("-"));
                const show = (names) => names
                    .filter(n => flags.includes("a") || !n.startsWith("."))
                    .map(esc).join(flags.includes("l") ? "<br>" : " ");
                if (targets.length === 0) return show(listDir(cwd));
                return targets.map(t => {
                    const f = lookup(t);
                    if (!f) return `ls: cannot access '${esc(t)}': No such file or directory`;
                    if (f.type !== "dir") return esc(t);
                    return (targets.length > 1 ? `${esc(t)}:<br>` : "") + show(listDir(f.path));
                }).join("<br>");
            }
        },
        cd: {
            usage: "cd [dir]", desc: "change directory (try 'cd ../games')",
            run: (args) => {
                const target = args[0] === undefined ? "~" : args[0];
                const path = target === "-" ? previousCwd : null;
                const f = path ? { type: "dir", path } : lookup(target);
                if (!f) return `cd: ${esc(target)}: No such file or directory`;
                if (f.type !== "dir") return `cd: ${esc(target)}: Not a directory`;
                previousCwd = cwd;
                cwd = f.path;
                return "";
            }
        },
        pwd: { usage: "pwd", desc: "print the current directory", run: () => esc(cwd) },
        cat: {
            usage: "cat <post>...", desc: "read a post",
            run: (args) => {
                if (args.length === 0) return "usage: cat &lt;post&gt;...";
                return args.map(arg => {
                    const f = lookup(arg);
                    if (!f) return `cat: ${esc(arg)}: No such file or directory<br>`;
                    if (f.type === "dir") return `cat: ${esc(arg)}: Is a directory<br>`;
                    if (f.type === "game") return `cat: ${esc(arg)}: binary file (try 'play ${esc(f.name)}')<br>`;
                    return data[f.name];
                }).join("");
            }
        },
        head: { usage: "head [-n N] <post>", desc: "print the first lines of a post", run: (args) => headTail("head", args, false) },
        tail: { usage: "tail [-n N] <post>", desc: "print the last lines of a post", run: (args) => headTail("tail", args, true) },
        wc: {
            usage: "wc <post>...", desc: "count lines, words and characters",
            run: (args) => {
                if (args.length === 0) return "usage: wc &lt;post&gt;...";
                return "<pre>" + args.map(arg => {
                    const r = readText("wc", arg);
                    if (r.error) return r.error;
                    const text = r.lines.join("\n");
                    const words = text.split(/\s+/).filter(Boolean).length;
                    return `${String(r.lines.length).padStart(6)} ${String(words).padStart(7)} ${String(text.length).padStart(8)} ${esc(r.name)}`;
                }).join("\n") + "</pre>";
            }
        },
        grep: {
            usage: "grep [-i] <pattern> [post...]", desc: "search the posts (-i ignores case)",
            run: (args) => {
                const ignoreCase = args.includes("-i");
                const rest = args.filter(a => a !== "-i");
                if (rest.length === 0) return "usage: grep [-i] &lt;pattern&gt; [post...]";
                let files = rest.slice(1);
                const searchAll = files.length === 0;
                if (searchAll) {
                    files = Object.keys(data).map(n => POSTS + "/" + n);
                }  

                const pattern = rest[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                const flags = ignoreCase ? "i" : "";
                const test = new RegExp(pattern, flags);
                const split = new RegExp("(" + pattern + ")", flags);
                const out = [];
                for (const file of files) {
                    const r = readText("grep", file);
                    if (r.error) { out.push(r.error); continue; }
                    for (const line of r.lines) {
                        if (!test.test(line)) continue;
                        const marked = line.split(split)
                            .map((part, i) => i % 2 ? `<strong>${esc(part)}</strong>` : esc(part)).join("");
                        out.push((searchAll || files.length > 1 ? `${esc(r.name)}: ` : "") + marked);
                    }
                }
                return out.length ? out.join("<br>") : "(no matches)";
            }
        },
        open: {
            usage: "open <post|game>",
            desc: "open a post or a game as a normal page",
            run: (args) => {
                if (args.length === 0) return "usage: open &lt;post|game&gt;";

                const f = lookup(args[0]);

                if (!f) return `open: ${esc(args[0])}: No such file or directory`;
                if (f.type === "dir") return `open: ${esc(args[0])}: Is a directory`;

                if (f.type === "game") {
                    return goTo(`/games/${f.name}.html`, `Launching ${f.name}...`);
                }

                if (f.name.startsWith(".")) {
                    return `open: ${esc(f.name)}: this file only exists in here, try 'cat ${esc(f.name)}'`;
                }

                const url = f.name
                    .split("/")
                    .map(encodeURIComponent)
                    .join("/");

                return goTo(`/posts/${url}.html`, `Opening ${f.name}...`);
            }
        },
        play: {
            usage: "play [game]", desc: "list the games, or play one",
            run: (args) => {
                if (games.length === 0) return "No games installed.";
                if (args.length === 0) return "Available games: " + games.map(esc).join(" ") + "<br>usage: play &lt;game&gt;";
                const name = args[0].split("/").pop();
                if (!games.includes(name)) return `play: ${esc(args[0])}: game not found`;
                return goTo(`/games/${name}.html`, `Launching ${name}...`);
            }
        },
        echo: { usage: "echo <text>", desc: "print some text", run: (args) => args.join(" ") },
        history: {
            usage: "history [-c]", desc: "show (or clear) the commands you typed",
            run: (args) => {
                if (args.includes("-c")) { commandHistory.length = 0; historyIndex = 0; return ""; }
                return "<pre>" + commandHistory.map((c, i) => `${String(i + 1).padStart(4)}  ${esc(c)}`).join("\n") + "</pre>";
            }
        },
        clear: { usage: "clear", desc: "clear the screen", run: () => { shell.innerHTML = ''; return ''; } },
        date: { usage: "date", desc: "print the current date and time", run: () => esc(new Date().toString()) },
        uptime: { usage: "uptime", desc: "how long this shell has been open", run: () => `up ${formatDuration(Date.now() - startTime)}, 1 user` },
        uname: {
            usage: "uname [-a]", desc: "print system information",
            run: (args) => args.includes("-a")
                ? esc(`PoleOS ${window.location.hostname || "localhost"} 1.0.0 ${navigator.platform || "web"} javascript`)
                : "PoleOS"
        },
        neofetch: {
            usage: "neofetch", desc: "show system info with style",
            run: () => {
                const host = window.location.hostname || "localhost";
                const art = ["  ______  ", " | o  o | ", " |  __  | ", " |______| ", "    ||    ", "   _||_   ", "          ", "          "];
                const title = `pole@${host}`;
                const info = [
                    title,
                    "-".repeat(title.length),
                    "OS: PoleOS 1.0.0",
                    "Shell: polesh",
                    `Uptime: ${formatDuration(Date.now() - startTime)}`,
                    `Posts: ${Object.keys(data).filter(n => !n.startsWith(".")).length}`,
                    `Games: ${games.length}`,
                    `Resolution: ${window.screen.width}x${window.screen.height}`,
                ];
                return "<pre>" + art.map((line, i) => esc(line + "   " + (info[i] || ""))).join("\n") + "</pre>";
            }
        },
        fortune: { usage: "fortune", desc: "print a random piece of wisdom", run: () => esc(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]) },
        exit: { usage: "exit", desc: "leave hacker mode", run: () => goTo("/", "logout") },

        // easter eggs
        whoami: { hidden: true, usage: "whoami", desc: "print your user name", run: () => "pole" },
        sudo: {
            hidden: true, usage: "sudo <command>", desc: "nice try",
            run: (args) => args.join(" ") === "make me a sandwich" ? "Okay." : "pole is not in the sudoers file. This incident will be reported."
        },
        rm: { hidden: true, usage: "rm <file>", desc: "nope", run: () => "rm: permission denied (these posts took too long to write)" },
        cls: { hidden: true, usage: "cls", desc: "wrong operating system, but fine", run: () => commands.clear.run() },
    };

    // ---------- parsing ----------
    // Splits the input into commands (separated by ';') made of words,
    // honouring "double" and 'single' quotes.
    function parse(input) {
        const groups = [[]];
        let current = "", quote = null, inWord = false;
        const endWord = () => { if (inWord) groups[groups.length - 1].push(current); current = ""; inWord = false; };
        for (const ch of input) {
            if (quote) {
                if (ch === quote) quote = null;
                else current += ch;
            } else if (ch === '"' || ch === "'") {
                quote = ch;
                inWord = true;
            } else if (ch === ";") {
                endWord();
                groups.push([]);
            } else if (/\s/.test(ch)) {
                endWord();
            } else {
                current += ch;
                inWord = true;
            }
        }
        endWord();
        return groups.filter(g => g.length > 0);
    }

    function runCommand(words) {
        const name = words[0].toLowerCase(); // commands are case insensitive
        if (has(commands, name)) return commands[name].run(words.slice(1));
        return `'${esc(words[0])}' is not recognized as a valid command. Type 'help' for a list of commands.`;
    }

    const processInput = (input) => parse(input).map(runCommand).filter(out => out !== "").join("<br>");

    // ---------- tab completion ----------
    function completePath(current, onlyDirs) {
        const slash = current.lastIndexOf("/");
        const prefix = current.slice(0, slash + 1);
        const base = current.slice(slash + 1);
        const entries = listDir(prefix ? resolvePath(prefix) : cwd) || [];
        return entries
            .filter(e => e.startsWith(base) && (!onlyDirs || e.endsWith("/")))
            .filter(e => base.startsWith(".") || !e.startsWith("."))
            .map(e => prefix + e);
    }

    function completions(value) {
        const words = value.split(";").pop().replace(/^\s+/, "").split(" ");
        const current = words[words.length - 1];
        const visibleCommands = Object.keys(commands).filter(n => !commands[n].hidden);
        let candidates;
        if (words.length === 1) candidates = visibleCommands.filter(c => c.startsWith(current.toLowerCase()));
        else {
            const cmd = words[0].toLowerCase();
            if (cmd === "help" || cmd === "man") candidates = visibleCommands.filter(c => c.startsWith(current));
            else if (cmd === "play") candidates = games.filter(g => g.startsWith(current));
            else candidates = completePath(current, cmd === "cd");
        }
        return { current, candidates };
    }

    const commonPrefix = (list) => list.reduce((a, b) => {
        let i = 0;
        while (i < a.length && a[i] === b[i]) i++;
        return a.slice(0, i);
    });

    // ---------- input handling ----------
    const addNewLine = (initialValue = "") => {
        const inputLine = document.createElement('div');
        inputLine.className = 'input-line';

        const prompt = document.createElement('span');
        prompt.id = 'prompt';
        prompt.innerText = cwd + '> ';
        inputLine.appendChild(prompt);

        const userInput = document.createElement('textarea');
        userInput.value = initialValue;
        if (prepopulateHelp) {
            userInput.value = "help";
            prepopulateHelp = false;
        }
        userInput.id = 'user-input';
        userInput.rows = 1;
        autoAdjustHeight(userInput);
        userInput.spellcheck = false;
        userInput.setAttribute("autocapitalize", "off");
        userInput.addEventListener('keydown', handleInput);
        userInput.addEventListener('input', () => autoAdjustHeight(userInput));

        inputLine.appendChild(userInput);
        shell.appendChild(inputLine);
        userInput.focus();
        inputLine.scrollIntoView({ block: "nearest" });
    };

    function autoAdjustHeight(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    const finishLine = (target) => {
        target.removeEventListener('keydown', handleInput);
        target.disabled = true;
    };

    const handleInput = (event) => {
        const target = event.target;
        const key = event.key;

        if (event.ctrlKey && key.toLowerCase() === "l") {
            event.preventDefault();
            const value = target.value;
            shell.innerHTML = "";
            addNewLine(value);
        } else if (event.ctrlKey && key.toLowerCase() === "c" &&
                   target.selectionStart === target.selectionEnd && !window.getSelection().toString()) {
            // Ctrl+C with nothing selected cancels the line (with a selection it still copies)
            event.preventDefault();
            removeSuggestions();
            target.value += "^C";
            finishLine(target);
            historyIndex = commandHistory.length;
            addNewLine();
        } else if (key === "Tab") {
            event.preventDefault();
            const { current, candidates } = completions(target.value);
            const start = target.value.slice(0, target.value.length - current.length);
            removeSuggestions();
            if (candidates.length === 1) {
                target.value = start + candidates[0] + (candidates[0].endsWith("/") ? "" : " ");
            } else if (candidates.length > 1) {
                const prefix = commonPrefix(candidates);
                if (prefix.length > current.length) target.value = start + prefix;
                addOutput(candidates.map(c => esc(c.replace(/^.*\/(?=.)/, ""))).join(" "), "suggestion");
            }
        } else if (key === 'Enter') {
            event.preventDefault();
            const input = target.value.trim();
            removeSuggestions();
            if (input !== '' && input !== commandHistory[commandHistory.length - 1]) commandHistory.push(input);
            historyIndex = commandHistory.length;
            finishLine(target);

            const output = input === '' ? '' : processInput(input);
            if (output !== '') addOutput(output);
            addNewLine();
        } else if (key === 'ArrowUp') {
            event.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                target.value = commandHistory[historyIndex];
            }
        } else if (key === 'ArrowDown') {
            event.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                target.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                target.value = '';
            }
        }
    };

    const removeSuggestions = () => {
        shell.querySelectorAll(".suggestion").forEach(el => el.remove());
    };

    const addOutput = (output, className = "output-line") => {
        const outputLine = document.createElement('div');
        outputLine.className = className;
        outputLine.innerHTML = output;
        // Suggestions go right below the prompt they belong to
        shell.appendChild(outputLine);
        microlight.reset();
    };

    // Clicking anywhere in the shell focuses the prompt (unless you're selecting text)
    shell.addEventListener("click", () => {
        if (window.getSelection().toString()) return;
        const inputs = shell.querySelectorAll("textarea:not(:disabled)");
        if (inputs.length) inputs[inputs.length - 1].focus();
    });

    addNewLine();
});
const data = {
    "running/an-hour-a-day": "<h1 id=\"an-hour-a-day-for-myself\">An Hour a Day for Myself?</h1>\n\n<h2 id=\"why-do-i-run\">Why do I run?</h2>\n\n<p>Nice question, thanks for asking.</p>\n\n<p>For a long time, I dedicated almost 100% of my available time to studying. Although I genuinely loved what I was learning, I later realised that having so little variety in my daily routine was holding me back me from fully enjoying it.</p>\n\n<p>So, I decided to make room for some of my other passions (interests that, until then, I hadn&#8217;t given enough attention to).</p>\n\n<p>One of them was sim racing. Well, sim racing without a sim, to be precise! \nWhen I realised that I didn&#8217;t actually need a sophisticated setup to enjoy it, I started playing Assetto Corsa with my Xbox 360 controller. I made myself a simple promise: one hour a day, just for me.</p>\n\n<p>It certainly helped me create some balance in my routine, but I had no idea that something else would eventually make an even bigger difference.</p>\n\n<p>One day, a friend of mine (a real athlete) invited me to go for a run. I still don&#8217;t know exactly why, but I said yes.</p>\n\n<p>We ran approximately 3 km. By the end of it, I genuinely felt like I was dying. My heart rate was probably somewhere above 200 bpm!</p>\n\n<p>And yet, I loved it.</p>\n\n<p>There was something special about the experience. It felt like facing my fears, deliberately stepping outside my comfort zone, and choosing to embrace the discomfort. Even better, I was doing it alongside a friend.</p>\n\n<p>That day changed the way I looked at spending time on myself. I realised that sometimes the most rewarding way to spend an hour is not necessarily the most comfortable one.</p>\n\n<p>I have become convinced that there is a lot to learn from people who choose to dedicate an hour of their day to challenging themselves, rather than simply taking the easiest option and spending that time on the sofa.</p>\n\n<p>And perhaps the most important lesson is that you don&#8217;t have to be good at something to enjoy it. You just have to be willing to start.</p>\n"
};
const gameList = ["flappy-pole", "snake", "soccerball"];
