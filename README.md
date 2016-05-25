# Creating SCORM Compliant Content

## Modify Hype Course

1. Add the course theme to the **Head HTML**:
    ```javascript
    // Category Stylesheet
    // 
    // @option category-rcp
    // @option category-irwin
    // @option category-lenox
    // @option category-dymo
    // @option category-hilmor
    var category = 'category-dymo';
    ```

2. Upload `hype-navigation-standalone.js` to the Resources folder and replace the link the **Head HTML**. Make sure it is placed below the link to the jQuery script:
    ```html
    // REMOVE
    <script src="//learnnr.com/dist/javascript/hype-navigation.min.js"></script>
    // REPLACE WITH
    <script src="${resourcesFolderName}t/hype-navigation-standalone.js"></script>
    ```

3. Add `hype-navigation-styles.css` to the **Head HTML**:
    ```html
    <link rel="stylesheet" type="text/css" href="${resourcesFolderName}/hype-navigation-styles.css" />
    ```

## Download SCORM Driver

Download the SCORM Driver template from [SCORM Cloud](https://cloud.scorm.com/sc/user/authoring/AddContent) and follow the 6 steps from the SCORM Driver Quickstart Guide:
    
[SCORM Driver Quickstart Guide](http://scorm.com/scorm-solved/scorm-driver/scorm-driver-quickstart-guide-1-pick-version/)

## Inserting Content from Hype

Follow these instructions during *Step 3. Insert Content* from the SCORM Driver Quickstart Guide:

1. File > Export to HTML > Folder  
2. **Rename exported file to index.html**
3. Save to the `scormcontent` directory