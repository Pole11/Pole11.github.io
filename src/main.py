import markdown2 # https://github.com/trentm/python-markdown2
import os

MISC_DIR = "misc/"
POSTS_DIR = "posts/"
WWW_DIR = "www/"
WWW_POSTS_DIR = "www/posts/"
WWW_SCRIPTS_DIR = "www/scripts/"
DOCTYPE_START = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{}</title>
    <link rel="stylesheet" href="/www/style/style.css">
</head>
<body>"""
DOCTYPE_END = """</body>
</html>"""

# INDEX 
index_content = DOCTYPE_START.format("Pole :)")

# header

# topbar
with open(MISC_DIR + "topbar.md", "r") as f:
    content = f.read()
    html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables"])
    index_content += html

with open(MISC_DIR + "home.md", "r") as f:
    content = f.read()
    html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables"])
    index_content += html

# posts list
posts = os.listdir(POSTS_DIR)
posts = sorted(posts)
posts = reversed(posts)
posts = list(posts)

index_content += "<ul>"

for i in range(0,5):
    post = posts[i]
    index_content += "<li><a href=\"/www/posts/" + post.replace(".md", ".html") + "\">" + post.replace(".md", "") + "</a></li>"

index_content += "</ul>"

# footer
with open(MISC_DIR + "footer.md", "r") as f:
    content = f.read()
    html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables"])
    index_content += html

index_content += DOCTYPE_END

with open(WWW_DIR + "index.html", "w") as f:
    f.write(index_content)

# POST INDEX
post_index_content = DOCTYPE_START.format("Posts")

# topbar
with open(MISC_DIR + "topbar.md", "r") as f:
    content = f.read()
    html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables"])
    post_index_content += html

# posts list
posts = os.listdir(POSTS_DIR)
posts = sorted(posts)

post_index_content += "<ul>"

for post in posts:
    post_index_content += "<li><a href=\"/www/posts/" + post.replace(".md", ".html") + "\">" + post.replace(".md", "") + "</a></li>"

post_index_content += "</ul>"

# footer
with open(MISC_DIR + "footer.md", "r") as f:
    content = f.read()
    html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables"])
    post_index_content += html

post_index_content += DOCTYPE_END

with open(WWW_POSTS_DIR + "index.html", "w") as f:
    f.write(post_index_content)

# POST
posts = os.listdir(POSTS_DIR)

for post in posts:
    post_content = DOCTYPE_START.format(post.replace("-", " ").replace(".md", ""))

    # topbar
    with open(MISC_DIR + "topbar.md", "r") as f:
        content = f.read()
        html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables"])
        post_content += html
    
    # content
    with open(POSTS_DIR + post, "r") as f:
        content = f.read()
        html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables"])
        post_content += html

    # footer
    with open(MISC_DIR + "footer.md", "r") as f:
        content = f.read()
        html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables"])
        post_content += html

    post_content += DOCTYPE_END

    with open(WWW_POSTS_DIR + post.replace(".md", ".html"), "w") as f:
        f.write(post_content)

# CONTACT
contact_content = DOCTYPE_START.format("Contact")

# topbar
with open(MISC_DIR + "topbar.md", "r") as f:
    content = f.read()
    html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables"])
    contact_content += html

# content
with open(MISC_DIR + "contact.md", "r") as f:
    content = f.read()
    html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables"])
    contact_content += html

# footer
with open(MISC_DIR + "footer.md", "r") as f:
    content = f.read()
    html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables"])
    contact_content += html

contact_content += DOCTYPE_END

with open(WWW_DIR + "contact.html", "w") as f:
    f.write(contact_content)

# ABOUT
about_content = DOCTYPE_START.format("About me")

# topbar
with open(MISC_DIR + "topbar.md", "r") as f:
    content = f.read()
    html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables"])
    about_content += html

# content
with open(MISC_DIR + "about.md", "r") as f:
    content = f.read()
    html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables"])
    about_content += html

# footer
with open(MISC_DIR + "footer.md", "r") as f:
    content = f.read()
    html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables"])
    about_content += html

about_content += DOCTYPE_END

with open(WWW_DIR + "about.html", "w") as f:
    f.write(about_content)

# HACKER MODE
posts = os.listdir(POSTS_DIR)
shell_content = ""

with open(MISC_DIR + "shell.js") as f:
    shell_content += f.read()

with open(WWW_SCRIPTS_DIR + "shell.js", "w") as f:
    f.write(shell_content + "\ndata = {\n")

for post in posts:
    post_content = ""

    # content
    with open(POSTS_DIR + post, "r") as f:
        content = f.read()
        html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables"])
        post_content += html

    with open(WWW_SCRIPTS_DIR + "shell.js", "a") as f:
        f.write("\"" + post.replace(".md", "") + "\"" + " : `" + post_content + "`")
        if (post != posts[-1]):
            f.write(",\n")
        else:
            f.write(" }")

