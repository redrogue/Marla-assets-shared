# Subtree: Run this in the Terminal in the Project

This will create the folders in src/

```
git remote add marla-shared https://github.com/redrogue/Marla-assets-shared.git 

git remote -v
```
Add the subtree 

```
git subtree add --prefix=src/assets-shared marla-shared develop --squash 
```

Commit subtree: 

```
git add . git commit -m "Add subtree for Marla-assets-shared (develop)" 
```

Push subtree 
```
git push origin develop 
```

## Ongoing management (to be used in project using the shared assets) 

Manually push to Shared location from src/ (push changes to here): 
```
git subtree push --prefix=src/assets-shared marla-shared develop 
```

Manually pull from shared location (pull changes from here): 
```
git subtree pull  --prefix=src/assets-shared  marla-shared develop --squash 
```

# Submodule: Run this in the Terminal in the Project

This will create the folders

```
git submodule add https://github.com/redrogue/Marla-assets-shared.git src/assets-shared

git submodule update --init --recursive

git add .gitmodules src/assets-shared

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

git commit -m "Moved submodule to src/shared-assets"

// Manually delete current folder

```

