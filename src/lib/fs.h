#ifndef _FS_H_
#define _FS_H_

// get r/a/w file descriptor wrapper
FILE* get_rfd_wrap(char* filename); // read
FILE* get_afd_wrap(char* filename); // append
FILE* get_wfd_wrap(char* filename); // write

void free_fd_list();

/*
Since ideally a directory is accessed much less than a file, I will
not implement any wrapper function, but here is how to do that in
the standard way

    DIR* dr = opendir(dirname);

    if (dr == NULL) {  // opendir returns NULL if the directory could not be opened
        printf("Could not open directory %s\n", dirname);
        exit(1);
    }
    
    while ((de = readdir(dr)) != NULL) {
        // Skip "." and ".."
        if (strcmp(de->d_name, ".") != 0 && strcmp(de->d_name, "..") != 0) {
            printf("Found file %s in directory %s\n", de->d_name, dirname);
        }
    }
    
    // Close the directory stream
    closedir(dr);
*/

// write to/from a file or to/from a string
void write_f2f(FILE* file_in, FILE* file_out);
void write_s2f(char* string_in, FILE* file_out);

#endif