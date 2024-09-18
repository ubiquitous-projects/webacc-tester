#!/usr/bin/env node

`use strict`;

const colors = require(`colors`);
const express = require(`express`);
const pa11y = require(`pa11y`);
const app = express();

app.use(express.static(`frontend`));

app.get(`/test`, async (request, response) => {
    try {
        if (!request.query.url) {
            response.status(400).json({
                response: `A fully-qualified URL to an active website page is required.`,
            });
            return;
        }
        const results = await pa11y(request.query.url);
        response.status(200).json(results);
        return;
    } catch (err) {
        console.error(err.message.brightRed);
        response
            .status(500)
            .json({ response: `Error testing your website accessibility.` });
        return;
    }
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(
        `webacc-tester listening on port: `.brightWhite,
        `${port}`.brightGreen
    );
    return;
});
