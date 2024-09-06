# FIND A NAME

## Features implemented:

- Headers (`#`): Supports `#` to `######` for `<h1>` to `<h6>`.
- Lists (`-` or `*`): Supports unordered lists using `-` or `*`.
- Bold and Italic: **bold**, *italic* are converted to `<b>` and `<i>`.
- Inline Code: Code enclosed by backticks (\`) is converted to `<code>`.
- Code Blocks: Code blocks wrapped with triple backticks (` ``` `) are supported with simple inline CSS color styling.
- Images `(![alt text](url))`: Converts images to `<img src="url" alt="alt text" />`.
- Audio Files `(![audio](url))`: Converts to HTML5 `<audio>` elements with controls.
- Links `([text](url))`: Converts to `<a href="url">text</a>`.
- Closing Lists: Ensures that HTML lists are closed properly when switching contexts.

## Features to implement

- New line on double new line
- Quotes
- Footnotes
- Horizontal rules
- Ordered lists
- Strikethough
- Tables
- Tasks

Yeah, there is still a lot to do and fix.

## Improvements

Use a different method to converto to markdown: the "syntactical approach" is not very effective for complex tasks. Try using a better data structure like a tree.

Improve the recognition of links that somehow need to be a completely different line.

Find bugs and implement a verificator for them.

Subdivide the lib in multiple lib files.