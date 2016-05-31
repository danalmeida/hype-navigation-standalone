# Creating SCORM Compliant Content with Hype

## Modify Hype Course

1. Add the course theme to the **Head HTML**:
    ```javascript
    // Category Stylesheet
    // 
    // @option category-rcp
    // @option category-rcp-white
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
    <script src="${resourcesFolderName}/hype-navigation-standalone.js"></script>
    ```

3. Add `hype-navigation-styles.css` to the **Head HTML**:
    ```html
    <link rel="stylesheet" type="text/css" href="${resourcesFolderName}/hype-navigation-styles.css" />
    ```

## Download SCORM Driver Template

Download the SCORM Driver template from [SCORM Cloud](https://cloud.scorm.com/sc/user/authoring/AddContent) and follow the 6 steps from the SCORM Driver Quickstart Guide:
    
[SCORM Driver Quickstart Guide](http://scorm.com/scorm-solved/scorm-driver/scorm-driver-quickstart-guide-1-pick-version/)

## Insert Content from Hype

Follow these instructions during *Step 3. Insert Content* from the SCORM Driver Quickstart Guide:

1. File > Export to HTML > Folder  
2. **Rename exported file to index.html**
3. **BlueVolt Fix**: Remove `IE=edge` from **index.html** and replace with `IE=EmulateIE8`:
    ```html
    <meta http-equiv="X-UA-Compatible" content="chrome=1,IE=EmulateIE8" />
    ```
4. Save to the `scormcontent` directory

## Add an Assessment

1. Copy the `/scormassessment` folder and `/assessment.html` from this repository to the root directory of the SCORM Driver Template.
2. Create an assessment in SCORM Cloud using [Quizzage](https://cloud.scorm.com/sc/user/authoring/ae/Quizzage).
3. Select the **Rules** tab under **Settings** and update the `Total Missed Question Threshold` and `Passing Score` fields. Make any necessary changes under the **Appearance** tab.
5. Select **Publish**, then **Export Course** to download the files.
6. Copy `assessment.json` from the downloaded files to the root directory of your SCORM Driver Template. The course should look like this (SCORM 1.2):
    ```markdown
    adlcp_rootv1p2.xsd
    ** assessment.html **
    ** assessment.json **
    ims_xml.xsd
    imscp_rootv1p1p2.xsd
    imsmanifest.xml
    imsmd_rootv1p2p1.xsd
    LICENSE.txt
    metadata.xml
    readme.txt
    ** /scormassessment **
    /scormcontent
    /scormdriver
    ScormEnginePackageProperties.xsd
    ```

7. Update the `stylesheeturl` option in `assessment.json` to use a stylesheet from the `/scormassessment/style` directory.
    ```json
    "stylesheeturl": "scormassessment/style/assessment-dymo.css",
    ```
