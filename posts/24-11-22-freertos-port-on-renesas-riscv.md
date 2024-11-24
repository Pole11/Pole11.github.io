# My unreal experience porting FreeRTOS on Renesas RISC-V MCU

To complete the **embedded systems** we have to make a project and pass the written exam. There are multiple options for the project that the student can choose from. While the professors were presenting the various options the one that caught my attention was the one of **porting FreeRTOS on an unsupported RISC-V implementation**.   

The professors initially said that it would involve writing assembly code. This magic word made me **tick**. (They also said that it was one of the hardest project to take but it did not bother me).  

I immediately asked if I could take the project and after a week or so I had a meeting with the PhD student that would have tutored me during the project.  

The meeting went very well! My tutor was both friendly, professional and experienced. Just a matter of days so that I could make some research and we met in person so that I could get the board and start working.
During the first meeting I learned a lot of new things and having a 1:1 conversation with someone that has a lot of knowledge on this topic really helped. 

## Hello world, or should I say blink

The first step is the hello world, or as the microcontroller programmers prefer: the **blink** program.
In a matter of minutes I had the application compiled and flashed on the board. The result is a blinking led. 

## The dark days

The next step is figuring out how to compile FreeRTOS and make it work on the board. It is a medium/big task at a first glance. But the most precious thing I learned as an engineer is to split hard task until you are facing smaller and easier ones.
The tasks I needed to accomplish are:

1. Compile FreeRTOS source and a simple application
2. Link it
3. Flash it
4. See what works and what not, if everything works you are done
5. Fix what does not work and verify that what worked before still works
6. Goto 4

### Compile, link and flash FreeRTOS source and a simple application

This was an easy step, just put together all the files and see if you can compile successfully the application. But yeah, nothing else worth noting in this step. 

### See what works and what not

**Nothing works.**

### Fix what does not work 

#### Unusual misalignment while linking

Right after I flashed the application and started debugging nothing worked (the board resets herself after a memset, which means something like "hey you! you cannot write in this memory area!" or something like that). After some googling (better: *duckducking*), after some absurd option that I gave attention to, I finally discovered that the problem was that the linker was not aligning correctly the `.text` area. Indeed after adding some magic `align("super high power of 2 number")` everything worked fine... Right?

#### What is going on with interrupt handlers?

Well...the main problem I was facing was that the variable containg the tick count, in FreeRTOS called `xTickCount` was constantly 0. The reason why this happens is that the function that increments this value was not called. This function is called by the *machine timer interrupt handler*. 

So yeah, even me understood that machine timer handler was not *installed* correctly.

Usually a RISC-V machine would need to set the `mtvec` memory mapped control status register. The value it must contain is the first address of the interrupt vector table. Then the offset from this base address is contained in the `mcause` memory mapped control status register. Doing something like `mtvec + mcause` you will then get to the appropriate interrupt handler.

The problem was that Renesas *added some bits in the higher part* of the `mcause` register and this implied that `mcause` arithmetically did **not** contain the right value. To solve it, I **masked** the higher part of this register when this register was used so that only the needed part was used.

In addition to that I could not manually set those registers with the corresponding instruction `csrw`. Since this attempt was not successful I decided to stick with the method that Renesas implemented and modified it a bit, since it was not working. I am not saying that it was their fault and that they delivered a bad product, but they way it works is kinda **obscure** and I struggled to understand it.

Once the interrupt vector table was done, even if I **pruned** a good part of Renesas code into a much more simple and friendly *array of function pointers*, the next step is the bad cousin that comes from far away of interrupts: *exceptions*.

#### ... and with exception handlers? The bright days

The fix was one of the things that requires to modify one line of code but it takes a lot of experience to know that you need to write it.

Indeed the fix was not mine, but if **Gaurav Aggarwal**, the community forum leader of FreeRTOS. In one of the two amazing calls that we had, he suggested to add the attribute `naked` to the function that handled the exceptions. This is important because handler must not have epilogue or prologue.

### Hand in of the project

After those modifications minor things were left. Once completed I handed in the project and the PhD student that tutored me was very happy on how it turned out and how I worked. This could not make me feel better. 
