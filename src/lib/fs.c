#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include "fs.h"

typedef struct fd_opened_s {
    struct fd_opened_s* next;
    char* filename;
    char* mode;
    FILE* fd;
} fd_opened_t;

fd_opened_t* fd_list = NULL;

// helpers to keep track of the open and close files
void add_to_fd_list(char* filename, char* mode, FILE* file) {
    fd_opened_t* element = malloc(sizeof(fd_opened_t));
    element->next = NULL;
    element->filename = strdup(filename); // Make a copy of the filename
    element->mode = strdup(mode);
    element->fd = file;
    
    if (fd_list == NULL) {
        fd_list = element;
        return;
    }

    element->next = fd_list;
    fd_list = element; 
}

void rm_from_fd_list(char* filename) {
    fd_opened_t* prev_iterator = NULL;
    fd_opened_t* iterator = fd_list;

    while (iterator != NULL) {
        if (strcmp(iterator->filename, filename) == 0) {
            if (prev_iterator == NULL) {
                // Removing the first element
                fd_list = iterator->next;
            } else {
                prev_iterator->next = iterator->next;
            }
            free(iterator->filename);
            free(iterator->mode);
            free(iterator);
            return; // Early exit after removing the node
        }
        prev_iterator = iterator;
        iterator = iterator->next;
    }
}

FILE* get_file_from_fd_list(char* filename) {
    for (fd_opened_t* iterator = fd_list; iterator != NULL && iterator->next != NULL; iterator = iterator->next) {
        if (strcmp(iterator->filename, filename) == 0) {
            return iterator->fd;            
        }
    }

    return NULL;
}

void free_fd_list() {
    if (fd_list == NULL) return;

    fd_opened_t* iterator = fd_list;

    while(iterator != NULL) {
        fd_opened_t* next_iterator = iterator->next;
        fclose(iterator->fd);
        free(iterator->filename);
        free(iterator->mode);
        free(iterator);
        iterator = next_iterator;
    }
}

// get r/a/w file descriptor wrapper
FILE* _get_fd_wrap(char* filename, char* mode) {
    {
        FILE* temp_file = get_file_from_fd_list(filename);
        if (temp_file != NULL ) {
            printf("Info: Found duplicate of file descriptor for file %s\n", filename);
            fclose(temp_file);
            rm_from_fd_list(filename);
        }
    }

    FILE* file = fopen(filename, mode);
    if (!file) {
        printf("Error: Could not open/create file %s\n", filename);
        exit(1);
    }
    
    add_to_fd_list(filename, mode, file);
    return file;
}

FILE* get_rfd_wrap(char* filename) {
    return _get_fd_wrap(filename, "r");
}

FILE* get_afd_wrap(char* filename) {
    return _get_fd_wrap(filename, "a");
}

FILE* get_wfd_wrap(char* filename) {
    return _get_fd_wrap(filename, "w");
}



// write to/from a file or to/from a string
void write_f2f(FILE* file_in, FILE* file_out) {
    while ((c = fgetc(file_in)) != EOF)
    {
        fputc(c, file_out);
    }
}

void write_s2f(char* string_in, FILE* file_out) {
    fprintf(string_in, file_out);
}

