// postcss.config.js
module.exports = {
    plugins: [
        {
            postcssPlugin: 'wrap-in-where',
            Rule(rule) {
                // Automatically wraps every class/selector in :where()
                rule.selector = `:where(${rule.selector})`;
            }
        }
    ]
};