
"""Static website generator: turns misc/, posts/ and games/ into www/."""

import html
import json
import os

import markdown2  # https://github.com/trentm/python-markdown2

MISC_DIR = "misc/"
POSTS_DIR = "posts/"
GAMES_DIR = "games/"
WWW_DIR = "www/"
WWW_POSTS_DIR = WWW_DIR + "posts/"
WWW_GAMES_DIR = WWW_DIR + "games/"
WWW_SCRIPTS_DIR = WWW_DIR + "scripts/"

MD_EXTRAS = [
    "footnotes", "header-ids", "smarty-pants", "strike", "toc",
    "wiki-tables", "tables", "fenced-code-blocks", "latex"
]

PAGE_START = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>{head_extra}
    <link rel="stylesheet" href="/style/style.css">
</head>
<body>"""

PAGE_END = """<script src="/scripts/microlight.js"></script>
</body>
</html>"""

P5_SCRIPT = '\n    <script src="/scripts/p5.min.js"></script>'


def read(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


def markdown(path):
    return markdown2.markdown(read(path), extras=MD_EXTRAS)


def page(title, body, topbar, footer, head_extra=""):
    return (
        PAGE_START.format(
            title=html.escape(title),
            head_extra=head_extra
        )
        + topbar + body + footer + PAGE_END
    )


def link_list(items):
    """items: list of (href, label) tuples."""
    lis = "".join(
        f'<li><a href="{html.escape(href, quote=True)}">'
        f'{html.escape(label)}</a></li>'
        for href, label in items
    )
    return f"<ul>{lis}</ul>"


def clean_generated(directory):
    """Delete generated HTML files recursively."""
    os.makedirs(directory, exist_ok=True)

    for root, dirs, files in os.walk(directory, topdown=False):
        for name in files:
            if name.endswith(".html"):
                os.remove(os.path.join(root, name))

        # Remove empty subdirectories left by deleted categories.
        for name in dirs:
            path = os.path.join(root, name)
            if not os.listdir(path):
                os.rmdir(path)


def discover_posts():
    """
    Discover all Markdown posts recursively.

    Returns a sorted list of tuples:
        (relative_path_without_extension, absolute_source_path)

    Example:
        ("running/an-hour-a-day",
         "posts/running/an-hour-a-day.md")
    """
    result = []

    for root, dirs, files in os.walk(POSTS_DIR):
        dirs[:] = sorted(d for d in dirs if not d.startswith("."))

        for filename in sorted(files):
            if not filename.endswith(".md") or filename.startswith("."):
                continue

            source = os.path.join(root, filename)
            relative = os.path.relpath(source, POSTS_DIR)
            slug = os.path.splitext(relative)[0]

            result.append((slug, source))

    return sorted(result, key=lambda item: item[0])


def post_link(slug):
    """Convert a post slug into its URL and display label."""
    name = slug.replace(os.sep, "/")
    label = os.path.basename(name).replace("-", " ")

    return f"/posts/{name}.html", label


def main():
    topbar = read(MISC_DIR + "topbar.html")
    footer = markdown(MISC_DIR + "footer.md")

    def make_page(title, body, head_extra=""):
        return page(title, body, topbar, footer, head_extra)

    posts = discover_posts()

    games = sorted(
        g for g in os.listdir(GAMES_DIR)
        if g.endswith(".js") and not g.startswith(".")
    )

    clean_generated(WWW_POSTS_DIR)
    clean_generated(WWW_GAMES_DIR)

    # HOME
    body = markdown(MISC_DIR + "home.md")

    if posts:
        recent = [slug for slug, _ in reversed(posts)][:5]
        body += (
            "<p>Here is a list of my recent posts:</p>"
            + link_list([post_link(slug) for slug in recent])
        )

    write(
        WWW_DIR + "index.html",
        make_page("Pole :)", body)
    )

    # POSTS INDEX
    body = (
        "<p>Sometimes, when I remember I have a website, "
        "I write a post.</p>"
    )

    # Group posts by their directory/category.
    categories = {}

    for slug, source in posts:
        category = os.path.dirname(slug).replace(os.sep, "/")

        if category not in categories:
            categories[category] = []

        categories[category].append(slug)

    # Posts directly inside posts/.
    if "" in categories:
        body += "<h2>Other</h2>"
        body += link_list([
            post_link(slug) for slug in categories[""]
        ])

    # Categorized posts.
    for category in sorted(categories):
        if not category:
            continue

        title = category.replace("/", " / ").replace("-", " ").title()

        body += f"<h2>{html.escape(title)}</h2>"
        body += link_list([
            post_link(slug) for slug in categories[category]
        ])

    if not posts:
        body += "<p>Nothing here yet, come back later!</p>"

    write(
        WWW_POSTS_DIR + "index.html",
        make_page("Posts", body)
    )

    # POSTS
    for slug, source in posts:
        output = os.path.join(
            WWW_POSTS_DIR,
            slug + ".html"
        )

        title = os.path.basename(slug).replace("-", " ")

        write(
            output,
            make_page(title, markdown(source))
        )

    # HACKER MODE
    # Preserve the relative category path in each post key.
    data = {
        slug: markdown(source)
        for slug, source in posts
    }

    write(
        WWW_SCRIPTS_DIR + "shell.js",
        read(MISC_DIR + "shell.js")
        + "\nconst data = " + json.dumps(data, indent=4) + ";\n"
        + "const gameList = "
        + json.dumps([g[:-len(".js")] for g in games])
        + ";\n"
    )

    # GAMES INDEX
    body = "<p>Definitely badly written games:</p>" + link_list(
        [
            (f"/games/{g[:-len('.js')]}.html",
             g[:-len(".js")])
            for g in games
        ]
    )

    write(
        WWW_GAMES_DIR + "index.html",
        make_page("Games", body)
    )

    # GAMES
    for game in games:
        name = game[:-len(".js")]

        body = (
            '<div id="game-div"><main></main></div>\n'
            "<script>\n"
            + read(GAMES_DIR + game)
            + "\n</script>\n"
        )

        write(
            WWW_GAMES_DIR + name + ".html",
            make_page(
                name.replace("-", " "),
                body,
                head_extra=P5_SCRIPT
            )
        )

    print(f"Generated {len(posts)} posts and {len(games)} games.")


if __name__ == "__main__":
    main()
