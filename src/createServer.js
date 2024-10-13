const http = require('http');
const { detectCase } = require('./convertToCase/detectCase');
const { convertToCase } = require('./convertToCase/convertToCase');

const allCases = ['SNAKE', 'KEBAB', 'UPPER', 'CAMEL', 'PASCAL'];

const createServer = () => {
  const server = http.createServer((req, res) => {
    const errors = [];

    try {
      const [path, queryString] = req.url.split('?');
      const params = new URLSearchParams(queryString);

      const targetCase = params.get('toCase');
      const originalText = path.slice(1);
      const originalCase = detectCase(originalText);

      if (!originalText) {
        errors.push({
          message:
            // eslint-disable-next-line max-len
            'Text to convert is required. Correct request is: "/<TEXT_TO_CONVERT>?toCase=<CASE_NAME>".',
        });
      }

      if (!targetCase) {
        errors.push({
          message:
            // eslint-disable-next-line max-len
            '"toCase" query param is required. Correct request is: "/<TEXT_TO_CONVERT>?toCase=<CASE_NAME>".',
        });
      } else if (!allCases.includes(targetCase)) {
        errors.push({
          message:
            // eslint-disable-next-line max-len
            'This case is not supported. Available cases: SNAKE, KEBAB, CAMEL, PASCAL, UPPER.',
        });
      }

      if (errors.length) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ errors }));

        return;
      }

      const convertedText = convertToCase(
        originalText,
        targetCase,
      ).convertedText;

      res.setHeader('Content-Type', 'application/json');

      res.write(
        JSON.stringify({
          originalCase: originalCase,
          targetCase: targetCase,
          originalText: originalText,
          convertedText: convertedText,
        }),
      );

      res.end();
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ errors: [{ message: error.message }] }));
    }
  });

  return server;
};

module.exports = {
  createServer,
};
