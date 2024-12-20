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


data = {
"24-11-22-freertos-port-on-renesas-riscv" : `<h1 id="my-unreal-experience-porting-freertos-on-renesas-risc-v-mcu">My unreal experience porting FreeRTOS on Renesas RISC-V MCU</h1>

<p>To complete the <strong>embedded systems</strong> we have to make a project and pass the written exam. There are multiple options for the project that the student can choose from. While the professors were presenting the various options the one that caught my attention was the one of <strong>porting FreeRTOS on an unsupported RISC-V implementation</strong>.   </p>

<p>The professors initially said that it would involve writing assembly code. This magic word made me <strong>tick</strong>. (They also said that it was one of the hardest project to take but it did not bother me).  </p>

<p>I immediately asked if I could take the project and after a week or so I had a meeting with the PhD student that would have tutored me during the project.  </p>

<p>The meeting went very well! My tutor was both friendly, professional and experienced. Just a matter of days so that I could make some research and we met in person so that I could get the board and start working.
During the first meeting I learned a lot of new things and having a 1:1 conversation with someone that has a lot of knowledge on this topic really helped. </p>

<h2 id="hello-world-or-should-i-say-blink">Hello world, or should I say blink</h2>

<p>The first step is the hello world, or as the microcontroller programmers prefer: the <strong>blink</strong> program.
In a matter of minutes I had the application compiled and flashed on the board. The result is a blinking led. </p>

<h2 id="the-dark-days">The dark days</h2>

<p>The next step is figuring out how to compile FreeRTOS and make it work on the board. It is a medium/big task at a first glance. But the most precious thing I learned as an engineer is to split hard task until you are facing smaller and easier ones.
The tasks I needed to accomplish are:</p>

<ol>
<li>Compile FreeRTOS source and a simple application</li>
<li>Link it</li>
<li>Flash it</li>
<li>See what works and what not, if everything works you are done</li>
<li>Fix what does not work and verify that what worked before still works</li>
<li>Goto 4</li>
</ol>

<h3 id="compile-link-and-flash-freertos-source-and-a-simple-application">Compile, link and flash FreeRTOS source and a simple application</h3>

<p>This was an easy step, just put together all the files and see if you can compile successfully the application. But yeah, nothing else worth noting in this step. </p>

<h3 id="see-what-works-and-what-not">See what works and what not</h3>

<p><strong>Nothing works.</strong></p>

<h3 id="fix-what-does-not-work">Fix what does not work</h3>

<h4 id="unusual-misalignment-while-linking">Unusual misalignment while linking</h4>

<p>Right after I flashed the application and started debugging nothing worked (the board resets herself after a memset, which means something like &#8220;hey you! you cannot write in this memory area!&#8221; or something like that). After some googling (better: <em>duckducking</em>), after some absurd option that I gave attention to, I finally discovered that the problem was that the linker was not aligning correctly the <code>.text</code> area. Indeed after adding some magic <code>align("super high power of 2 number")</code> everything worked fine&#8230; Right?</p>

<h4 id="what-is-going-on-with-interrupt-handlers">What is going on with interrupt handlers?</h4>

<p>Well...the main problem I was facing was that the variable containg the tick count, in FreeRTOS called <code>xTickCount</code> was constantly 0. The reason why this happens is that the function that increments this value was not called. This function is called by the <em>machine timer interrupt handler</em>. </p>

<p>So yeah, even me understood that machine timer handler was not <em>installed</em> correctly.</p>

<p>Usually a RISC-V machine would need to set the <code>mtvec</code> memory mapped control status register. The value it must contain is the first address of the interrupt vector table. Then the offset from this base address is contained in the <code>mcause</code> memory mapped control status register. Doing something like <code>mtvec + mcause</code> you will then get to the appropriate interrupt handler.</p>

<p>The problem was that Renesas <em>added some bits in the higher part</em> of the <code>mcause</code> register and this implied that <code>mcause</code> arithmetically did <strong>not</strong> contain the right value. To solve it, I <strong>masked</strong> the higher part of this register when this register was used so that only the needed part was used.</p>

<p>In addition to that I could not manually set those registers with the corresponding instruction <code>csrw</code>. Since this attempt was not successful I decided to stick with the method that Renesas implemented and modified it a bit, since it was not working. I am not saying that it was their fault and that they delivered a bad product, but they way it works is kinda <strong>obscure</strong> and I struggled to understand it.</p>

<p>Once the interrupt vector table was done, even if I <strong>pruned</strong> a good part of Renesas code into a much more simple and friendly <em>array of function pointers</em>, the next step is the bad cousin that comes from far away of interrupts: <em>exceptions</em>.</p>

<h4 id="and-with-exception-handlers-the-bright-days">... and with exception handlers? The bright days</h4>

<p>The fix was one of the things that requires to modify one line of code but it takes a lot of experience to know that you need to write it.</p>

<p>Indeed the fix was not mine, but if <strong>Gaurav Aggarwal</strong>, the community forum leader of FreeRTOS. In one of the two amazing calls that we had, he suggested to add the attribute <code>naked</code> to the function that handled the exceptions. This is important because handler must not have epilogue or prologue.</p>

<h3 id="hand-in-of-the-project">Hand in of the project</h3>

<p>After those modifications minor things were left. Once completed I handed in the project and the PhD student that tutored me was very happy on how it turned out and how I worked. This could not make me feel better. </p>
`,
".do-not-open-me" : `<p>Wooooooooooooooo you are a top level hacker, amazing!</p>
` }