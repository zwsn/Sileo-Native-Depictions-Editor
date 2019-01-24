# Sileo-Native-Depictions-Editor
Easily create or edit a Sileo Native Depiction JSON file.

Preview available : https://www.yourepo.com/sileo-native-depictions

#### With this tool, you can:
* Embed a Sileo native depiction on your website
* Create/Edit a Sileo native depiction

#### Depends:
* jQuery
* Showdown (http://showdownjs.com/)

#### How to:
1. Add CSS & JS files to your project + depends
2. Add a div to your html, eg: <div id="sileodepiction"></div>
3. Add jQuery & Showdown BEFORE.
4. Now, you can start by initializing a variable in you javascript, eg:
```var depiction = $('#sileodepiction').SileoDepiction(); ```
5. And you can load your depiction into your div, eg:
``` depiction.load(-PARSED-JSON-, -PACKAGE-NAME-, -PACKAGE-AUTHOR-, -PACKAGE-ICON); ```
> All arguments are optionals, if you leave first argument empty, you'll start from scratch. Other arguments are only for preview purpose like these infos are not stored into JSON depiction files.
6. Now, you can use edit method to start editing your depiction, eg:
``` depiction.edit(); ```
7. You can use cancel method to avoid changes, eg:
``` depiction.cancel(); ```
8. You can also, get actual changes by using stringify method, eg:
``` depiction.stringify() ```
9. To stop edition and save changes just use save method. That will also return your stringified JSON depiction, eg: 
``` console.log(depiction.save()) ```

#### TODO :
* Add a button to edit header image
* Add a better support for mobile (I tested it on my Mac only, on Chrome, Firefox and Safari)
* Add a way to translate strings

#### Known bugs:
* Stylesheet needs to be fully rewrite
