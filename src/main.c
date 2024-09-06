#include <stdio.h>
#include <stdlib.h>
#include <dirent.h>
#include <string.h>
#include "lib/fs.h"
#include "lib/pages.h"
#include "lib/parse.h"
#include "config.h"

// Main driver function
int main(int argc, char* argv[]) {
    // 1. Create index.html
    // 1.1 topbar
    char* topbarFileName = "./misc/topbar.md";
    FILE* topbarFile = get_rfd_wrap(topbarFileName);
    
    char* indexFileName = "./www/index.html";
    FILE* indexFile = get_wfd_wrap(indexFileName);

    markdownToHTML(topbarFile, indexFile);

    // 1.2 posts list
    struct dirent *de;  // Pointer for directory entry

    // Open the directory specified
    char* postDirName = "./posts";
    DIR* dr = opendir(postDirName);

    if (dr == NULL) {  // opendir returns NULL if the directory could not be opened
        printf("Could not open directory %s\n", postDirName);
        return 1;
    }

    indexFileName = "./www/index.html";
    indexFile = get_afd_wrap(indexFileName);

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
    
    // Close the directory stream
    closedir(dr);

    // 1.3 footer

    char* footerFileName = "./misc/footer.md";
    FILE* footerFile = get_rfd_wrap(footerFileName);
    
    indexFileName = "./www/index.html";
    indexFile = get_afd_wrap(indexFileName);

    markdownToHTML(footerFile, indexFile);

    free_fd_list();

    // Create posts

    return 0;
}
