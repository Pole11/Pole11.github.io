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
"003-tables" : `<table>
<thead>
<tr>
  <th>Header 1</th>
  <th>Header 2</th>
  <th>Header 3</th>
</tr>
</thead>
<tbody>
<tr>
  <td>Row 1 Col 1</td>
  <td>Row 1 Col 2</td>
  <td>Row 1 Col 3</td>
</tr>
<tr>
  <td>Row 2 Col 1</td>
  <td>Row 2 Col 2</td>
  <td>Row 2 Col 3</td>
</tr>
</tbody>
</table>

<table>
<thead>
<tr>
  <th>Default</th>
  <th style="text-align:left;">Left</th>
  <th style="text-align:center;">Center</th>
  <th style="text-align:right;">Right</th>
</tr>
</thead>
<tbody>
<tr>
  <td>Long Cell</td>
  <td style="text-align:left;">Long Cell</td>
  <td style="text-align:center;">Long Cell</td>
  <td style="text-align:right;">Long Cell</td>
</tr>
<tr>
  <td>Cell</td>
  <td style="text-align:left;">Cell</td>
  <td style="text-align:center;">Cell</td>
  <td style="text-align:right;">Cell</td>
</tr>
</tbody>
</table>
`,
"007-strikethrough" : `<p><s>This text is strikethrough</s></p>

<p>You can combine <strong>bold</strong>, <em>italic</em>, and <s>strikethrough</s>.</p>
`,
"005-horizontal-rules" : `<p>This is some text.</p>

<hr />

<p>This is more text after a horizontal rule.</p>
`,
"004-images" : `<p><img src="https://markdown-here.com/img/icon256.png" alt="Markdown Logo" /></p>
`,
"010-footnotes" : `<p>Markdown supports footnotes.[^1]</p>

<p>This is the first paragraph.[^first]</p>

<ul>
<li>List item one.[^second]</li>
<li>List item two.[^third]</li>
</ul>

<h1 id="headerfourth">Header[^fourth]</h1>

<p>Some paragraph with a footnote[^1], and another[^2].</p>

<pre><code>three lines, with some span-level markup like
_emphasis_, a [link][].
</code></pre>

<p>Another paragraph with a named footnote[^fn-name].</p>

<p>This paragraph should not have a footnote marker since 
the footnote is undefined.[^3]</p>

<p>This paragraph should not have a footnote marker since 
the footnote has already been used before.[^1]</p>

<p>This paragraph links to a footnote with plenty of 
block-level content.[^block]</p>

<pre><code>*   List item

&gt; Blockquote

    Code block
</code></pre>

<p>This paragraph host the footnote reference within a 
footnote test[^reference].</p>

<pre><code>should be impossible.[^impossible]

another footnote, which is not allowed.
</code></pre>
`,
"001-lists" : `<ul>
<li>Item 1
<ul>
<li>Subitem 1</li>
<li>Subitem 2</li>
</ul></li>
<li>Item 2</li>
</ul>

<ol>
<li>First item</li>
<li>Second item</li>
<li>Third item
<ol>
<li>Nested item</li>
<li>Nested item</li>
</ol></li>
</ol>
`,
".do-not-open-me" : `<p>Wooooooooooooooo you are a top level hacker, amazing!</p>
`,
"008-tasks" : `<ul>
<li>[x] Task 1 completed</li>
<li>[ ] Task 2 not completed</li>
<li>[ ] Task 3 not completed</li>
</ul>
`,
"012-math" : `<p>First of all:</p>

<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><mn>2</mn><mo>&#x0002B;</mo><mn>2</mn><mo>&#x0003D;</mo><mn>5</mn></mrow></math> ok?

<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mrow><mn>2</mn><mo>&#x0002B;</mo><mn>2</mn><mo>&#x0003D;</mo><mn>5</mn></mrow></math>

<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mrow><mi>f</mi><mo stretchy="false">&#x00028;</mo><mi>x</mi><mo stretchy="false">&#x00029;</mo><mo>&#x0003D;</mo><msub><mi>a</mi><mrow><mn>11</mn></mrow></msub><mo>&#x0002B;</mo><msub><mi>b</mi><mrow><mn>32</mn></mrow></msub><mo>&#x02212;</mo><msubsup><mo>&#x0222B;</mo><mrow><mn>0</mn></mrow><mrow><mn>120</mn></mrow></msubsup><msup><mi>x</mi><mn>2</mn></msup><mi>d</mi><mi>x</mi></mrow></math>
`,
"006-headers" : `<h1 id="this-is-an-h1-header">This is an H1 Header</h1>

<h2 id="this-is-an-h2-header">This is an H2 Header</h2>

<h3 id="this-is-an-h3-header">This is an H3 Header</h3>

<h4 id="this-is-an-h4-header">This is an H4 Header</h4>

<h5 id="this-is-an-h5-header">This is an H5 Header</h5>

<h6 id="this-is-an-h6-header">This is an H6 Header</h6>

<p>This text is <strong>bold</strong> and this text is <em>italic</em>.</p>

<p>You can combine them: <strong><em>bold and italic</em></strong>.</p>
`,
"009-code" : `<p>To print &#8220;Hello, World!&#8221; in Python, use the following code:</p>

<pre><code>print("Hello, World!")
</code></pre>

<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&#8217;s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>

<pre><code>#include "stdint.h"
#include "stddef.h"
#include "trap.h"
#include "print.h"
#include "debug.h"
#include "memory.h"

void kernel_main() {
    clean_screen();
    init_idt();
    init_memory();
    init_kvm();
}
</code></pre>

<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? </p>

<pre><code>#include &lt;stdio.h&gt;

int main(void) {
    int a = 4 + 2;

    print_screen();

    return 0;
}
</code></pre>

<p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.</p>

<pre><code>[bits 16]       ; real mode
[org 0x7c00]    ; the bios will look for instructions from this address

start:
    xor ax, ax  ; set ax to 0
                ; reset all the segment registers (we don t care about fs and gs) and initialize the stack pointer
    mov ds, ax  
    mov es, ax  
    mov ss, ax  
    mov sp, 0x7c00  ; between ~0x500 and 0x7c00 there is free memory space, here is where the stack will be  

; from now on we can use stack 

    mov     bx, GREETING_MSG
    call    bios_println_string

test_disk_extension:
.check_1:
    mov [DRIVE_ID], dl      ; save into DRIVE_ID location the value of DL
    mov ah, 0x41
    mov bx, 0x55aa
    int 0x13
    jnc .support_1          ; if the service is supported, the carry flag is not set

    mov     bx, DE_NOT_SUPPORT_1
    call    bios_println_string
    ;jmp     .check_2        ; TODO: probably better to jump at the end, in every non supported feature
    jmp end

.support_1:
    mov     bx, DE_SUPPORT_1
    call    bios_println_string

.check_2:                   ; there is certantly a cleaner way to check it without calling the interrupt two times 
    mov [DRIVE_ID], dl      ; save into DRIVE_ID location the value of DL
    mov ah, 0x41
    mov bx, 0x55aa
    int 0x13

    cmp bx, 0xaa55
    je  .support_2

    mov     bx, DE_NOT_SUPPORT_2
    call    bios_println_string
    ;jmp     .end
    jmp end

.support_2:
    mov     bx, DE_SUPPORT_2
    call    bios_println_string

; todo: add printing AH in the case it is not supported to get the error
.end:

load_loader:
    mov si, READ_PACKET_STRUCTURE   ; this interrupt will populate some values inside the packet structure
    mov word[si], 0x10              ; size of the structure, 16 as declared later in the data section of this file
    mov word[si + 2], 5             ; number of sectors, random small value, if not enough increase it
    ; get the memory location where the loader file is by the segment:offset notation, the physical address is 0x7e00
    ; idk if it is the standard notation for addressing memory in real mode, I remember I read somewhere that the offset
    ; should be lower than a certain value but the way it is implemented works and that s what is important 
    mov word[si + 4], 0x7e00        ; offset
    mov word[si + 6], 0             ; segment
    ; the next two values are the lower and higher part of the LBA, in this case the second sector, so 1
    mov dword[si + 8], 1            ; lo
    mov dword[si + 12], 0           ; hi
    mov dl, [DRIVE_ID]
    mov ah, 0x42
    int 0x13
    jnc .no_error                   ; if it fails to read the sector, the carry flag is set

    mov bx, READ_SECTOR_ERROR
    call bios_println_string
    jmp end

.no_error:
    mov bx, LOADER_LOADED_MSG
    call bios_println_string

    mov dl, [DRIVE_ID]
    jmp 0x7e00

end:
    hlt
    jmp end

; external files
%include "./utils/bios.asm"

; data
GREETING_MSG:           db "Boot process started, welcome to Polex", 0 
DRIVE_ID:               db 0
DE_SUPPORT_1:           db "Disk extension supported 1/2", 0
DE_SUPPORT_2:           db "Disk extension supported 2/2", 0
DE_NOT_SUPPORT_1:       db "Disk extension not supported 1/2", 0
DE_NOT_SUPPORT_2:       db "Disk extension not supported 2/2", 0
READ_PACKET_STRUCTURE:  times 16 db 0
READ_SECTOR_ERROR:      db "Error while reading loader sector", 0
LOADER_LOADED_MSG:       db "Loader loaded", 0

; fill all the sector up to 512 bytes with zeros and with the data to make the partition bootable
times (0x1be - ($ - $$)) db 0

; make the partition as a valid "b  ootable" partition (required by some BIOS)
    db 80h              ; boot indicator, it shows that it is a bootable partition
    db 0, 2, 0          ; starting CHS (still don't have LBA implemented, so we need to use CHS)
    db 0f0h             ; partition type
    db 0ffh,0ffh,0ffh   ; ending CHS
    dd 1                ; starting sector, 1 is the first
    dd (20*16*63 - 1)   ; size of the partition

    times (16*3) db 0

    ; magical value to mark a partition as bootable
    db 0x55
    db 0xaa
</code></pre>

<p>This is <code>inline code</code>.</p>
`,
"011-lorem" : `<h1 id="hunc-loquar-habebat-in-inposita-ut-avita">Hunc loquar habebat in inposita ut avita</h1>

<h2 id="in-illis">In illis</h2>

<p>Lorem markdownum, tunc et amat virum, <em>qui pax</em> Aesoniden Bacchi ubi praeceps et
quaeque, iamque, esset. Iter quique et carae inposita sollemnia dies furentem,
admissumque latebras tum sidera, putares pollice papyriferi summo habuit
<a href="http://longiusnostro.com/noscere">at</a>. Munimina ferenda. Uritur terribilis
campus Etruscam reponunt. Veteris priscosque famem.</p>

<h2 id="est-humo">Est humo</h2>

<p>Pacis <em>nefas</em> praenuntia umeris. Virgamque meum est pater paulatim nostro
aequoris meminit quam. Protinus serpentis saepe: humana ego est autumnus nisi
versus ardet melioris sua luxit lacusque barbara, me nutrix mens? Inquit uva
subito pater.</p>

<pre><code>if (2 * -4) {
    repeaterJumperAdf -= -4;
    publishing_scroll = alert;
    executablePcb.dpi = ruby;
}
if (utfPhreakingApp != -3) {
    css_isp_application(2);
} else {
    dtd_windows(access_cable, fullSataIo, backbone);
    animated.pSearch.parity(58, method_vga_denial(skyscraperVdsl),
            operating);
    clipNewline *= perl;
}
laptop_office_desktop.wais_markup(mbr_finder_osi(lossy / backboneImport,
        font_cycle_ppga.so(image, sata_shareware_del),
        netbios_queue_debugger(3)), hover_bitrate, firewire);
</code></pre>

<h2 id="nec-et-neve-protegat-quibus">Nec et neve protegat quibus</h2>

<p>Cererem elicuere discedens nunc, et ut nox alimenta palmas; te illo nervi,
Leucosiamque! Arbore ab intellegit causa Lichan vulnus undique obstet <em>de</em>
potitus gestu, radice precando. Lateantque spiris, palladias nepos; ope nostros
ore nomine <em>emoriar</em>. Paelex nec recingitur ignis tabellis biformis facinusque
socerumque abiit <strong>in nomen</strong> frequentant fuit: iamque demit. Terribiles pariter
Stabiasque tenet haud quas!</p>

<h2 id="ab-pleni-patienda-et-oppida-et-nate">Ab pleni patienda et oppida et nate</h2>

<p>Serpere colat, <em>Talibus liquido</em> emoriar. Hanc <strong>viri tenetque</strong> unum voti
suffusus <em>arguit</em>: iners, <strong>colloquium Luna</strong> parvis. Regni ante ac Dixit ordine
quoque inguina nupta decerptas stratis facta amorem populare ad prima promissis
niveis, nudo. Fumantia in emittite ad manare virisque Pergama contigerant loqui
attonitum maturus amplius: memor idem sonarent. Vota senior et coniuge currum.</p>

<blockquote>
  <p>Addit ex ut <em>est</em> officium antrum, ducibus currebam venti: pati vatis tot,
  eiecit ille Pallas. Tibi clamat quorum inguinibus aut adsis est igne, Hectora
  tempusque docta. Hinc luctus hausto, videri <em>parum</em> harena tecta, metas sonant
  pavens concubiturus sensit solitus.</p>
</blockquote>

<p>Inania et Alcathoi est alis nec vidit aquis, ob quem hastae alite. Per ullas
quaedam ore! Nata nec fortunatumque nemorum communis perfide.</p>
`,
"002-blockquotes-links" : `<blockquote>
  <p>&#8220;The only limit to our realization of tomorrow is our doubts of today.&#8221; - Franklin D. Roosevelt</p>
</blockquote>

<p>Find more quotes <a href="https://www.brainyquote.com">here</a>.</p>
` }