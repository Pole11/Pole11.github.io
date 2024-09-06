#ifndef _PARSE_H_
#define _PARSE_H_

#define MAX_LINE_LENGTH 1024
#define MAX_HTML_LENGTH 8192

void markdownToHTML(FILE* inputFile, FILE* outputFile);

#endif
