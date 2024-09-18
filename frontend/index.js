#!/usr/bin/env node

`use strict`;

const issues = document.querySelector(`#issues`);

const issues_count = document.querySelector(`#issues-count`);

const url = document.querySelector(`#url`);

const clear = (request) => {
    request.preventDefault();
    issues.innerHTML = ``;
    issues_count.innerHTML = ``;
    url.value = ``;
    url.focus();
    document.querySelector(`#clear`).classList.add(`hide`);
    document.querySelector(`#download`).classList.add(`hide`);
    return;
};

const download = async (request) => {
    request.preventDefault();
    const url_value = url.value;
    if (url === ``) {
        issues.innerHTML = `<div class="alert alert-danger" role="alert">A fully-qualified URL to an active website page is required.</div>`;
        return;
    }
    progress(true);
    const response = await fetch(`/test/?url=${url_value}`);
    if (response.status !== 200) {
        progress(false);
        issues.innerHTML = `<div class="alert alert-danger" role="alert">Error testing your website accessibility.</div>`;
        return;
    }
    const { issues: accessibility_issues } = await response.json();
    if (accessibility_issues.length === 0) {
        progress(false);
        issues.innerHTML = `<div class="alert alert-warning" role="alert">Error generating your website accessibility test results CSV file.</div>`;
        return;
    }
    const csv = accessibility_issues
        .map((accessibility_issue) => {
            return `${accessibility_issue.code} , ${accessibility_issue.message} , ${accessibility_issue.context}`;
        })
        .join(`\n`);
    const csv_blob = new Blob([csv], { type: `text/csv` });
    const csv_url = URL.createObjectURL(csv_blob);
    const csv_link = document.createElement(`a`);
    csv_link.href = csv_url;
    csv_link.download =
        `webacc-tester-results-` + csv_url.substring(12) + `.csv`;
    document.body.appendChild(csv_link);
    csv_link.click();
    document.body.removeChild(csv_link);
    progress(false);
    return;
};

const escape = (html) => {
    return html
        .replace(/&/g, `&amp;`)
        .replace(/</g, `&lt;`)
        .replace(/>/g, `&gt;`)
        .replace(/"/g, `&quot;`)
        .replace(/`/g, `&#039;`);
};

const progress = (loading) => {
    const load = document.querySelector(`.load`);
    if (loading) {
        load.style.display = `block`;
        return;
    }
    load.style.display = `none`;
    return;
};

const show = (accessibility_issues) => {
    issues.innerHTML = ``;
    issues_count.innerHTML = ``;
    if (accessibility_issues.length === 0) {
        issues.innerHTML = `<div class="alert alert-warning" role="alert">No web accessibility issues found.</div>`;
        return;
    }
    issues_count.innerHTML = `<p class="alert alert-warning">${accessibility_issues.length} web accessibility issues found.</p>`;
    accessibility_issues.forEach((accessibility_issue) => {
        let output = `<div class="card mb-3 rounded"><div class="card-body"><h5>${
            accessibility_issue.message
        }</h5><p class="bg-light p-3 my-3">${escape(
            accessibility_issue.context
        )}</p><p class="bg-secondary text-light p-2 rounded">CODE: ${
            accessibility_issue.code
        }</p></div></div>`;
        issues.innerHTML += output;
    });
    return;
};

const test = async (request) => {
    request.preventDefault();
    const url_value = url.value;
    if (url === ``) {
        issues.innerHTML = `<div class="alert alert-danger" role="alert">A fully-qualified URL to an active website page is required.</div>`;
        return;
    }
    progress(true);
    const response = await fetch(`/test/?url=${url_value}`);
    if (response.status !== 200) {
        progress(false);
        issues.innerHTML = `<div class="alert alert-danger" role="alert">Error testing your website accessibility.</div>`;
        return;
    }
    const { issues: accessibility_issues } = await response.json();
    show(accessibility_issues);
    progress(false);
    document.querySelector(`#clear`).classList.remove(`hide`);
    document.querySelector(`#download`).classList.remove(`hide`);
    return;
};

document.querySelector(`#clear`).addEventListener(`click`, clear);

document.querySelector(`#download`).addEventListener(`click`, download);

document.querySelector(`#test`).addEventListener(`submit`, test);
