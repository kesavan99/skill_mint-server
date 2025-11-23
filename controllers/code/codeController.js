const prettier = require('prettier');
const { Linter } = require('eslint');
const diff = require('diff');

// Format code using Prettier
exports.formatCode = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Map language to prettier parser
    const parserMap = {
      javascript: 'babel',
      typescript: 'typescript',
      html: 'html',
      css: 'css',
      json: 'json',
      markdown: 'markdown',
    };

    const parser = parserMap[language] || 'babel';

    // Format the code
    const formattedCode = await prettier.format(code, {
      parser,
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5',
      printWidth: 80,
    });

    res.json({ formattedCode });
  } catch (error) {
    console.error('Error formatting code:', error);
    res.status(500).json({ 
      error: 'Failed to format code',
      message: error.message 
    });
  }
};

// Lint JavaScript/TypeScript code using ESLint
exports.lintCode = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Only lint JavaScript and TypeScript
    if (!['javascript', 'typescript'].includes(language)) {
      return res.json({ 
        errors: [],
        message: `Linting is not supported for ${language}` 
      });
    }

    const linter = new Linter();
    
    const config = {
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
      rules: {
        'no-unused-vars': 'warn',
        'no-undef': 'error',
        'no-console': 'off',
        'semi': ['error', 'always'],
        'quotes': ['error', 'single'],
        'no-var': 'error',
        'prefer-const': 'warn',
      },
      env: {
        browser: true,
        node: true,
        es6: true,
      },
    };

    const messages = linter.verify(code, config);

    const errors = messages.map(msg => 
      `Line ${msg.line}:${msg.column} - ${msg.message} (${msg.ruleId})`
    );

    res.json({ 
      errors,
      count: errors.length,
      details: messages 
    });
  } catch (error) {
    console.error('Error linting code:', error);
    res.status(500).json({ 
      error: 'Failed to lint code',
      message: error.message 
    });
  }
};

// Check diff between original and modified code
exports.checkDiff = async (req, res) => {
  try {
    const { originalCode, modifiedCode } = req.body;

    if (!originalCode || !modifiedCode) {
      return res.status(400).json({ 
        error: 'Both originalCode and modifiedCode are required' 
      });
    }

    // Generate diff
    const differences = diff.diffLines(originalCode, modifiedCode);

    let additions = 0;
    let deletions = 0;
    const changes = [];

    differences.forEach((part) => {
      if (part.added) {
        additions += part.count || 0;
        changes.push(`+ ${part.value.trim()}`);
      } else if (part.removed) {
        deletions += part.count || 0;
        changes.push(`- ${part.value.trim()}`);
      }
    });

    res.json({
      additions,
      deletions,
      changes: changes.slice(0, 50), // Limit to 50 changes for performance
      totalChanges: changes.length,
    });
  } catch (error) {
    console.error('Error checking diff:', error);
    res.status(500).json({ 
      error: 'Failed to check diff',
      message: error.message 
    });
  }
};
