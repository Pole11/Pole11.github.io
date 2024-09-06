#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <stdbool.h>
#include "parse.h"
#include "../config.h"

// Helper function to replace a substring
char* replace(const char* str, const char* old, const char* new) {
    static char buffer[MAX_LINE_LENGTH * 2];  // Increase buffer size for safety
    char* pos;

    buffer[0] = '\0';  // Clear the buffer
    const char* start = str;

    // Find the first occurrence of the substring to replace
    while ((pos = strstr(start, old)) != NULL) {
        // Copy the part before the old substring
        strncat(buffer, start, pos - start);
        // Append the new substring
        strcat(buffer, new);
        // Move the pointer to the rest of the string
        start = pos + strlen(old);
    }

    // Append the rest of the original string
    strcat(buffer, start);
    return buffer;
}

// Check if a line starts with a markdown header
bool isHeader(char* line) {
    return line[0] == '#';
}

// Convert Markdown headers to HTML headers
void processHeader(char* line, char* html) {
    int level = 0;
    while (line[level] == '#') {
        level++;
    }
    sprintf(html + strlen(html), "<h%d>%s</h%d>\n", level, line + level + 1, level);
}

// Check for and convert markdown lists
bool isList(char* line) {
    return (line[0] == '-' || line[0] == '*') && line[1] == ' ';
}

// Convert Markdown lists to HTML lists
void processList(char* line, char* html, bool* inList) {
    if (!(*inList)) {
        strcat(html, "<ul>\n");
        *inList = true;
    }
    sprintf(html + strlen(html), "<li>%s</li>\n", line + 2);
}

void closeList(char* html, bool* inList) {
    if (*inList) {
        strcat(html, "</ul>\n");
        *inList = false;
    }
}

// Helper function to replace text between delimiters
void replaceDelimiters(char* line, char* html, const char* mdTag, const char* htmlOpen, const char* htmlClose) {
    char* start = strstr(line, mdTag);
    while (start != NULL) {
        strncat(html, line, start - line);  // Copy text before the delimiter
        strcat(html, htmlOpen);              // Add the HTML opening tag

        line = start + strlen(mdTag);        // Move the pointer past the Markdown tag
        start = strstr(line, mdTag);         // Find the next occurrence of the delimiter
    }
    strcat(html, line);                      // Append the rest of the line
    strcat(html, htmlClose);                 // Add the closing tag
}

// Replace bold and italic markers in the correct order
void processBoldItalic(char* line, char* html) {
    char temp[MAX_LINE_LENGTH] = "";

    // Step 1: Replace ***bold and italic*** -> <b><i>text</i></b>
    char* start = strstr(line, "***");
    while (start != NULL) {
        // Copy everything before ***
        strncat(temp, line, start - line);
        // Add the opening <b><i> tags
        strcat(temp, "<b><i>");
        line = start + 3;  // Move past the ***
        // Find the closing ***
        start = strstr(line, "***");
        if (start) {
            // Add the content inside ***
            strncat(temp, line, start - line);
            // Add the closing </i></b> tags
            strcat(temp, "</i></b>");
            line = start + 3;  // Move past the closing ***
        }
        start = strstr(line, "***");
    }
    strcat(temp, line);  // Copy the rest of the line
    strcpy(line, temp);  // Copy back the processed line

    // Step 2: Replace **bold** -> <b>text</b>
    strcpy(temp, "");
    start = strstr(line, "**");
    while (start != NULL) {
        strncat(temp, line, start - line);
        strcat(temp, "<b>");
        line = start + 2;
        start = strstr(line, "**");
        if (start) {
            strncat(temp, line, start - line);
            strcat(temp, "</b>");
            line = start + 2;
        }
        start = strstr(line, "**");
    }
    strcat(temp, line);
    strcpy(line, temp);

    // Step 3: Replace *italic* -> <i>text</i>
    strcpy(temp, "");
    start = strstr(line, "*");
    while (start != NULL) {
        strncat(temp, line, start - line);
        strcat(temp, "<i>");
        line = start + 1;
        start = strstr(line, "*");
        if (start) {
            strncat(temp, line, start - line);
            strcat(temp, "</i>");
            line = start + 1;
        }
        start = strstr(line, "*");
    }
    strcat(temp, line);

    // Step 4: Output the final result to HTML
    strcat(html, temp);
}

// Function to handle inline code (backticks)
void processInlineCode(char* line, char* html) {
    char temp[MAX_LINE_LENGTH] = "";
    char *start, *end;

    start = strchr(line, '`');  // Find the first backtick
    while (start != NULL) {
        // Copy everything before the backtick
        strncat(temp, line, start - line);
        strcat(temp, "<code>");  // Add opening <code> tag

        line = start + 1;  // Move past the opening backtick

        // Find the closing backtick
        end = strchr(line, '`');
        if (end) {
            // Copy the content between backticks as inline code
            strncat(temp, line, end - line);
            strcat(temp, "</code>");  // Add closing </code> tag
            line = end + 1;  // Move past the closing backtick
        } else {
            // If no closing backtick, treat the rest as plain text (edge case)
            strcat(temp, line);
            break;
        }

        // Find the next backtick
        start = strchr(line, '`');
    }

    // Copy the rest of the line (if any)
    strcat(temp, line);

    // Output the final result to HTML
    strcat(html, temp);
}

// Convert code blocks
bool isCodeBlock(char* line) {
    return strncmp(line, "```", 3) == 0;
}

void processCodeBlock(char* line, char* html, bool* inCodeBlock) {
    if (!*inCodeBlock) {
        strcat(html, "<pre><code style=\"color:blue\">\n");
        *inCodeBlock = true;
    } else {
        strcat(html, "</code></pre>\n");
        *inCodeBlock = false;
    }
}

// Convert images
void processImage(char* line, char* html) {
    char altText[MAX_LINE_LENGTH], url[MAX_LINE_LENGTH];
    sscanf(line, "![%[^]]](%[^)])", altText, url);
    sprintf(html + strlen(html), "<img src=\"%s\" alt=\"%s\"/>\n", url, altText);
}

// Convert links
void processLink(char* line, char* html) {
    char text[MAX_LINE_LENGTH], url[MAX_LINE_LENGTH];
    sscanf(line, "[%[^]]](%[^)])", text, url);
    sprintf(html + strlen(html), "<a href=\"%s\">%s</a>\n", url, text);
}

// Convert audio files
void processAudio(char* line, char* html) {
    char url[MAX_LINE_LENGTH];
    sscanf(line, "![audio](%[^)])", url);
    sprintf(html + strlen(html), "<audio controls><source src=\"%s\" type=\"audio/mpeg\">Your browser does not support the audio element.</audio>\n", url);
}

// Main function to parse markdown and convert to HTML
void md2html_f2f(FILE* inputFile, FILE* outputFile) {
    char line[MAX_LINE_LENGTH];
    char html[MAX_HTML_LENGTH] = "";

    bool inCodeBlock = false;  // State for code blocks (```)
    bool inList = false;       // State for lists

    while (fgets(line, MAX_LINE_LENGTH, inputFile)) {
        // Remove newline characters
        line[strcspn(line, "\n")] = 0;

        // Handle headers
        if (isHeader(line)) {
            closeList(html, &inList);  // Close any open list
            processHeader(line, html);
        }
        // Handle lists
        else if (isList(line)) {
            processList(line, html, &inList);
        }
        // Handle code blocks
        else if (isCodeBlock(line)) {
            processCodeBlock(line, html, &inCodeBlock);
        }
        // Handle inline code
        else if (strchr(line, '`')) {
            closeList(html, &inList);  // Close any open list
            processInlineCode(line, html);
        }
        // Handle bold/italic
        else if (strchr(line, '*') || strchr(line, '_')) {
            closeList(html, &inList);  // Close any open list
            processBoldItalic(line, html);
        }
        // Handle images
        else if (strstr(line, "![") && strstr(line, "](")) {
            closeList(html, &inList);  // Close any open list
            processImage(line, html);
        }
        // Handle audio
        else if (strstr(line, "![audio](")) {
            closeList(html, &inList);  // Close any open list
            processAudio(line, html);
        }
        // Handle links
        else if (strstr(line, "[") && strstr(line, "](")) {
            closeList(html, &inList);  // Close any open list
            processLink(line, html);
        }
        // Default case (plain text or other elements)
        else {
            closeList(html, &inList);  // Close any open list
            strcat(html, line);
            strcat(html, "\n");
        }
    }

    // Ensure all lists are closed
    closeList(html, &inList);

    // Output final HTML
    fputs(html, outputFile);
}
