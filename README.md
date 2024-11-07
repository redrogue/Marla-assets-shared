# Run this in the Terminal in the Project

This will create the folders

```
git submodule add https://github.com/redrogue/Marla-assets-shared.git public/assets-shared

git submodule update --init --recursive

git add .gitmodules public/assets-shared

git commit -m "Added shared assets as a submodule"

```


## Moving location of folder in Project

If you need to move the folder location of the project run this


```
// NB you will prob get a {y/n) question - Answer:n
git submodule deinit -f [current folder location]

// run anyway - will prob error
rm -rf .git/modules/assets-shared

// run anyway - will prob error
rm -rf [current folder location]

git submodule add https://github.com/redrogue/Marla-assets-shared.git [new folder location]

git submodule update --init --recursive

git add .gitmodules [new folder location]

git commit -m "Moved submodule to public/shared-assets"

// Manually delete current folder

```

