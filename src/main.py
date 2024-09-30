import markdown2 # https://github.com/trentm/python-markdown2
import os

MISC_DIR = "misc/"
POSTS_DIR = "posts/"
GAMES_DIR = "games/"
WWW_DIR = "www/"
WWW_POSTS_DIR = "www/posts/"
WWW_GAMES_DIR = "www/games/"
WWW_SCRIPTS_DIR = "www/scripts/"
DOCTYPE_START = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{}</title>
    <link rel="stylesheet" href="/style/style.css">
</head>
<body>"""
DOCTYPE_GAMES_START = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{}</title>
    <script src="/scripts/p5.min.js"></script>
    <link rel="stylesheet" href="/style/style.css">
</head>
<body>"""
DOCTYPE_END = """<script src="/scripts/microlight.js"></script>
</body>
</html>"""

# INDEX 
index_content = DOCTYPE_START.format("Pole :)")

# topbar
with open(MISC_DIR + "topbar.html", "r") as f:
    content = f.read()
    #html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables", "fenced-code-blocks", "latex"])
    index_content += content

with open(MISC_DIR + "home.md", "r") as f:
    content = f.read()
    html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables", "fenced-code-blocks", "latex"])
    index_content += html

# posts list
posts = os.listdir(POSTS_DIR)
posts = filter(lambda p: p[0] != '.', posts)
posts = sorted(posts)
posts = reversed(posts)
posts = list(posts)

index_content += "<ul>"

for i in range(0,5):
    post = posts[i]
    index_content += "<li><a href=\"/posts/" + post.replace(".md", ".html") + "\">" + post.replace(".md", "") + "</a></li>"

index_content += "</ul>"

# footer
with open(MISC_DIR + "footer.md", "r") as f:
    content = f.read()
    html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables", "fenced-code-blocks", "latex"])
    index_content += html

index_content += DOCTYPE_END

with open(WWW_DIR + "index.html", "w") as f:
    f.write(index_content)

# POST INDEX
post_index_content = DOCTYPE_START.format("Posts")

# topbar
with open(MISC_DIR + "topbar.html", "r") as f:
    content = f.read()
    #html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables", "fenced-code-blocks", "latex"])
    post_index_content += content

# posts list
posts = os.listdir(POSTS_DIR)
posts = filter(lambda p: p[0] != '.', posts)
posts = sorted(posts)

post_index_content += "<ul>"

for post in posts:
    post_index_content += "<li><a href=\"/posts/" + post.replace(".md", ".html") + "\">" + post.replace(".md", "") + "</a></li>"

post_index_content += "</ul>"

# footer
with open(MISC_DIR + "footer.md", "r") as f:
    content = f.read()
    html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables", "fenced-code-blocks", "latex"])
    post_index_content += html

post_index_content += DOCTYPE_END

with open(WWW_POSTS_DIR + "index.html", "w") as f:
    f.write(post_index_content)

# POST
posts = os.listdir(POSTS_DIR)
posts = filter(lambda p: p[0] != '.', posts)

for post in posts:
    post_content = DOCTYPE_START.format(post.replace("-", " ").replace(".md", ""))

    # topbar
    with open(MISC_DIR + "topbar.html", "r") as f:
        content = f.read()
        #html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables", "fenced-code-blocks", "latex"])
        post_content += content
    
    # content
    with open(POSTS_DIR + post, "r") as f:
        content = f.read()
        html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables", "fenced-code-blocks", "latex"])
        post_content += html

    # footer
    with open(MISC_DIR + "footer.md", "r") as f:
        content = f.read()
        html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables", "fenced-code-blocks", "latex"])
        post_content += html

    post_content += DOCTYPE_END

    with open(WWW_POSTS_DIR + post.replace(".md", ".html"), "w") as f:
        f.write(post_content)

# CONTACT
contact_content = DOCTYPE_START.format("Contact")

# topbar
with open(MISC_DIR + "topbar.html", "r") as f:
    content = f.read()
    #html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables", "fenced-code-blocks", "latex"])
    contact_content += content

# content
with open(MISC_DIR + "contact.md", "r") as f:
    content = f.read()
    html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables", "fenced-code-blocks", "latex"])
    contact_content += html

# footer
with open(MISC_DIR + "footer.md", "r") as f:
    content = f.read()
    html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables", "fenced-code-blocks", "latex"])
    contact_content += html

contact_content += DOCTYPE_END

with open(WWW_DIR + "contact.html", "w") as f:
    f.write(contact_content)

# ABOUT
about_content = DOCTYPE_START.format("About me")

# topbar
with open(MISC_DIR + "topbar.html", "r") as f:
    content = f.read()
    #html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables", "fenced-code-blocks", "latex"])
    about_content += content

# content
with open(MISC_DIR + "about.md", "r") as f:
    content = f.read()
    html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables", "fenced-code-blocks", "latex"])
    about_content += html

# footer
with open(MISC_DIR + "footer.md", "r") as f:
    content = f.read()
    html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables", "fenced-code-blocks", "latex"])
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
        html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables", "fenced-code-blocks", "latex"])
        post_content += html

    with open(WWW_SCRIPTS_DIR + "shell.js", "a") as f:
        f.write("\"" + post.replace(".md", "") + "\"" + " : `" + post_content + "`")
        if (post != posts[-1]):
            f.write(",\n")
        else:
            f.write(" }")

# GAMES INDEX
game_index_content = DOCTYPE_START.format("Games")

# topbar
with open(MISC_DIR + "topbar.html", "r") as f:
    content = f.read()
    #html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables", "fenced-code-blocks", "latex"])
    game_index_content += content

# games list
games = os.listdir(GAMES_DIR)
games = sorted(games)

game_index_content += "<ul>"

for game in games:
    game_index_content += "<li><a href=\"/games/" + game.replace(".js", ".html") + "\">" + game.replace(".js", "") + "</a></li>"

game_index_content += "</ul>"

# footer
with open(MISC_DIR + "footer.md", "r") as f:
    content = f.read()
    html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables", "fenced-code-blocks", "latex"])
    game_index_content += html

game_index_content += DOCTYPE_END

with open(WWW_GAMES_DIR + "index.html", "w") as f:
    f.write(game_index_content)


# GAMES
games = os.listdir(GAMES_DIR)

for game in games:
    game_content = DOCTYPE_GAMES_START.format(game.replace("-", " ").replace(".js", ""))

    # topbar
    with open(MISC_DIR + "topbar.html", "r") as f:
        content = f.read()
        #html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables", "fenced-code-blocks", "latex"])
        game_content += content
    
    game_content += "<div id='game-div'><main></main></div>" # here put the canvas

    # footer
    with open(MISC_DIR + "footer.md", "r") as f:
        content = f.read()
        html = markdown2.markdown(content, extras=["footnotes, header-ids, highlightjs-lang", "smarty-pants", "strike", "toc", "wiki-tables", "tables", "fenced-code-blocks", "latex"])
        game_content += html

    # content
    game_content += "<script defer>"
    with open(GAMES_DIR + game, "r") as f:
        content = f.read()
        game_content += content
    game_content += "</script>"
    game_content += DOCTYPE_END

    with open(WWW_GAMES_DIR + game.replace(".js", ".html"), "w") as f:
        f.write(game_content)

