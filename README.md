# takeshu

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Publish vue project to Github Pages
To publish a Vue.js project from VSCode to GitHub Pages, follow these steps:

Initialize a Git repository in your project folder (if not already initialized): Open the terminal in VSCode and run git init.

Commit your project files to Git: Use git add . to stage your files and git commit -m "Initial commit" to make an initial commit.

Create a GitHub repository: Go to GitHub and create a new repository for your project.

Link your local repository to GitHub: Run the following commands, replacing <username> and <repository> with your GitHub username and repository name:

git remote add origin https://github.com/<username>/<repository>.git
git branch -M main
git push -u origin main
Build your Vue.js project: In your VSCode terminal, run the command to build your Vue.js project. For example: npm run build. This will generate a dist folder with your production-ready code.

Install the gh-pages package: Run npm install --save gh-pages to install the GitHub Pages package.

Configure your package.json: Add the following lines to your package.json file to specify the GitHub Pages deployment settings:
```
    "homepage": "https://<username>.github.io/<repository>/",
    "scripts": {
    "deploy": "gh-pages -d dist"
    }
```

Deploy to GitHub Pages: Run npm run deploy to deploy your project to GitHub Pages.

Access your project: Your Vue.js project should now be accessible at https://<username>.github.io/<repository>/.

Make sure your GitHub repository is public, and you have the necessary permissions to deploy to GitHub Pages.

## icon example : https://fontawesome.com/v4/examples/

To-Do:
1. 预览图上传到github，这样国内也能访问，虽然慢点
2. 开发管理后台，建立艺术品和图片数据库，可以网页端编辑。
