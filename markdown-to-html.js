;
(function() {
    "use strict";

    var
    /**
     * The parsed output string, in HTML format.
     * @type {String}
     */
        output = "",

        BLOCK = "block",
        INLINE = "inline",

        /**
         * Used to attach MarkdownToHtml object to `window` in browser
         * context, or as an AMD module where appropriate.
         * @type {Object}
         */
        exports,

        /**
         * An array of parse rule descriptor objects. Each object has two keys;
         * pattern (the RegExp to match), and replace (the replacement string or
         * function to execute).
         * @type {Array}
         */
        parseMap = [{
                // - 
                pattern: /(\-)\1/g,
                replace: "\n\t - $1\n",
                type: BLOCK,
            },
            {
                // <b>
                // Either two asterisks or two underscores, followed by any
                // characters, followed by the same two starting characters.
                pattern: /(\*\*|__)(.*?)\1/g,
                replace: "\n\t<b>$2</b>",
                type: INLINE,
            },
        ],
        $$;

    /**
     * Self-executing function to handle exporting the parse function for
     * external use.
     */
    (function go() {
        // Export AMD module if possible.
        if (typeof module !== "undefined" &&
            typeof module.exports !== "undefined") {
            exports = module.exports;
        }
        // Otherwise check for browser context.
        else if (typeof window !== "undefined") {
            window.MarkdownToHtml = {};
            exports = window.MarkdownToHtml;
        }

        exports.parse = parse;
    })();

    /**
     * Parses a provided Markdown string into valid HTML.
     *
     * @param  {string} string Markdown input for transformation
     * @return {string}        Transformed HTML output
     */
    function parse(string) {
        // Pad with newlines for compatibility.
        output = "\n" + string + "\n";

        parseMap.forEach(function(p) {
            // Replace all matches of provided RegExp pattern with either the
            // replacement string or callback function.
            output = output.replace(p.pattern, function() {
                // console.log(this, arguments);
                return replace.call(this, arguments, p.replace, p.type);
            });
        });

        // Perform any post-processing required.
        output = clean(output);
        // Trim for any spaces or newlines.
        output = output.trim();
        // Tidy up newlines to condense where more than 1 occurs back to back.
        output = output.replace(/[\n]{1,}/g, "\n");
        return output;
    }

    function replace(matchList, replacement, type) {
        var
            i,
            $$;

        for (i in matchList) {
            if (!matchList.hasOwnProperty(i)) {
                continue;
            }

            // Replace $n with the matching regexp group.
            replacement = replacement.split("$" + i).join(matchList[i]);
            // Replace $Ln with the matching regexp group's string length.
            replacement = replacement.split("$L" + i).join(matchList[i].length);
        }

        if (type === BLOCK) {
            replacement = replacement.trim() + "\n";
        }

        return replacement;
    }

    function clean(string) {
        var cleaningRuleArray = [{
                match: /<\/([uo]l)>\s*<\1>/g,
                replacement: "",
            },
            {
                match: /(<\/\w+>)<\/(blockquote)>\s*<\2>/g,
                replacement: "$1",
            },
        ];

        cleaningRuleArray.forEach(function(rule) {
            string = string.replace(rule.match, rule.replacement);
        });

        return string;
    }

})();