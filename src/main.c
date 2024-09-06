#include <stdio.h>
#include <stdlib.h>
#include <dirent.h>
#include <string.h>
#include "lib/parse.h"
#include "lib/fs.h"
#include "config.h"

// Main driver function
int main(int argc, char* argv[]) {
    /*if (argc < 3) {
        printf("Usage: %s <input.md> <output.html>\n", argv[0]);
        return 1;
    }

    FILE* inputFile = fopen(argv[1], "r");
    if (!inputFile) {
        printf("Error: Could not open input file %s\n", argv[1]);
        return 1;
    }

    FILE* outputFile = fopen(argv[2], "w");
    if (!outputFile) {
        printf("Error: Could not open output file %s\n", argv[2]);
        fclose(inputFile);
        return 1;
    }

    // Start conversion
    markdownToHTML(inputFile, outputFile);

    fclose(inputFile);
    fclose(outputFile);

    printf("Markdown converted to HTML successfully.\n");*/

    // 1. Create index.html
    // 1.1 topbar
    char* topbarFileName = "./misc/topbar.md";
    FILE* topbarFile = fopen(topbarFileName, "r");
    if (!topbarFile) {
        printf("Error: Could not open/create file %s\n", topbarFileName);
        fclose(topbarFile);
        return 1;
    }
    
    char* indexFileName = "./www/index.html";
    FILE* indexFile = fopen(indexFileName, "w");
    if (!indexFile) {
        printf("Error: Could not open/create file %s\n", indexFileName);
        fclose(indexFile);
        return 1;
    }

    markdownToHTML(topbarFile, indexFile);

    fclose(indexFile);
    fclose(topbarFile);

    // 1.2 posts list
    struct dirent *de;  // Pointer for directory entry

    // Open the directory specified
    char* postDirName = "./posts";
    DIR *dr = opendir(postDirName);

    if (dr == NULL) {  // opendir returns NULL if the directory could not be opened
        printf("Could not open directory %s\n", postDirName);
        return 1;
    }

    indexFileName = "./www/index.html";
    indexFile = fopen(indexFileName, "a");
    if (!indexFile) {
        printf("Error: Could not open file %s\n", indexFileName);
        fclose(indexFile);
        return 1;
    }

    // Read and print the names of all files and directories in the directory
    printf("Files in the directory %s:\n", postDirName);
    fputs("<ol>", indexFile);
    while ((de = readdir(dr)) != NULL) {
        // Skip "." and ".."
        if (strcmp(de->d_name, ".") != 0 && strcmp(de->d_name, "..") != 0) {
            printf("Adding post %s\n", de->d_name);

            fprintf(indexFile, "<li>%s</li>", de->d_name);
        }
    }
    fputs("</ol>", indexFile);
    
    fclose(indexFile);

    // Close the directory stream
    closedir(dr);

    // 1.3 footer

    char* footerFileName = "./misc/footer.md";
    FILE* footerFile = fopen(footerFileName, "r");
    if (!footerFile) {
        printf("Error: Could not open/create file %s\n", footerFileName);
        fclose(footerFile);
        return 1;
    }
    
    indexFileName = "./www/index.html";
    indexFile = fopen(indexFileName, "a");
    if (!indexFile) {
        printf("Error: Could not open file %s\n", indexFileName);
        fclose(indexFile);
        return 1;
    }

    markdownToHTML(footerFile, indexFile);

    fclose(indexFile);
    fclose(footerFile);

    // Create posts

    return 0;
}
