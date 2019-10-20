# CS 529 VDS Final Project Starter

This project uses [ES6](http://es6-features.org/) syntax with [Babel](https://babeljs.io/docs/en/) and is bundled by [parcel](https://parceljs.org/). It also supports use of SCSS if preferred.

[![Netlify Status](https://api.netlify.com/api/v1/badges/2d6015af-a3c3-4a46-9c52-347e3e4b411a/deploy-status)](https://app.netlify.com/sites/cs529-project-nkprince007/deploys)

## Project Resources

- [Website](https://cs529.naveen.cloud)
- [Workbook](https://cs529.naveen.cloud/workbook/)

## Getting Started

- Install Node.js on your machine
- Run `npm install` to install dependencies for this project.
- Run `npm start` to start development server with hot module reloading.
- Visit http://localhost:1234 to view the site.

## Layout of project

```
.
├── assets
│   ├── imgs
│   │   └── createlydatasci.jpg
│   └── styles
│       └── main.scss
├── index.html
├── LICENSE
├── package.json
├── package-lock.json
├── README.md
└── src
    └── index.js
```

- `assets/` - where all static files live
- `assets/styles` - where all stylesheets live
- `src/` - where all javascript code lives

## FAQ

Q1: I opened `index.html` with my browser and nothing happens.

Ans: A typical node.js project doesn't work that way. You need to use the tools suited for this specific project. Refer [Getting started](#getting-started) section.

Q2: Why is there just one script tag?

Ans: This project uses ES6 modules. i.e. It uses imports to fetch other dependencies installed in `node_modules`. This is analogous to compilation in other languages.
