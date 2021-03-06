non_hoisted_function_after_return: {
    options = {
        hoist_funs: false, dead_code: true, conditionals: true, comparisons: true,
        evaluate: true, booleans: true, loops: true, unused: true, keep_fargs: true,
        if_return: true, join_vars: true, cascade: true, side_effects: true
    }
    input: {
        function foo(x) {
            if (x) {
                return bar();
                not_called1();
            } else {
                return baz();
                not_called2();
            }
            function bar() { return 7; }
            return not_reached;
            function UnusedFunction() {}
            function baz() { return 8; }
        }
    }
    expect: {
        function foo(x) {
            return x ? bar() : baz();
            function bar() { return 7 }
            function baz() { return 8 }
        }
    }
    expect_warnings: [
        'WARN: Dropping unreachable code [test/compress/issue-1034.js:11,16]',
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:14,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:17,12]",
        "WARN: Dropping unused function UnusedFunction [test/compress/issue-1034.js:18,21]"
    ]
}

non_hoisted_function_after_return_2a: {
    options = {
        hoist_funs: false, dead_code: true, conditionals: true, comparisons: true,
        evaluate: true, booleans: true, loops: true, unused: true, keep_fargs: true,
        if_return: true, join_vars: true, cascade: true, side_effects: true,
        collapse_vars: false
    }
    input: {
        function foo(x) {
            if (x) {
                return bar(1);
                var a = not_called(1);
            } else {
                return bar(2);
                var b = not_called(2);
            }
            var c = bar(3);
            function bar(x) { return 7 - x; }
            function nope() {}
            return b || c;
        }
    }
    expect: {
        // NOTE: Output is correct, but suboptimal. Not a regression. Can be improved in future.
        //       This output is run through non_hoisted_function_after_return_2b with same flags.
        function foo(x) {
            if (x) {
                return bar(1);
            } else {
                return bar(2);
                var b;
            }
            var c = bar(3);
            function bar(x) {
                return 7 - x;
            }
            return b || c;
        }
    }
    expect_warnings: [
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:48,16]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:48,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:51,16]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:51,16]",
        "WARN: Dropping unused variable a [test/compress/issue-1034.js:48,20]",
        "WARN: Dropping unused function nope [test/compress/issue-1034.js:55,21]"
    ]
}

non_hoisted_function_after_return_2b: {
    options = {
        hoist_funs: false, dead_code: true, conditionals: true, comparisons: true,
        evaluate: true, booleans: true, loops: true, unused: true, keep_fargs: true,
        if_return: true, join_vars: true, cascade: true, side_effects: true,
        collapse_vars: false
    }
    input: {
        // Note: output of test non_hoisted_function_after_return_2a run through compress again
        function foo(x) {
            if (x) {
                return bar(1);
            } else {
                return bar(2);
                var b;
            }
            var c = bar(3);
            function bar(x) {
                return 7 - x;
            }
            return b || c;
        }
    }
    expect: {
        // the output we would have liked to see from non_hoisted_function_after_return_2a
        function foo(x) {
            return bar(x ? 1 : 2);
            function bar(x) { return 7 - x; }
        }
    }
    expect_warnings: [
        // Notice that some warnings are repeated by multiple compress passes.
        // Not a regression. There is room for improvement here.
        // Warnings should be cached and only output if unique.
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:100,16]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:100,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:100,16]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:100,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:100,16]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:100,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:100,16]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:100,16]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:102,12]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:102,12]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:106,12]",
        "WARN: Dropping unreachable code [test/compress/issue-1034.js:100,16]",
        "WARN: Declarations in unreachable code! [test/compress/issue-1034.js:100,16]",
        "WARN: Dropping unused variable b [test/compress/issue-1034.js:100,20]",
        "WARN: Dropping unused variable c [test/compress/issue-1034.js:102,16]"
    ]
}

