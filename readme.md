# How to use

Clone this repo and then in command line type:

* `npm install` 
* `gulp` - run dev-server, or
* `gulp build` - build project from sources

--

## List of Gulp tasks

To run separate task type in command line `gulp [task_name]`.


### Main tasks
Task name          | Description                                                      
:------------------|:----------------------------------
`default`          | will start all tasks required by project in dev mode: initial build, watch files, run server with livereload
`dev`              | build dev version of project (without code optimizations)
`build`            | build production-ready project (with code optimizations)

### Other tasks
Task name          | Description                                                      
:------------------|:----------------------------------
`styles` 	         | compile .less to .css. We also use [postcss](https://github.com/postcss/postcss) for [autoprefixer](https://github.com/postcss/autoprefixer) and [Lost](https://github.com/peterramsing/lost), so feel free to include other awesome postcss [plugins](https://github.com/postcss/postcss#plugins) when needed
`build-html`       | compile Pug [pug](https://pugjs.org/api/getting-started.html) templates
`watch`            | run dev-server powered by [BrowserSync](https://www.browsersync.io/)

## Other
You can also use [npm scripts](https://docs.npmjs.com/misc/scripts):

* `npm run start` - same as `gulp default`.
* `npm run build-grid` - for build grid system use `smart-grid-config` files.


